//! 设置：主题配置、合规信息、数据备份、导入导出
use crate::error::{AppError, AppResult};
use crate::models::*;
use crate::state::AppState;
use serde::{Deserialize, Serialize};
use tauri::State;

fn theme_path(state: &AppState) -> std::path::PathBuf {
    state.data_dir.join("theme.json")
}

#[tauri::command]
pub fn get_theme(state: State<'_, AppState>) -> AppResult<ThemeConfig> {
    let p = theme_path(&state);
    if !p.exists() {
        return Ok(ThemeConfig::default());
    }
    let txt = std::fs::read_to_string(&p)?;
    Ok(serde_json::from_str(&txt).unwrap_or_default())
}

#[tauri::command]
pub fn set_theme(state: State<'_, AppState>, config: ThemeConfig) -> AppResult<ThemeConfig> {
    let p = theme_path(&state);
    if let Some(parent) = p.parent() {
        std::fs::create_dir_all(parent)?;
    }
    std::fs::write(&p, serde_json::to_string_pretty(&config)?)?;
    Ok(config)
}

#[tauri::command]
pub fn export_theme(state: State<'_, AppState>) -> AppResult<String> {
    let p = theme_path(&state);
    if !p.exists() {
        return Ok(serde_json::to_string_pretty(&ThemeConfig::default())?);
    }
    Ok(std::fs::read_to_string(p)?)
}

#[tauri::command]
pub fn import_theme(state: State<'_, AppState>, json: String) -> AppResult<ThemeConfig> {
    let cfg: ThemeConfig = serde_json::from_str(&json)
        .map_err(|e| AppError::Config(format!("主题配置格式错误：{}", e)))?;
    let p = theme_path(&state);
    std::fs::write(&p, serde_json::to_string_pretty(&cfg)?)?;
    Ok(cfg)
}

// ==================== 合规信息（设置页展示） ====================

/// 一个数据源的完整合规信息
#[derive(Debug, Clone, Serialize)]
pub struct SourceCompliance {
    pub key: String,
    pub name: String,
    pub base_url: String,
    pub kind: String,
    /// 实际生效的限速（毫秒）
    pub interval_ms: u64,
    /// 是否被硬性下限抬升过
    pub floor_applied: bool,
    /// robots 状态：allowed | disallowed | not_found | unknown
    pub robots_state: String,
    pub robots_checked_at: Option<String>,
    pub enabled: bool,
    /// 该源的条目数
    pub item_count: i64,
}

/// 全局合规摘要
#[derive(Debug, Clone, Serialize)]
pub struct ComplianceInfo {
    pub user_agent: String,
    pub min_interval_floor_ms: u64,
    pub default_interval_ms: u64,
    pub max_body_bytes: usize,
    pub timeout_secs: u64,
    pub max_retries: u32,
    pub sources: Vec<SourceCompliance>,
    /// 数据目录绝对路径（用户可见）
    pub data_dir: String,
    pub db_path: String,
    pub db_bytes: u64,
    /// 是否禁止任何联网回传（恒 true，用于界面明示）
    pub offline_only: bool,
}

#[tauri::command]
pub fn compliance_info(state: State<'_, AppState>) -> AppResult<ComplianceInfo> {
    let conn = state.open()?;

    let mut st = conn.prepare(
        "SELECT s.key, s.name, s.base_url, s.kind, s.min_interval_ms,
                COALESCE(s.robots_state,'unknown'), s.robots_checked_at, s.enabled,
                (SELECT COUNT(*) FROM items i WHERE i.source_key = s.key)
         FROM sources s ORDER BY s.id",
    )?;
    let sources = st
        .query_map([], |r| {
            let configured: u64 = r.get::<_, i64>(4)? as u64;
            let floor = crate::collect::sources::MIN_INTERVAL_FLOOR_MS;
            Ok(SourceCompliance {
                key: r.get(0)?,
                name: r.get(1)?,
                base_url: r.get(2)?,
                kind: r.get(3)?,
                interval_ms: configured.max(floor),
                floor_applied: configured < floor,
                robots_state: r.get(5)?,
                robots_checked_at: r.get(6)?,
                enabled: r.get::<_, i64>(7)? == 1,
                item_count: r.get(8)?,
            })
        })?
        .collect::<rusqlite::Result<Vec<_>>>()?;

    let db_bytes = std::fs::metadata(&state.db_path).map(|m| m.len()).unwrap_or(0);

    Ok(ComplianceInfo {
        user_agent: crate::collect::sources::USER_AGENT.to_string(),
        min_interval_floor_ms: crate::collect::sources::MIN_INTERVAL_FLOOR_MS,
        default_interval_ms: crate::collect::sources::DEFAULT_INTERVAL_MS,
        max_body_bytes: crate::collect::fetcher::MAX_BODY_BYTES,
        timeout_secs: crate::collect::fetcher::TIMEOUT_SECS,
        max_retries: crate::collect::fetcher::MAX_RETRIES,
        sources,
        data_dir: state.data_dir.to_string_lossy().to_string(),
        db_path: state.db_path.to_string_lossy().to_string(),
        db_bytes,
        offline_only: true,
    })
}

// ==================== 数据备份 / 恢复 ====================

#[derive(Debug, Clone, Serialize)]
pub struct BackupResult {
    pub path: String,
    pub bytes: u64,
    pub items: i64,
    pub notes: i64,
    pub progress: i64,
}

