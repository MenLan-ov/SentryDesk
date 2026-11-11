//! 错题本：自测答错的题自动入库，可专门重练
//!
//! v0.8.1 起「复习」不再只是翻 reviewed 标记：排期逻辑搬到 `db::review`，
//! 本模块只负责记录与读取原始错题。
use crate::error::AppResult;
use rusqlite::{params, Connection};
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct WrongAnswer {
    pub id: i64,
    pub lesson_id: String,
    pub quiz_index: i64,
    pub question: String,
    pub chosen: i64,
    pub correct: i64,
    pub explain: Option<String>,
    pub wrong_times: i64,
    pub reviewed: bool,
    pub updated_at: String,
}

/// 记录一道错题；同一题重复答错则累加次数
pub fn record_wrong(
    conn: &Connection,
    lesson_id: &str,
    quiz_index: i64,
    question: &str,
    chosen: i64,
    correct: i64,
    explain: Option<&str>,
) -> AppResult<()> {
    let now = chrono::Utc::now().to_rfc3339();
    conn.execute(
        "INSERT INTO wrong_answers (lesson_id, quiz_index, question, chosen, correct, explain, wrong_times, reviewed, created_at, updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,1,0,?7,?7)
         ON CONFLICT(lesson_id, quiz_index) DO UPDATE SET
            chosen = excluded.chosen,
            wrong_times = wrong_times + 1,
            reviewed = 0,
            updated_at = excluded.updated_at",
        params![lesson_id, quiz_index, question, chosen, correct, explain, now],
    )?;
    Ok(())
}

/// 列出错题（默认只列未复习的）
pub fn list_wrong(conn: &Connection, include_reviewed: bool) -> AppResult<Vec<WrongAnswer>> {
    let sql = if include_reviewed {
        "SELECT id, lesson_id, quiz_index, question, chosen, correct, explain, wrong_times, reviewed, updated_at
         FROM wrong_answers ORDER BY reviewed ASC, updated_at DESC"
    } else {
        "SELECT id, lesson_id, quiz_index, question, chosen, correct, explain, wrong_times, reviewed, updated_at
         FROM wrong_answers WHERE reviewed = 0 ORDER BY updated_at DESC"
    };
    let mut st = conn.prepare(sql)?;
    let rows = st.query_map([], |r| {
        Ok(WrongAnswer {
            id: r.get(0)?,
            lesson_id: r.get(1)?,
            quiz_index: r.get(2)?,
            question: r.get(3)?,
            chosen: r.get(4)?,
            correct: r.get(5)?,
            explain: r.get(6)?,
            wrong_times: r.get(7)?,
            reviewed: r.get::<_, i64>(8)? == 1,
            updated_at: r.get(9)?,
        })
    })?;
    let mut out = Vec::new();
    for r in rows {
        out.push(r?);
    }
    Ok(out)
}

/// 错题统计
pub fn wrong_count(conn: &Connection) -> AppResult<(i64, i64)> {
    let total: i64 = conn.query_row("SELECT COUNT(*) FROM wrong_answers", [], |r| r.get(0))?;
    let pending: i64 =
        conn.query_row("SELECT COUNT(*) FROM wrong_answers WHERE reviewed = 0", [], |r| r.get(0))?;
    Ok((total, pending))
}
