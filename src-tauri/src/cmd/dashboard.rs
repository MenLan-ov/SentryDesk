//! 看板：把分散的统计聚合成一次调用
use crate::error::AppResult;
use crate::models::*;
use crate::state::AppState;
use rusqlite::Connection;
use tauri::State;

fn build(conn: &Connection, days: i64) -> AppResult<DashboardData> {
    let total: i64 = conn.query_row("SELECT COUNT(*) FROM items", [], |r| r.get(0))?;
    let kev_count: i64 = conn.query_row("SELECT COUNT(*) FROM items WHERE in_kev = 1", [], |r| r.get(0))?;
    let rated_count: i64 =
        conn.query_row("SELECT COUNT(*) FROM items WHERE cvss_score IS NOT NULL", [], |r| r.get(0))?;

    // 近 N 天每日新增：日期缺失的用采集日期兜底
    let mut st = conn.prepare(
        "SELECT substr(COALESCE(published_at, collected_at),1,10) AS d, COUNT(*)
         FROM items
         WHERE d >= date('now', ?1)
         GROUP BY d ORDER BY d ASC",
    )?;
    let daily = st
        .query_map(params_days(days), |r| {
            Ok(DayCount { date: r.get(0)?, count: r.get(1)? })
        })?
        .collect::<rusqlite::Result<Vec<_>>>()?;

    let recent_30d: i64 = conn.query_row(
        "SELECT COUNT(*) FROM items WHERE COALESCE(published_at, collected_at) >= date('now','-30 day')",
        [],
        |r| r.get(0),
    )?;

    let mut st2 = conn.prepare(
        "SELECT COALESCE(cvss_severity,'UNKNOWN') AS s, COUNT(*) FROM items GROUP BY s ORDER BY 2 DESC",
    )?;
    let severity = st2
        .query_map([], |r| Ok(SeverityCount { severity: r.get(0)?, count: r.get(1)? }))?
        .collect::<rusqlite::Result<Vec<_>>>()?;

    let mut st3 = conn.prepare(
        "SELECT s.key, s.name, COUNT(i.id), MAX(i.collected_at)
         FROM sources s LEFT JOIN items i ON i.source_key = s.key
         GROUP BY s.key, s.name HAVING COUNT(i.id) > 0 ORDER BY 3 DESC",
    )?;
    let sources = st3
        .query_map([], |r| {
            Ok(SourceCount {
                source_key: r.get(0)?,
                name: r.get(1)?,
                count: r.get(2)?,
                last_at: r.get(3)?,
            })
        })?
        .collect::<rusqlite::Result<Vec<_>>>()?;

    // 受影响产品 Top 10：products 是 JSON 数组，用 JSON 函数展开
    let mut st4 = conn.prepare(
        "SELECT j.value AS p, COUNT(*) AS n
         FROM items, json_each(items.products) AS j
         WHERE items.products IS NOT NULL AND items.products <> '[]'
         GROUP BY p ORDER BY n DESC LIMIT 10",
    )?;
    let top_products = st4
        .query_map([], |r| Ok(CountPair { key: r.get(0)?, count: r.get::<_, i64>(1)? as usize }))?
        .collect::<rusqlite::Result<Vec<_>>>()?;

    let mut st5 = conn.prepare(
        "SELECT cwe, COUNT(*) AS n FROM items WHERE cwe IS NOT NULL
         GROUP BY cwe ORDER BY n DESC LIMIT 10",
    )?;
    let top_cwe = st5
        .query_map([], |r| Ok(CountPair { key: r.get(0)?, count: r.get::<_, i64>(1)? as usize }))?
        .collect::<rusqlite::Result<Vec<_>>>()?;

    let collect_ok: i64 = conn
        .query_row("SELECT COUNT(*) FROM collect_log WHERE ok = 1 AND started_at >= date('now','-7 day')", [], |r| r.get(0))
        .unwrap_or(0);
    let collect_fail: i64 = conn
        .query_row("SELECT COUNT(*) FROM collect_log WHERE ok = 0 AND started_at >= date('now','-7 day')", [], |r| r.get(0))
        .unwrap_or(0);

    Ok(DashboardData {
        daily,
        severity,
        sources,
        top_products,
        top_cwe,
        kev_count,
        rated_count,
        total,
        recent_30d,
        collect_ok,
        collect_fail,
    })
}

fn params_days(days: i64) -> [String; 1] {
    [format!("-{} day", days.max(1))]
}

/// 看板数据
#[tauri::command]
pub fn dashboard(state: State<'_, AppState>, days: Option<i64>) -> AppResult<DashboardData> {
    let conn = state.open()?;
    build(&conn, days.unwrap_or(30))
}
