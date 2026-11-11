//! 间隔重复复习（v0.8.1）
//!
//! 错题本原来只有「我懂了」一个按钮：点一下标记 reviewed=1，然后这题就再也不出现了。
//! 这跟记忆规律相反——当下看懂了不等于几天后还记得。这里给每道错题加一个
//! 复习时刻表，按「忘记 / 有点印象 / 记住了」三种反馈算出下次该在什么时候出现。
//!
//! 算法是 SM-2 的简化版（不用 0–5 分打分，教学场景里三个按钮更好点）：
//! - 忘记（0）：重来，间隔归零，10 分钟后同一轮里再问一次，难度 +0.2
//! - 有点印象（1）：间隔 ×1.2（首次 1 天），难度 -0.05
//! - 记住了（2）：首次 1 天、第二次 6 天，之后 间隔 × 难度系数，难度 +0.05
//!
//! 上限 180 天：偶尔错的题不该就此消失在复习队列里。
use crate::error::AppResult;
use rusqlite::{params, Connection};
use serde::Serialize;

/// 难度系数上下限：低于 1.3 会让间隔几乎不涨，高于 3.0 会让间隔涨得离谱
const EASE_MIN: f64 = 1.3;
const EASE_MAX: f64 = 3.0;
/// 单次最长间隔（天）
const MAX_INTERVAL: i64 = 180;
/// 「忘记」后同一轮里的重问间隔（分钟）
const AGAIN_MINUTES: i64 = 10;

#[derive(Debug, Clone, Serialize)]
pub struct ReviewItem {
    pub id: i64,
    pub lesson_id: String,
    pub quiz_index: i64,
    pub question: String,
    pub chosen: i64,
    pub correct: i64,
    pub explain: Option<String>,
    pub wrong_times: i64,
    pub reps: i64,
    pub interval_days: i64,
    pub ease: f64,
    pub lapses: i64,
    pub due_at: Option<String>,
    /// 逾期天数（整数，仅用于界面提示「拖了 3 天」）
    pub overdue_days: i64,
}

#[derive(Debug, Clone, Serialize)]
pub struct ReviewState {
    pub reps: i64,
    pub interval_days: i64,
    pub ease: f64,
    pub lapses: i64,
    pub due_at: String,
    /// 下次复习距今多少分钟（0 表示就是现在）
    pub due_in_minutes: i64,
}

#[derive(Debug, Clone, Copy)]
pub struct NextSchedule {
    pub reps: i64,
    pub interval_days: i64,
    pub ease: f64,
    pub lapses: i64,
    pub due_in_minutes: i64,
}

/// 纯函数：给定当前状态与反馈，算出下一次的状态。
/// 单独抽出来是为了能直接测——不碰数据库，不用等时间流逝。
pub fn schedule(reps: i64, interval_days: i64, ease: f64, lapses: i64, grade: u8) -> NextSchedule {
    let ease = ease.clamp(EASE_MIN, EASE_MAX);
    let prev = interval_days.max(1);
    match grade {
        // 忘记：回到起点，但保留已积累的难度惩罚（越难的题下次间隔涨得越慢）
        0 => NextSchedule {
            reps: 0,
            interval_days: 0,
            ease: (ease - 0.2).max(EASE_MIN),
            lapses: lapses + 1,
            due_in_minutes: AGAIN_MINUTES,
        },
        // 有点印象：只小幅推进
        1 => {
            let next = if reps == 0 {
                1
            } else {
                ((prev as f64) * 1.2).round() as i64
            }
            .clamp(1, MAX_INTERVAL);
            NextSchedule {
                reps: reps + 1,
                interval_days: next,
                ease: (ease - 0.05).max(EASE_MIN),
                lapses,
                due_in_minutes: next * 1440,
            }
        }
        // 记住了：标准 SM-2 阶梯 1 → 6 → 6×ease
        _ => {
            let next = match reps {
                0 => 1,
                1 => 6,
                _ => ((prev as f64) * ease).round() as i64,
            }
            .clamp(1, MAX_INTERVAL);
            NextSchedule {
                reps: reps + 1,
                interval_days: next,
                ease: (ease + 0.05).min(EASE_MAX),
                lapses,
                due_in_minutes: next * 1440,
            }
        }
    }
}

/// 到期待复习队列：没排过期（due_at IS NULL）也算到期，逾期最久的排最前
pub fn due_queue(conn: &Connection, limit: i64) -> AppResult<Vec<ReviewItem>> {
    let now = chrono::Utc::now();
    let mut st = conn.prepare(
        "SELECT id, lesson_id, quiz_index, question, chosen, correct, explain, wrong_times,
                reps, interval_days, ease, lapses, due_at
         FROM wrong_answers
         WHERE due_at IS NULL OR due_at <= ?1
         ORDER BY COALESCE(due_at, '') ASC, wrong_times DESC, id ASC
         LIMIT ?2",
    )?;
    let rows = st.query_map(params![now.to_rfc3339(), limit.max(1)], |r| {
        Ok(ReviewItem {
            id: r.get(0)?,
            lesson_id: r.get(1)?,
            quiz_index: r.get(2)?,
            question: r.get(3)?,
            chosen: r.get(4)?,
            correct: r.get(5)?,
            explain: r.get(6)?,
            wrong_times: r.get(7)?,
            reps: r.get(8)?,
            interval_days: r.get(9)?,
            ease: r.get(10)?,
            lapses: r.get(11)?,
            due_at: r.get(12)?,
            overdue_days: 0,
        })
    })?;
    let mut out = Vec::new();
    for r in rows {
        let mut it = r?;
        it.overdue_days = overdue_days(it.due_at.as_deref(), now);
        out.push(it);
    }
    Ok(out)
}

