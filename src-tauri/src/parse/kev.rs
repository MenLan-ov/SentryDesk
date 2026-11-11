//! CISA KEV（已知被利用漏洞）解析器
use crate::error::{AppError, AppResult};
use crate::models::{Lang, ParsedItem, Severity};
use crate::parse::{clean_products, clean_text, extract_cve, norm_cve, SourceParser};
use serde_json::Value;

pub struct KevParser;

impl SourceParser for KevParser {
    fn parse(&self, raw: &[u8]) -> AppResult<Vec<ParsedItem>> {
        let v: Value = serde_json::from_slice(raw).map_err(|e| AppError::Parse(format!("KEV JSON 解析失败：{}", e)))?;
        let arr = v
            .get("vulnerabilities")
            .and_then(|x| x.as_array())
            .ok_or_else(|| AppError::Parse("KEV 响应缺少 vulnerabilities".into()))?;

        let mut out = Vec::new();
        for a in arr {
            let cve_raw = a.get("cveID").and_then(|x| x.as_str()).unwrap_or("");
            let cve_id = norm_cve(cve_raw).or_else(|| extract_cve(cve_raw));

            let name = a.get("vulnerabilityName").and_then(|x| x.as_str()).unwrap_or("");
            let short = a.get("shortDescription").and_then(|x| x.as_str()).unwrap_or("");
            let action = a.get("requiredAction").and_then(|x| x.as_str()).unwrap_or("");

            let title = clean_text(name, 200).unwrap_or_else(|| cve_raw.to_string());
            // 摘要：描述 + 处置要求（处置摘要是 KEV 的核心价值）
            let summary = {
                let mut s = String::new();
                if let Some(d) = clean_text(short, 1200) {
                    s.push_str(&d);
                }
                if let Some(act) = clean_text(action, 400) {
                    if !s.is_empty() {
                        s.push_str(" | 处置：");
                    }
                    s.push_str(&act);
                }
                if s.is_empty() {
                    None
                } else {
                    Some(s)
                }
            };

            let vendor = a.get("vendorProject").and_then(|x| x.as_str()).unwrap_or("");
            let product = a.get("product").and_then(|x| x.as_str()).unwrap_or("");
            let mut prods = Vec::new();
            if !product.is_empty() {
                prods.push(if vendor.is_empty() {
                    product.to_string()
                } else {
                    format!("{} {}", vendor, product)
                });
            }
            let products = clean_products(prods);

            // CWE：cwes 数组，取第一个
            let cwe = a
                .get("cwes")
                .and_then(|x| x.as_array())
                .and_then(|arr| arr.iter().find_map(|c| c.as_str()))
                .and_then(crate::parse::norm_cwe);

            // 处置要求：KEV 的核心字段，单独抽取供教学展示
            let action = clean_text(action, 600);

            let published = a.get("dateAdded").and_then(|x| x.as_str()).map(|s| s.to_string());

            out.push(ParsedItem {
                external_id: Some(cve_raw.to_string()),
                cve_id: cve_id.clone(),
                title,
                summary,
                // KEV 不提供 CVSS 分值，不做推测
                cvss_score: None,
                cvss_severity: None::<Severity>,
                products,
                published_at: published,
                source_url: cve_id
                    .map(|c| format!("https://nvd.nist.gov/vuln/detail/{}", c))
                    .unwrap_or_else(|| "https://www.cisa.gov/known-exploited-vulnerabilities-catalog".to_string()),
                lang: Lang::En,
                cwe,
                action,
            });
        }
        Ok(out)
    }
}
