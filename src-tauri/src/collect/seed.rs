//! 内置情报种子库导入。
//!
//! 快照文件（knowledge/seed/*.json）由发布流程离线生成并随安装包分发，
//! 运行时零网络：首次启动（items 表为空）时一次性导入，
//! 之后用户数据优先，永不覆盖。
use crate::db::repo;
use crate::error::AppResult;
use crate::parse::{kev::KevParser, nvd::NvdParser, SourceParser};
use rusqlite::Connection;
use std::path::{Path, PathBuf};

/// 定位随包分发的 seed 目录（与 knowledge/ 的解析规则保持一致）
fn seed_dir(data_dir: &Path) -> Option<PathBuf> {
    // 1) 程序同目录（普通安装布局 / NSIS _up_ 布局）
    if let Ok(exe) = std::env::current_exe()
        && let Some(dir) = exe.parent()
    {
        for cand in ["knowledge/seed", "_up_/knowledge/seed"] {
            let p = dir.join(cand);
            if p.join("kev.json").exists() {
                return Some(p);
            }
        }
        // 开发期：target/debug 回到源码目录
        let dev = dir.join("../../../knowledge/seed");
        if dev.join("kev.json").exists() {
            return Some(dev);
        }
    }
    // 2) 数据目录（便于用户自行扩充）
    let p = data_dir.join("knowledge").join("seed");
    if p.join("kev.json").exists() {
        return Some(p);
    }
    None
}

/// items 表为空则导入种子库，返回导入条数；已有数据则什么都不做（Ok(0)）。
pub fn import_if_empty(conn: &Connection, data_dir: &Path) -> AppResult<usize> {
    let n: i64 = conn.query_row("SELECT COUNT(*) FROM items", [], |r| r.get(0))?;
    if n > 0 {
        return Ok(0);
    }
    let Some(dir) = seed_dir(data_dir) else {
        return Ok(0);
    };

    let collected_at = chrono::Local::now().to_rfc3339();
    let kev = KevParser;
    let nvd = NvdParser;
    let jobs: [(&str, &str, &dyn SourceParser); 2] = [
        ("kev.json", "cisa_kev", &kev),
        ("nvd_recent.json", "nvd", &nvd),
    ];

    let mut total = 0usize;
    for (file, source_key, parser) in jobs {
        let path = dir.join(file);
        let Ok(raw) = std::fs::read(&path) else {
            continue;
        };
        let Ok(items) = parser.parse(&raw) else {
            continue;
        };
        for it in &items {
            if repo::upsert_item(conn, it, source_key, &collected_at)? {
                total += 1;
            }
        }
    }
    Ok(total)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn import_twice_is_idempotent() {
        let conn = Connection::open_in_memory().unwrap();
        crate::db::schema::init(&conn).unwrap();
        // data_dir 传项目根目录：seed_dir 会命中 <root>/knowledge/seed
        let dir = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("..");
        if !dir.join("knowledge/seed/kev.json").exists() {
            return; // 快照未生成时跳过
        }
        let first = import_if_empty(&conn, &dir).unwrap();
        assert!(first > 1000, "种子库应至少导入千级条目，实际 {}", first);
        // 第二次启动：已有数据，不再导入
        let second = import_if_empty(&conn, &dir).unwrap();
        assert_eq!(second, 0);
        // KEV 条目应被打上 in_kev 标记
        crate::collect::cross_mark_kev(&conn).unwrap();
        let kev_n: i64 = conn
            .query_row("SELECT COUNT(*) FROM items WHERE in_kev = 1", [], |r| r.get(0))
            .unwrap();
        assert!(kev_n > 1000, "KEV 标记数异常：{}", kev_n);
    }
}
