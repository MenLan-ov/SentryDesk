//! 数据层压力测试：大批量写入、重复数据、并发、反复检索。
//!
//! 只在 `cargo test` 下编译，不进入发布产物。
//! 目标不是覆盖率，而是回答三个问题：
//!   1. 写入 5 万次（含大量重复）会不会崩、会不会产生重复行
//!   2. FTS5 索引与主表在大量写入后是否仍然一致
//!   3. 并发多连接写同一库时是否只会阻塞而不会损坏
#![cfg(test)]

use super::repo;
use super::schema;
use crate::models::{Lang, ParsedItem, SearchFilter, Severity};
use rusqlite::Connection;
use std::path::PathBuf;
use std::time::Instant;

/// 建一个临时库，返回连接与目录（目录用于最后清理）
///
/// 用工程内 target/test-tmp 而不是系统 TEMP：
/// 受限环境下 std::env::temp_dir() 可能不可写（实测返回 PermissionDenied）。
fn temp_db(tag: &str) -> (Connection, PathBuf) {
    let mut dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    dir.push("target");
    dir.push("test-tmp");
    let nanos = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_nanos())
        .unwrap_or(0);
    dir.push(format!("sentrydesk-test-{}-{}", tag, nanos));
    std::fs::create_dir_all(&dir).expect("创建临时目录失败");
    let path = dir.join("test.db");
    let conn = schema::open(&path).expect("建库失败");
    (conn, dir)
}

/// 造一条可复现的条目：i 决定内容，保证唯一
fn fake_item(i: usize) -> ParsedItem {
    let cves = [
        "CVE-2024-0001",
        "CVE-2024-0002",
        "CVE-2024-0003",
        "CVE-2024-0004",
        "CVE-2024-0005",
    ];
    let products = [
        "nginx", "openssl", "log4j", "spring", "kubernetes",
        "redis", "postgres", "docker", "tomcat", "jenkins",
    ];
    let sevs = [Severity::Critical, Severity::High, Severity::Medium, Severity::Low];
    ParsedItem {
        external_id: Some(format!("EXT-{}", i)),
        cve_id: Some(cves[i % cves.len()].to_string()),
        title: format!("Test vulnerability number {} in component {}", i, products[i % products.len()]),
        summary: Some(format!(
            "A synthetic issue used for stress testing the local index. Instance {} of the generated corpus.",
            i
        )),
        cvss_score: if i % 5 == 0 { None } else { Some(((i % 100) as f64) / 10.0) },
        cvss_severity: if i % 5 == 0 { None } else { Some(sevs[i % sevs.len()]) },
        products: vec![products[i % products.len()].to_string()],
        published_at: Some(format!("2026-{:02}-{:02}T00:00:00Z", (i % 12) + 1, (i % 28) + 1)),
        source_url: format!("https://example.invalid/vuln/{}", i),
        lang: Lang::En,
        cwe: Some(format!("CWE-{}", 20 + (i % 30))),
        action: None,
    }
}

