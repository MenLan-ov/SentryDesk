//! 数据访问层：插入、检索、详情、统计、日志、笔记
use crate::error::AppResult;
use crate::models::*;
use rusqlite::{params, Connection, OptionalExtension, Row};

/// 由标题 + 来源 URL 计算去重哈希
pub fn content_hash(title: &str, source_url: &str) -> String {
    use sha2::{Digest, Sha256};
    let mut h = Sha256::new();
    h.update(title.trim().as_bytes());
    h.update(b"|");
    h.update(source_url.trim().as_bytes());
    format!("{:x}", h.finalize())
}

/// 播种数据源白名单
pub fn seed_sources(conn: &Connection) -> AppResult<()> {
    for s in crate::collect::sources::all_sources() {
        conn.execute(
            "INSERT INTO sources (key, name, base_url, kind, min_interval_ms, enabled)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)
             ON CONFLICT(key) DO UPDATE SET name=excluded.name, base_url=excluded.base_url, kind=excluded.kind",
            params![s.key, s.name, s.base_url, s.kind, s.min_interval_ms as i64, if s.enabled { 1 } else { 0 }],
        )?;
    }
    Ok(())
}

/// 读取数据源白名单
pub fn list_sources(conn: &Connection) -> AppResult<Vec<SourceDef>> {
    let mut st = conn.prepare(
        "SELECT key, name, base_url, kind, min_interval_ms, enabled FROM sources ORDER BY id",
    )?;
    let rows = st.query_map([], |r| {
        Ok(SourceDef {
            key: r.get(0)?,
            name: r.get(1)?,
            base_url: r.get(2)?,
            kind: r.get(3)?,
            min_interval_ms: r.get::<_, i64>(4)? as u64,
            max_items: 0,
            enabled: r.get::<_, i64>(5)? == 1,
        })
    })?;
    let mut out = Vec::new();
    for r in rows {
        out.push(r?);
    }
    // 用代码里的定义补齐 max_items
    for o in out.iter_mut() {
        if let Some(d) = crate::collect::sources::all_sources().into_iter().find(|d| d.key == o.key) {
            o.max_items = d.max_items;
        }
    }
    Ok(out)
}

/// 更新 robots 校验状态
pub fn set_robots(conn: &Connection, st: &RobotsStatus) -> AppResult<()> {
    conn.execute(
        "UPDATE sources SET robots_allowed=?1, robots_state=?2, robots_checked_at=?3 WHERE key=?4",
        params![
            if st.allowed { 1 } else { 0 },
            st.state,
            st.checked_at,
            st.source_key
        ],
    )?;
    Ok(())
}

/// 读取 robots 状态
pub fn list_robots(conn: &Connection) -> AppResult<Vec<RobotsStatus>> {
    let mut st = conn.prepare(
        "SELECT key, robots_allowed, COALESCE(robots_state,'unknown'), COALESCE(robots_checked_at,''), base_url
         FROM sources ORDER BY id",
    )?;
    let rows = st.query_map([], |r| {
        Ok(RobotsStatus {
            source_key: r.get(0)?,
            allowed: r.get::<_, i64>(1)? == 1,
            state: r.get(2)?,
            checked_at: r.get(3)?,
            detail: r.get(4)?,
        })
    })?;
    let mut out = Vec::new();
    for r in rows {
        out.push(r?);
    }
    Ok(out)
}

fn row_to_item(r: &Row) -> rusqlite::Result<Item> {
    let products_json: Option<String> = r.get("products")?;
    let products: Vec<String> = products_json
        .and_then(|s| serde_json::from_str::<Vec<String>>(&s).ok())
        .unwrap_or_default();
    Ok(Item {
        id: r.get("id")?,
        source_key: r.get("source_key")?,
        external_id: r.get("external_id")?,
        cve_id: r.get("cve_id")?,
        title: r.get("title")?,
        summary: r.get("summary")?,
        cvss_score: r.get("cvss_score")?,
        cvss_severity: r.get("cvss_severity")?,
        products,
        published_at: r.get("published_at")?,
        source_url: r.get("source_url")?,
        collected_at: r.get("collected_at")?,
        lang: r.get("lang")?,
        in_kev: r.get::<_, i64>("in_kev")? == 1,
        cwe: r.get("cwe").unwrap_or(None),
        action: r.get("action").unwrap_or(None),
        favorite: r.get::<_, i64>("fav").unwrap_or(0) == 1,
        tags: Vec::new(),
        note: None,
        lesson: None,
    })
}

