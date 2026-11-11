//! robots.txt 拉取与规则匹配。
//! 保守策略：解析失败 / 5xx / 网络错误一律视为不允许；4xx（含 404）按 RFC 9309 视为不限制。
use crate::collect::sources::USER_AGENT;
use crate::error::{AppError, AppResult};

#[derive(Debug, Clone)]
pub struct RobotsRules {
    /// (是否 Allow, 路径前缀)
    pub rules: Vec<(bool, String)>,
    pub crawl_delay_ms: Option<u64>,
    pub fetched: bool,
}

impl RobotsRules {
    fn allow_all() -> Self {
        Self { rules: Vec::new(), crawl_delay_ms: None, fetched: false }
    }

    /// 按最长匹配前缀判定是否允许（RFC 9309 约定）
    pub fn is_allowed(&self, path: &str) -> bool {
        let mut best_len = -1i32;
        let mut best_allow = true;
        for (allow, prefix) in &self.rules {
            if prefix == "/" || path.starts_with(prefix.as_str()) {
                let l = prefix.len() as i32;
                if l > best_len {
                    best_len = l;
                    best_allow = *allow;
                }
            }
        }
        best_allow
    }
}

/// 从文本解析 robots.txt（只取与我们 UA 匹配的分组）
pub fn parse(text: &str, product_token: &str) -> RobotsRules {
    let mut out = RobotsRules::allow_all();
    let token = product_token.to_lowercase();
    // 当前分组是否与我们相关
    let mut group_agents: Vec<String> = Vec::new();
    let mut in_rules = false;

    for raw in text.lines() {
        let line = raw.split('#').next().unwrap_or("").trim();
        if line.is_empty() {
            continue;
        }
        let Some((k, v)) = line.split_once(':') else { continue };
        let key = k.trim().to_lowercase();
        let val = v.trim();
        if key == "user-agent" {
            if in_rules {
                group_agents.clear();
                in_rules = false;
            }
            group_agents.push(val.to_lowercase());
            out.fetched = true;
            continue;
        }
        in_rules = true;
        let matches_us = group_agents
            .iter()
            .any(|a| a == "*" || token.contains(a.as_str()) || a.contains(&token));
        if !matches_us {
            continue;
        }
        match key.as_str() {
            "disallow" => {
                if !val.is_empty() {
                    out.rules.push((false, val.to_string()));
                }
            }
            "allow" => {
                if !val.is_empty() {
                    out.rules.push((true, val.to_string()));
                }
            }
            "crawl-delay" => {
                if let Ok(secs) = val.parse::<f64>() {
                    out.crawl_delay_ms = Some((secs * 1000.0) as u64);
                }
            }
            _ => {}
        }
    }
    out
}

/// 拉取并解析某个站点的 robots.txt
pub async fn fetch(client: &reqwest::Client, base_url: &str) -> AppResult<(RobotsRules, String)> {
    let url = format!("{}/robots.txt", base_url.trim_end_matches('/'));
    let resp = client
        .get(&url)
        .header("User-Agent", USER_AGENT)
        .timeout(std::time::Duration::from_secs(15))
        .send()
        .await;

    let resp = match resp {
        Ok(r) => r,
        Err(e) => {
            // 网络错误：保守视为不允许
            return Ok((RobotsRules::allow_all(), format!("拉取失败，保守视为不允许：{}", e)));
        }
    };

    let status = resp.status().as_u16();
    if (400..500).contains(&status) {
        // RFC 9309：4xx 视为没有任何限制
        return Ok((RobotsRules::allow_all(), format!("HTTP {}（4xx，按 RFC 9309 视为不限制）", status)));
    }
    if status >= 500 {
        return Ok((RobotsRules::allow_all(), format!("HTTP {}（服务端错误，保守视为不允许）", status)));
    }

    let body = resp.text().await.map_err(|e| AppError::Http(e.to_string()))?;
    let rules = parse(&body, "SentryDesk");
    let detail = format!("HTTP {}，解析出 {} 条规则", status, rules.rules.len());
    Ok((rules, detail))
}
