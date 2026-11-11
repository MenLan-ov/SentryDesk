//! v0.7.5 质量验证：数据层功能、边界、并发、超大输入。
//!
//! 与 stress.rs 的分工：
//! - stress.rs 只看「量」：能不能扛住 5 万次写入、索引会不会飘
//! - qa.rs      看「理」：分页有没有漏、收藏语义对不对、畸形输入会不会崩、
//!                 读线程与写线程同时跑会不会锁死
//!
//! 全部在 `cargo test` 下运行，用 target/test-tmp 下的独立临时库，不碰真实数据。
#![cfg(test)]

use super::{progress, repo, review, schema, wrong};
use crate::models::{Lang, ParsedItem, SearchFilter, Severity};
use rusqlite::Connection;
use std::path::PathBuf;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use std::time::Instant;

fn temp_db(tag: &str) -> (Connection, PathBuf) {
    let mut dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    dir.push("target");
    dir.push("test-tmp");
    let nanos = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_nanos())
        .unwrap_or(0);
    dir.push(format!("qa-{}-{}", tag, nanos));
    std::fs::create_dir_all(&dir).expect("创建临时目录失败");
    let conn = schema::open(&dir.join("test.db")).expect("建库失败");
    (conn, dir)
}

fn item(i: usize) -> ParsedItem {
    let products = ["nginx", "openssl", "log4j", "spring", "redis"];
    let sevs = [Severity::Critical, Severity::High, Severity::Medium, Severity::Low];
    ParsedItem {
        external_id: Some(format!("QA-{}", i)),
        cve_id: Some(format!("CVE-2026-{:05}", i)),
        title: format!("QA item {} in {}", i, products[i % products.len()]),
        summary: Some(format!("Synthetic record {} for the qa suite.", i)),
        cvss_score: if i % 7 == 0 { None } else { Some(((i % 100) as f64) / 10.0) },
        cvss_severity: if i % 7 == 0 { None } else { Some(sevs[i % sevs.len()]) },
        products: vec![products[i % products.len()].to_string()],
        published_at: Some(format!("2026-{:02}-{:02}T00:00:00Z", (i % 12) + 1, (i % 28) + 1)),
        source_url: format!("https://example.invalid/qa/{}", i),
        lang: Lang::En,
        cwe: Some(format!("CWE-{}", 20 + (i % 30))),
        action: None,
    }
}

fn filter(query: &str) -> SearchFilter {
    SearchFilter {
        query: query.to_string(),
        source_key: None,
        cvss_min: None,
        days: None,
        kev_only: false,
        severity: None,
        cwe: None,
        favorite_only: false,
        limit: Some(100),
        offset: Some(0),
    }
}

fn seed(conn: &mut Connection, n: usize) {
    let tx = conn.transaction().expect("事务失败");
    for i in 0..n {
        repo::upsert_item(&tx, &item(i), "nvd", "2026-11-11T00:00:00Z").expect("写入失败");
    }
    tx.commit().expect("提交失败");
}

// ==================== 1. 迁移 ====================

#[test]
fn migrate_v4_database_keeps_data_and_adds_favorites() {
    let (mut conn, dir) = temp_db("migrate-v4");
    seed(&mut conn, 25);
    drop(conn);

    // 人为退回 v4：删掉收藏表，把版本号写回 4
    let db_path = dir.join("test.db");
    {
        let c = Connection::open(&db_path).unwrap();
        c.execute_batch("DROP TABLE IF EXISTS favorites; PRAGMA user_version = 4;")
            .unwrap();
        let ver: i64 = c.query_row("PRAGMA user_version", [], |r| r.get(0)).unwrap();
        assert_eq!(ver, 4);
    }

    // 重新打开必须自动升级，且原数据一条不少
    let c = schema::open(&db_path).expect("升级失败");
    let ver: i64 = c.query_row("PRAGMA user_version", [], |r| r.get(0)).unwrap();
    assert_eq!(ver, schema::SCHEMA_VERSION, "版本未升到最新");
    let items: i64 = c.query_row("SELECT COUNT(*) FROM items", [], |r| r.get(0)).unwrap();
    assert_eq!(items, 25, "升级过程丢了数据");
    let has_fav: i64 = c
        .query_row(
            "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='favorites'",
            [],
            |r| r.get(0),
        )
        .unwrap();
    assert_eq!(has_fav, 1, "升级后缺少 favorites 表");

    println!("迁移：v4 库升级到 v{}，{} 条数据完好，favorites 已补建", ver, items);
    drop(c);
    let _ = std::fs::remove_dir_all(&dir);
}

