//! 采集相关 command
use crate::collect::{self, limiter::RateLimiter};
use crate::error::AppResult;
use crate::models::*;
use crate::state::AppState;
use tauri::{AppHandle, Emitter, State};

/// 扫描全部源的 robots 状态（联网）
#[tauri::command]
pub async fn check_robots(state: State<'_, AppState>) -> AppResult<Vec<RobotsStatus>> {
    let client = crate::collect::fetcher::build_client()?;
    let defs = crate::collect::sources::all_sources();
    let mut out = Vec::new();
    for d in defs {
        // robots 抓取在 async 中完成，拿到结果后立刻用短生命周期连接写库
        let (rules, detail) = crate::collect::robots::fetch(&client, &d.base_url).await?;
        let path = crate::collect::sources::robots_path(&d.key);
        let allowed = (rules.fetched && rules.rules.is_empty()) || rules.is_allowed(path);
        let state_str = if !rules.fetched {
            "not_found"
        } else if allowed {
            "allowed"
        } else {
            "disallowed"
        };
        let st = RobotsStatus {
            source_key: d.key.clone(),
            allowed: allowed && state_str != "disallowed",
            state: state_str.to_string(),
            detail,
            checked_at: chrono::Utc::now().to_rfc3339(),
        };
        {
            let conn = state.open()?;
            crate::db::repo::set_robots(&conn, &st)?;
        }
        out.push(st);
        tokio::time::sleep(std::time::Duration::from_millis(
            d.min_interval_ms.max(crate::collect::sources::MIN_INTERVAL_FLOOR_MS),
        ))
        .await;
    }
    Ok(out)
}

/// 读取已缓存的 robots 状态（不联网）
#[tauri::command]
pub fn get_robots(state: State<'_, AppState>) -> AppResult<Vec<RobotsStatus>> {
    let conn = state.open()?;
    crate::db::repo::list_robots(&conn)
}

/// 读取数据源白名单
#[tauri::command]
pub fn list_sources(state: State<'_, AppState>) -> AppResult<Vec<SourceDef>> {
    let conn = state.open()?;
    crate::db::repo::list_sources(&conn)
}

/// 启动采集：异步执行，逐源推送进度事件
#[tauri::command]
pub async fn start_collect(app: AppHandle, state: State<'_, AppState>) -> AppResult<CollectSummary> {
    // 互斥：双击采集 / 界面状态不同步时，只放行一个任务
    let _collect_guard = state
        .begin_collect()
        .ok_or_else(|| crate::error::AppError::Other("采集正在进行中，请稍候".into()))?;
    let t0 = std::time::Instant::now();
    let task_id = format!("task-{}", chrono::Utc::now().timestamp_millis());
    let defs = crate::collect::sources::all_sources();
    let client = crate::collect::fetcher::build_client()?;
    let limiter = RateLimiter::new();
    let db_path = state.db_path.clone();

    let mut details: Vec<CollectDetail> = Vec::new();
    let (mut ok_sources, mut failed_sources, mut inserted, mut skipped) = (0usize, 0usize, 0usize, 0usize);
    let total = defs.len();

    for (i, d) in defs.iter().enumerate() {
        let _ = app.emit(
            "collect://progress",
            CollectProgress {
                task_id: task_id.clone(),
                source_key: d.key.clone(),
                source_name: d.name.clone(),
                done: i,
                total,
                status: "running".into(),
                message: None,
            },
        );

        // 连接在块作用域内创建并释放，绝不跨 await
        let robots_state = {
            let conn = crate::db::schema::open(&db_path)?;
            crate::db::repo::list_robots(&conn)?
                .into_iter()
                .find(|r| r.source_key == d.key)
                .map(|r| r.state)
                .unwrap_or_else(|| "unknown".into())
        };

        let outcome = collect::collect_source(&db_path, &client, &limiter, d, &robots_state).await;

        match outcome {
            Ok(o) => {
                if o.status == "ok" {
                    ok_sources += 1;
                } else {
                    failed_sources += 1;
                }
                inserted += o.inserted;
                skipped += o.skipped;
                let _ = app.emit(
                    "collect://progress",
                    CollectProgress {
                        task_id: task_id.clone(),
                        source_key: o.source_key.clone(),
                        source_name: o.name.clone(),
                        done: i + 1,
                        total,
                        status: o.status.clone(),
                        message: o.message.clone(),
                    },
                );
                details.push(CollectDetail {
                    source_key: o.source_key,
                    name: o.name,
                    status: o.status,
                    fetched: o.fetched,
                    inserted: o.inserted,
                    skipped: o.skipped,
                    elapsed_ms: o.elapsed_ms,
                    message: o.message,
                });
            }
            Err(e) => {
                failed_sources += 1;
                let msg = e.to_string();
                // 解析失败等错误也要落采集日志，否则用户只看到「+0 条」，无从排查
                if let Ok(conn) = crate::db::schema::open(&db_path) {
                    let url = crate::collect::sources::entry_url(&d.key).unwrap_or_default();
                    let _ = crate::db::repo::log_collect(
                        &conn, &d.key, &url, None, 0, false, Some(&msg),
                    );
                }
                details.push(CollectDetail {
                    source_key: d.key.clone(),
                    name: d.name.clone(),
                    status: "failed".into(),
                    fetched: 0,
                    inserted: 0,
                    skipped: 0,
                    elapsed_ms: 0,
                    message: Some(msg),
                });
            }
        }
    }

    // 采集后做两次交叉补全：
    // 1) KEV 标记：把已确认在野利用的 CVE 标到所有同号条目
    // 2) CVSS 回填：用有评分的同号条目补齐缺分值的（KEV 源本身不带评分）
    {
        let conn = crate::db::schema::open(&db_path)?;
        let _ = collect::cross_mark_kev(&conn);
        let filled = collect::cross_fill_cvss(&conn).unwrap_or(0);
        if filled > 0 {
            crate::log_line(&format!("[collect] CVSS 交叉回填 {} 条", filled));
        }
    }

    let summary = CollectSummary {
        task_id,
        ok_sources,
        failed_sources,
        inserted,
        skipped,
        elapsed_ms: t0.elapsed().as_millis() as u64,
        details,
    };
    let _ = app.emit("collect://done", &summary);
    Ok(summary)
}

/// 读取最近采集日志
#[tauri::command]
pub fn collect_logs(state: State<'_, AppState>, limit: Option<i64>) -> AppResult<Vec<serde_json::Value>> {
    let conn = state.open()?;
    crate::db::repo::recent_logs(&conn, limit.unwrap_or(50))
}
