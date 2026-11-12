//! 合规采集：白名单 → robots 校验 → 限速 → 采集 → 解析 → 入库
pub mod fetcher;
pub mod limiter;
pub mod robots;
pub mod seed;
pub mod sources;

use crate::error::AppError;
use crate::models::*;
use crate::parse::SourceParser;

/// 单源采集结果
pub struct SourceOutcome {
    pub source_key: String,
    pub name: String,
    pub status: String,
    pub fetched: usize,
    pub inserted: usize,
    pub skipped: usize,
    pub elapsed_ms: u64,
    pub message: Option<String>,
}

/// 采集单个源。连接在内部按需创建/释放，不跨 await 持有。
pub async fn collect_source(
    db_path: &std::path::Path,
    client: &reqwest::Client,
    limiter: &limiter::RateLimiter,
    def: &SourceDef,
    robots_state: &str,
) -> Result<SourceOutcome, AppError> {
    let t0 = std::time::Instant::now();
    let urls = sources::entry_urls(&def.key);
    let url = urls
        .first()
        .cloned()
        .ok_or_else(|| AppError::Config(format!("未定义入口 URL：{}", def.key)))?;

    // robots 禁止则跳过，不发起请求
    if robots_state == "disallowed" {
        if let Ok(conn) = crate::db::schema::open(db_path) {
            let _ = crate::db::repo::log_collect(
                &conn, &def.key, &url, None, 0, false, Some("robots.txt 禁止，已跳过"),
            );
        }
        return Ok(SourceOutcome {
            source_key: def.key.clone(),
            name: def.name.clone(),
            status: "skipped".into(),
            fetched: 0,
            inserted: 0,
            skipped: 0,
            elapsed_ms: t0.elapsed().as_millis() as u64,
            message: Some("robots.txt 禁止访问，已跳过".into()),
        });
    }

    let extra: Vec<(&str, &str)> = if def.key == "ghsa" {
        vec![
            ("Accept", "application/vnd.github+json"),
            ("X-GitHub-Api-Version", "2022-11-28"),
        ]
    } else {
        vec![]
    };

    // 逐个 URL 抓取：每轮都单独过限速，绝不因为「是同一个源」就跳过间隔。
    // 任何一个 URL 失败都不整体失败——定向补采本来就是锦上添花，
    // 主入口成功就该把主入口的数据落库。
    let mut parsed: Vec<ParsedItem> = Vec::new();
    let mut first_err: Option<String> = None;
    let mut ok_urls = 0usize;
    let mut http_status: Option<u16> = None;
    for u in &urls {
        let domain = limiter::domain_of(u);
        limiter.acquire(&domain, def.min_interval_ms).await;

        let body = match fetcher::fetch(client, u, &extra).await {
            Ok(o) => {
                ok_urls += 1;
                if http_status.is_none() {
                    http_status = o.http_status;
                }
                o.body
            }
            Err(e) => {
                let msg = e.to_string();
                if let Ok(conn) = crate::db::schema::open(db_path) {
                    let _ = crate::db::repo::log_collect(
                        &conn, &def.key, u, None, t0.elapsed().as_millis() as i64, false, Some(&msg),
                    );
                }
                if first_err.is_none() {
                    first_err = Some(msg);
                }
                continue;
            }
        };

        // 解析（纯 CPU，无 await）
        let mut got: Vec<ParsedItem> = match def.key.as_str() {
            "nvd" => crate::parse::nvd::NvdParser.parse(&body)?,
            "ghsa" => crate::parse::ghsa::GhsaParser.parse(&body)?,
            "cisa_kev" => crate::parse::kev::KevParser.parse(&body)?,
            _ => crate::parse::rss::RssParser { source_key: def.key.clone() }.parse(&body)?,
        };
        parsed.append(&mut got);
    }

    // 一个都没成功才算这个源失败
    if ok_urls == 0 {
        return Ok(SourceOutcome {
            source_key: def.key.clone(),
            name: def.name.clone(),
            status: "failed".into(),
            fetched: 0,
            inserted: 0,
            skipped: 0,
            elapsed_ms: t0.elapsed().as_millis() as u64,
            message: first_err.or_else(|| Some("全部请求失败".into())),
        });
    }

    let total_fetched = parsed.len();
    let now = chrono::Utc::now().to_rfc3339();
    let mut inserted = 0usize;
    let mut skipped = 0usize;

    {
        let conn = crate::db::schema::open(db_path)?;
        // 整批放进一个 IMMEDIATE 事务：
        // 1) 逐条 autocommit 时每条都是一次 WAL 提交，1000 条要 1000 次落盘
        // 2) 事务内只要有单条失败，其余条目仍然全部提交，不丢数据
        let mut write_errors: usize = 0;
        {
            let tx = crate::db::schema::write_tx(&conn)?;
            for p in parsed.into_iter().take(def.max_items.max(1)) {
                match crate::db::repo::upsert_item(&tx, &p, &def.key, &now) {
                    Ok(true) => inserted += 1,
                    Ok(false) => skipped += 1,
                    Err(e) => {
                        write_errors += 1;
                        crate::log_line(&format!("[collect] {} 单条写入失败：{}", def.key, e));
                    }
                }
            }
            tx.commit()?;
        }
        if write_errors > 0 {
            let _ = crate::db::repo::log_collect(
                &conn,
                &def.key,
                &url,
                http_status.map(|s| s as i64),
                t0.elapsed().as_millis() as i64,
                false,
                Some(&format!("{} 条写入失败", write_errors)),
            );
        }
        let _ = crate::db::repo::log_collect(
            &conn,
            &def.key,
            &url,
            http_status.map(|s| s as i64),
            t0.elapsed().as_millis() as i64,
            true,
            None,
        );
    }

    Ok(SourceOutcome {
        source_key: def.key.clone(),
        name: def.name.clone(),
        status: "ok".into(),
        fetched: total_fetched,
        inserted,
        skipped,
        elapsed_ms: t0.elapsed().as_millis() as u64,
        message: None,
    })
}

