//! 数据源白名单（硬编码，唯一入口）。
//! 只允许公开 API / 公开 RSS，且经 robots.txt 校验。
use crate::models::SourceDef;

/// 固定 User-Agent：含项目名与用途说明，不伪装浏览器、不含任何个人标识
pub const USER_AGENT: &str =
    "SentryDesk/1.0.5 (local personal research tool; non-commercial, robots-compliant)";

/// 每域名最小间隔（毫秒）。硬性下限 500ms，配置更小也强制 500。
pub const MIN_INTERVAL_FLOOR_MS: u64 = 500;

/// 默认间隔
pub const DEFAULT_INTERVAL_MS: u64 = 1000;

pub fn all_sources() -> Vec<SourceDef> {
    vec![
        SourceDef {
            key: "nvd".into(),
            name: "NVD CVE API 2.0".into(),
            base_url: "https://services.nvd.nist.gov".into(),
            kind: "json_api".into(),
            min_interval_ms: 6000, // 无 key 时 5 次/30s，保守取 6s
            max_items: 50,
            enabled: true,
        },
        SourceDef {
            key: "ghsa".into(),
            name: "GitHub Security Advisory".into(),
            base_url: "https://api.github.com".into(),
            kind: "json_api".into(),
            min_interval_ms: 1000,
            max_items: 50,
            enabled: true,
        },
        SourceDef {
            key: "cisa_kev".into(),
            name: "CISA KEV".into(),
            base_url: "https://www.cisa.gov".into(),
            kind: "json_api".into(),
            min_interval_ms: 1000,
            max_items: 400,
            enabled: true,
        },
        SourceDef {
            key: "cisa_news".into(),
            name: "CISA News (RSS)".into(),
            base_url: "https://www.cisa.gov".into(),
            kind: "rss".into(),
            min_interval_ms: 1000,
            max_items: 30,
            enabled: true,
        },
        SourceDef {
            key: "ncsc_uk".into(),
            name: "NCSC UK (RSS)".into(),
            base_url: "https://www.ncsc.gov.uk".into(),
            kind: "rss".into(),
            min_interval_ms: 1000,
            max_items: 30,
            enabled: true,
        },
    ]
}

pub fn find(key: &str) -> Option<SourceDef> {
    all_sources().into_iter().find(|s| s.key == key)
}

/// 采集入口 URL（每个源一次请求）
pub fn entry_url(key: &str) -> Option<String> {
    match key {
        "nvd" => Some(
            "https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=50&noRejected".to_string(),
        ),
        "ghsa" => Some(
            "https://api.github.com/advisories?per_page=50&sort=published&direction=desc".to_string(),
        ),
        "cisa_kev" => Some(
            "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"
                .to_string(),
        ),
        "cisa_news" => Some("https://www.cisa.gov/news.xml".to_string()),
        "ncsc_uk" => Some("https://www.ncsc.gov.uk/api/1/services/v1/all-rss-feed.xml".to_string()),
        _ => None,
    }
}

/// robots.txt 检查用的路径
pub fn robots_path(key: &str) -> &'static str {
    match key {
        "nvd" => "/rest/json/cves/2.0",
        "ghsa" => "/advisories",
        "cisa_kev" => "/sites/default/files/feeds/known_exploited_vulnerabilities.json",
        "cisa_news" => "/news.xml",
        "ncsc_uk" => "/api/1/services/v1/all-rss-feed.xml",
        _ => "/",
    }
}
