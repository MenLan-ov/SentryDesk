//! 数据结构定义。缺失字段一律用 Option 表达，禁止用空字符串或 0 占位。
use serde::{Deserialize, Serialize};

/// 严重等级，由 CVSS 分值推导
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "UPPERCASE")]
pub enum Severity {
    Critical,
    High,
    Medium,
    Low,
}

impl Severity {
    pub fn from_score(score: f64) -> Option<Self> {
        if !(0.0..=10.0).contains(&score) {
            return None;
        }
        if score >= 9.0 {
            Some(Severity::Critical)
        } else if score >= 7.0 {
            Some(Severity::High)
        } else if score >= 4.0 {
            Some(Severity::Medium)
        } else if score > 0.0 {
            Some(Severity::Low)
        } else {
            None
        }
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            Severity::Critical => "CRITICAL",
            Severity::High => "HIGH",
            Severity::Medium => "MEDIUM",
            Severity::Low => "LOW",
        }
    }
}

/// 语言标记
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Lang {
    #[serde(rename = "en")]
    En,
    #[serde(rename = "zh")]
    Zh,
}

impl Lang {
    pub fn as_str(&self) -> &'static str {
        match self {
            Lang::En => "en",
            Lang::Zh => "zh",
        }
    }
}

/// 数据源定义（白名单，硬编码在 sources.rs）
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SourceDef {
    pub key: String,
    pub name: String,
    pub base_url: String,
    /// json_api | rss
    pub kind: String,
    pub min_interval_ms: u64,
    /// 单次最多取多少条
    pub max_items: usize,
    pub enabled: bool,
}

/// robots.txt 校验结果
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RobotsStatus {
    pub source_key: String,
    pub allowed: bool,
    /// allowed | disallowed | not_found | error
    pub state: String,
    pub detail: String,
    pub checked_at: String,
}

/// 解析后的统一条目
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParsedItem {
    pub external_id: Option<String>,
    pub cve_id: Option<String>,
    pub title: String,
    pub summary: Option<String>,
    pub cvss_score: Option<f64>,
    pub cvss_severity: Option<Severity>,
    pub products: Vec<String>,
    pub published_at: Option<String>,
    pub source_url: String,
    pub lang: Lang,
    /// 缺陷类型编号，如 CWE-89；用于关联教学卡
    pub cwe: Option<String>,
    /// 处置要求摘要（KEV 的 requiredAction）
    pub action: Option<String>,
}

/// 入库后的完整条目（带 id 与来源信息）
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Item {
    pub id: i64,
    pub source_key: String,
    pub external_id: Option<String>,
    pub cve_id: Option<String>,
    pub title: String,
    pub summary: Option<String>,
    pub cvss_score: Option<f64>,
    pub cvss_severity: Option<String>,
    pub products: Vec<String>,
    pub published_at: Option<String>,
    pub source_url: String,
    pub collected_at: String,
    pub lang: String,
    pub in_kev: bool,
    pub cwe: Option<String>,
    pub action: Option<String>,
    /// 是否已收藏（稍后读）
    #[serde(default)]
    pub favorite: bool,
    pub tags: Vec<String>,
    pub note: Option<Note>,
    /// 关联的教学卡（按 cwe 匹配），无匹配则为 None
    pub lesson: Option<LessonCard>,
}

// ==================== 教学知识库 ====================

