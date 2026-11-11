//! 解析引擎：各源独立解析器，统一输出 ParsedItem
pub mod ghsa;
pub mod kev;
pub mod nvd;
pub mod rss;

#[cfg(test)]
mod tests;

use crate::error::AppResult;
use crate::models::ParsedItem;

/// 各源解析器统一 trait
pub trait SourceParser {
    fn parse(&self, raw: &[u8]) -> AppResult<Vec<ParsedItem>>;
}

/// CVE 编号严格匹配
pub fn extract_cve(text: &str) -> Option<String> {
    static RE: std::sync::OnceLock<regex::Regex> = std::sync::OnceLock::new();
    let re = RE.get_or_init(|| regex::Regex::new(r"(?i)\bCVE-\d{4}-\d{4,7}\b").unwrap());
    re.find(text).map(|m| m.as_str().to_uppercase())
}

/// 校验并规范化 CVE（严格 ^CVE-\d{4}-\d{4,7}$）
pub fn norm_cve(s: &str) -> Option<String> {
    static RE: std::sync::OnceLock<regex::Regex> = std::sync::OnceLock::new();
    let re = RE.get_or_init(|| regex::Regex::new(r"^CVE-\d{4}-\d{4,7}$").unwrap());
    let up = s.trim().to_uppercase();
    if re.is_match(&up) {
        Some(up)
    } else {
        None
    }
}

/// 规范化 CWE 编号：接受 CWE-89 / cwe-89 / CWE-89:2019 等形式，统一输出 CWE-NNN
pub fn norm_cwe(s: &str) -> Option<String> {
    static RE: std::sync::OnceLock<regex::Regex> = std::sync::OnceLock::new();
    let re = RE.get_or_init(|| regex::Regex::new(r"(?i)\bCWE-(\d{1,4})\b").unwrap());
    re.captures(s)
        .and_then(|c| c.get(1))
        .map(|m| format!("CWE-{}", m.as_str()))
}

/// 清洗文本：去 Markdown 标记、去首尾空白、折叠连续空行，超长截断
pub fn clean_text(s: &str, max_len: usize) -> Option<String> {
    let stripped = strip_markdown(s);
    let collapsed = stripped
        .replace("\r\n", "\n")
        .lines()
        .map(|l| l.trim())
        .filter(|l| !l.is_empty())
        .collect::<Vec<_>>()
        .join(" ");
    let t = collapsed.trim();
    if t.is_empty() {
        return None;
    }
    let out: String = if t.chars().count() > max_len {
        t.chars().take(max_len).collect::<String>() + "…"
    } else {
        t.to_string()
    };
    Some(out)
}

/// 去掉常见 Markdown 标记，避免原文符号污染结构化字段
fn strip_markdown(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for line in s.lines() {
        let t = line.trim();
        // 纯分隔线
        if t.chars().all(|c| c == '-' || c == '*' || c == '_' || c.is_whitespace()) && !t.is_empty() {
            continue;
        }
        // 标题符号 ###、引用 >、列表 - * +
        let mut l = t.trim_start_matches('#').trim_start();
        l = l.trim_start_matches('>').trim_start();
        if l.starts_with("- ") || l.starts_with("* ") || l.starts_with("+ ") {
            l = &l[2..];
        }
        // 行内代码反引号、加粗星号
        let cleaned: String = l.chars().filter(|c| *c != '`').collect();
        let cleaned = cleaned.replace("**", "").replace("__", "");
        out.push_str(cleaned.trim());
        out.push('\n');
    }
    out
}

/// 产品名清洗：去空白、去重、保留原始大小写
pub fn clean_products(list: Vec<String>) -> Vec<String> {
    let mut seen = std::collections::HashSet::new();
    let mut out = Vec::new();
    for p in list {
        let t = p.trim().to_string();
        if t.is_empty() {
            continue;
        }
        let k = t.to_lowercase();
        if seen.insert(k) {
            out.push(t);
        }
    }
    out
}

/// 判定文本语种（粗粒度：含 CJK 即视为中文）
pub fn detect_lang(text: &str) -> crate::models::Lang {
    let cjk = text.chars().any(|c| ('\u{4e00}'..='\u{9fff}').contains(&c));
    if cjk {
        crate::models::Lang::Zh
    } else {
        crate::models::Lang::En
    }
}
