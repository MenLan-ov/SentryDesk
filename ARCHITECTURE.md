# SentryDesk 架构说明

> 版本 v0.6.0 ｜ 最后更新 2026-11-11
> 本文档描述**代码结构**与**分层约定**，不描述功能清单（功能见 README）。

---

## 1. 分层与依赖方向

```
Vue 组件层  src/components/*.vue
  只负责渲染与事件，不直接调 invoke
        │
        ▼
状态层  src/store.ts
  应用状态的唯一出口；组件不直接依赖 stores/*
        │
   ┌────┴────┬─────────┬──────────┐
   ▼         ▼         ▼          ▼
stores/    stores/   stores/    stores/
theme.ts   i18n.ts   guard.ts   format.ts
（状态）   （词表）  （竞态）   （纯函数）
        │
        ▼  invoke
IPC 层  src/api.ts      ← 唯一调用 Tauri invoke 的地方
        │
        ▼
Rust command 层  src-tauri/src/cmd/*
  只做参数解包 → 调下层 → 序列化返回
        │
   ┌────┴─────┬──────────┬──────────┐
   ▼          ▼          ▼          ▼
 db/*     collect/*   parse/*   knowledge
SQLite   合规采集     解析      内置教学库
```

**硬性约定**

1. 组件不直接 `invoke`，只调 `store.ts` 导出的函数。
2. `store.ts` 不直接拼 SQL，只调 `api.ts`。
3. `cmd/*` 不写业务逻辑，业务在 `db/` `collect/` `parse/` `knowledge`。
4. `stores/*` 之间单向依赖：`theme` ← `i18n` / `format`；`guard` 无依赖。
5. Rust 侧不使用 `pub use` 扁平重导出，调用方写全路径（`db::repo::xxx`）。

---

## 2. Rust 目录

| 路径 | 行数 | 职责 |
|---|---|---|
| `src/lib.rs` | 150 | 装配：单实例、panic 兜底、命令注册（按领域分组） |
| `src/main.rs` | 7 | GUI 入口，release 下无控制台 |
| `src/state.rs` | 18 | 只存路径，连接按需打开（规避 MutexGuard 跨 await） |
| `src/error.rs` | 60 | `AppError` 统一错误类型 |
| `src/models.rs` | 487 | 全部数据结构（含双语字段） |
| `src/knowledge.rs` | 273 | 内置教学库加载与检索，OnceLock 缓存 |
| `src/db/schema.rs` | 239 | 建表、迁移、`write_tx`（写事务统一入口） |
| `src/db/repo.rs` | 474 | 情报条目读写与检索 |
| `src/db/progress.rs` | 135 | 教学进度、自测成绩、总览 |
| `src/db/wrong.rs` | 91 | 错题本 |
| `src/db/stress.rs` | 303 | 压力测试（`#[cfg(test)]`，不进产物） |
| `src/collect/mod.rs` | 192 | 采集编排：限速 → 取 → 解析 → 批量入库 |
| `src/collect/sources.rs` | 99 | 5 个公开源定义、UA、限速下限 |
| `src/collect/robots.rs` | 122 | robots.txt 解析（RFC 9309） |
| `src/collect/limiter.rs` | 61 | 按域名限速 |
| `src/collect/fetcher.rs` | 85 | HTTP 取数，超时/重试/体积上限 |
| `src/parse/{nvd,ghsa,kev,rss}.rs` | 561 | 四类解析器 |
| `src/cmd/*` | 8 个文件 | 41 个 Tauri 命令 |

**命令按领域分组注册**（`lib.rs`）

```
collect    check_robots / get_robots / list_sources / start_collect / collect_logs
dashboard  dashboard
export     preview_memo / export_memo
knowledge  search_lessons / get_lesson / get_lesson_by_cwe / lesson_stats / count_items_by_cwe
learn      related_lessons / glossary_all / learning_paths / get_progress / set_progress /
           save_quiz_result / list_wrong_answers / mark_wrong_reviewed / wrong_answer_count /
           save_lesson_note / learn_overview / export_learn_report
query      search_items / get_item_detail / get_stats / save_note
settings   get_theme / set_theme / export_theme / import_theme / compliance_info /
           backup_database / restore_database / open_data_dir / export_items_json
window     window_state / save_window_state / quit_app
```

---

## 3. 前端目录

| 路径 | 行数 | 职责 |
|---|---|---|
| `src/main.ts` | 6 | 挂载 |
| `src/App.vue` | 110 | 视图路由 + 错误边界包裹 |
| `src/store.ts` | 363 | 应用状态唯一出口 |
| `src/stores/theme.ts` | 66 | 主题与语言状态、写回本地 |
| `src/stores/i18n.ts` | 92 | 分类/标签英译表（纯数据） |
| `src/stores/guard.ts` | 35 | 请求竞态守卫 |
| `src/stores/format.ts` | 47 | 纯格式化函数 |
| `src/api.ts` | 119 | 唯一 invoke 出口 |
| `src/types.ts` | 323 | 与 Rust 对齐的类型定义 |
| `src/locales/*.json` | 81×2 | 界面文案 |
| `src/styles/tokens.css` | 273 | 设计 Token（颜色/间距/圆角/字号） |

**组件（16 个）**

