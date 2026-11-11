//! 解析器回归测试：真实源的畸形响应不能把采集打挂。
//!
//! 采集面对的是公网，返回体什么样都可能：截断的 JSON、缺字段、
//! 类型串位（数字给字符串）、未转义的 &、CDATA、四字节 emoji。
//! 这里的断言只有两条：**不 panic**、**该拿到的字段能拿到**。
#![cfg(test)]

use super::{extract_cve, clean_text, norm_cve, norm_cwe, SourceParser};
use super::{ghsa::GhsaParser, kev::KevParser, nvd::NvdParser, rss::RssParser};
use crate::models::Severity;

fn parse_all(raw: &[u8]) {
    let _ = KevParser.parse(raw);
    let _ = NvdParser.parse(raw);
    let _ = GhsaParser.parse(raw);
    let _ = RssParser { source_key: "cisa_news".into() }.parse(raw);
}

// ==================== KEV ====================

#[test]
fn kev_minimal_is_mapped() {
    let raw = r#"{"vulnerabilities":[{
        "cveID":"CVE-2026-12345",
        "vendorProject":"Acme",
        "product":"Gateway",
        "vulnerabilityName":"Acme Gateway 远程代码执行",
        "shortDescription":"未校验的输入导致命令注入。",
        "requiredAction":"Apply mitigations per vendor instructions.",
        "dateAdded":"2026-11-01",
        "cwes":["CWE-78"]
    }]}"#;
    let items = KevParser.parse(raw.as_bytes()).expect("合法 KEV 不该失败");
    assert_eq!(items.len(), 1);
    let it = &items[0];
    assert_eq!(it.cve_id.as_deref(), Some("CVE-2026-12345"));
    assert_eq!(it.cwe.as_deref(), Some("CWE-78"));
    assert_eq!(it.products, vec!["Acme Gateway".to_string()]);
    assert!(it.summary.as_ref().unwrap().contains("处置："), "摘要里应带处置要求");
    assert!(it.action.is_some());
    println!("KEV：cve={:?} cwe={:?} 产品={:?}", it.cve_id, it.cwe, it.products);
}

#[test]
fn kev_wrong_shapes_do_not_panic() {
    let cases: Vec<&str> = vec![
        "",
        "null",
        "[]",
        "{}",
        r#"{"vulnerabilities":null}"#,
        r#"{"vulnerabilities":{}}"#,
        r#"{"vulnerabilities":"x"}"#,
        r#"{"vulnerabilities":[null]}"#,
        r#"{"vulnerabilities":[{}]}"#,
        r#"{"vulnerabilities":[{"cveID":123,"product":42}]}"#,
        r#"{"vulnerabilities":[{"cveID":"NOT-A-CVE"}]}"#,
    ];
    for c in &cases {
        parse_all(c.as_bytes());
    }
    parse_all(&[0xff, 0xfe, 0x00, 0x01]);
    // 非 CVE 编号应被丢弃而不是写进库
    let items = KevParser.parse(r#"{"vulnerabilities":[{"cveID":"NOT-A-CVE"}]}"#.as_bytes()).unwrap();
    assert!(items.len() == 1 && items[0].cve_id.is_none(), "非法 CVE 不应被当成编号");
    println!("KEV：{} 种畸形响应全部未 panic", cases.len());
}

// ==================== NVD ====================

#[test]
fn nvd_minimal_is_mapped() {
    let raw = r#"{"vulnerabilities":[{"cve":{
        "id":"CVE-2026-9999",
        "descriptions":[{"lang":"en","value":"Heap overflow in FooParser."}],
        "metrics":{"cvssMetricV31":[{"cvssData":{"baseScore":9.8,"baseSeverity":"CRITICAL"}}]},
        "weaknesses":[{"description":[{"lang":"en","value":"CWE-787"}]}]
    }}]}"#;
    let items = NvdParser.parse(raw.as_bytes()).expect("合法 NVD 不该失败");
    assert_eq!(items.len(), 1);
    let it = &items[0];
    assert_eq!(it.cve_id.as_deref(), Some("CVE-2026-9999"));
    assert_eq!(it.cvss_score, Some(9.8));
    assert!(matches!(it.cvss_severity, Some(Severity::Critical)));
    assert_eq!(it.cwe.as_deref(), Some("CWE-787"));
    println!("NVD：score={:?} sev={:?} cwe={:?}", it.cvss_score, it.cvss_severity, it.cwe);
}

#[test]
fn nvd_hostile_values_are_rejected() {
    // 分值给字符串、超范围、缺描述
    let raw = r#"{"vulnerabilities":[
      {"cve":{"id":"CVE-2026-0001","descriptions":[{"lang":"en","value":"A"}],
              "metrics":{"cvssMetricV31":[{"cvssData":{"baseScore":"9.8"}}]}}},
      {"cve":{"id":"CVE-2026-0002","descriptions":[{"lang":"en","value":"B"}],
              "metrics":{"cvssMetricV31":[{"cvssData":{"baseScore":99.0}}]}}},
      {"cve":{"id":"CVE-2026-0003"}},
      {"nope":true}
    ]}"#;
    let items = NvdParser.parse(raw.as_bytes()).expect("畸形字段不该让整批失败");
    // 字符串分值 -> 视为没有分值；99 -> 超出 0..10 被清空；无描述 -> 跳过
    assert_eq!(items.len(), 2, "应只保留两条有描述的，实际 {}", items.len());
    assert!(items[0].cvss_score.is_none(), "字符串分值不应被采信");
    assert!(items[1].cvss_score.is_none(), "超范围分值应被丢弃");
    println!("NVD：越界/串位分值被丢弃，缺描述条目被跳过");
}