/// 导出完整备份（SQLite 单文件拷贝 + 元数据）
#[tauri::command]
pub fn backup_database(state: State<'_, AppState>, target_dir: Option<String>) -> AppResult<BackupResult> {
    let conn = state.open()?;
    // 先做 WAL checkpoint，保证备份文件是完整的
    let _ = conn.execute_batch("PRAGMA wal_checkpoint(TRUNCATE);");

    let items: i64 = conn.query_row("SELECT COUNT(*) FROM items", [], |r| r.get(0))?;
    let notes: i64 = conn.query_row("SELECT COUNT(*) FROM notes", [], |r| r.get(0))?;
    let progress: i64 = conn.query_row("SELECT COUNT(*) FROM lesson_progress", [], |r| r.get(0))?;

    let dir = match target_dir {
        Some(d) if !d.trim().is_empty() => std::path::PathBuf::from(d),
        _ => state.data_dir.clone(),
    };
    std::fs::create_dir_all(&dir)?;

    let stamp = chrono::Local::now().format("%Y%m%d-%H%M%S");
    let dest = dir.join(format!("sentrydesk-backup-{}.db", stamp));
    std::fs::copy(&state.db_path, &dest)?;
    let bytes = std::fs::metadata(&dest).map(|m| m.len()).unwrap_or(0);

    crate::log_line(&format!("[backup] {} ({} bytes)", dest.display(), bytes));

    Ok(BackupResult {
        path: dest.to_string_lossy().to_string(),
        bytes,
        items,
        notes,
        progress,
    })
}

/// 从备份恢复：替换数据库并提示重启
#[tauri::command]
pub fn restore_database(state: State<'_, AppState>, source: String) -> AppResult<String> {
    let src = std::path::PathBuf::from(&source);
    if !src.exists() {
        return Err(AppError::Config(format!("备份文件不存在：{}", source)));
    }
    // 基本校验：必须是 SQLite 文件头
    let head = std::fs::read(&src)?;
    if head.len() < 16 || &head[0..15] != b"SQLite format 3" {
        return Err(AppError::Config("不是有效的 SQLite 数据库文件".into()));
    }
    // 先备份当前库，避免恢复失败丢数据
    let safety = state.data_dir.join(format!(
        "before-restore-{}.db",
        chrono::Local::now().format("%Y%m%d-%H%M%S")
    ));
    let _ = std::fs::copy(&state.db_path, &safety);
    std::fs::copy(&src, &state.db_path)?;
    crate::log_line(&format!("[restore] from {} (safety: {})", source, safety.display()));
    Ok(format!(
        "已恢复。原库已备份到 {}，请重启程序生效。",
        safety.display()
    ))
}

/// 打开数据目录（方便用户自己找备份）
#[tauri::command]
pub fn open_data_dir(app: tauri::AppHandle, state: State<'_, AppState>) -> AppResult<String> {
    let dir = state.data_dir.to_string_lossy().to_string();
    use tauri_plugin_opener::OpenerExt;
    let _ = app.opener().open_path(&dir, None::<&str>);
    Ok(dir)
}

// ==================== 数据导入 / 导出（JSON） ====================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ItemExport {
    pub cve_id: Option<String>,
    pub title: String,
    pub summary: Option<String>,
    pub cvss_score: Option<f64>,
    pub cvss_severity: Option<String>,
    pub products: Vec<String>,
    pub published_at: Option<String>,
    pub source_url: String,
    pub source_key: String,
    pub collected_at: String,
    pub cwe: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct ItemExportResult {
    pub path: String,
    pub count: usize,
    pub bytes: u64,
}

/// 导出条目为 JSON（仅元数据，不含任何原文全文）
#[tauri::command]
pub fn export_items_json(state: State<'_, AppState>, limit: Option<i64>) -> AppResult<ItemExportResult> {
    let conn = state.open()?;
    let n = limit.unwrap_or(5000).clamp(1, 100_000);
    let mut st = conn.prepare(
        "SELECT cve_id, title, summary, cvss_score, cvss_severity, products,
                published_at, source_url, source_key, collected_at, cwe
         FROM items ORDER BY COALESCE(published_at, collected_at) DESC LIMIT ?1",
    )?;
    let rows = st
        .query_map([n], |r| {
            let products: Option<String> = r.get(5)?;
            Ok(ItemExport {
                cve_id: r.get(0)?,
                title: r.get(1)?,
                summary: r.get(2)?,
                cvss_score: r.get(3)?,
                cvss_severity: r.get(4)?,
                products: products
                    .and_then(|s| serde_json::from_str::<Vec<String>>(&s).ok())
                    .unwrap_or_default(),
                published_at: r.get(6)?,
                source_url: r.get(7)?,
                source_key: r.get(8)?,
                collected_at: r.get(9)?,
                cwe: r.get(10)?,
            })
        })?
        .collect::<rusqlite::Result<Vec<_>>>()?;

    let stamp = chrono::Local::now().format("%Y%m%d-%H%M%S");
    let dest = state.data_dir.join(format!("sentrydesk-items-{}.json", stamp));
    let body = serde_json::to_string_pretty(&rows)?;
    std::fs::write(&dest, &body)?;
    Ok(ItemExportResult {
        path: dest.to_string_lossy().to_string(),
        count: rows.len(),
        bytes: body.len() as u64,
    })
}
