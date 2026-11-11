# SentryDesk

[![CI](https://github.com/MenLan-ov/SentryDesk/actions/workflows/ci.yml/badge.svg)](https://github.com/MenLan-ov/SentryDesk/actions/workflows/ci.yml)

**离线优先的漏洞知识库与安全学习工作台** —— 把公网情报变成可教学、可自测、可复习的知识资产。

- 🖥️ Windows 桌面应用（Tauri 2 + Rust + Vue 3 + TypeScript）
- 📦 单安装包约 4 MB，安装后约 17 MB，安装即用，**断网可用**
- 🔒 无账号、无遥测、不上传任何数据，全部内容存于本机 SQLite
- 🌏 中英文双语界面与双语教学内容

![首页](docs/screenshots/01-home.png)

## 这是什么

SentryDesk 是一个本地优先的安全知识库。安装包内同时包含：

| 组成 | 内容 |
|---|---|
| 情报库 | **2900+ 条漏洞条目**（CISA KEV 在野利用清单 + 近期 CVE），随包分发、离线可查 |
| 教学卡 | **110 张**中英双语教学卡（CWE 弱点、安全域、实战实验），每卡附参考来源 |
| 自测题 | **338 道**随卡自测题，答错自动进入错题本 |
| 术语表 | **91 条**安全术语双语对照 |
| 学习路径 | **14 条**岗位视角学习路径（含 ATT&CK、供应链、云原生主题） |

## 核心能力

**1. 情报 → 学习的完整闭环**
情报条目自动关联 CWE 弱点 → 一键跳到对应教学卡 → 学完立即自测 → 错题进入间隔重复复习队列 → 看板追踪进度。一条漏洞新闻可以直接变成一次学习。

**2. 本地优先，离线可用**
SQLite + FTS5 全文检索，毫秒级搜索；WAL 日志 + 内存临时表保证并发与性能；数据库损坏自动隔离重建，绝不白屏。

**3. 合规采集（可选更新）**
内容默认随安装包分发、覆盖安装即更新；内置的采集模块遵守 robots 协议、固定 User-Agent、严格限速，只访问白名单公开源（NVD / GitHub Advisory / CISA）。

## 界面

首次启动有三步引导：选语言 → 认识内容 → 做一道题。

![首次启动引导](docs/screenshots/00-onboarding.png)

| 情报检索 | 教学卡 | 学习看板 |
|---|---|---|
| ![情报](docs/screenshots/02-items.png) | ![卡片](docs/screenshots/03-lesson.png) | ![看板](docs/screenshots/04-dashboard.png) |

| 学习路径 | 设置与数据来源 |
|---|---|
| ![路径](docs/screenshots/05-paths.png) | ![设置](docs/screenshots/06-settings.png) |

## 技术架构

```
┌─────────────────────────────────────────────┐
│  Vue 3 + TypeScript 前端（视图层）            │
│  Home / Items / Lessons / Dashboard / Settings│
├─────────────────────────────────────────────┤
│  Tauri 2 IPC（命令层，27 个 command）          │
├─────────────────────────────────────────────┤
│  Rust 业务层                                  │
│  collect（合规采集）· parse（解析引擎）         │
│  db（SQLite/FTS5）· knowledge（教学库）        │
├─────────────────────────────────────────────┤
│  数据层：SQLite（WAL）+ JSON 内置知识库         │
└─────────────────────────────────────────────┘
```

- Rust 约 6200 行，40 个单元测试（`cargo test` 全过）
- 前端约 8000 行，`vue-tsc --noEmit` 零错误
- 安装器：NSIS 自定义模板，安装位置自选、写入受阻自动改道、占用自愈、启动即申请所需权限

## 安装与更新

**安装**：下载 `SentryDesk_x.x.x_x64-setup.exe`，双击运行（会申请一次管理员权限），
装完即含全部内容，离线可用。

**更新**：运行新版安装包即可覆盖更新，学习进度与笔记保留在
`%LOCALAPPDATA%\com.sentrydesk.app`，不受影响。

**便携版**：`SentryDesk_x.x.x_portable.zip` 解压即用，不写注册表。

## 从源码构建

```bash
npm install
npm run build                # 前端产物
cd src-tauri && cargo test   # 单元测试
npx tauri build              # 产出 NSIS 安装包
```

要求：Node 18+、Rust stable、Windows 10/11（WebView2）。

## 数据来源与合规

- [CISA KEV](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)（美国政府作品，公有领域）
- [NVD](https://nvd.nist.gov/)（NIST 公开数据）
- [GitHub Security Advisories](https://github.com/advisories)（CC-BY-4.0）

教学内容为本项目原创撰写，参考来源在每张卡片的 `refs` 字段标注。
详见 [docs/数据来源与合规.md](docs/数据来源与合规.md)。

## 文档

| 文档 | 内容 |
|---|---|
| [docs/演示脚本.md](docs/演示脚本.md) | 5 分钟现场演示流程 + 预判提问与回答（答辩用） |
| [docs/评审与升级清单.md](docs/评审与升级清单.md) | 自我评审记录：v0.8.7 基线 → v1.0.5 复评 |
| [docs/发布与更新.md](docs/发布与更新.md) | 发版流程、两套签名、`latest.json` 模板 |
| [docs/数据来源与合规.md](docs/数据来源与合规.md) | 五个数据源的许可与采集边界 |
| [CHANGELOG.md](CHANGELOG.md) | v0.1 → v1.0.5 演进记录 |

## 许可

代码以 [MIT License](LICENSE) 发布。

---

*SentryDesk —— 漏洞情报，不止于阅读。*