/// 按 content_hash 去重插入；返回 true 表示新增
pub fn upsert_item(conn: &Connection, p: &ParsedItem, source_key: &str, collected_at: &str) -> AppResult<bool> {
    let hash = content_hash(&p.title, &p.source_url);
    let products = serde_json::to_string(&p.products)?;
    let sev = p.cvss_severity.map(|s| s.as_str().to_string());
    let n = conn.execute(
        "INSERT INTO items (source_key, external_id, cve_id, title, summary, cvss_score, cvss_severity,
                            products, published_at, source_url, collected_at, lang, in_kev, cwe, action, content_hash)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,0,?13,?14,?15)
         ON CONFLICT(content_hash) DO NOTHING",
        params![
            source_key,
            p.external_id,
            p.cve_id,
            p.title,
            p.summary,
            p.cvss_score,
            sev,
            products,
            p.published_at,
            p.source_url,
            collected_at,
            p.lang.as_str(),
            p.cwe,
            p.action,
            hash
        ],
    )?;
    Ok(n > 0)
}

/// 标记某 CVE 在 KEV 名单中
fn build_where(f: &SearchFilter, use_fts: bool) -> (String, Vec<Box<dyn rusqlite::ToSql>>) {
    let mut clauses: Vec<String> = Vec::new();
    let mut args: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

    if use_fts {
        clauses.push("i.id IN (SELECT rowid FROM items_fts WHERE items_fts MATCH ?)".into());
        args.push(Box::new(f.query.clone()));
    }
    if let Some(sk) = &f.source_key
        && !sk.is_empty() && sk != "all" {
            clauses.push("i.source_key = ?".into());
            args.push(Box::new(sk.clone()));
        }
    if let Some(cv) = f.cvss_min {
        clauses.push("i.cvss_score IS NOT NULL AND i.cvss_score >= ?".into());
        args.push(Box::new(cv));
    }
    if let Some(d) = f.days
        && d > 0 {
            let since = chrono::Utc::now() - chrono::Duration::days(d);
            clauses.push("i.published_at IS NOT NULL AND i.published_at >= ?".into());
            args.push(Box::new(since.format("%Y-%m-%d").to_string()));
        }
    if f.kev_only {
        clauses.push("i.in_kev = 1".into());
    }
    if let Some(sev) = &f.severity
        && !sev.is_empty() && sev != "all" {
            clauses.push("i.cvss_severity = ?".into());
            args.push(Box::new(sev.clone()));
        }
    if let Some(c) = &f.cwe
        && !c.is_empty() && c != "all" {
            clauses.push("i.cwe = ?".into());
            args.push(Box::new(c.clone()));
        }
    if f.favorite_only {
        clauses.push("i.id IN (SELECT item_id FROM favorites)".into());
    }
    let w = if clauses.is_empty() {
        "1=1".to_string()
    } else {
        clauses.join(" AND ")
    };
    (w, args)
}

/// 转义 LIKE 通配符，避免用户输入的 % / _ 被当成通配符
fn like_escape(s: &str) -> String {
    let mut out = String::with_capacity(s.len() + 2);
    for ch in s.chars() {
        match ch {
            '\\' | '%' | '_' => {
                out.push('\\');
                out.push(ch);
            }
            _ => out.push(ch),
        }
    }
    out
}

/// 判断关键词是否可用于 trigram（需 >= 3 个字符；中文 2 字需 LIKE 兜底）
fn fts_usable(q: &str) -> bool {
    let t = q.trim();
    if t.is_empty() {
        return false;
    }
    // 转义 FTS5 特殊字符，用双引号包裹成短语
    t.chars().filter(|c| !c.is_whitespace()).count() >= 3
}

fn quote_fts(q: &str) -> String {
    let cleaned = q.replace('"', " ");
    format!("\"{}\"", cleaned.trim())
}

