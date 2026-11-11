//! GitHub Security Advisory 解析器（REST /advisories）
use crate::error::{AppError, AppResult};
use crate::models::{ParsedItem, Severity};
use crate::parse::{clean_products, clean_text, detect_lang, norm_cve, SourceParser};
use serde_json::Value;

pub struct GhsaParser;

impl SourceParser for GhsaParser {
    fn parse(&self, raw: &[u8]) -> AppResult<Vec<ParsedItem>> {
        let v: Value = serde_json::from_slice(raw).map_err(|e| AppError::Parse(format!("GHSA JSON 解析失败：{}", e)))?;
        let arr = v
            .as_array()
            .ok_or_else(|| AppError::Parse("GHSA 响应应为数组".into()))?;

        let mut out = Vec::new();
        for a in arr {
            let ghsa_id = a.get("ghsa_id").and_then(|x| x.as_str()).unwrap_or("");
            let cve_raw = a.get("cve_id").and_then(|x| x.as_str()).unwrap_or("");
            let cve_id = norm_cve(cve_raw).or_else(|| crate::parse::extract_cve(ghsa_id));

            let summary = a.get("summary").and_then(|x| x.as_str()).unwrap_or("");
            let desc = a.get("description").and_then(|x| x.as_str()).unwrap_or("");
            let title = clean_text(summary, 200)
                .or_else(|| clean_text(desc, 120))
                .unwrap_or_else(|| ghsa_id.to_string());
            let body = clean_text(desc, 2000);

            // CVSS：优先 cvss 对象，其次 cvss_severities 里的向量
            let mut score: Option<f64> = a
                .get("cvss")
                .and_then(|c| c.get("score"))
                .and_then(|x| x.as_f64());
            let mut sev = a
                .get("severity")
                .and_then(|x| x.as_str())
                .and_then(|s| match s.to_uppercase().as_str() {
                    "CRITICAL" => Some(Severity::Critical),
                    "HIGH" => Some(Severity::High),
                    "MEDIUM" => Some(Severity::Medium),
                    "LOW" => Some(Severity::Low),
                    _ => None,
                });
            if score.is_none() {
                for k in ["cvss_severities"] {
                    if let Some(o) = a.get(k) {
                        for vert in ["cvss_v4", "cvss_v3"] {
                            if let Some(sc) = o.get(vert).and_then(|c| c.get("score")).and_then(|x| x.as_f64()) {
                                score = Some(sc);
                                break;
                            }
                        }
                    }
                }
            }
            if let Some(s) = score {
                if !(0.0..=10.0).contains(&s) {
                    score = None;
                    sev = None;
                } else if sev.is_none() {
                    sev = Severity::from_score(s);
                }
            }

            // 受影响产品：vulnerabilities[].package.name
            let mut prods: Vec<String> = Vec::new();
            if let Some(vs) = a.get("vulnerabilities").and_then(|x| x.as_array()) {
                for vv in vs {
                    if let Some(p) = vv.get("package").and_then(|p| p.get("name")).and_then(|x| x.as_str()) {
                        prods.push(p.to_string());
                    }
                }
            }
            let products = clean_products(prods);

            // CWE：cwes[].cwe_id
            let cwe = a
                .get("cwes")
                .and_then(|x| x.as_array())
                .and_then(|arr| {
                    arr.iter()
                        .find_map(|c| c.get("cwe_id").and_then(|x| x.as_str()))
                })
                .and_then(crate::parse::norm_cwe);

            let published = a.get("published_at").and_then(|x| x.as_str()).map(|s| s.to_string());
            let html = a
                .get("html_url")
                .and_then(|x| x.as_str())
                .map(|s| s.to_string())
                .unwrap_or_else(|| format!("https://github.com/advisories/{}", ghsa_id));

            let lang = detect_lang(&title);
            out.push(ParsedItem {
                external_id: Some(ghsa_id.to_string()),
                cve_id,
                title,
                summary: body,
                cvss_score: score,
                cvss_severity: sev,
                products,
                published_at: published,
                source_url: html,
                lang,
                cwe,
                action: None,
            });
        }
        Ok(out)
    }
}