// ==================== 2. 分页 ====================

#[test]
fn pagination_walks_every_row_exactly_once() {
    let (mut conn, dir) = temp_db("page");
    const N: usize = 1234;
    seed(&mut conn, N);

    let mut seen = std::collections::HashSet::new();
    let mut offset = 0i64;
    let mut pages = 0;
    loop {
        let mut f = filter("");
        f.limit = Some(100);
        f.offset = Some(offset);
        let r = repo::search_items(&conn, &f).expect("分页查询失败");
        assert_eq!(r.total as usize, N, "总数在翻页过程中漂移");
        if r.items.is_empty() {
            break;
        }
        for it in &r.items {
            assert!(seen.insert(it.id), "第 {} 页出现重复 id={}", pages, it.id);
        }
        offset += 100;
        pages += 1;
        assert!(pages < 100, "翻页未收敛，可能 offset 不生效");
    }
    assert_eq!(seen.len(), N, "翻页遗漏了 {} 条", N - seen.len());

    // offset 超出范围应返回空列表而不是报错
    let mut f = filter("");
    f.offset = Some(999_999);
    let r = repo::search_items(&conn, &f).expect("越界 offset 报错");
    assert!(r.items.is_empty());
    assert_eq!(r.total as usize, N);

    println!("分页：{} 条 / {} 页，无重复无遗漏；越界 offset 返回空列表", N, pages);
    drop(conn);
    let _ = std::fs::remove_dir_all(&dir);
}

// ==================== 3. 收藏 ====================

