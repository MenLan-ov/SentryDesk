//! 数据层：schema 建表 + repo 查询 + 学习进度 + 错题本
//!
//! 模块边界：
//! - schema  建库、迁移、write_tx（写事务统一入口）
//! - repo    情报条目的读写与检索
//! - progress 教学卡学习进度
//! - wrong    错题本
//! - review   间隔重复复习（错题本的时间维度）
//!
//! 不使用 `pub use` 做扁平重导出：调用方一律写 `db::repo::xxx`，
//! 保持「谁定义、谁负责」的可追溯性，避免同名函数在不同层被混淆。
pub mod progress;
pub mod repo;
pub mod review;
pub mod schema;
pub mod wrong;

#[cfg(test)]
mod qa;
#[cfg(test)]
mod stress;