/// 检索：关键词 + 筛选，返回结果与耗时
pub fn search_items(conn: &Connection, f: &SearchFilter) -> AppResult<SearchResult> {
    let t0 = std::time::Instant::now();
    let limit = f.limit.unwrap_or(100).clamp(1, 500);
    let offset = f.offset.unwrap_or(0).max(0);

    let q = f.query.trim().to_string();
    let use_fts = fts_usable(&q);
    let use_like = !q.is_empty() && !use_fts;

    let mut f2 = f.clone();
    if use_fts {
        f2.query = quote_fts(&q);
    }

    // ---- 一次性构建 WHERE 与参数，COUNT 与列表共用同一份 ----
    let (where_sql, mut owned) = build_where(&f2, use_fts);

    let where_sql = if use_like {
        // trigram 分词器要求至少 3 个字符，更短的词退化为子串匹配
        // 用户输入里的 % 和 _ 必须转义，否则会被当成通配符（搜 "%" 会命中全库）
        let pat = format!("%{}%", like_escape(&q));
        for _ in 0..4 {
            owned.push(Box::new(pat.clone()));
        }
        format!(
            "({}) AND (i.title LIKE ? ESCAPE '\\' OR i.summary LIKE ? ESCAPE '\\' OR i.products LIKE ? ESCAPE '\\' OR i.cve_id LIKE ? ESCAPE '\\')",
            where_sql
        )
    } else {
        where_sql
    };

    let params: Vec<&dyn rusqlite::ToSql> = owned.iter().map(|b| b.as_ref()).collect();

    let count_sql = format!("SELECT COUNT(*) FROM items i WHERE {}", where_sql);
    let total: i64 = conn.query_row(&count_sql, params.as_slice(), |r| r.get(0))?;

    // 列表查询在 WHERE 参数之后追加 LIMIT / OFFSET，顺序与占位符严格一致
    let list_sql = format!(
        "SELECT i.*, EXISTS(SELECT 1 FROM favorites fv WHERE fv.item_id = i.id) AS fav
         FROM items i WHERE {}
         ORDER BY i.in_kev DESC,
                  CASE WHEN i.cvss_score IS NULL THEN 1 ELSE 0 END ASC,
                  i.cvss_score DESC,
                  COALESCE(i.published_at, i.collected_at) DESC,
                  i.id DESC
         LIMIT ? OFFSET ?",
        where_sql
    );
    let mut list_params = params;
    list_params.push(&limit as &dyn rusqlite::ToSql);
    list_params.push(&offset as &dyn rusqlite::ToSql);

    let mut st = conn.prepare(&list_sql)?;
    let rows = st.query_map(list_params.as_slice(), row_to_item)?;
    let mut items = Vec::new();
    for r in rows {
        items.push(r?);
    }

    Ok(SearchResult {
        total,
        items,
        elapsed_ms: t0.elapsed().as_millis() as u64,
    })
}

/// 详情：条目 + 标签 + 笔记 +（可选）关联教学卡
pub fn get_item_with_lesson(
    conn: &Connection,
    id: i64,
    data_dir: &std::path::Path,
) -> AppResult<Option<Item>> {
    let mut it = match get_item(conn, id)? {
        Some(x) => x,
        None => return Ok(None),
    };
    if let Some(cwe) = it.cwe.clone() {
        it.lesson = crate::knowledge::by_cwe(data_dir, &cwe);
    }
    Ok(Some(it))
}

/// 详情：条目 + 标签 + 笔记
pub fn get_item(conn: &Connection, id: i64) -> AppResult<Option<Item>> {
    let mut st = conn.prepare(
        "SELECT i.*, EXISTS(SELECT 1 FROM favorites fv WHERE fv.item_id = i.id) AS fav
         FROM items i WHERE i.id = ?1",
    )?;
    let item = st.query_row(params![id], row_to_item).optional()?;
    let Some(mut it) = item else { return Ok(None) };

    let mut tst = conn.prepare(
        "SELECT t.name FROM tags t JOIN item_tags it ON it.tag_id = t.id WHERE it.item_id = ?1 ORDER BY t.name",
    )?;
    let tags = tst
        .query_map(params![id], |r| r.get::<_, String>(0))?
        .collect::<rusqlite::Result<Vec<_>>>()?;
    it.tags = tags;

    let mut nst = conn.prepare(
        "SELECT id, item_id, body, created_at, updated_at FROM notes WHERE item_id = ?1 ORDER BY id DESC LIMIT 1",
    )?;
    it.note = nst
        .query_row(params![id], |r| {
            Ok(Note {
                id: r.get(0)?,
                item_id: r.get(1)?,
                body: r.get(2)?,
                created_at: r.get(3)?,
                updated_at: r.get(4)?,
            })
        })
        .optional()?;
    Ok(Some(it))
}

