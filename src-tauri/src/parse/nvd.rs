//! NVD CVE API 2.0 解析器
use crate::error::{AppError, AppResult};
use crate::models::{Lang, ParsedItem, Severity};
use crate::parse::{clean_products, clean_text, detect_lang, norm_cve, SourceParser};
use serde_json::Value;

pub struct NvdParser;

impl SourceParser for NvdParser {
    fn parse(&self, raw: &[u8]) -> AppResult<Vec<ParsedItem>> {
        let v: Value = serde_json::from_slice(raw).map_err(|e| AppError::Parse(format!("NVD JSON 解析失败：{}", e)))?;
        let arr = v
            .get("vulnerabilities")
            .and_then(|x| x.as_array())
            .ok_or_else(|| AppError::Parse("NVD 响应缺少 vulnerabilities 数组".into()))?;

        let mut out = Vec::new();
        for entry in arr {
            let Some(cve) = entry.get("cve") else { continue };
            let id = cve.get("id").and_then(|x| x.as_str()).unwrap_or("");
            let cve_id = norm_cve(id);

            // descriptions：优先英文，其次中文
            let mut desc_en: Option<String> = None;
            let mut desc_zh: Option<String> = None;
            if let Some(descs) = cve.get("descriptions").and_then(|x| x.as_array()) {
                for d in descs {
                    let lang = d.get("lang").and_then(|x| x.as_str()).unwrap_or("");
                    let val = d.get("value").and_then(|x| x.as_str()).unwrap_or("");
                    if lang == "en" && desc_en.is_none() {
                        desc_en = clean_text(val, 2000);
                    } else if lang == "zh" && desc_zh.is_none() {
                        desc_zh = clean_text(val, 2000);
                    }
                }
            }
            let summary = desc_en.clone().or_else(|| desc_zh.clone());
            if summary.is_none() {
                continue;
            }

            // CVSS：优先 v4.0 > v3.1 > v3.0 > v2
            let mut score: Option<f64> = None;
            let mut sev: Option<Severity> = None;
            if let Some(metrics) = cve.get("metrics") {
                for key in ["cvssMetricV40", "cvssMetricV31", "cvssMetricV30", "cvssMetricV2"] {
                    if let Some(arr2) = metrics.get(key).and_then(|x| x.as_array())
                        && let Some(first) = arr2.first()
                            && let Some(cd) = first.get("cvssData") {
                                score = cd.get("baseScore").and_then(|x| x.as_f64());
                                let sv = cd.get("baseSeverity").and_then(|x| x.as_str());
                                sev = match sv {
                                    Some("CRITICAL") => Some(Severity::Critical),
                                    Some("HIGH") => Some(Severity::High),
                                    Some("MEDIUM") => Some(Severity::Medium),
                                    Some("LOW") => Some(Severity::Low),
                                    _ => score.and_then(Severity::from_score),
                                };
                                if score.is_some() {
                                    break;
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

            // 标题：NVD 无独立标题，用 CVE 号 + 产品组合出可读标题
            let publish = cve.get("published").and_then(|x| x.as_str()).map(|s| s.to_string());
            let affected_products = extract_products_from_cpe(cve);
            let title = build_title(cve_id.as_deref(), &affected_products, &summary);
            let lang = if desc_zh.is_some() && desc_en.is_none() {
                Lang::Zh
            } else {
                detect_lang(&title)
            };

            // CWE：取第一个形如 CWE-NNN 的条目
            let cwe = cve
                .get("weaknesses")
                .and_then(|x| x.as_array())
                .and_then(|arr2| {
                    arr2.iter().find_map(|w| {
                        w.get("description")
                            .and_then(|d| d.as_array())
                            .and_then(|ds| {
                                ds.iter().find_map(|d| {
                                    let v = d.get("value").and_then(|x| x.as_str())?;
                                    crate::parse::norm_cwe(v)
                                })
                            })
                    })
                });

            out.push(ParsedItem {
                external_id: cve_id.clone(),
                cve_id,
                title,
                summary,
                cvss_score: score,
                cvss_severity: sev,
                products: affected_products,
                published_at: publish,
                source_url: format!("https://nvd.nist.gov/vuln/detail/{}", id),
                lang: if lang == Lang::Zh { Lang::Zh } else { Lang::En },
                cwe,
                action: None,
            });
        }
        Ok(out)
    }
}

fn build_title(cve_id: Option<&str>, products: &[String], summary: &Option<String>) -> String {
    let id = cve_id.unwrap_or("CVE");
    let prod = products.first().cloned().unwrap_or_default();
    let head = if prod.is_empty() {
        id.to_string()
    } else {
        format!("{} · {}", id, prod)
    };
    match summary {
        Some(s) => {
            let short: String = s.chars().take(70).collect();
            if short.chars().count() < s.chars().count() {
                format!("{} — {}…", head, short)
            } else {
                format!("{} — {}", head, short)
            }
        }
        None => head,
    }
}

/// 从 configurations 的 cpeMatch 里抽受影响产品（厂商/产品）
fn extract_products_from_cpe(cve: &Value) -> Vec<String> {
    let mut raw: Vec<String> = Vec::new();
    let Some(nodes) = cve.get("configurations").and_then(|x| x.as_array()) else {
        return Vec::new();
    };
    fn walk(node: &Value, out: &mut Vec<String>) {
        if let Some(matches) = node.get("cpeMatch").and_then(|x| x.as_array()) {
            for m in matches {
                if let Some(c) = m.get("criteria").and_then(|x| x.as_str()) {
                    // cpe:2.3:a:vendor:product:version:...
                    let parts: Vec<&str> = c.split(':').collect();
                    if parts.len() > 4 {
                        let vendor = parts[3];
                        let product = parts[4];
                        if product != "*" && !product.is_empty() {
                            out.push(pretty_product(vendor, product));
                        }
                    }
                }
            }
        }
        if let Some(children) = node.get("nodes").and_then(|x| x.as_array()) {
            for c in children {
                walk(c, out);
            }
        }
    }
    for n in nodes {
        walk(n, &mut raw);
    }
    clean_products(raw)
}

fn pretty_product(vendor: &str, product: &str) -> String {
    if vendor == "*" || vendor.is_empty() || vendor == product {
        product.replace('_', " ")
    } else {
        format!("{} {}", vendor.replace('_', " "), product.replace('_', " "))
    }
}
