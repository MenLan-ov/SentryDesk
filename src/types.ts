// 与 Rust models.rs 对应的类型定义

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";

export interface Note {
  id: number;
  item_id: number;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface CodeBlock {
  lang: string;
  title?: string;
  title_en?: string | null;
  note_en?: string | null;
  bad: string;
  good: string;
  note?: string | null;
}

export interface LessonSection {
  h: string;
  p: string;
  h_en?: string | null;
  p_en?: string | null;
  code?: CodeBlock[];
}

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
  explain: string;
  q_en?: string | null;
  options_en?: string[] | null;
  explain_en?: string | null;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  term_en?: string | null;
  alias?: string[];
  definition: string;
  definition_en?: string | null;
  related?: string[];
}

export interface LearningPath {
  id: string;
  title: string;
  title_en?: string | null;
  desc: string;
  desc_en?: string | null;
  minutes: number;
  steps: string[];
}

export interface LessonProgress {
  lesson_id: string;
  status: "unread" | "reading" | "mastered";
  quiz_score: number | null;
  quiz_total: number;
  quiz_correct: number;
  updated_at: string;
  note: string | null;
}

export interface CategoryProgress {
  category: string;
  total: number;
  mastered: number;
}

export interface DashboardData {
  daily: DayCount[];
  severity: SeverityCount[];
  sources: SourceCount[];
  top_products: CountPair[];
  top_cwe: CountPair[];
  kev_count: number;
  rated_count: number;
  total: number;
  recent_30d: number;
  collect_ok: number;
  collect_fail: number;
}

// ==================== 设置 / 合规 ====================

export interface SourceCompliance {
  key: string;
  name: string;
  base_url: string;
  kind: string;
  interval_ms: number;
  floor_applied: boolean;
  robots_state: "allowed" | "disallowed" | "not_found" | "unknown";
  robots_checked_at: string | null;
  enabled: boolean;
  item_count: number;
}

export interface ComplianceInfo {
  user_agent: string;
  min_interval_floor_ms: number;
  default_interval_ms: number;
  max_body_bytes: number;
  timeout_secs: number;
  max_retries: number;
  sources: SourceCompliance[];
  data_dir: string;
  db_path: string;
  db_bytes: number;
  offline_only: boolean;
}

export interface BackupResult {
  path: string;
  bytes: number;
  items: number;
  notes: number;
  progress: number;
}

export interface ItemExportResult {
  path: string;
  count: number;
  bytes: number;
}

export interface WrongAnswer {
  id: number;
  lesson_id: string;
  quiz_index: number;
  question: string;
  chosen: number;
  correct: number;
  explain: string | null;
  wrong_times: number;
  reviewed: boolean;
  updated_at: string;
}

/** 复习队列里的一道题（错题 + 间隔重复排期） */
export interface ReviewItem {
  id: number;
  lesson_id: string;
  quiz_index: number;
  question: string;
  chosen: number;
  correct: number;
  explain: string | null;
  wrong_times: number;
  reps: number;
  interval_days: number;
  ease: number;
  lapses: number;
  due_at: string | null;
  overdue_days: number;
}

/** 提交反馈后返回的新排期 */
export interface ReviewState {
  reps: number;
  interval_days: number;
  ease: number;
  lapses: number;
  due_at: string;
  due_in_minutes: number;
}

export interface LearnOverview {
  total_cards: number;
  read_count: number;
  mastered_count: number;
  quizzed_count: number;
  avg_score: number;
  note_count: number;
  streak_days: number;
  wrong_pending: number;
  by_category: CategoryProgress[];
}

export interface LessonRef {
  name: string;
  url: string;
}

export interface LessonCard {
  id: string;
  kind: "cwe" | "lesson" | "lab";
  category: string;
  cwe: string | null;
  title: string;
  title_en: string | null;
  level: "beginner" | "intermediate" | "advanced";
  icon: string;
  color: string;
  summary: string;
  summary_en: string | null;
  sections: LessonSection[];
  refs: LessonRef[];
  tags: string[];
  quiz?: QuizQuestion[];
  related?: string[];
}

export interface LessonFilter {
  query?: string;
  kind?: string | null;
  category?: string | null;
  level?: string | null;
}

export interface CountPair {
  key: string;
  count: number;
}

export interface LessonStats {
  total: number;
  by_kind: CountPair[];
  by_category: CountPair[];
  by_level: CountPair[];
}

export interface Item {
  id: number;
  source_key: string;
  external_id: string | null;
  cve_id: string | null;
  title: string;
  summary: string | null;
  cvss_score: number | null;
  cvss_severity: Severity | null;
  products: string[];
  published_at: string | null;
  source_url: string;
  collected_at: string;
  lang: string;
  in_kev: boolean;
  cwe: string | null;
  action: string | null;
  /** 是否已收藏（稍后读） */
  favorite?: boolean;
  tags: string[];
  note: Note | null;
  lesson: LessonCard | null;
}

export interface SourceDef {
  key: string;
  name: string;
  base_url: string;
  kind: string;
  min_interval_ms: number;
  max_items: number;
  enabled: boolean;
}

export interface RobotsStatus {
  source_key: string;
  allowed: boolean;
  state: "allowed" | "disallowed" | "not_found" | "unknown";
  detail: string;
  checked_at: string;
}

export interface SearchFilter {
  query?: string;
  source_key?: string | null;
  cvss_min?: number | null;
  days?: number | null;
  kev_only?: boolean;
  severity?: string | null;
  cwe?: string | null;
  /** 只看已收藏 */
  favorite_only?: boolean;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  total: number;
  items: Item[];
  elapsed_ms: number;
}

export interface SourceCount {
  source_key: string;
  name: string;
  count: number;
  last_at: string | null;
}

export interface SeverityCount {
  severity: string;
  count: number;
}

export interface DayCount {
  date: string;
  count: number;
}

export interface Stats {
  total: number;
  by_source: SourceCount[];
  by_severity: SeverityCount[];
  kev_count: number;
  db_bytes: number;
  last_collected_at: string | null;
  /** 库内最新一条情报的发布/收录日期（YYYY-MM-DD），用于标注快照时点 */
  latest_published?: string | null;
  last_7_days: DayCount[];
}

export interface CollectProgress {
  task_id: string;
  source_key: string;
  source_name: string;
  done: number;
  total: number;
  status: string;
  message: string | null;
}

export interface CollectDetail {
  source_key: string;
  name: string;
  status: string;
  fetched: number;
  inserted: number;
  skipped: number;
  elapsed_ms: number;
  message: string | null;
}

export interface CollectSummary {
  task_id: string;
  ok_sources: number;
  failed_sources: number;
  inserted: number;
  skipped: number;
  elapsed_ms: number;
  details: CollectDetail[];
}

export interface ThemeConfig {
  mode: "light" | "dark" | "eyecare";
  accent: string;
  density: "comfortable" | "compact";
  radius: "sm" | "md" | "lg";
  lang: "zh-CN" | "en-US";
}