#[test]
fn favorite_toggle_and_filter_are_consistent() {
    let (mut conn, dir) = temp_db("fav");
    seed(&mut conn, 300);

    let ids: Vec<i64> = {
        let mut st = conn.prepare("SELECT id FROM items ORDER BY id").unwrap();
        st.query_map([], |r| r.get::<_, i64>(0))
            .unwrap()
            .map(|x| x.unwrap())
            .collect()
    };
    let picked: Vec<i64> = ids.iter().copied().step_by(8).take(37).collect();

    for id in &picked {
        assert!(repo::toggle_favorite(&conn, *id).unwrap(), "首次收藏应返回 true");
    }
    assert_eq!(repo::favorite_count(&conn).unwrap() as usize, picked.len());
    assert_eq!(repo::favorite_ids(&conn).unwrap().len(), picked.len());

    // 只读收藏时，total 必须等于收藏数，且每条 item.favorite 为真
    let mut f = filter("");
    f.favorite_only = true;
    f.limit = Some(500);
    let r = repo::search_items(&conn, &f).unwrap();
    assert_eq!(r.total as usize, picked.len(), "收藏筛选总数不符");
    assert_eq!(r.items.len(), picked.len());
    assert!(r.items.iter().all(|i| i.favorite), "返回了未收藏的条目");

    // 与其它条件叠加：收藏 + 关键字，两者取交集而不是并集
    let mut f2 = filter("QA item 8 ");
    f2.favorite_only = true;
    let r2 = repo::search_items(&conn, &f2).unwrap();
    assert!(r2.items.len() <= r.items.len(), "叠加条件后结果反而变多");

    // 再点一次必须取消
    for id in &picked {
        assert!(!repo::toggle_favorite(&conn, *id).unwrap(), "再次点击应变回未收藏");
    }
    assert_eq!(repo::favorite_count(&conn).unwrap(), 0);
    let mut f3 = filter("");
    f3.favorite_only = true;
    assert_eq!(repo::search_items(&conn, &f3).unwrap().total, 0);

    println!("收藏：{} 条收藏/取消成对生效，筛选与总数一致", picked.len());
    drop(conn);
    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn favorite_on_missing_item_is_graceful() {
    let (conn, dir) = temp_db("fav-missing");
    // 条目不存在时不应崩溃；允许返回 Err，但不能 panic
    let r = repo::toggle_favorite(&conn, 999_999);
    println!("收藏不存在条目 -> {:?}", r);
    assert_eq!(r.unwrap(), false, "不存在的条目应安静返回 false，而不是抛约束错误");
    assert_eq!(repo::favorite_count(&conn).unwrap(), 0, "不应写入孤儿收藏");
    drop(conn);
    let _ = std::fs::remove_dir_all(&dir);
}

// ==================== 4. 笔记 ====================

#[test]
fn note_upsert_keeps_single_row_and_latest_body() {
    let (mut conn, dir) = temp_db("note");
    seed(&mut conn, 3);
    let id: i64 = conn.query_row("SELECT MIN(id) FROM items", [], |r| r.get(0)).unwrap();

    for i in 0..500 {
        repo::upsert_note(&conn, id, &format!("第 {} 次修改", i)).expect("写笔记失败");
    }
    let n: i64 = conn
        .query_row("SELECT COUNT(*) FROM notes WHERE item_id=?1", [id], |r| r.get(0))
        .unwrap();
    assert_eq!(n, 1, "同一纸条目应只保留一条笔记，实际 {}", n);

    let got = repo::get_item(&conn, id).unwrap().unwrap();
    let note = got.note.expect("读不回笔记");
    assert_eq!(note.body, "第 499 次修改", "笔记不是最后一次写入的内容");

    // 空字符串与超长内容
    repo::upsert_note(&conn, id, "").expect("清空笔记失败");
    let long = "长".repeat(50_000);
    repo::upsert_note(&conn, id, &long).expect("超长笔记失败");
    let got = repo::get_item(&conn, id).unwrap().unwrap();
    assert_eq!(got.note.unwrap().body.len(), long.len(), "超长笔记被截断");

    println!("笔记：500 次覆盖写只留 1 行，空串与 5 万字均正常");
    drop(conn);
    let _ = std::fs::remove_dir_all(&dir);
}

// ==================== 5. 畸形查询 ====================

#[test]
fn malformed_queries_never_panic_or_hang() {
    let (mut conn, dir) = temp_db("bad-query");
    seed(&mut conn, 2_000);

    let nasty: Vec<String> = vec![
        "\"".into(),
        "\"unbalanced".into(),
        "' OR 1=1--".into(),
        "'; DROP TABLE items; --".into(),
        "NEAR(".into(),
        "NEAR(a b, 5)".into(),
        "*".into(),
        "***".into(),
        "-".into(),
        "a AND".into(),
        "AND OR NOT".into(),
        "%".into(),
        "_".into(),
        "%%%".into(),
        "\\".into(),
        "^".into(),
        "CVE-*".into(),
        "title:".into(),
        " ".into(),
        "\t\n\r".into(),
        "🙂🔒".into(),
        "零宽\u{200b}字符".into(),
        "a".repeat(10_000),
        format!("\"{}\"", "x".repeat(5_000)),
        "((((((((((".into(),
        ")))".into(),
        "0x00".into(),
        "SELECT * FROM items".into(),
    ];

    let mut worst = 0u128;
    for q in &nasty {
        let t0 = Instant::now();
        let r = repo::search_items(&conn, &filter(q));
        let dt = t0.elapsed().as_millis();
        worst = worst.max(dt);
        match r {
            Ok(res) => {
                assert!(res.total >= 0);
                assert!(res.items.len() <= 100);
            }
            Err(e) => panic!("查询 {:?} 返回错误：{}", &q[..q.len().min(30)], e),
        }
    }

    // 注入尝试不得改变数据
    let total: i64 = conn.query_row("SELECT COUNT(*) FROM items", [], |r| r.get(0)).unwrap();
    assert_eq!(total, 2_000, "畸形查询破坏了数据");

    println!("畸形查询：{} 种全部返回正常，最慢 {} ms，数据未被破坏", nasty.len(), worst);
    drop(conn);
    let _ = std::fs::remove_dir_all(&dir);
}

// ==================== 6. 超大输入 ====================

#[test]
fn oversized_fields_are_stored_and_searchable() {
    let (conn, dir) = temp_db("huge");
    let mut big = item(1);
    big.title = format!("ZZMARKERZZ {}", "超长标题".repeat(20_000));
    big.summary = Some("正文".repeat(200_000)); // ~400KB UTF-8
    big.products = (0..500).map(|i| format!("product-{}", i)).collect();

    repo::upsert_item(&conn, &big, "nvd", "2026-11-11T00:00:00Z").expect("写入超大条目失败");

    let r = repo::search_items(&conn, &filter("ZZMARKERZZ")).expect("检索超大条目失败");
    assert_eq!(r.total, 1, "超大条目应能被搜到");
    let id = r.items[0].id;
    let got = repo::get_item(&conn, id).unwrap().unwrap();
    assert_eq!(got.products.len(), 500, "产品列表被截断");
    assert!(got.summary.as_ref().unwrap().len() > 700_000, "摘要被截断");

    // 时间与体积
    let t0 = Instant::now();
    for _ in 0..20 {
        repo::search_items(&conn, &filter("超长标题")).unwrap();
    }
    println!(
        "超大输入：400KB 摘要 / 500 个产品入库并可检索，20 次查询 {:?}",
        t0.elapsed()
    );
    drop(conn);
    let _ = std::fs::remove_dir_all(&dir);
}

// ==================== 7. 空库 ====================

#[test]
fn empty_database_operations_are_safe() {
    let (conn, dir) = temp_db("empty");

    assert_eq!(repo::search_items(&conn, &filter("")).unwrap().total, 0);
    assert_eq!(repo::favorite_count(&conn).unwrap(), 0);
    assert!(repo::favorite_ids(&conn).unwrap().is_empty());
    assert!(repo::get_item(&conn, 1).unwrap().is_none());
    assert!(progress::list(&conn).unwrap().is_empty());
    assert!(wrong::list_wrong(&conn, true).unwrap().is_empty());
    let (a, b) = wrong::wrong_count(&conn).unwrap();
    assert_eq!((a, b), (0, 0));

    let st = repo::stats(&conn, &dir.join("test.db")).unwrap();
    assert_eq!(st.total, 0);
    assert_eq!(st.kev_count, 0);
    assert!(st.db_bytes > 0, "文件大小应大于 0");
    assert!(st.by_source.iter().all(|s| s.count == 0));

    // 收藏筛选在空库上不能报错
    let mut f = filter("");
    f.favorite_only = true;
    assert_eq!(repo::search_items(&conn, &f).unwrap().total, 0);

    println!("空库：检索/收藏/进度/错题/统计全部返回空值，无除零与空指针");
    drop(conn);
    let _ = std::fs::remove_dir_all(&dir);
}

// ==================== 8. 读写并发 ====================

#[test]
fn readers_never_fail_while_writer_is_busy() {
    let (mut conn, dir) = temp_db("rw");
    seed(&mut conn, 2_000);
    drop(conn);
    let db_path = dir.join("test.db");

    let stop = Arc::new(AtomicUsize::new(0));
    let errs = Arc::new(AtomicUsize::new(0));
    let reads = Arc::new(AtomicUsize::new(0));

    // 6 个读线程持续检索
    let mut readers = Vec::new();
    for t in 0..6 {
        let path = db_path.clone();
        let stop = stop.clone();
        let errs = errs.clone();
        let reads = reads.clone();
        readers.push(std::thread::spawn(move || {
            let c = schema::open(&path).expect("读线程开库失败");
            let qs = ["nginx", "CVE-2026-000", "synthetic", "", "CWE-25"];
            while stop.load(Ordering::Relaxed) == 0 {
                let q = qs[(reads.load(Ordering::Relaxed) + t) % qs.len()];
                if let Err(e) = repo::search_items(&c, &filter(q)) {
                    errs.fetch_add(1, Ordering::Relaxed);
                    eprintln!("读线程 {} 失败：{}", t, e);
                }
                reads.fetch_add(1, Ordering::Relaxed);
            }
        }));
    }

    // 主线程分 10 批写入 1000 条
    let mut write_err = 0;
    for batch in 0..10 {
        let c = schema::open(&db_path).expect("写线程开库失败");
        let tx = schema::write_tx(&c).expect("开写事务失败");
        for i in 0..100 {
            if repo::upsert_item(&tx, &item(10_000 + batch * 100 + i), "nvd", "2026-11-11T00:00:00Z")
                .is_err()
            {
                write_err += 1;
            }
        }
        if tx.commit().is_err() {
            write_err += 1;
        }
        c.close().ok();
    }

    stop.store(1, Ordering::Relaxed);
    for h in readers {
        h.join().expect("读线程 panic");
    }

    let c = schema::open(&db_path).unwrap();
    let total: i64 = c.query_row("SELECT COUNT(*) FROM items", [], |r| r.get(0)).unwrap();
    let check: String = c.query_row("PRAGMA integrity_check", [], |r| r.get(0)).unwrap();
    c.execute("INSERT INTO items_fts(items_fts) VALUES('integrity-check')", [])
        .expect("并发读写后 FTS 损坏");

    println!(
        "读写并发：{} 次读、写失败 {} 次、最终 {} 条、integrity={}",
        reads.load(Ordering::Relaxed),
        write_err,
        total,
        check
    );
    assert_eq!(errs.load(Ordering::Relaxed), 0, "并发读出现失败");
    assert_eq!(write_err, 0, "并发写出现失败");
    assert_eq!(total, 3_000, "并发写入丢失数据");
    assert_eq!(check, "ok");

    drop(c);
    let _ = std::fs::remove_dir_all(&dir);
}

// ==================== 9. 学习进度与错题反复写 ====================

#[test]
fn progress_and_wrong_are_idempotent() {
    let (conn, dir) = temp_db("learn");

    for i in 0..300 {
        let status = ["reading", "mastered", "unread"][i % 3];
        progress::set_status(&conn, "cwe-89", status).unwrap();
        progress::set_quiz(&conn, "cwe-89", 3, (i % 4) as i64).unwrap();
    }
    let list = progress::list(&conn).unwrap();
    assert_eq!(list.len(), 1, "同一张卡只应有一条进度，实际 {}", list.len());
    assert_eq!(list[0].lesson_id, "cwe-89");

    for i in 0..200 {
        wrong::record_wrong(
            &conn,
            "cwe-89",
            (i % 3) as i64,
            "下面哪种写法能根治注入？",
            (i % 4) as i64,
            0,
            Some("参数化查询"),
        )
        .unwrap();
    }
    let (pending, total) = wrong::wrong_count(&conn).unwrap();
    assert!(total > 0 && total <= 3, "错题应按题去重，实际 {} 条", total);
    assert!(pending <= total);

    println!("学习进度与错题：300 次状态写 / 200 次错题记只产生 {} 条错题", total);
    drop(conn);
    let _ = std::fs::remove_dir_all(&dir);
}

// ==================== 9.5 间隔重复复习队列 ====================

#[test]
fn review_queue_schedules_and_resurfaces() {
    let (conn, dir) = temp_db("review");

    // 新错题没有排期，应当立刻到期
    for i in 0..3 {
        wrong::record_wrong(
            &conn,
            "cwe-89",
            i,
            "下面哪种写法能根治注入？",
            i,
            0,
            Some("参数化查询"),
        )
        .unwrap();
    }
    assert_eq!(review::due_count(&conn).unwrap(), 3, "新错题应当立即出现在复习队列");

    let q = review::due_queue(&conn, 80).unwrap();
    assert_eq!(q.len(), 3);
    assert!(q.iter().all(|x| x.overdue_days == 0));

    // 记住了 → 排到 1 天后，今天的队列里就没了
    let st = review::grade(&conn, q[0].id, 2).unwrap();
    assert_eq!(st.interval_days, 1);
    assert!(st.due_in_minutes >= 1440);
    assert_eq!(review::due_count(&conn).unwrap(), 2);

    // 忘记 → 10 分钟后重问，reviewed 回到 0，继续留在错题列表里
    review::grade(&conn, q[1].id, 0).unwrap();
    assert_eq!(review::due_count(&conn).unwrap(), 1);
    let reviewed: i64 = conn
        .query_row("SELECT reviewed FROM wrong_answers WHERE id = ?1", [q[1].id], |r| r.get(0))
        .unwrap();
    assert_eq!(reviewed, 0, "「忘记」不该把题标成已复习");

    // 把第 1 题的下次到期时间拨回两天前，模拟隔两天再开 App
    let past = (chrono::Utc::now() - chrono::Duration::days(2)).to_rfc3339();
    conn.execute("UPDATE wrong_answers SET due_at = ?1 WHERE id = ?2", rusqlite::params![past, q[0].id])
        .unwrap();
    let q2 = review::due_queue(&conn, 80).unwrap();
    assert_eq!(q2.len(), 2, "到期的题应当重新出现");
    let again = q2.iter().find(|x| x.id == q[0].id).expect("应包含重新到期的题");
    assert_eq!(again.overdue_days, 2, "逾期天数算错：{}", again.overdue_days);

    // 「我懂了」按钮走同一条排期逻辑，不存在的题不报错
    review::mark_mastered(&conn, "cwe-89", 2).unwrap();
    review::mark_mastered(&conn, "no-such-card", 9).unwrap();

    println!(
        "复习队列：3 题 → 记住 1 题后剩 {} 题 → 隔两天重新出现 {} 题",
        1, q2.len()
    );
    drop(conn);
    let _ = std::fs::remove_dir_all(&dir);
}

// ==================== 10. 删除后重建索引 ====================

#[test]
fn deleting_everything_keeps_index_clean() {
    let (mut conn, dir) = temp_db("purge");
    seed(&mut conn, 500);
    conn.execute("DELETE FROM items", []).unwrap();

    assert_eq!(repo::search_items(&conn, &filter("nginx")).unwrap().total, 0);
    let fts: i64 = conn.query_row("SELECT COUNT(*) FROM items_fts", [], |r| r.get(0)).unwrap();
    assert_eq!(fts, 0, "清空主表后 FTS 仍有 {} 行", fts);
    conn.execute("INSERT INTO items_fts(items_fts) VALUES('integrity-check')", [])
        .expect("清空后 FTS 损坏");

    // 清空后还能继续用
    seed(&mut conn, 10);
    assert_eq!(repo::search_items(&conn, &filter("nginx")).unwrap().total > 0, true);

    println!("清空：主表与 FTS 同步归零，之后可继续写入");
    drop(conn);
    let _ = std::fs::remove_dir_all(&dir);
}

// ==================== 12. 排序稳定性 ====================

#[test]
fn ordering_is_stable_across_identical_queries() {
    let (mut conn, dir) = temp_db("order");
    // 故意造大量排序键完全相同的行（同日期、同 CVSS、同 KEV 状态）
    let tx = conn.transaction().unwrap();
    for i in 0..400 {
        let mut it = item(i);
        it.cvss_score = Some(7.0);
        it.cvss_severity = Some(Severity::High);
        it.published_at = Some("2026-05-05T00:00:00Z".to_string());
        repo::upsert_item(&tx, &it, "nvd", "2026-11-11T00:00:00Z").unwrap();
    }
    tx.commit().unwrap();

    let snapshot = |offset: i64| -> Vec<i64> {
        let mut f = filter("");
        f.limit = Some(50);
        f.offset = Some(offset);
        repo::search_items(&conn, &f).unwrap().items.iter().map(|i| i.id).collect()
    };

    // 同一页连续查 5 次，顺序必须完全一致（否则虚拟列表会跳行）
    let base = snapshot(0);
    for _ in 0..5 {
        assert_eq!(base, snapshot(0), "重复查询同一页顺序发生变化");
    }
    // 相邻两页不能重叠
    let p2 = snapshot(50);
    assert!(
        base.iter().all(|id| !p2.contains(id)),
        "相邻分页出现重叠行，排序缺少稳定的次序键"
    );

    println!("排序稳定性：同键 400 行，连续 5 次查询顺序一致，分页无重叠");
    drop(conn);
    let _ = std::fs::remove_dir_all(&dir);
}


// ==================== 13. 频繁开关库（模拟反复点采集/刷新） ====================

#[test]
fn repeated_open_close_is_stable() {
    let (_c, dir) = temp_db("churn");
    let path = dir.join("test.db");
    let t0 = Instant::now();
    for _ in 0..60 {
        let c = schema::open(&path).expect("反复开库失败");
        repo::search_items(&c, &filter("nginx")).expect("开库后检索失败");
        c.close().ok();
    }
    println!("反复开库：60 次 open+query+close，耗时 {:?}", t0.elapsed());
    let _ = std::fs::remove_dir_all(&dir);
}
