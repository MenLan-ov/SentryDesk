//! SentryDesk 装配：初始化数据层、注册 command、启动窗口
//!
//! 静默原则（本文件的设计约束）：
//! 1. 单实例：第二次启动不再拉起新进程，而是唤醒已有窗口
//! 2. 无控制台：release 下 windows_subsystem = "windows"，不产生黑窗
//! 3. 无弹窗：任何错误只写本地日志，绝不弹系统消息框
//! 4. 干净退出：窗口关闭即进程结束，WebView2 子进程随之回收
mod cmd;
pub mod collect;
mod db;
mod error;
mod knowledge;
mod models;
mod parse;
mod state;

use state::AppState;
use tauri::Manager;

/// 把异常写入本地日志（不弹窗、不联网）
pub fn log_line(msg: &str) {
    use std::io::Write;
    let dir = std::env::var("APPDATA")
        .map(|p| std::path::PathBuf::from(p).join("com.sentrydesk.app"))
        .unwrap_or_else(|_| std::env::temp_dir());
    let _ = std::fs::create_dir_all(&dir);
    if let Ok(mut f) = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(dir.join("sentrydesk.log"))
    {
        let _ = writeln!(
            f,
            "[{}] {}",
            chrono::Local::now().format("%Y-%m-%d %H:%M:%S"),
            msg
        );
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 全局 panic 兜底：不弹窗，只落日志（debug 下同时打到控制台，便于定位）
    std::panic::set_hook(Box::new(|info| {
        log_line(&format!("[panic] {}", info));
        #[cfg(debug_assertions)]
        eprintln!("[panic] {info}");
    }));

    let mut builder = tauri::Builder::default();

    // 单实例：第二次启动直接唤醒已有窗口后退出
    builder = builder.plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
        if let Some(w) = app.get_webview_window("main") {
            let _ = w.unminimize();
            let _ = w.show();
            let _ = w.set_focus();
        }
    }));

    builder
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            let data_dir = app
                .path()
                .app_data_dir()
                .map_err(|e| format!("无法获取应用数据目录：{}", e))?;
            std::fs::create_dir_all(&data_dir)
                .map_err(|e| format!("无法创建应用数据目录：{}", e))?;
            let db_path = data_dir.join("sentrydesk.db");

            // 首次启动自动建库并执行 DDL
            db::schema::open(&db_path).map_err(|e| format!("数据库初始化失败：{}", e))?;

            // 预加载教学库，早失败早暴露（失败也只记日志，不阻断启动）
            if let Err(e) = knowledge::all_cards(&data_dir) {
                log_line(&format!("[warn] 教学库加载失败：{}", e));
            }

            // 首次启动：导入随包分发的情报种子库（items 为空才导入，幂等）
            if let Ok(conn) = db::schema::open(&db_path) {
                match collect::seed::import_if_empty(&conn, &data_dir) {
                    Ok(n) if n > 0 => {
                        log_line(&format!("[startup] 种子情报库导入 {} 条", n));
                    }
                    Err(e) => log_line(&format!("[warn] 种子情报库导入失败：{}", e)),
                    _ => {}
                }
                // 启动时做一次数据补全，老数据也能受益（幂等，无副作用）
                let _ = collect::cross_mark_kev(&conn);
                if let Ok(n) = collect::cross_fill_cvss(&conn)
                    && n > 0 {
                        log_line(&format!("[startup] CVSS 交叉回填 {} 条", n));
                    }
            }

            app.manage(AppState::new(db_path, data_dir));
            Ok(())
        })
        .on_window_event(|_window, _event| {
            // 不拦截 CloseRequested：让 Tauri 走默认关闭流程，
            // 窗口全部关闭后进程自然结束，WebView2 随之回收。
            // 如需自定义退出逻辑，请在 RunEvent::ExitRequested 中处理。
        })
        .invoke_handler(tauri::generate_handler![
            // ---- collect ----
            cmd::collect::check_robots,
            cmd::collect::get_robots,
            cmd::collect::list_sources,
            cmd::collect::start_collect,
            cmd::collect::collect_logs,
            // ---- dashboard ----
            cmd::dashboard::dashboard,
            // ---- export ----
            cmd::export::preview_memo,
            cmd::export::export_memo,
            cmd::export::save_report_png,
            // ---- knowledge ----
            cmd::knowledge::search_lessons,
            cmd::knowledge::get_lesson,
            cmd::knowledge::get_lesson_by_cwe,
            cmd::knowledge::lesson_stats,
            cmd::knowledge::count_items_by_cwe,
            // ---- learn ----
            cmd::learn::related_lessons,
            cmd::learn::glossary_all,
            cmd::learn::learning_paths,
            cmd::learn::get_progress,
            cmd::learn::set_progress,
            cmd::learn::save_quiz_result,
            cmd::learn::list_wrong_answers,
            cmd::learn::mark_wrong_reviewed,
            cmd::learn::wrong_answer_count,
            cmd::learn::review_queue,
            cmd::learn::review_grade,
            cmd::learn::review_due_count,
            cmd::learn::save_lesson_note,
            cmd::learn::learn_overview,
            cmd::learn::export_learn_report,
            // ---- query ----
            cmd::query::search_items,
            cmd::query::get_item_detail,
            cmd::query::get_stats,
            cmd::query::save_note,
            cmd::query::toggle_favorite,
            cmd::query::favorite_summary,
            // ---- settings ----
            cmd::settings::get_theme,
            cmd::settings::set_theme,
            cmd::settings::export_theme,
            cmd::settings::import_theme,
            cmd::settings::compliance_info,
            cmd::settings::backup_database,
            cmd::settings::restore_database,
            cmd::settings::open_data_dir,
            cmd::settings::export_items_json,
            // ---- window ----
            cmd::window::window_state,
            cmd::window::save_window_state,
            cmd::window::quit_app,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
