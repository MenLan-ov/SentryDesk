//! 学习进度、术语表、学习路径 command
use crate::error::AppResult;
use crate::models::*;
use crate::state::AppState;
use tauri::State;

/// 取单张卡进度
#[tauri::command]
pub fn get_progress(state: State<'_, AppState>) -> AppResult<Vec<LessonProgress>> {
    let conn = state.open()?;
    crate::db::progress::list(&conn)
}

/// 设置卡状态：unread / reading / mastered
#[tauri::command]
pub fn set_progress(state: State<'_, AppState>, lesson_id: String, status: String) -> AppResult<()> {
    let conn = state.open()?;
    crate::db::progress::set_status(&conn, &lesson_id, &status)?;
    Ok(())
}

/// 保存自测成绩，并把答错的题记入错题本
#[tauri::command]
pub fn save_quiz_result(
    state: State<'_, AppState>,
    lesson_id: String,
    total: i64,
    correct: i64,
    wrong: Option<Vec<WrongEntry>>,
) -> AppResult<()> {
    let conn = state.open()?;
    crate::db::progress::set_quiz(&conn, &lesson_id, total, correct)?;
    if let Some(list) = wrong {
        for w in list {
            let _ = crate::db::wrong::record_wrong(
                &conn,
                &lesson_id,
                w.index,
                &w.question,
                w.chosen,
                w.correct,
                w.explain.as_deref(),
            );
        }
    }
    Ok(())
}

/// 一道错题的提交结构
#[derive(Debug, Clone, serde::Deserialize)]
pub struct WrongEntry {
    pub index: i64,
    pub question: String,
    pub chosen: i64,
    pub correct: i64,
    #[serde(default)]
    pub explain: Option<String>,
}

/// 错题列表
#[tauri::command]
pub fn list_wrong_answers(
    state: State<'_, AppState>,
    include_reviewed: Option<bool>,
) -> AppResult<Vec<crate::db::wrong::WrongAnswer>> {
    let conn = state.open()?;
    crate::db::wrong::list_wrong(&conn, include_reviewed.unwrap_or(false))
}

/// 标记某道错题已复习
///
/// v0.8.1 起语义变成「记住了」：不只是翻个标记，还会按间隔重复排到下一次
/// （首次 1 天 → 6 天 → 6×难度系数），到点自动回到复习队列。
#[tauri::command]
pub fn mark_wrong_reviewed(
    state: State<'_, AppState>,
    lesson_id: String,
    quiz_index: i64,
) -> AppResult<()> {
    let conn = state.open()?;
    crate::db::review::mark_mastered(&conn, &lesson_id, quiz_index)?;
    Ok(())
}

/// 到期待复习的错题队列（逾期最久的排最前）
#[tauri::command]
pub fn review_queue(
    state: State<'_, AppState>,
    limit: Option<i64>,
) -> AppResult<Vec<crate::db::review::ReviewItem>> {
    let conn = state.open()?;
    crate::db::review::due_queue(&conn, limit.unwrap_or(80))
}

/// 提交一次复习反馈：0 忘记 / 1 有点印象 / 2 记住了
#[tauri::command]
pub fn review_grade(
    state: State<'_, AppState>,
    id: i64,
    grade: u8,
) -> AppResult<crate::db::review::ReviewState> {
    let conn = state.open()?;
    crate::db::review::grade(&conn, id, grade.min(2))
}

/// 待复习数量（侧栏 / 顶栏徽标）
#[tauri::command]
pub fn review_due_count(state: State<'_, AppState>) -> AppResult<i64> {
    let conn = state.open()?;
    crate::db::review::due_count(&conn)
}

/// 错题数量（用于徽标）
#[tauri::command]
pub fn wrong_answer_count(state: State<'_, AppState>) -> AppResult<(i64, i64)> {
    let conn = state.open()?;
    crate::db::wrong::wrong_count(&conn)
}

/// 保存教学卡笔记
#[tauri::command]
pub fn save_lesson_note(state: State<'_, AppState>, lesson_id: String, note: String) -> AppResult<()> {
    let conn = state.open()?;
    crate::db::progress::set_note(&conn, &lesson_id, &note)?;
    Ok(())
}

/// 学习总览
#[tauri::command]
pub fn learn_overview(state: State<'_, AppState>) -> AppResult<LearnOverview> {
    let conn = state.open()?;
    let cards = crate::knowledge::all_cards(&state.data_dir)?;
    let cats = crate::knowledge::categories(&state.data_dir);
    crate::db::progress::overview(&conn, cards.len(), &cats)
}