/// 新增或更新笔记（同一 item 只保留一条）
pub fn upsert_note(conn: &Connection, item_id: i64, body: &str) -> AppResult<Note> {
    let now = chrono::Utc::now().to_rfc3339();
    let existing: Option<i64> = conn
        .query_row("SELECT id FROM notes WHERE item_id = ?1 LIMIT 1", params![item_id], |r| r.get(0))
        .optional()?;
    let id = match existing {
        Some(id) => {
            conn.execute("UPDATE notes SET body = ?1, updated_at = ?2 WHERE id = ?3", params![body, now, id])?;
            id
        }
        None => {
            conn.execute(
                "INSERT INTO notes (item_id, body, created_at, updated_at) VALUES (?1, ?2, ?3, ?3)",
                params![item_id, body, now],
            )?;
            conn.last_insert_rowid()
        }
    };
    Ok(Note { id, item_id, body: body.to_string(), created_at: now.clone(), updated_at: now })
}

/// 统计概览
pub fn stats(conn: &Connection, db_path: &std::path::Path) -> AppResult<Stats> {
    let total: i64 = conn.query_row("SELECT COUNT(*) FROM items", [], |r| r.get(0))?;
    let kev_count: i64 = conn.query_row("SELECT COUNT(*) FROM items WHERE in_kev = 1", [], |r| r.get(0))?;
    let db_bytes = std::fs::metadata(db_path).map(|m| m.len()).unwrap_or(0);

    let mut st = conn.prepare(
        "SELECT s.key, s.name, COUNT(i.id), MAX(i.collected_at)
         FROM sources s LEFT JOIN items i ON i.source_key = s.key
         GROUP BY s.key, s.name ORDER BY s.id",
    )?;
    let by_source = st
        .query_map([], |r| {
            Ok(SourceCount {
                source_key: r.get(0)?,
                name: r.get(1)?,
                count: r.get(2)?,
                last_at: r.get(3)?,
            })
        })?
        .collect::<rusqlite::Result<Vec<_>>>()?;

    let mut st2 = conn.prepare(
        "SELECT COALESCE(cvss_severity,'UNKNOWN'), COUNT(*) FROM items GROUP BY 1 ORDER BY 2 DESC",
    )?;
    let by_severity = st2
        .query_map([], |r| Ok(SeverityCount { severity: r.get(0)?, count: r.get(1)? }))?
        .collect::<rusqlite::Result<Vec<_>>>()?;

    // collect_log 的时间字段是 started_at（不是 collected_at）
    let last_collected_at: Option<String> =
        conn.query_row("SELECT MAX(started_at) FROM collect_log WHERE ok = 1", [], |r| r.get(0))
            .optional()?
            .flatten();

    // 库内最新一条情报的日期：种子导入的条目没有采集记录，用它来标注「数据截至」
    let latest_published: Option<String> = conn
        .query_row(
            "SELECT MAX(substr(COALESCE(published_at, collected_at),1,10)) FROM items",
            [],
            |r| r.get(0),
        )
        .optional()?
        .flatten();

    let mut st3 = conn.prepare(
        "SELECT substr(COALESCE(published_at, collected_at),1,10) AS d, COUNT(*)
         FROM items GROUP BY d ORDER BY d DESC LIMIT 7",
    )?;
    let mut last_7_days = st3
        .query_map([], |r| Ok(DayCount { date: r.get(0)?, count: r.get(1)? }))?
        .collect::<rusqlite::Result<Vec<_>>>()?;
    last_7_days.reverse();

    Ok(Stats {
        total,
        by_source,
        by_severity,
        kev_count,
        db_bytes,
        last_collected_at,
        latest_published,
        last_7_days,
    })
}

/// 写采集日志（合规留痕）
pub fn log_collect(
    conn: &Connection,
    source_key: &str,
    url: &str,
    http_status: Option<i64>,
    elapsed_ms: i64,
    ok: bool,
    reason: Option<&str>,
) -> AppResult<()> {
    conn.execute(
        "INSERT INTO collect_log (source_key, url, http_status, elapsed_ms, ok, reason, started_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7)",
        params![source_key, url, http_status, elapsed_ms, if ok { 1 } else { 0 }, reason, chrono::Utc::now().to_rfc3339()],
    )?;
    Ok(())
}

