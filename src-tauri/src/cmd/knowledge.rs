//! 教学知识库 command（全部离线，读内置 JSON）
use crate::error::AppResult;
use crate::models::*;
use crate::state::AppState;
use tauri::State;

/// 检索教学卡
#[tauri::command]
pub fn search_lessons(state: State<'_, AppState>, filter: LessonFilter) -> AppResult<Vec<LessonCard>> {
    crate::knowledge::search(&state.data_dir, &filter)
}

/// 取单张教学卡
#[tauri::command]
pub fn get_lesson(state: State<'_, AppState>, id: String) -> AppResult<Option<LessonCard>> {
    crate::knowledge::get(&state.data_dir, &id)
}

/// 按 CWE 编号取教学卡
#[tauri::command]
pub fn get_lesson_by_cwe(state: State<'_, AppState>, cwe: String) -> AppResult<Option<LessonCard>> {
    Ok(crate::knowledge::by_cwe(&state.data_dir, &cwe))
}

/// 教学库统计
#[tauri::command]
pub fn lesson_stats(state: State<'_, AppState>) -> AppResult<LessonStats> {
    crate::knowledge::stats(&state.data_dir)
}

/// 某 CWE 关联的真实漏洞条目数（用于教学卡展示「真实案例」）
#[tauri::command]
pub fn count_items_by_cwe(state: State<'_, AppState>, cwe: String) -> AppResult<i64> {
    let conn = state.open()?;
    let n: i64 = conn.query_row(
        "SELECT COUNT(*) FROM items WHERE cwe = ?1",
        rusqlite::params![cwe],
        |r| r.get(0),
    )?;
    Ok(n)
}
