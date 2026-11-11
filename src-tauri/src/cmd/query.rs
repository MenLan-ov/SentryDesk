//! 检索相关 command
use crate::error::AppResult;
use crate::models::*;
use crate::state::AppState;
use tauri::State;

/// 检索：关键词 + 筛选
#[tauri::command]
pub fn search_items(state: State<'_, AppState>, filter: SearchFilter) -> AppResult<SearchResult> {
    let conn = state.open()?;
    crate::db::repo::search_items(&conn, &filter)
}

/// 条目详情（带标签、笔记与关联教学卡）
#[tauri::command]
pub fn get_item_detail(state: State<'_, AppState>, id: i64) -> AppResult<Option<Item>> {
    let conn = state.open()?;
    crate::db::repo::get_item_with_lesson(&conn, id, &state.data_dir)
}

/// 统计概览
#[tauri::command]
pub fn get_stats(state: State<'_, AppState>) -> AppResult<Stats> {
    let conn = state.open()?;
    crate::db::repo::stats(&conn, &state.db_path)
}

/// 保存笔记
#[tauri::command]
pub fn save_note(state: State<'_, AppState>, item_id: i64, body: String) -> AppResult<Note> {
    let conn = state.open()?;
    let r = crate::db::repo::upsert_note(&conn, item_id, &body)?;
    Ok(r)
}
/// 收藏 / 取消收藏
#[tauri::command]
pub fn toggle_favorite(state: State<'_, AppState>, item_id: i64) -> AppResult<bool> {
    let conn = state.open()?;
    crate::db::repo::toggle_favorite(&conn, item_id)
}

/// 收藏统计：总数 + id 列表
#[tauri::command]
pub fn favorite_summary(state: State<'_, AppState>) -> AppResult<(i64, Vec<i64>)> {
    let conn = state.open()?;
    let n = crate::db::repo::favorite_count(&conn)?;
    let ids = crate::db::repo::favorite_ids(&conn)?;
    Ok((n, ids))
}