/// 教学卡：CWE 原理卡 / 方法论课 / 实战实验，共用一套结构
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LessonCard {
    pub id: String,
    /// cwe | lesson | lab
    pub kind: String,
    pub category: String,
    #[serde(default)]
    pub cwe: Option<String>,
    pub title: String,
    #[serde(default)]
    pub title_en: Option<String>,
    /// beginner | intermediate | advanced
    pub level: String,
    pub icon: String,
    pub color: String,
    pub summary: String,
    #[serde(default)]
    pub summary_en: Option<String>,
    pub sections: Vec<LessonSection>,
    #[serde(default)]
    pub refs: Vec<LessonRef>,
    #[serde(default)]
    pub tags: Vec<String>,
    /// 自测题
    #[serde(default)]
    pub quiz: Vec<QuizQuestion>,
    /// 关联的其它卡 id
    #[serde(default)]
    pub related: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LessonSection {
    /// 小节标题：原理 / 如何发现 / 解决办法 …
    pub h: String,
    pub p: String,
    /// 英文小节标题
    #[serde(default)]
    pub h_en: Option<String>,
    /// 英文正文
    #[serde(default)]
    pub p_en: Option<String>,
    /// 该小节内的代码对比块（可选）
    #[serde(default)]
    pub code: Vec<CodeBlock>,
}

/// 漏洞代码 / 修复代码对比块
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodeBlock {
    /// 语言标识：java | python | javascript | go | rust | sql | bash | text
    pub lang: String,
    /// 代码块标题（一句话说明这段代码在做什么）
    #[serde(default)]
    pub title: Option<String>,
    /// 英文标题（缺失时英文界面回退到语言名，不显示中文）
    #[serde(default)]
    pub title_en: Option<String>,
    /// 英文说明（缺失时英文界面不再显示中文）
    #[serde(default)]
    pub note_en: Option<String>,
    /// 有问题的写法
    pub bad: String,
    /// 修复后的写法
    pub good: String,
    /// 一句话说明差在哪
    #[serde(default)]
    pub note: Option<String>,
}

/// 自测题
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuizQuestion {
    pub q: String,
    /// 选项文本
    pub options: Vec<String>,
    /// 正确选项下标（0 起）
    pub answer: usize,
    /// 解析
    pub explain: String,
    /// 英文题干（缺失时前端回退中文）
    #[serde(default)]
    pub q_en: Option<String>,
    /// 英文选项
    #[serde(default)]
    pub options_en: Option<Vec<String>>,
    /// 英文解析
    #[serde(default)]
    pub explain_en: Option<String>,
}

/// 术语条目
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GlossaryTerm {
    pub id: String,
    pub term: String,
    #[serde(default)]
    pub term_en: Option<String>,
    /// 别名，用于正文匹配：如 IDOR / 水平越权
    #[serde(default)]
    pub alias: Vec<String>,
    pub definition: String,
    /// 英文释义（缺失时英文界面回退到中文释义）
    #[serde(default)]
    pub definition_en: Option<String>,
    /// 关联教学卡 id
    #[serde(default)]
    pub related: Vec<String>,
}

/// 学习路径
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LearningPath {
    pub id: String,
    pub title: String,
    #[serde(default)]
    pub title_en: Option<String>,
    pub desc: String,
    #[serde(default)]
    pub desc_en: Option<String>,
    /// 大致时长，单位分钟
    pub minutes: u32,
    /// 有序的卡片 id 列表
    pub steps: Vec<String>,
}

/// 单张卡的本地学习状态
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LessonProgress {
    pub lesson_id: String,
    /// unread | reading | mastered
    pub status: String,
    /// 自测得分（0-100），未测为 None
    pub quiz_score: Option<i64>,
    /// 自测总题数 / 答对数
    pub quiz_total: i64,
    pub quiz_correct: i64,
    pub updated_at: String,
    pub note: Option<String>,
}

/// 学习总览
#[derive(Debug, Clone, Serialize)]
pub struct LearnOverview {
    pub total_cards: usize,
    pub read_count: i64,
    pub mastered_count: i64,
    pub quizzed_count: i64,
    pub avg_score: f64,
    pub note_count: i64,
    /// 连续学习天数（今天或昨天有学习行为开始往回数）
    pub streak_days: i64,
    /// 待复习的错题数
    pub wrong_pending: i64,
    pub by_category: Vec<CategoryProgress>,
}

#[derive(Debug, Clone, Serialize)]
pub struct CategoryProgress {
    pub category: String,
    pub total: usize,
    pub mastered: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LessonRef {
    pub name: String,
    pub url: String,
}

/// 教学库检索条件
#[derive(Debug, Clone, Default, Deserialize)]
#[serde(default)]
pub struct LessonFilter {
    pub query: String,
    pub kind: Option<String>,
    pub category: Option<String>,
    pub level: Option<String>,
}

/// 教学库统计
#[derive(Debug, Clone, Serialize)]
pub struct LessonStats {
    pub total: usize,
    pub by_kind: Vec<CountPair>,
    pub by_category: Vec<CountPair>,
    pub by_level: Vec<CountPair>,
}

#[derive(Debug, Clone, Serialize)]
pub struct CountPair {
    pub key: String,
    pub count: usize,
}

/// 个人笔记
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Note {
    pub id: i64,
    pub item_id: i64,
    pub body: String,
    pub created_at: String,
    pub updated_at: String,
}

/// 检索条件
#[derive(Debug, Clone, Default, Deserialize)]
#[serde(default)]
pub struct SearchFilter {
    pub query: String,
    pub source_key: Option<String>,
    pub cvss_min: Option<f64>,
    pub days: Option<i64>,
    pub kev_only: bool,
    pub severity: Option<String>,
    pub cwe: Option<String>,
    /// 只看已收藏
    pub favorite_only: bool,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

/// 检索结果
#[derive(Debug, Clone, Serialize)]
pub struct SearchResult {
    pub total: i64,
    pub items: Vec<Item>,
    pub elapsed_ms: u64,
}

/// 统计概览
#[derive(Debug, Clone, Serialize)]
pub struct Stats {
    pub total: i64,
    pub by_source: Vec<SourceCount>,
    pub by_severity: Vec<SeverityCount>,
    pub kev_count: i64,
    pub db_bytes: u64,
    pub last_collected_at: Option<String>,
    /// 库内最新一条情报的发布/收录日期（YYYY-MM-DD），用于在界面标注快照时点
    pub latest_published: Option<String>,
    pub last_7_days: Vec<DayCount>,
}

#[derive(Debug, Clone, Serialize)]
pub struct SourceCount {
    pub source_key: String,
    pub name: String,
    pub count: i64,
    pub last_at: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct SeverityCount {
    pub severity: String,
    pub count: i64,
}

#[derive(Debug, Clone, Serialize)]
pub struct DayCount {
    pub date: String,
    pub count: i64,
}

// ==================== 看板 ====================

/// 看板：一次性返回所有图表需要的数据，减少往返
#[derive(Debug, Clone, Serialize)]
pub struct DashboardData {
    /// 近 N 天每日新增（按发布时间归集）
    pub daily: Vec<DayCount>,
    /// 按 CVSS 分级的数量与占比
    pub severity: Vec<SeverityCount>,
    /// 来源占比
    pub sources: Vec<SourceCount>,
    /// 受影响产品 Top N
    pub top_products: Vec<CountPair>,
    /// CWE 分布 Top N
    pub top_cwe: Vec<CountPair>,
    /// 在野利用 / 已评级 / 总数
    pub kev_count: i64,
    pub rated_count: i64,
    pub total: i64,
    /// 近 30 天新增总数（用于「本周新增」这类文案）
    pub recent_30d: i64,
    /// 采集健康度：近 7 天成功/失败请求数
    pub collect_ok: i64,
    pub collect_fail: i64,
}

/// 采集进度事件
#[derive(Debug, Clone, Serialize)]
pub struct CollectProgress {
    pub task_id: String,
    pub source_key: String,
    pub source_name: String,
    pub done: usize,
    pub total: usize,
    pub status: String,
    pub message: Option<String>,
}

/// 采集结果汇总
#[derive(Debug, Clone, Serialize)]
pub struct CollectSummary {
    pub task_id: String,
    pub ok_sources: usize,
    pub failed_sources: usize,
    pub inserted: usize,
    pub skipped: usize,
    pub elapsed_ms: u64,
    pub details: Vec<CollectDetail>,
}

#[derive(Debug, Clone, Serialize)]
pub struct CollectDetail {
    pub source_key: String,
    pub name: String,
    pub status: String,
    pub fetched: usize,
    pub inserted: usize,
    pub skipped: usize,
    pub elapsed_ms: u64,
    pub message: Option<String>,
}

/// 主题配置
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default)]
pub struct ThemeConfig {
    pub mode: String,
    pub accent: String,
    pub density: String,
    pub radius: String,
    pub lang: String,
}

impl Default for ThemeConfig {
    fn default() -> Self {
        Self {
            mode: "light".into(),
            accent: "#2563eb".into(),
            density: "comfortable".into(),
            radius: "md".into(),
            lang: "zh-CN".into(),
        }
    }
}

/// 备忘导出项：只含元数据 + 链接 + 笔记，绝不含原文全文
#[derive(Debug, Clone, Serialize)]
pub struct MemoItem {
    pub cve_id: Option<String>,
    pub title: String,
    pub cvss_score: Option<f64>,
    pub cvss_severity: Option<String>,
    pub products: Vec<String>,
    pub published_at: Option<String>,
    pub source_name: String,
    pub source_url: String,
    pub collected_at: String,
    pub note: Option<String>,
}