| 组件 | 行数 | 职责 |
|---|---|---|
| `TopBar.vue` | 208 | 品牌、视图切换、搜索框、主题切换、语言 |
| `Sidebar.vue` | 238 | 数据源与筛选 |
| `ResultList.vue` | 336 | 虚拟滚动列表 |
| `DetailPanel.vue` | 279 | 条目详情与笔记 |
| `HomeView.vue` | 373 | 教学磁贴三列布局 + 分类侧栏 |
| `LearnView.vue` | 346 | 教学卡详情 |
| `CodeCompare.vue` | 191 | 易受攻击/修复后代码对比 |
| `QuizPanel.vue` | 238 | 自测 |
| `PathView.vue` | 160 | 学习路径 |
| `DashboardView.vue` | 314 | 数据看板 |
| `WrongView.vue` | 203 | 错题本 |
| `SettingsView.vue` | 444 | 设置（5 个 tab） |
| `GlossaryPopover.vue` | 66 | 术语浮层 |
| `ErrorBoundary.vue` | 59 | 错误边界 |
| `ContextMenu.vue` | 87 | 右键菜单 |
| `StatusBar.vue` | 70 | 底部状态栏 |

---

## 4. 数据层约定

### 4.1 连接管理

`AppState` **只存路径**，不持有 `Mutex<Connection>`。每次命令打开新连接，作用域结束即释放。

理由：`rusqlite` 的 `Connection` 不是 `Sync`，跨 `await` 持有 `MutexGuard` 会让 Future 不满足 `Send`，Tauri 的命令是 `async` 的直接编译不过。

### 4.2 连接参数（`schema::open`）

```
journal_mode  = WAL       崩溃安全 + 读写并发
foreign_keys  = ON        外键级联删除生效
busy_timeout  = 5000      锁等待 5 秒
temp_store    = MEMORY    临时表放内存，不依赖系统 TEMP
synchronous   = NORMAL    WAL 下的推荐值
```

`temp_store = MEMORY` 不是性能优化，是**健壮性修复**：批量写入约 600 行时排序需要临时文件，若 `USERPROFILE` / `TEMP` 不可用，SQLite 返回 `SQLITE_CANTOPEN`（"unable to open database file"），错误信息完全指不到真实原因。

### 4.3 写事务统一入口

**所有写入**必须走 `schema::write_tx()`，不要用 `conn.transaction()`。

`conn.transaction()` 发出的是 `BEGIN`（DEFERRED）：事务开始只是读事务，第一次写时才尝试升级为写事务。WAL 下若此刻别的连接持写锁，SQLite **立即**返回 `SQLITE_BUSY`，`busy_timeout` 对锁升级无效 —— 表现为并发写入直接报 "database is locked"。

`write_tx()` 用 `BEGIN IMMEDIATE` 开头就取写锁，`busy_timeout` 才真正生效。

### 4.4 检索路径

```
query 长度 < 3    → LIKE 子串匹配（trigram 分词器不支持短词）
query 长度 ≥ 3    → FTS5 trigram 短语匹配
query 为空        → 纯筛选
```

排序固定为四键，顺序不可调换：

```sql
ORDER BY i.in_kev DESC,                  -- 已知被利用最高优先
         CASE WHEN i.cvss_score IS NULL THEN 1 ELSE 0 END ASC,
         i.cvss_score DESC,
         COALESCE(i.published_at, i.collected_at) DESC
```

---

## 5. 一致性约束

| 约束 | 落地方式 |
|---|---|
| 每条记录保留来源名/URL/采集时间 | `items.source_key` / `source_url` / `collected_at` 均为 NOT NULL |
| 同一内容不重复入库 | `content_hash` 唯一索引 + `ON CONFLICT DO NOTHING` |
| FTS 与主表一致 | 三个触发器（INSERT/DELETE/UPDATE）维护；测试里跑 `integrity-check` |
| 双语字段缺失不崩 | Rust 侧全部 `#[serde(default)]` + `Option<T>`，前端回退中文 |
| 请求竞态不串数据 | `stores/guard.ts` 序号比对，过期响应直接丢弃 |

---

## 6. 测试

```bash
cd src-tauri && cargo test --lib -- --test-threads=1
```

| 测试 | 验证什么 |
|---|---|
| `bulk_insert_50k_with_duplicates` | 5 万次写入（含 3 万重复）不崩、不重复、去重生效 |
| `fts_stays_consistent_after_bulk_writes` | 5000 条写入后主表与 FTS 一致；删除/更新同步；`integrity-check` 通过 |
| `repeated_searches_do_not_fail` | 7200 次检索（含空词、短词、恶意串）全部成功，最慢 < 500ms |
| `concurrent_writers_do_not_corrupt` | 4 线程并发写不损坏，`PRAGMA integrity_check = ok` |
| `reopen_and_migrate_is_idempotent` | 重复打开 20 次 schema 稳定、数据源无重复播种 |

---

## 7. 已知限制

1. **右键菜单在 WebView2 里测不通** —— 代码保留，可能只是自动化工具发不进事件。
2. **NVD 的 CWE 提取率低** —— 50 条只有 1 条能提取，公开 API 里该字段本身稀疏。
3. **笔记输入无法自动化验证** —— 测试工具无法向 WebView2 注入键盘事件。
4. **教学内容未经第三方审校**。
5. **旧错题记录是中文快照** —— 新记录已改为存 `lesson_id + quiz_index`，渲染时按语言取。
