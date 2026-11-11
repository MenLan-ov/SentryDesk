//! 窗口状态：记住位置、尺寸、最大化状态，下次启动恢复
use crate::error::AppResult;
use crate::state::AppState;
use serde::{Deserialize, Serialize};
use tauri::{State, WebviewWindow};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default)]
pub struct WindowState {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
    pub maximized: bool,
}

impl Default for WindowState {
    fn default() -> Self {
        Self { x: 0, y: 0, width: 1280, height: 820, maximized: false }
    }
}

fn state_path(state: &AppState) -> std::path::PathBuf {
    state.data_dir.join("window.json")
}

/// 读取窗口状态（前端启动时调用）
#[tauri::command]
pub fn window_state(state: State<'_, AppState>) -> AppResult<WindowState> {
    let p = state_path(&state);
    if !p.exists() {
        return Ok(WindowState::default());
    }
    Ok(std::fs::read_to_string(p)
        .ok()
        .and_then(|t| serde_json::from_str(&t).ok())
        .unwrap_or_default())
}

/// 保存窗口状态（前端在 resize / move 时防抖调用）
#[tauri::command]
pub fn save_window_state(
    window: WebviewWindow,
    state: State<'_, AppState>,
    x: i32,
    y: i32,
    width: u32,
    height: u32,
    maximized: bool,
) -> AppResult<()> {
    let ws = WindowState { x, y, width, height, maximized };
    let _ = std::fs::write(state_path(&state), serde_json::to_string_pretty(&ws)?);
    let _ = window;
    Ok(())
}

/// 关闭程序：干净退出，不留后台
#[tauri::command]
pub fn quit_app(app: tauri::AppHandle) {
    app.exit(0);
}
