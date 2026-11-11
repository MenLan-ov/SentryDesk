//! Tauri command 层：前端通过 invoke 调用
//!
//! 分层约定：
//! - `cmd/*` 只做「参数解包 → 调用 db/knowledge/collect → 序列化返回」，
//!   不写业务逻辑，也不直接持有长生命周期状态（AppState 只存路径）。
//! - 每个命令返回 `AppResult<T>`，错误统一走 `error::AppError`，
//!   前端由 `errMsg()` 转成可读文案。
//!
//! 不使用 `pub use` 扁平重导出：lib.rs 里一律写 `cmd::query::search_items` 这样的全路径，
//! 这样从注册表就能看出每个命令属于哪个领域，避免同名命令在不同模块间混淆。
pub mod collect;
pub mod dashboard;
pub mod export;
pub mod knowledge;
pub mod learn;
pub mod query;
pub mod settings;
pub mod window;
