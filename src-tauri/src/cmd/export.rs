//! 备忘导出：仅元数据 + 原文链接 + 个人笔记，绝不含原文全文
use crate::error::AppResult;
use crate::models::MemoItem;
use crate::state::AppState;
use tauri::State;

/// 收集待导出数据供前端预览
#[tauri::command]
pub fn preview_memo(state: State<'_, AppState>) -> AppResult<Vec<MemoItem>> {
    let conn = state.open()?;
    crate::db::repo::items_with_notes(&conn)
}

/// 生成备忘 Markdown，写入指定路径
/// 相对路径落到数据目录（安装到 Program Files 时工作目录可能不可写）
#[tauri::command]
pub fn export_memo(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    path: String,
) -> AppResult<String> {
    let conn = state.open()?;
    let rows = crate::db::repo::items_with_notes(&conn)?;
    if rows.is_empty() {
        return Err(crate::error::AppError::Other("没有带笔记的条目可导出".into()));
    }

    let mut md = String::new();
    md.push_str("# SentryDesk 个人备忘导出\n\n");
    md.push_str(&format!("导出时间：{}\n", chrono::Utc::now().to_rfc3339()));
    md.push_str(&format!("条目数：{}\n\n", rows.len()));
    md.push_str("> 本文件仅包含元数据、原文链接与个人笔记，不包含原文全文。\n\n");
    md.push_str("---\n\n");

    for r in rows {
        if let Some(c) = &r.cve_id {
            md.push_str(&format!("## {}\n\n", c));
        } else {
            md.push_str(&format!("## {}\n\n", r.title));
        }
        md.push_str(&format!("- 标题：{}\n", r.title));
        if let Some(s) = r.cvss_score {
            md.push_str(&format!(
                "- CVSS：{} {}\n",
                s,
                r.cvss_severity.clone().unwrap_or_default()
            ));
        }
        if !r.products.is_empty() {
            md.push_str(&format!("- 受影响产品：{}\n", r.products.join(", ")));
        }
        if let Some(p) = &r.published_at {
            md.push_str(&format!("- 发布时间：{}\n", p));
        }
        md.push_str(&format!("- 来源：{}\n", r.source_name));
        md.push_str(&format!("- 原文链接：{}\n", r.source_url));
        md.push_str(&format!("- 采集时间：{}\n", r.collected_at));
        if let Some(n) = &r.note {
            md.push_str(&format!("- 我的笔记：{}\n", n.replace('\n', " ")));
        }
        md.push('\n');
    }

    let out = resolve_out_path(&app, &path)?;
    std::fs::write(&out, md)?;
    Ok(out.to_string_lossy().to_string())
}

/// 把相对路径解析到可写的应用数据目录，返回绝对路径
pub fn resolve_out_path(
    app: &tauri::AppHandle,
    path: &str,
) -> AppResult<std::path::PathBuf> {
    use tauri::Manager;
    let p = std::path::Path::new(path);
    if p.is_absolute() {
        return Ok(p.to_path_buf());
    }
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| crate::error::AppError::Other(format!("无法定位数据目录：{e}")))?;
    std::fs::create_dir_all(&dir)?;
    Ok(dir.join(p))
}
/// 保存学习报告 PNG：前端 canvas 渲染出的字节流，写到你选择的路径
#[tauri::command]
pub fn save_report_png(path: String, data: Vec<u8>) -> AppResult<String> {
    if data.is_empty() {
        return Err(crate::error::AppError::Other("报告内容为空".into()));
    }
    if let Some(parent) = std::path::Path::new(&path).parent() {
        std::fs::create_dir_all(parent)?;
    }
    std::fs::write(&path, &data)?;
    Ok(path)
}
