//! 全局状态：只存路径，连接按需打开。
//! 不持有 Mutex<Connection>：避免 Guard 跨 await 导致 Future 不满足 Send。
//! SQLite 在 WAL 模式下支持多连接并发读，单用户场景足够。
use crate::error::AppResult;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};

pub struct AppState {
    pub db_path: PathBuf,
    pub data_dir: PathBuf,
    /// 采集互斥标志：双击「采集」或两个入口同时触发时，只允许一个任务跑，
    /// 否则会重复请求一次公网、进度事件互相覆盖、结束回调发两遍。
    pub collecting: AtomicBool,
}

impl AppState {
    pub fn new(db_path: PathBuf, data_dir: PathBuf) -> Self {
        Self { db_path, data_dir, collecting: AtomicBool::new(false) }
    }

    /// 占用采集锁；已在采集时返回 None。
    /// 返回的 guard 在离开作用域（含 ? 提前返回）时自动释放，不会把锁漏掉。
    pub fn begin_collect(&self) -> Option<CollectGuard<'_>> {
        if self.collecting.swap(true, Ordering::SeqCst) {
            None
        } else {
            Some(CollectGuard(self))
        }
    }
}

/// 采集锁的 RAII 句柄
pub struct CollectGuard<'a>(&'a AppState);

impl Drop for CollectGuard<'_> {
    fn drop(&mut self) {
        self.0.collecting.store(false, Ordering::SeqCst);
    }
}

impl AppState {
    /// 打开一个新连接（调用方负责在作用域结束时释放）
    pub fn open(&self) -> AppResult<rusqlite::Connection> {
        crate::db::schema::open(&self.db_path)
    }
}

#[cfg(test)]
mod tests {
    use super::AppState;
    use std::path::PathBuf;

    fn st() -> AppState {
        AppState::new(PathBuf::from("t.db"), PathBuf::from("t"))
    }

    #[test]
    fn collect_lock_is_exclusive_and_released_on_drop() {
        let s = st();
        let g1 = s.begin_collect();
        assert!(g1.is_some(), "第一次应拿到锁");
        assert!(s.begin_collect().is_none(), "并发第二次必须被拒");
        drop(g1);
        assert!(s.begin_collect().is_some(), "释放后应可再次获取");
    }
}
