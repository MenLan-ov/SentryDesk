//! 学习进度：状态、自测成绩、学习笔记
use crate::error::AppResult;
use crate::models::*;
use rusqlite::{params, Connection};

/// 更新学习状态（unread / reading / mastered）
pub fn set_status(conn: &Connection, lesson_id: &str, status: &str) -> AppResult<()> {
    let now = chrono::Utc::now().to_rfc3339();
    conn.execute(
        "INSERT INTO lesson_progress (lesson_id, status, updated_at, started_at)
         VALUES (?1, ?2, ?3, ?3)
         ON CONFLICT(lesson_id) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at",
        params![lesson_id, status, now],
    )?;
    log_action(conn, lesson_id, &format!("status:{}", status))?;
    Ok(())
}

/// 记录自测成绩
pub fn set_quiz(conn: &Connection, lesson_id: &str, total: i64, correct: i64) -> AppResult<()> {
    let score = if total > 0 { correct * 100 / total } else { 0 };
    let now = chrono::Utc::now().to_rfc3339();
    conn.execute(
        "INSERT INTO lesson_progress (lesson_id, status, quiz_score, quiz_total, quiz_correct, updated_at, started_at)
         VALUES (?1, 'reading', ?2, ?3, ?4, ?5, ?5)
         ON CONFLICT(lesson_id) DO UPDATE SET
            quiz_score = excluded.quiz_score,
            quiz_total = excluded.quiz_total,
            quiz_correct = excluded.quiz_correct,
            updated_at = excluded.updated_at",
        params![lesson_id, score, total, correct, now],
    )?;
    log_action(conn, lesson_id, &format!("quiz:{}/{}", correct, total))?;
    Ok(())
}

/// 保存教学卡笔记
pub fn set_note(conn: &Connection, lesson_id: &str, note: &str) -> AppResult<()> {
    let now = chrono::Utc::now().to_rfc3339();
    conn.execute(
        "INSERT INTO lesson_progress (lesson_id, updated_at, note, started_at)
         VALUES (?1, ?2, ?3, ?2)
         ON CONFLICT(lesson_id) DO UPDATE SET note = excluded.note, updated_at = excluded.updated_at",
        params![lesson_id, now, note],
    )?;
    Ok(())
}

/// 读全部进度（前端一次拿全，减少往返）
pub fn list(conn: &Connection) -> AppResult<Vec<LessonProgress>> {
    let mut st = conn.prepare(
        "SELECT lesson_id, status, quiz_score, quiz_total, quiz_correct, updated_at, note
         FROM lesson_progress ORDER BY updated_at DESC",
    )?;
    let rows = st.query_map([], |r| {
        Ok(LessonProgress {
            lesson_id: r.get(0)?,
            status: r.get(1)?,
            quiz_score: r.get(2)?,
            quiz_total: r.get::<_, i64>(3).unwrap_or(0),
            quiz_correct: r.get::<_, i64>(4).unwrap_or(0),
            updated_at: r.get(5)?,
            note: r.get(6)?,
        })
    })?;
    let mut out = Vec::new();
    for r in rows {
        out.push(r?);
    }
    Ok(out)
}

fn log_action(conn: &Connection, lesson_id: &str, action: &str) -> AppResult<()> {
    conn.execute(
        "INSERT INTO learn_log (lesson_id, action, created_at) VALUES (?1, ?2, ?3)",
        params![lesson_id, action, chrono::Utc::now().to_rfc3339()],
    )?;
    Ok(())
}

/// 学习总览。
///
/// `categories` 的每个元素是「分类名 + 该分类下的全部 lesson_id」。
/// 必须传 id 列表而不是只传数量：进度表里存的是 lesson_id，
/// 只有拿到 id 才能判断某分类下哪些卡已掌握。
pub fn overview(
    conn: &Connection,
    total_cards: usize,
    categories: &[(String, Vec<String>)],
) -> AppResult<LearnOverview> {
    let read_count: i64 = conn
        .query_row("SELECT COUNT(*) FROM lesson_progress WHERE status IN ('reading','mastered')", [], |r| r.get(0))
        .unwrap_or(0);
    let mastered_count: i64 = conn
        .query_row("SELECT COUNT(*) FROM lesson_progress WHERE status = 'mastered'", [], |r| r.get(0))
        .unwrap_or(0);
    let quizzed_count: i64 = conn
        .query_row("SELECT COUNT(*) FROM lesson_progress WHERE quiz_score IS NOT NULL", [], |r| r.get(0))
        .unwrap_or(0);
    let avg_score: f64 = conn
        .query_row("SELECT COALESCE(AVG(quiz_score), 0) FROM lesson_progress WHERE quiz_score IS NOT NULL", [], |r| r.get(0))
        .unwrap_or(0.0);
    let note_count: i64 = conn
        .query_row("SELECT COUNT(*) FROM lesson_progress WHERE note IS NOT NULL AND trim(note) <> ''", [], |r| r.get(0))
        .unwrap_or(0);

    // 一次性取出所有已掌握的 lesson_id，再按分类做集合求交。
    // 原来逐分类执行 "lesson_id = 分类名" 的查询，条件恒不成立，
    // 导致每个分类的已掌握数永远是 0。
    let mastered_ids: std::collections::HashSet<String> = {
        let mut st = conn.prepare("SELECT lesson_id FROM lesson_progress WHERE status = 'mastered'")?;
        st.query_map([], |r| r.get::<_, String>(0))?
            .collect::<rusqlite::Result<std::collections::HashSet<_>>>()?
    };
    let mut by_category = Vec::new();
    for (cat, ids) in categories {
        let mastered = ids.iter().filter(|id| mastered_ids.contains(*id)).count() as i64;
        by_category.push(CategoryProgress {
            category: cat.clone(),
            total: ids.len(),
            mastered,
        });
    }

    // 连续学习天数：取出有学习行为的所有日期（本地时区），
    // 从今天（或昨天）开始往回数连续段。今天没学时 streak 不归零——
    // 用户早上打开应用不应看到「连续 0 天」。
    let streak_days = {
        let mut st = conn.prepare(
            "SELECT DISTINCT date(created_at, 'localtime') FROM learn_log ORDER BY 1 DESC",
        )?;
        let days: Vec<String> = st
            .query_map([], |r| r.get(0))?
            .collect::<rusqlite::Result<Vec<_>>>()?;
        let set: std::collections::HashSet<&str> = days.iter().map(String::as_str).collect();
        let mut cur = chrono::Local::now().date_naive();
        let mut n = 0i64;
        if !set.contains(cur.format("%Y-%m-%d").to_string().as_str()) {
            cur -= chrono::Duration::days(1);
        }
        while set.contains(cur.format("%Y-%m-%d").to_string().as_str()) {
            n += 1;
            cur -= chrono::Duration::days(1);
        }
        n
    };

    // 待复习错题（未标记掌握的）
    let wrong_pending: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM wrong_answers WHERE COALESCE(reviewed, 0) = 0",
            [],
            |r| r.get(0),
        )
        .unwrap_or(0);

    Ok(LearnOverview {
        total_cards,
        read_count,
        mastered_count,
        quizzed_count,
        avg_score,
        note_count,
        streak_days,
        wrong_pending,
        by_category,
    })
}