/// 逾期天数：没排期算 0（就是今天要复习），未来的算负数但界面不用
fn overdue_days(due_at: Option<&str>, now: chrono::DateTime<chrono::Utc>) -> i64 {
    let Some(raw) = due_at else { return 0 };
    let Ok(t) = chrono::DateTime::parse_from_rfc3339(raw) else {
        return 0;
    };
    (now - t.with_timezone(&chrono::Utc)).num_days().max(0)
}

/// 待复习数量（侧栏 / 顶栏徽标）
pub fn due_count(conn: &Connection) -> AppResult<i64> {
    let now = chrono::Utc::now().to_rfc3339();
    let n: i64 = conn.query_row(
        "SELECT COUNT(*) FROM wrong_answers WHERE due_at IS NULL OR due_at <= ?1",
        params![now],
        |r| r.get(0),
    )?;
    Ok(n)
}

/// 提交一次复习反馈，写回新的间隔与到期时间。
/// grade < 2（忘记）会把 reviewed 置回 0，让错题本列表继续显示它。
pub fn grade(conn: &Connection, id: i64, grade: u8) -> AppResult<ReviewState> {
    let (reps, interval_days, ease, lapses): (i64, i64, f64, i64) = conn.query_row(
        "SELECT reps, interval_days, ease, lapses FROM wrong_answers WHERE id = ?1",
        params![id],
        |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?)),
    )?;
    let s = schedule(reps, interval_days, ease, lapses, grade);
    let now = chrono::Utc::now();
    let due = now + chrono::Duration::minutes(s.due_in_minutes);
    conn.execute(
        "UPDATE wrong_answers
         SET reps = ?1, interval_days = ?2, ease = ?3, lapses = ?4,
             due_at = ?5, reviewed = ?6, updated_at = ?7
         WHERE id = ?8",
        params![
            s.reps,
            s.interval_days,
            s.ease,
            s.lapses,
            due.to_rfc3339(),
            if grade >= 1 { 1 } else { 0 },
            now.to_rfc3339(),
            id
        ],
    )?;
    Ok(ReviewState {
        reps: s.reps,
        interval_days: s.interval_days,
        ease: s.ease,
        lapses: s.lapses,
        due_at: due.to_rfc3339(),
        due_in_minutes: s.due_in_minutes,
    })
}

/// 「我懂了」按钮的语义就是「记住了」，走同一条排期逻辑，
/// 否则会出现「点了懂了 → 明天不该出现 → 但它永远消失」的两套说法。
pub fn mark_mastered(conn: &Connection, lesson_id: &str, quiz_index: i64) -> AppResult<()> {
    let id: Option<i64> = conn
        .query_row(
            "SELECT id FROM wrong_answers WHERE lesson_id = ?1 AND quiz_index = ?2",
            params![lesson_id, quiz_index],
            |r| r.get(0),
        )
        .ok();
    match id {
        Some(id) => {
            grade(conn, id, 2)?;
            Ok(())
        }
        None => Ok(()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn good_first_three_steps() {
        let a = schedule(0, 0, 2.5, 0, 2);
        assert_eq!(a.interval_days, 1);
        let b = schedule(a.reps, a.interval_days, a.ease, a.lapses, 2);
        assert_eq!(b.interval_days, 6);
        let c = schedule(b.reps, b.interval_days, b.ease, b.lapses, 2);
        // 6 × 2.6 = 15.6 → 16
        assert_eq!(c.interval_days, 16);
        assert!(c.ease > 2.5);
    }

    #[test]
    fn forgot_resets_and_keeps_lapse() {
        let s = schedule(4, 40, 2.5, 1, 0);
        assert_eq!(s.reps, 0);
        assert_eq!(s.interval_days, 0);
        assert_eq!(s.lapses, 2);
        assert_eq!(s.due_in_minutes, 10);
        assert!((s.ease - 2.3).abs() < 1e-9);
    }

    #[test]
    fn ease_has_floor_and_ceiling() {
        let mut ease = 2.5;
        for _ in 0..20 {
            ease = schedule(2, 6, ease, 0, 0).ease;
        }
        assert!((ease - EASE_MIN).abs() < 1e-9, "难度不该低于 1.3，实际 {}", ease);

        let mut ease = 2.5;
        for _ in 0..40 {
            ease = schedule(2, 6, ease, 0, 2).ease;
        }
        assert!(ease <= EASE_MAX, "难度不该高于 3.0，实际 {}", ease);
    }

    #[test]
    fn interval_is_capped() {
        let mut s = schedule(10, 170, 3.0, 0, 2);
        assert_eq!(s.interval_days, MAX_INTERVAL);
        s = schedule(3, 100, 3.0, 0, 1);
        assert!(s.interval_days <= MAX_INTERVAL);
    }

    #[test]
    fn hard_pushes_more_gently_than_good() {
        let hard = schedule(2, 6, 2.5, 0, 1);
        let good = schedule(2, 6, 2.5, 0, 2);
        assert!(hard.interval_days < good.interval_days);
        assert!(hard.ease < good.ease);
    }

    #[test]
    fn garbage_state_does_not_panic() {
        // 老库里 interval_days = 0 但 reps 很大（手工改过库），乘法仍要给出合法值
        let s = schedule(9, 0, 0.0, 0, 2);
        assert!(s.interval_days >= 1 && s.interval_days <= MAX_INTERVAL);
        assert!(s.ease >= EASE_MIN);
    }
}