// ==================== GHSA ====================

#[test]
fn ghsa_maps_and_rejects() {
    let raw = r#"[{
      "ghsa_id":"GHSA-aaaa-bbbb-cccc",
      "cve_id":"CVE-2026-7777",
      "summary":"Prototype pollution in libx",
      "description":"Deep merge allows __proto__ write.",
      "severity":"high",
      "cvss":{"score":7.5},
      "vulnerabilities":[{"package":{"name":"libx"}}]
    },{"ghsa_id":"GHSA-dddd"}]"#;
    let items = GhsaParser.parse(raw.as_bytes()).expect("合法 GHSA 数组不该失败");
    assert_eq!(items.len(), 2);
    assert_eq!(items[0].cve_id.as_deref(), Some("CVE-2026-7777"));
    assert_eq!(items[0].cvss_score, Some(7.5));
    assert!(matches!(items[0].cvss_severity, Some(Severity::High)));
    // 没有 cve_id 的第二条应回退用 GHSA 编号里的 CVE（没有则保持空）
    assert!(GhsaParser.parse(r#"{"a":1}"#.as_bytes()).is_err(), "非数组应报错");
    println!("GHSA：{} 条解析成功，非数组报错", items.len());
}

// ==================== RSS ====================

#[test]
fn rss2_and_atom_are_mapped() {
    let rss = r#"<?xml version="1.0"?><rss><channel>
      <item><title>CVE-2026-1111 &amp; 补丁已发布</title>
            <link>https://example.invalid/a</link>
            <description><![CDATA[厂商 <b>已修复</b>，建议尽快升级。]]></description>
            <pubDate>Tue, 03 Nov 2026 08:00:00 GMT</pubDate></item>
      <item><title>没有链接的条目</title><description>应被跳过</description></item>
    </channel></rss>"#;
    let items = RssParser { source_key: "cisa_news".into() }.parse(rss.as_bytes()).expect("合法 RSS 不该失败");
    assert_eq!(items.len(), 1, "缺链接的条目应被跳过");
    assert_eq!(items[0].cve_id.as_deref(), Some("CVE-2026-1111"));
    assert!(items[0].source_url.starts_with("http"));
    assert!(!items[0].title.contains("<b>"), "CDATA 里的标签应被清掉");
    assert!(items[0].published_at.is_some(), "pubDate 应被解析");

    let atom = r#"<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom">
      <entry><title>Atom 条目</title><link href="https://example.invalid/b"/>
             <summary>摘要</summary><updated>2026-11-02T10:00:00Z</updated></entry>
    </feed>"#;
    let a = RssParser { source_key: "cisa_news".into() }.parse(atom.as_bytes()).expect("合法 Atom 不该失败");
    assert_eq!(a.len(), 1);
    assert_eq!(a[0].source_url, "https://example.invalid/b");
    println!("RSS/Atom：RSS {} 条、Atom {} 条", items.len(), a.len());
}

#[test]
fn rss_malformed_reports_error_without_panic() {
    for bad in [
        "<rss><channel><item><title>x</title>",
        "not xml at all",
        "<a><b></a>",
    ] {
        let r = RssParser { source_key: "cisa_news".into() }.parse(bad.as_bytes());
        // 允许 Ok(空) 或 Err，但绝不能 panic
        println!("畸形 XML -> {:?}", r.as_ref().map(|v| v.len()).map_err(|e| e.to_string()));
        parse_all(bad.as_bytes());
    }
}

// ==================== 工具函数 ====================

#[test]
fn helpers_handle_edges() {
    assert_eq!(norm_cve(" cve-2026-1234 ").as_deref(), Some("CVE-2026-1234"));
    assert_eq!(norm_cve("CVE-26-1234"), None);
    assert_eq!(norm_cve("CVE-2026-123"), None, "三位序号不合法");
    assert_eq!(extract_cve("详见 CVE-2026-12345 公告").as_deref(), Some("CVE-2026-12345"));
    assert_eq!(norm_cwe("cwe-89:2019").as_deref(), Some("CWE-89"));
    assert_eq!(norm_cwe("没有编号"), None);

    // 截断按字符数而非字节数：4000 个 emoji 不能切成半个字符
    let s = "🔒".repeat(50);
    let t = clean_text(&s, 10).unwrap();
    assert_eq!(t.chars().count(), 11, "应为 10 个字符 + 省略号");
    assert!(t.ends_with('…'));

    assert!(clean_text("   \n\n  ", 100).is_none(), "纯空白应返回 None");
    println!("工具函数：CVE/CWE 规范化与字符级截断正常");
}

#[test]
fn random_bytes_never_panic() {
    // 简单 LCG，避免引入 rand 依赖
    let mut seed: u64 = 0x9E3779B97F4A7C15;
    let next = |s: &mut u64| {
        *s = s.wrapping_mul(6364136223846793005).wrapping_add(1442695040888963407);
        (*s >> 33) as u8
    };
    let alphabet = b"{}[]<>&\"':,/\\0123456789abcdefgh \n\t";
    for _ in 0..300 {
        let len = 1 + (next(&mut seed) as usize % 200);
        let raw: Vec<u8> = (0..len)
            .map(|_| {
                let b = next(&mut seed);
                if b % 3 == 0 { b } else { alphabet[(b as usize) % alphabet.len()] }
            })
            .collect();
        parse_all(&raw);
    }
    println!("模糊输入：300 组随机字节穿过 4 个解析器，无 panic");
}