/// 读取最近采集日志
pub fn recent_logs(conn: &Connection, limit: i64) -> AppResult<Vec<serde_json::Value>> {
    let mut st = conn.prepare(
        "SELECT source_key, url, http_status, elapsed_ms, ok, COALESCE(reason,''), started_at
         FROM collect_log ORDER BY id DESC LIMIT ?1",
    )?;
    let rows = st.query_map(params![limit], |r| {
        Ok(serde_json::json!({
            "source_key": r.get::<_, String>(0)?,
            "url": r.get::<_, String>(1)?,
            "http_status": r.get::<_, Option<i64>>(2)?,
            "elapsed_ms": r.get::<_, Option<i64>>(3)?,
            "ok": r.get::<_, i64>(4)? == 1,
            "reason": r.get::<_, String>(5)?,
            "started_at": r.get::<_, String>(6)?,
        }))
    })?;
    let mut out = Vec::new();
    for r in rows {
        out.push(r?);
    }
    Ok(out)
}

/// 取全部带笔记的条目，用于导出备忘
pub fn items_with_notes(conn: &Connection) -> AppResult<Vec<MemoItem>> {
    let mut st = conn.prepare(
        "SELECT i.cve_id, i.title, i.cvss_score, i.cvss_severity, i.products, i.published_at,
                i.source_url, i.collected_at, s.name, n.body
         FROM items i
         LEFT JOIN notes n ON n.item_id = i.id
         JOIN sources s ON s.key = i.source_key
         WHERE n.body IS NOT NULL AND trim(n.body) <> ''
         ORDER BY i.published_at DESC",
    )?;
    let rows = st.query_map([], |r| {
        let products: Option<String> = r.get(4)?;
        Ok(MemoItem {
            cve_id: r.get(0)?,
            title: r.get(1)?,
            cvss_score: r.get(2)?,
            cvss_severity: r.get(3)?,
            products: products
                .and_then(|s| serde_json::from_str::<Vec<String>>(&s).ok())
                .unwrap_or_default(),
            published_at: r.get(5)?,
            source_url: r.get(6)?,
            collected_at: r.get(7)?,
            source_name: r.get(8)?,
            note: r.get(9)?,
        })
    })?;
    let mut out = Vec::new();
    for r in rows {
        out.push(r?);
    }
    Ok(out)
}

/// 切换收藏状态，返回切换后的值
///
/// 条目已不存在时视为「没收藏」直接返回 false，不再把 FOREIGN KEY 约束错误抛给界面：
/// 恢复备份/重新采集后列表里可能残留旧 id，用户点星标不该看到一句 SQL 报错。
pub fn toggle_favorite(conn: &Connection, item_id: i64) -> AppResult<bool> {
    let exists: i64 = conn.query_row(
        "SELECT COUNT(*) FROM items WHERE id = ?1",
        params![item_id],
        |r| r.get(0),
    )?;
    if exists == 0 {
        return Ok(false);
    }
    let fav: i64 = conn.query_row(
        "SELECT COUNT(*) FROM favorites WHERE item_id = ?1",
        params![item_id],
        |r| r.get(0),
    )?;
    if fav > 0 {
        conn.execute("DELETE FROM favorites WHERE item_id = ?1", params![item_id])?;
        Ok(false)
    } else {
        conn.execute(
            "INSERT INTO favorites (item_id, created_at) VALUES (?1, ?2)",
            params![item_id, chrono::Utc::now().to_rfc3339()],
        )?;
        Ok(true)
    }
}

/// 收藏总数
pub fn favorite_count(conn: &Connection) -> AppResult<i64> {
    Ok(conn.query_row("SELECT COUNT(*) FROM favorites", [], |r| r.get(0))?)
}

/// 全部收藏 id（前端用于列表角标同步）
pub fn favorite_ids(conn: &Connection) -> AppResult<Vec<i64>> {
    let mut st = conn.prepare("SELECT item_id FROM favorites ORDER BY created_at DESC")?;
    let rows = st.query_map([], |r| r.get::<_, i64>(0))?;
    let mut out = Vec::new();
    for r in rows {
        out.push(r?);
    }
    Ok(out)
}