/// CVSS 交叉回填：KEV 源不提供评分，用其它源同 CVE 号的分值补齐
/// 这样「按 CVSS 排序 / 筛选」时不会丢失在野利用告警
pub fn cross_fill_cvss(conn: &rusqlite::Connection) -> crate::error::AppResult<usize> {
    // 用同 cve_id 下已有评分的最高分，回填到缺分值的条目
    let n = conn.execute(
        "UPDATE items AS t
         SET cvss_score = (
                SELECT MAX(s.cvss_score) FROM items s
                WHERE s.cve_id = t.cve_id AND s.cvss_score IS NOT NULL
             ),
             cvss_severity = (
                SELECT s.cvss_severity FROM items s
                WHERE s.cve_id = t.cve_id AND s.cvss_score IS NOT NULL
                ORDER BY s.cvss_score DESC LIMIT 1
             )
         WHERE t.cvss_score IS NULL
           AND t.cve_id IS NOT NULL
           AND EXISTS (
                SELECT 1 FROM items s
                WHERE s.cve_id = t.cve_id AND s.cvss_score IS NOT NULL
             )",
        [],
    )?;
    Ok(n)
}

/// KEV 名单回填：把已在 KEV 的 CVE 标记到其它源的同号条目上
pub fn cross_mark_kev(conn: &rusqlite::Connection) -> crate::error::AppResult<usize> {
    let mut st = conn.prepare(
        "UPDATE items SET in_kev = 1
         WHERE in_kev = 0 AND cve_id IS NOT NULL AND cve_id IN (
            SELECT cve_id FROM items WHERE source_key = 'cisa_kev' AND cve_id IS NOT NULL
         )",
    )?;
    Ok(st.execute([])?)
}