#[test]
fn bulk_insert_50k_with_duplicates() {
    let (mut conn, dir) = temp_db("bulk");

    // 5 万次写入尝试，但只有前 20000 个是不同的内容
    // 剩下 30000 次全是重复 -> 期望结果是被 ON CONFLICT 静默忽略，不报错不重复
    const UNIQUE: usize = 20_000;
    const ATTEMPTS: usize = 50_000;

    let t0 = Instant::now();
    let tx = conn.transaction().expect("开启事务失败");
    let mut inserted = 0usize;
    for k in 0..ATTEMPTS {
        let item = fake_item(k % UNIQUE);
        if repo::upsert_item(&tx, &item, "nvd", "2026-11-11T00:00:00Z").expect("写入失败") {
            inserted += 1;
        }
    }
    tx.commit().expect("提交失败");
    let elapsed = t0.elapsed();

    let total: i64 = conn
        .query_row("SELECT COUNT(*) FROM items", [], |r| r.get(0))
        .expect("统计失败");

    assert_eq!(inserted, UNIQUE, "应只有 {} 条被真正写入", UNIQUE);
    assert_eq!(total as usize, UNIQUE, "主表行数应与唯一内容数一致");

    // 关键断言：重复写入不会产生重复行
    let dup: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM (SELECT content_hash FROM items GROUP BY content_hash HAVING COUNT(*) > 1)",
            [],
            |r| r.get(0),
        )
        .expect("查重失败");
    assert_eq!(dup, 0, "不应存在重复的 content_hash");

    println!(
        "批量写入：{} 次尝试 -> {} 条入库，{} 条被去重，耗时 {:?}（约 {:.0} 次/秒）",
        ATTEMPTS,
        total,
        ATTEMPTS as i64 - total,
        elapsed,
        ATTEMPTS as f64 / elapsed.as_secs_f64()
    );

    drop(conn);
    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn fts_stays_consistent_after_bulk_writes() {
    let (mut conn, dir) = temp_db("fts");

    let tx = conn.transaction().expect("事务失败");
    for i in 0..5_000 {
        repo::upsert_item(&tx, &fake_item(i), "nvd", "2026-11-11T00:00:00Z").expect("写入失败");
    }
    tx.commit().expect("提交失败");

    let items: i64 = conn.query_row("SELECT COUNT(*) FROM items", [], |r| r.get(0)).unwrap();
    let fts: i64 = conn
        .query_row("SELECT COUNT(*) FROM items_fts", [], |r| r.get(0))
        .unwrap();
    assert_eq!(items, fts, "FTS 索引行数必须与主表一致");

    // 删掉一部分，索引必须跟着删
    conn.execute("DELETE FROM items WHERE id % 3 = 0", []).expect("删除失败");
    let items_after: i64 = conn.query_row("SELECT COUNT(*) FROM items", [], |r| r.get(0)).unwrap();
    let fts_after: i64 = conn
        .query_row("SELECT COUNT(*) FROM items_fts", [], |r| r.get(0))
        .unwrap();
    assert_eq!(items_after, fts_after, "删除后 FTS 索引仍须一致");

    // FTS 完整性自检（FTS5 内置命令）
    conn.execute(
        "INSERT INTO items_fts(items_fts) VALUES('integrity-check')",
        [],
    )
    .expect("FTS integrity-check 失败：索引已损坏");

    // 更新标题后，旧词应查不到、新词应查得到
    conn.execute(
        "UPDATE items SET title = 'Renamed marker zzuniquezz' WHERE id = (SELECT MIN(id) FROM items)",
        [],
    )
    .expect("更新失败");
    let hit: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM items_fts WHERE items_fts MATCH '\"zzuniquezz\"'",
            [],
            |r| r.get(0),
        )
        .unwrap_or(0);
    assert!(hit >= 1, "更新后的新词应能被全文索引查到");

    println!("FTS 一致性：{} 条写入后主表/索引一致，删除与更新均同步", items);

    drop(conn);
    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn repeated_searches_do_not_fail() {
    let (mut conn, dir) = temp_db("search");

    let tx = conn.transaction().expect("事务失败");
    for i in 0..8_000 {
        repo::upsert_item(&tx, &fake_item(i), "nvd", "2026-11-11T00:00:00Z").expect("写入失败");
    }
    tx.commit().expect("提交失败");

    let queries = [
        "", "nginx", "CVE-2024-0001", "CWE-25", "synthetic", "stress testing",
        "zzz-no-such-thing", "log4j vulnerability", "中文两个字符", "a", "\"", "' OR 1=1--",
    ];

    let mut worst_ms = 0u128;
    let mut runs = 0usize;
    let t0 = Instant::now();
    for _round in 0..200 {
        for q in queries {
            for (kev_only, cvss_min, days) in
                [(false, None, None), (true, None, None), (false, Some(7.0), Some(30))]
            {
                let f = SearchFilter {
                    query: q.to_string(),
                    source_key: None,
                    cvss_min,
                    days,
                    kev_only,
                    severity: None,
                    cwe: None,
                    favorite_only: false,
                    limit: Some(100),
                    offset: Some(0),
                };
                let r = repo::search_items(&conn, &f).expect("检索失败");
                assert!(r.items.len() <= 100, "limit 未生效");
                runs += 1;
                if r.elapsed_ms as u128 > worst_ms {
                    worst_ms = r.elapsed_ms as u128;
                }
            }
        }
    }
    let elapsed = t0.elapsed();

    // 恶意/畸形查询不应引发 panic 或 SQL 错误——上面的 expect 已经验证过
    println!(
        "反复检索：{} 次查询全部成功，最慢 {} ms，总耗时 {:?}（平均 {:.3} ms/次）",
        runs,
        worst_ms,
        elapsed,
        elapsed.as_secs_f64() * 1000.0 / runs as f64
    );

    assert!(worst_ms < 500, "单次检索不应超过 500 ms，实测 {} ms", worst_ms);

    drop(conn);
    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn concurrent_writers_do_not_corrupt() {
    let (conn, dir) = temp_db("concurrent");
    let db_path = dir.join("test.db");
    drop(conn);

    // 4 个线程各写 500 条，互不重叠
    let mut handles = Vec::new();
    for t in 0..4usize {
        let path = db_path.clone();
        handles.push(std::thread::spawn(move || {
            let mut c = schema::open(&path).expect("线程内建库失败");
            let tx = c.transaction().expect("线程内开事务失败");
            for i in 0..500usize {
                let idx = t * 1000 + i;
                repo::upsert_item(&tx, &fake_item(idx), "nvd", "2026-11-11T00:00:00Z")
                    .expect("线程内写入失败");
            }
            tx.commit().expect("线程内提交失败");
        }));
    }
    for h in handles {
        h.join().expect("写入线程 panic");
    }

    let conn = schema::open(&db_path).expect("重开库失败");
    let total: i64 = conn.query_row("SELECT COUNT(*) FROM items", [], |r| r.get(0)).unwrap();
    assert_eq!(total, 2_000, "4 线程 × 500 条应全部落库");
    conn.execute("INSERT INTO items_fts(items_fts) VALUES('integrity-check')", [])
        .expect("并发写入后 FTS 索引损坏");
    let check: String = conn.query_row("PRAGMA integrity_check", [], |r| r.get(0)).unwrap();
    assert_eq!(check, "ok", "数据库完整性检查未通过：{}", check);

    println!("并发写入：4 线程 × 500 条全部落库，integrity_check=ok");

    drop(conn);
    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn reopen_and_migrate_is_idempotent() {
    let (conn, dir) = temp_db("migrate");
    drop(conn);
    let db_path = dir.join("test.db");

    // 连续打开 20 次：建表语句与迁移必须可重入
    for _ in 0..20 {
        let c = schema::open(&db_path).expect("重复打开失败");
        let ver: i64 = c.query_row("PRAGMA user_version", [], |r| r.get(0)).unwrap();
        assert_eq!(ver, schema::SCHEMA_VERSION, "schema 版本被写坏");
    }

    let c = schema::open(&db_path).expect("最终打开失败");
    let sources: i64 = c.query_row("SELECT COUNT(*) FROM sources", [], |r| r.get(0)).unwrap();
    assert!(sources >= 5, "数据源播种应至少 5 条，实际 {}", sources);

    // 播种不能重复插入
    let dup: i64 = c
        .query_row(
            "SELECT COUNT(*) FROM (SELECT key FROM sources GROUP BY key HAVING COUNT(*) > 1)",
            [],
            |r| r.get(0),
        )
        .unwrap();
    assert_eq!(dup, 0, "数据源播种产生了重复 key");

    println!("重复打开 20 次：schema 版本稳定，数据源 {} 条无重复", sources);

    drop(c);
    let _ = std::fs::remove_dir_all(&dir);
}