/// 全部术语
#[tauri::command]
pub fn glossary_all(state: State<'_, AppState>) -> AppResult<Vec<GlossaryTerm>> {
    Ok(crate::knowledge::glossary(&state.data_dir)?.clone())
}

/// 全部学习路径
#[tauri::command]
pub fn learning_paths(state: State<'_, AppState>) -> AppResult<Vec<LearningPath>> {
    Ok(crate::knowledge::paths(&state.data_dir)?.clone())
}

/// 相关卡推荐
#[tauri::command]
pub fn related_lessons(state: State<'_, AppState>, id: String) -> AppResult<Vec<LessonCard>> {
    Ok(crate::knowledge::related_of(&state.data_dir, &id))
}

/// 导出学习报告：掌握情况 + 自测成绩 + 薄弱项 + 笔记
#[tauri::command]
pub fn export_learn_report(state: State<'_, AppState>, path: String) -> AppResult<String> {
    let conn = state.open()?;
    let cards = crate::knowledge::all_cards(&state.data_dir)?;
    let progress = crate::db::progress::list(&conn)?;
    let ov = crate::db::progress::overview(
        &conn,
        cards.len(),
        &crate::knowledge::categories(&state.data_dir),
    )?;

    let mut md = String::new();
    md.push_str("# SentryDesk 学习报告\n\n");
    md.push_str(&format!("生成时间：{}\n\n", chrono::Utc::now().to_rfc3339()));
    md.push_str("## 总览\n\n");
    md.push_str(&format!("- 教学卡总数：{}\n", ov.total_cards));
    md.push_str(&format!("- 已学习：{}\n", ov.read_count));
    md.push_str(&format!("- 已掌握：{}\n", ov.mastered_count));
    md.push_str(&format!("- 已完成自测：{}\n", ov.quizzed_count));
    md.push_str(&format!("- 自测平均分：{:.1}\n", ov.avg_score));
    md.push_str(&format!("- 学习笔记：{} 条\n\n", ov.note_count));

    md.push_str("## 分类掌握情况\n\n| 分类 | 已掌握 / 总数 |\n|---|---|\n");
    for c in &ov.by_category {
        md.push_str(&format!("| {} | {} / {} |\n", c.category, c.mastered, c.total));
    }
    md.push('\n');

    // 薄弱项：有自测但得分低于 60
    let weak: Vec<&LessonProgress> = progress
        .iter()
        .filter(|p| p.quiz_score.map(|s| s < 60).unwrap_or(false))
        .collect();
    if !weak.is_empty() {
        md.push_str("## 需要复习（自测低于 60 分）\n\n");
        for p in weak {
            let title = cards
                .iter()
                .find(|c| c.id == p.lesson_id)
                .map(|c| c.title.clone())
                .unwrap_or_else(|| p.lesson_id.clone());
            md.push_str(&format!(
                "- {} —— {} 分（{}/{}）\n",
                title,
                p.quiz_score.unwrap_or(0),
                p.quiz_correct,
                p.quiz_total
            ));
        }
        md.push('\n');
    }

    // 笔记
    let noted: Vec<&LessonProgress> = progress
        .iter()
        .filter(|p| p.note.as_ref().map(|n| !n.trim().is_empty()).unwrap_or(false))
        .collect();
    if !noted.is_empty() {
        md.push_str("## 学习笔记\n\n");
        for p in noted {
            let title = cards
                .iter()
                .find(|c| c.id == p.lesson_id)
                .map(|c| c.title.clone())
                .unwrap_or_else(|| p.lesson_id.clone());
            md.push_str(&format!("### {}\n\n{}\n\n", title, p.note.clone().unwrap_or_default()));
        }
    }

    md.push_str("---\n\n> 本报告由 SentryDesk 本地生成，全部数据保存在本机，未上传任何服务器。\n");

    // 只传文件名时落到 app_data_dir；传绝对路径则按用户指定
    let target = if std::path::Path::new(&path).is_absolute() {
        std::path::PathBuf::from(&path)
    } else {
        state.data_dir.join(&path)
    };
    if let Some(parent) = target.parent() {
        std::fs::create_dir_all(parent)?;
    }
    std::fs::write(&target, md)?;
    Ok(target.to_string_lossy().to_string())
}
