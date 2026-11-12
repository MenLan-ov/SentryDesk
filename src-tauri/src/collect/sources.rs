//! 数据源白名单（硬编码，唯一入口）。
//! 只允许公开 API / 公开 RSS，且经 robots.txt 校验。
use crate::models::SourceDef;

/// 固定 User-Agent：含项目名与用途说明，不伪装浏览器、不含任何个人标识
pub const USER_AGENT: &str =
    "SentryDesk/1.1.2 (local personal research tool; non-commercial, robots-compliant)";

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

/// 单次采集要访问的 URL 列表。
///
/// 为什么 NVD 不止一个 URL：只取「最新 50 条」时，CWE 分布极度倾斜
/// （CWE-862/79/89 占大头），教学卡里那些冷门类别一条都落不到库里，
/// 用户点进去就是空列表。NVD 官方支持 cweId 过滤，按类别定向补齐，
/// 每个类别只取少量条目，既补全覆盖面又不放大请求量。
/// 其余源仍然是一源一请求，保持原有合规节奏。
pub fn entry_urls(key: &str) -> Vec<String> {
    match key {
        "nvd" => {
            let mut v = vec![entry_url("nvd").unwrap_or_default()];
            // 与教学卡/常见弱点对齐的定向查询；每类 20 条足够「至少有内容」
            for cwe in NVD_CWE_TARGETS {
                v.push(format!(
                    "https://services.nvd.nist.gov/rest/json/cves/2.0?cweId={cwe}&resultsPerPage=20"
                ));
            }
            v
        }
        _ => entry_url(key).into_iter().collect(),
    }
}

/// 定向补采的 CWE 列表。
/// 只放「NVD 确实会分配 CVE」的类别：像 CWE-1059 / CWE-1104 / CWE-29 这类
/// 设计/过程层面的弱点，NVD 侧就是 0 条，查了也是空，不放进来浪费请求。
/// 只补「教学卡有卡、库里却几乎没有」的类别。
/// 数量刻意压到 4 个：NVD 无 key 时限 5 次/30s，每类 20 条已经够「点进去有内容」，
/// 再加只会把一次采集拖到一分钟以上，用户体感很差。
pub const NVD_CWE_TARGETS: [&str; 4] = [
    "CWE-327", // 使用已被攻破/有风险的加密算法（NVD 428 条）
    "CWE-799", // 交互频率控制不当（NVD 2 条，全取）
    "CWE-311", // 敏感数据缺失加密（NVD 252 条）
    "CWE-330", // 不充分的随机值（NVD 283 条）
];

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
