//! 通用 RSS 2.0 / Atom 解析器（用于 CISA News、NCSC UK）
use crate::error::{AppError, AppResult};
use crate::models::{Lang, ParsedItem};
use crate::parse::{clean_text, detect_lang, extract_cve, SourceParser};
use quick_xml::events::Event;
use quick_xml::Reader;

pub struct RssParser {
    /// 来源 key。现在不再用它拼兜底 URL（没有链接的条目直接丢弃），
    /// 但保留字段以便解析器统一以「源」为单位构造，未来做按源差异解析时还要用。
    #[allow(dead_code)]
    pub source_key: String,
}

impl SourceParser for RssParser {
    fn parse(&self, raw: &[u8]) -> AppResult<Vec<ParsedItem>> {
        let text = String::from_utf8_lossy(raw);
        let mut reader = Reader::from_str(&text);
        reader.config_mut().trim_text(true);

        let mut items: Vec<RawFeedItem> = Vec::new();
        let mut cur: Option<RawFeedItem> = None;
        let mut buf = Vec::new();
        // 当前正在读取的字段
        let mut field: Option<&'static str> = None;

        loop {
            match reader.read_event_into(&mut buf) {
                Ok(Event::Start(e)) => {
                    let name = String::from_utf8_lossy(e.name().as_ref()).to_lowercase();
                    let local = name.split(':').next_back().unwrap_or("").to_string();
                    match local.as_str() {
                        "item" | "entry" => cur = Some(RawFeedItem::default()),
                        "title" => field = Some("title"),
                        "link" => {
                            // Atom 用 <link href="...">，RSS 用 <link>文本</link>
                            let mut href: Option<String> = None;
                            for a in e.attributes().flatten() {
                                if a.key.as_ref().eq_ignore_ascii_case(b"href") {
                                    href = Some(String::from_utf8_lossy(&a.value).to_string());
                                }
                            }
                            if let (Some(it), Some(h)) = (cur.as_mut(), href)
                                && it.link.is_none() {
                                    it.link = Some(h);
                                }
                            field = Some("link");
                        }
                        "description" | "summary" | "content" => field = Some("desc"),
                        "pubdate" | "published" | "updated" => field = Some("date"),
                        "id" | "guid" => field = Some("guid"),
                        _ => field = None,
                    }
                }
                Ok(Event::Text(t)) => {
                    let val = t.decode().map(|c| c.into_owned()).unwrap_or_default();
                    if let (Some(it), Some(f)) = (cur.as_mut(), field) {
                        match f {
                            "title" => append(&mut it.title, &val),
                            "link" => {
                                if it.link.is_none() {
                                    it.link = Some(val.clone());
                                }
                            }
                            "desc" => append(&mut it.desc, &val),
                            "date" => append(&mut it.date, &val),
                            "guid"
                                if it.guid.is_none() => {
                                    it.guid = Some(val.clone());
                                }
                            _ => {}
                        }
                    }
                }
                Ok(Event::CData(t)) => {
                    let val = String::from_utf8_lossy(&t).to_string();
                    if let (Some(it), Some(f)) = (cur.as_mut(), field) {
                        match f {
                            "title" => append(&mut it.title, &val),
                            "desc" => append(&mut it.desc, &val),
                            "date" => append(&mut it.date, &val),
                            _ => {}
                        }
                    }
                }
                Ok(Event::End(e)) => {
                    let name = String::from_utf8_lossy(e.name().as_ref()).to_lowercase();
                    let local = name.split(':').next_back().unwrap_or("");
                    if (local == "item" || local == "entry")
                        && let Some(it) = cur.take() {
                            items.push(it);
                        }
                    field = None;
                }
                // Atom 的 <link href="…"/> 是自闭合标签，只会产生 Empty 事件，
                // 以前只处理 Start，导致所有 Atom 源都取不到链接（条目被静默丢弃）。
                Ok(Event::Empty(e)) => {
                    let name = String::from_utf8_lossy(e.name().as_ref()).to_lowercase();
                    let local = name.split(':').next_back().unwrap_or("");
                    if local == "link"
                        && let Some(it) = cur.as_mut()
                        && it.link.is_none()
                    {
                        for a in e.attributes().flatten() {
                            if a.key.as_ref().eq_ignore_ascii_case(b"href") {
                                it.link = Some(String::from_utf8_lossy(&a.value).to_string());
                                break;
                            }
                        }
                    }
                }
                Ok(Event::Eof) => break,
                Err(e) => return Err(AppError::Parse(format!("RSS XML 解析失败：{}", e))),
                _ => {}
            }
            buf.clear();
        }

        let mut out = Vec::new();
        for it in items {
            let title = match clean_text(&it.title, 200) {
                Some(t) => t,
                None => continue,
            };
            // 没有链接的条目直接丢弃：以前会兜底成 example.invalid 的假地址，
            // 结果列表里出现「点开 404」的条目，也污染了去重用的 content_hash
            let url = match it.link.clone().or_else(|| it.guid.clone()) {
                Some(u) => u,
                None => continue,
            };
            if !url.starts_with("http") {
                continue;
            }
            let summary = clean_text(&it.desc, 2000);
            let published = parse_date(&it.date);
            let cve_id = extract_cve(&title).or_else(|| extract_cve(&it.desc));

            out.push(ParsedItem {
                external_id: it.guid.clone().or_else(|| Some(url.clone())),
                cve_id,
                title: title.clone(),
                summary,
                cvss_score: None,
                cvss_severity: None,
                products: Vec::new(),
                published_at: published,
                source_url: url,
                lang: detect_lang(&title),
                cwe: None,
                action: None,
            });
        }
        Ok(out)
    }
}


#[derive(Default, Clone)]
struct RawFeedItem {
    title: String,
    link: Option<String>,
    desc: String,
    date: String,
    guid: Option<String>,
}

fn append(dst: &mut String, s: &str) {
    if dst.is_empty() {
        dst.push_str(s);
    } else {
        dst.push(' ');
        dst.push_str(s);
    }
}

/// 解析常见 RSS 日期格式，统一转 UTC ISO8601
fn parse_date(s: &str) -> Option<String> {
    let t = s.trim();
    if t.is_empty() {
        return None;
    }
    // RFC 2822（RSS 2.0）
    if let Ok(d) = chrono::DateTime::parse_from_rfc2822(t) {
        return Some(d.with_timezone(&chrono::Utc).to_rfc3339());
    }
    // RFC 3339（Atom）
    if let Ok(d) = chrono::DateTime::parse_from_rfc3339(t) {
        return Some(d.with_timezone(&chrono::Utc).to_rfc3339());
    }
    // 常见变体：2026-11-10T12:00:00+0000
    for fmt in ["%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"] {
        if let Ok(d) = chrono::DateTime::parse_from_str(t, fmt) {
            return Some(d.with_timezone(&chrono::Utc).to_rfc3339());
        }
        if let Ok(d) = chrono::NaiveDateTime::parse_from_str(t, fmt) {
            return Some(d.and_utc().to_rfc3339());
        }
        if let Ok(d) = chrono::NaiveDate::parse_from_str(t, fmt) {
            return Some(d.and_hms_opt(0, 0, 0)?.and_utc().to_rfc3339());
        }
    }
    None
}

impl RawFeedItem {
    fn _lang_hint(&self) -> Lang {
        detect_lang(&self.title)
    }
}
