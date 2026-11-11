//! 建表 DDL 与迁移（PRAGMA user_version 记录版本）
use crate::error::AppResult;
use rusqlite::{Connection, Transaction, TransactionBehavior};

pub const SCHEMA_VERSION: i64 = 6;

const DDL_V1: &str = r#"
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS sources (
    id                INTEGER PRIMARY KEY,
    key               TEXT NOT NULL UNIQUE,
    name              TEXT NOT NULL,
    base_url          TEXT NOT NULL,
    kind              TEXT NOT NULL,
    robots_allowed    INTEGER NOT NULL DEFAULT 0,
    robots_state      TEXT,
    robots_checked_at TEXT,
    min_interval_ms   INTEGER NOT NULL DEFAULT 1000,
    enabled           INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS items (
    id            INTEGER PRIMARY KEY,
    source_key    TEXT NOT NULL,
    external_id   TEXT,
    cve_id        TEXT,
    title         TEXT NOT NULL,
    summary       TEXT,
    cvss_score    REAL,
    cvss_severity TEXT,
    products      TEXT,
    published_at  TEXT,
    source_url    TEXT NOT NULL,
    collected_at  TEXT NOT NULL,
    lang          TEXT NOT NULL DEFAULT 'en',
    in_kev        INTEGER NOT NULL DEFAULT 0,
    cwe           TEXT,
    action        TEXT,
    content_hash  TEXT NOT NULL,
    UNIQUE(content_hash)
);

CREATE INDEX IF NOT EXISTS idx_items_cve    ON items(cve_id);
CREATE INDEX IF NOT EXISTS idx_items_pub    ON items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_cvss   ON items(cvss_score DESC);
CREATE INDEX IF NOT EXISTS idx_items_source ON items(source_key);
CREATE INDEX IF NOT EXISTS idx_items_kev    ON items(in_kev);
CREATE INDEX IF NOT EXISTS idx_items_cwe    ON items(cwe);

CREATE TABLE IF NOT EXISTS tags (
    id   INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS item_tags (
    item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    tag_id  INTEGER NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
    PRIMARY KEY (item_id, tag_id)
);

CREATE TABLE IF NOT EXISTS notes (
    id         INTEGER PRIMARY KEY,
    item_id    INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    body       TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notes_item ON notes(item_id);

CREATE TABLE IF NOT EXISTS collect_log (
    id          INTEGER PRIMARY KEY,
    source_key  TEXT NOT NULL,
    url         TEXT NOT NULL,
    http_status INTEGER,
    elapsed_ms  INTEGER,
    ok          INTEGER NOT NULL,
    reason      TEXT,
    started_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_log_source ON collect_log(source_key, started_at DESC);

CREATE VIRTUAL TABLE IF NOT EXISTS items_fts USING fts5(
    title,
    summary,
    products,
    cve_id,
    content='items',
    content_rowid='id',
    tokenize='trigram'
);

CREATE TRIGGER IF NOT EXISTS items_ai AFTER INSERT ON items BEGIN
    INSERT INTO items_fts(rowid, title, summary, products, cve_id)
    VALUES (new.id, new.title, new.summary, new.products, new.cve_id);
END;

CREATE TRIGGER IF NOT EXISTS items_ad AFTER DELETE ON items BEGIN
    INSERT INTO items_fts(items_fts, rowid, title, summary, products, cve_id)
    VALUES ('delete', old.id, old.title, old.summary, old.products, old.cve_id);
END;

CREATE TRIGGER IF NOT EXISTS items_au AFTER UPDATE ON items BEGIN
    INSERT INTO items_fts(items_fts, rowid, title, summary, products, cve_id)
    VALUES ('delete', old.id, old.title, old.summary, old.products, old.cve_id);
    INSERT INTO items_fts(rowid, title, summary, products, cve_id)
    VALUES (new.id, new.title, new.summary, new.products, new.cve_id);
END;
"#;

/// v1 → v2：为 items 补 cwe / action 列（教学关联所需）
const MIGRATE_V2: &str = r#"
ALTER TABLE items ADD COLUMN cwe TEXT;
ALTER TABLE items ADD COLUMN action TEXT;
CREATE INDEX IF NOT EXISTS idx_items_cwe ON items(cwe);
"#;

/// v2 → v3：学习进度表（教学卡状态、自测成绩、学习笔记）
const MIGRATE_V3: &str = r#"
CREATE TABLE IF NOT EXISTS lesson_progress (
    lesson_id     TEXT PRIMARY KEY,
    status        TEXT NOT NULL DEFAULT 'unread',
    quiz_score    INTEGER,
    quiz_total    INTEGER NOT NULL DEFAULT 0,
    quiz_correct  INTEGER NOT NULL DEFAULT 0,
    note          TEXT,
    started_at    TEXT,
    updated_at    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_lp_status ON lesson_progress(status);
CREATE TABLE IF NOT EXISTS learn_log (
    id         INTEGER PRIMARY KEY,
    lesson_id  TEXT NOT NULL,
    action     TEXT NOT NULL,
    created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ll_lesson ON learn_log(lesson_id, created_at DESC);
"#;

/// v3 → v4：错题本（答错的题自动进复习队列）
const MIGRATE_V4: &str = r#"
CREATE TABLE IF NOT EXISTS wrong_answers (
    id          INTEGER PRIMARY KEY,
    lesson_id   TEXT NOT NULL,
    quiz_index  INTEGER NOT NULL,
    question    TEXT NOT NULL,
    chosen      INTEGER NOT NULL,
    correct     INTEGER NOT NULL,
    explain     TEXT,
    wrong_times INTEGER NOT NULL DEFAULT 1,
    reviewed    INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL,
    UNIQUE(lesson_id, quiz_index)
);
CREATE INDEX IF NOT EXISTS idx_wa_reviewed ON wrong_answers(reviewed, updated_at DESC);
"#;

/// v4 → v5：收藏（稍后读）
const MIGRATE_V5: &str = r#"
CREATE TABLE IF NOT EXISTS favorites (
    item_id    INTEGER PRIMARY KEY REFERENCES items(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL
);
"#;

/// v5 → v6：间隔重复（错题本升级成复习队列）
///
/// 老库里已有的错题没有排期，`due_at` 留 NULL 表示「今天就该复习」，
/// 首次打开时会一次性出现在队列里——这正是想要的效果，不需要按时间回填。
const MIGRATE_V6: &str = r#"
ALTER TABLE wrong_answers ADD COLUMN due_at TEXT;
ALTER TABLE wrong_answers ADD COLUMN interval_days INTEGER NOT NULL DEFAULT 0;
ALTER TABLE wrong_answers ADD COLUMN ease REAL NOT NULL DEFAULT 2.5;
ALTER TABLE wrong_answers ADD COLUMN reps INTEGER NOT NULL DEFAULT 0;
ALTER TABLE wrong_answers ADD COLUMN lapses INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_wa_due ON wrong_answers(due_at);
"#;

/// 判断某列是否存在
fn has_column(conn: &Connection, table: &str, column: &str) -> AppResult<bool> {
    let mut st = conn.prepare(&format!("PRAGMA table_info({})", table))?;
    let names = st
        .query_map([], |r| r.get::<_, String>(1))?
        .collect::<rusqlite::Result<Vec<_>>>()?;
    Ok(names.iter().any(|n| n == column))
}

/// 初始化：建库、建表、迁移、播种白名单
pub fn init(conn: &Connection) -> AppResult<()> {
    let ver: i64 = conn.query_row("PRAGMA user_version", [], |r| r.get(0))?;

    if ver < 1 {
        conn.execute_batch(DDL_V1)?;
    }

    // v1 → v2 增量迁移：老库补列，新库跳过（DDL 已含）
    if (1..2).contains(&ver) && !has_column(conn, "items", "cwe")? {
        // ALTER 失败不致命：可能是列已存在
        let _ = conn.execute_batch(MIGRATE_V2);
    }

    // v2 → v3：学习进度表
    if ver < 3 {
        conn.execute_batch(MIGRATE_V3)?;
    }

    // v3 → v4：错题本
    if ver < 4 {
        conn.execute_batch(MIGRATE_V4)?;
    }

    // v4 → v5：收藏夹
    if ver < 5 {
        conn.execute_batch(MIGRATE_V5)?;
    }

    // v5 → v6：间隔重复。按列判断而不是只看版本号——迁移中途被打断时
    // user_version 可能还没写，重跑 ALTER 会报 duplicate column name。
    if ver < 6 && !has_column(conn, "wrong_answers", "due_at")? {
        conn.execute_batch(MIGRATE_V6)?;
    }

    if ver < SCHEMA_VERSION {
        conn.execute_batch(&format!("PRAGMA user_version = {};", SCHEMA_VERSION))?;
    }

    crate::db::repo::seed_sources(conn)?;
    Ok(())
}

/// 打开数据库连接并初始化
pub fn open(path: &std::path::Path) -> AppResult<Connection> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    match open_once(path) {
        Ok(conn) => Ok(conn),
        // 损坏库自恢复：先把坏文件改名隔离（不删，留给用户/我们取回），再建空库。
        // 没有这一步时，setup 会返回 Err → Tauri panic → 进程 0xC0000409 静默退出，
        // 用户看到的就是「双击没反应」。宁可空库启动，也不能打不开。
        Err(e) if is_corrupt(&e) => {
            match quarantine(path) {
                Ok(dst) => crate::log_line(&format!(
                    "[recover] 数据库损坏（{}），已隔离为 {}，本次以空库启动",
                    e,
                    dst.display()
                )),
                Err(err) => crate::log_line(&format!(
                    "[recover] 数据库损坏（{}）且隔离失败：{}",
                    e, err
                )),
            }
            open_once(path)
        }
        Err(e) => Err(e),
    }
}

/// 单次打开 + 初始化；失败原样返回，由 `open` 决定是否走恢复流程。
fn open_once(path: &std::path::Path) -> AppResult<Connection> {
    let conn = Connection::open(path)?;
    // temp_store = MEMORY：把排序/索引的临时表放进内存，不落磁盘临时文件。
    // 实测代价：本项目的排序集上限 500 行，内存开销可忽略；
    // 收益：不再依赖系统 TEMP 目录，避免 USERPROFILE/TEMP 缺失或被策略禁用时
    // 出现 SQLITE_CANTOPEN（批量写入约 600 行时触发，很难排查）。
    conn.execute_batch(
        "PRAGMA journal_mode = WAL;
         PRAGMA foreign_keys = ON;
         PRAGMA busy_timeout = 5000;
         PRAGMA temp_store = MEMORY;
         PRAGMA synchronous = NORMAL;",
    )?;
    init(&conn)?;
    Ok(conn)
}

/// 判断是否为「文件不是数据库 / 数据损坏」这类可恢复错误。
/// 只认这两类：其它错误（磁盘满、权限不足）改名也没用，不能吞。
fn is_corrupt(e: &crate::error::AppError) -> bool {
    use rusqlite::ErrorCode::*;
    match e {
        crate::error::AppError::Db(rusqlite::Error::SqliteFailure(err, _)) => {
            matches!(err.code, NotADatabase | DatabaseCorrupt)
        }
        _ => false,
    }
}

/// 把损坏的库连同 -wal/-shm 一起改名，返回隔离后的路径。
fn quarantine(db: &std::path::Path) -> std::io::Result<std::path::PathBuf> {
    let stamp = chrono::Local::now().format("%Y%m%d-%H%M%S");
    let name = db
        .file_name()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "sentrydesk.db".to_string());
    let dst = db.with_file_name(format!("{}.corrupt-{}", name, stamp));
    std::fs::rename(db, &dst)?;
    for ext in ["-wal", "-shm"] {
        let side = db.with_file_name(format!("{}{}", name, ext));
        if side.exists() {
            let _ = std::fs::rename(
                &side,
                db.with_file_name(format!("{}.corrupt-{}{}", name, stamp, ext)),
            );
        }
    }
    Ok(dst)
}

/// 开一个写事务。
///
/// 为什么不用 `conn.transaction()`：它发出的是 `BEGIN`（DEFERRED），
/// 事务一开始只是读事务，直到第一次写才尝试升级为写事务。
/// 在 WAL 下若此时别的连接持写锁，SQLite 会**立即**返回 SQLITE_BUSY，
/// `busy_timeout` 对锁升级不生效——并发写入会直接报 "database is locked"。
/// 用 `BEGIN IMMEDIATE` 开头就取写锁，busy_timeout 才真正起作用。
///
/// 本项目所有写入都是「成批插入 + 更新标记」的组合，
/// 没有「先长读再写」的需求，因此立即取写锁没有副作用。
pub fn write_tx(conn: &Connection) -> AppResult<Transaction<'_>> {
    // new_unchecked 自身就会发 BEGIN IMMEDIATE（只是不做 &mut 借用检查），
    // 再手动 execute_batch("BEGIN IMMEDIATE") 会变成「事务里再开事务」直接报错。
    Ok(Transaction::new_unchecked(conn, TransactionBehavior::Immediate)?)
}

#[cfg(test)]
mod tests {
    use super::*;

    /// 测试用临时目录：放在 target/ 下（沙箱禁止测试进程写系统 TEMP）
    fn tmpdir(tag: &str) -> std::path::PathBuf {
        let p = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("target")
            .join("test-tmp")
            .join(format!(
                "sd_schema_{}_{}_{}",
                tag,
                std::process::id(),
                chrono::Local::now().format("%H%M%S%3f")
            ));
        std::fs::create_dir_all(&p).unwrap();
        p
    }

    /// 损坏的 db 文件：open() 应当隔离坏文件并以空库继续，而不是返回错误。
    #[test]
    fn corrupt_db_is_quarantined_and_rebuilt() {
        let dir = tmpdir("corrupt");
        let db = dir.join("sentrydesk.db");
        std::fs::write(&db, b"NOT A DATABASE".repeat(200)).unwrap();

        let conn = open(&db).expect("损坏库应被隔离后重建，而不是报错");
        let ver: i64 = conn
            .query_row("PRAGMA user_version", [], |r| r.get(0))
            .unwrap();
        assert_eq!(ver, SCHEMA_VERSION, "重建后的库应是最新版本");
        let tables: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM sqlite_master WHERE type='table'",
                [],
                |r| r.get(0),
            )
            .unwrap();
        assert!(tables >= 14, "重建后的库应建齐表，实际 {tables}");
        drop(conn);

        let quarantined: Vec<_> = std::fs::read_dir(&dir)
            .unwrap()
            .filter_map(|e| e.ok())
            .map(|e| e.file_name().to_string_lossy().to_string())
            .filter(|n| n.contains(".corrupt-"))
            .collect();
        assert_eq!(quarantined.len(), 1, "坏文件应被改名隔离：{quarantined:?}");
        let content = std::fs::read(dir.join(&quarantined[0])).unwrap();
        assert!(content.starts_with(b"NOT A DATABASE"), "隔离文件内容应保持原样");

        std::fs::remove_dir_all(&dir).ok();
    }

    /// 正常库重复 open 不应触发隔离（回归保护：别把正常启动也当成损坏）。
    #[test]
    fn healthy_db_opens_twice_without_quarantine() {
        let dir = tmpdir("healthy");
        let db = dir.join("sentrydesk.db");
        {
            let c = open(&db).unwrap();
            c.execute(
                "INSERT INTO sources(key,name,base_url,kind) VALUES('t','T','https://e.x','rss')",
                [],
            )
            .unwrap();
        }
        let c2 = open(&db).unwrap();
        let n: i64 = c2
            .query_row("SELECT COUNT(*) FROM sources WHERE key='t'", [], |r| r.get(0))
            .unwrap();
        assert_eq!(n, 1, "二次打开应保留数据");
        drop(c2);
        let bad: Vec<_> = std::fs::read_dir(&dir)
            .unwrap()
            .filter_map(|e| e.ok())
            .map(|e| e.file_name().to_string_lossy().to_string())
            .filter(|n| n.contains(".corrupt-"))
            .collect();
        assert!(bad.is_empty(), "正常库不应产生隔离文件：{bad:?}");
        std::fs::remove_dir_all(&dir).ok();
    }
}
