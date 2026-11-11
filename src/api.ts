// Tauri command 封装。所有 invoke 集中在此，便于统一错误处理。
import { invoke } from "@tauri-apps/api/core";
import type {
  BackupResult,
  CollectSummary,
  ComplianceInfo,
  DashboardData,
  GlossaryTerm,
  ItemExportResult,
  Item,
  LearnOverview,
  LearningPath,
  LessonCard,
  LessonFilter,
  LessonProgress,
  LessonStats,
  Note,
  ReviewItem,
  ReviewState,
  RobotsStatus,
  SearchFilter,
  SearchResult,
  SourceDef,
  Stats,
  ThemeConfig,
  WrongAnswer,
} from "./types";

export interface AppErrorPayload {
  code: string;
  message: string;
}

export function errMsg(e: unknown): string {
  if (typeof e === "string") return e;
  if (e && typeof e === "object" && "message" in e) {
    return String((e as AppErrorPayload).message);
  }
  return String(e);
}

export const api = {
  // 采集
  listSources: () => invoke<SourceDef[]>("list_sources"),
  getRobots: () => invoke<RobotsStatus[]>("get_robots"),
  checkRobots: () => invoke<RobotsStatus[]>("check_robots"),
  startCollect: () => invoke<CollectSummary>("start_collect"),
  collectLogs: (limit = 50) => invoke<Record<string, unknown>[]>("collect_logs", { limit }),

  // 检索
  search: (filter: SearchFilter) => invoke<SearchResult>("search_items", { filter }),
  getItem: (id: number) => invoke<Item | null>("get_item_detail", { id }),
  getStats: () => invoke<Stats>("get_stats"),
  saveNote: (itemId: number, body: string) =>
    invoke<Note>("save_note", { itemId, body }),
  toggleFavorite: (itemId: number) => invoke<boolean>("toggle_favorite", { itemId }),
  favoriteSummary: () => invoke<[number, number[]]>("favorite_summary"),

  // 设置
  getTheme: () => invoke<ThemeConfig>("get_theme"),
  setTheme: (config: ThemeConfig) => invoke<ThemeConfig>("set_theme", { config }),
  exportTheme: () => invoke<string>("export_theme"),
  importTheme: (json: string) => invoke<ThemeConfig>("import_theme", { json }),

  // 导出
  previewMemo: () => invoke<unknown[]>("preview_memo"),
  exportMemo: (path: string) => invoke<string>("export_memo", { path }),
  saveReportPng: (path: string, data: number[]) =>
    invoke<string>("save_report_png", { path, data }),

  // 教学知识库（全部离线）
  searchLessons: (filter: LessonFilter) => invoke<LessonCard[]>("search_lessons", { filter }),
  getLesson: (id: string) => invoke<LessonCard | null>("get_lesson", { id }),
  getLessonByCwe: (cwe: string) => invoke<LessonCard | null>("get_lesson_by_cwe", { cwe }),
  lessonStats: () => invoke<LessonStats>("lesson_stats"),

  // 看板
  dashboard: (days = 30) => invoke<DashboardData>("dashboard", { days }),

  // 错题本
  listWrongAnswers: (includeReviewed = false) =>
    invoke<WrongAnswer[]>("list_wrong_answers", { includeReviewed }),
  markWrongReviewed: (lessonId: string, quizIndex: number) =>
    invoke<void>("mark_wrong_reviewed", { lessonId, quizIndex }),
  wrongAnswerCount: () => invoke<[number, number]>("wrong_answer_count"),

  // 间隔重复复习（v0.8.1）
  reviewQueue: (limit = 80) => invoke<ReviewItem[]>("review_queue", { limit }),
  reviewGrade: (id: number, grade: number) => invoke<ReviewState>("review_grade", { id, grade }),
  reviewDueCount: () => invoke<number>("review_due_count"),
  countItemsByCwe: (cwe: string) => invoke<number>("count_items_by_cwe", { cwe }),
  relatedLessons: (id: string) => invoke<LessonCard[]>("related_lessons", { id }),

  // 术语表
  glossary: () => invoke<GlossaryTerm[]>("glossary_all"),

  // 学习路径
  learningPaths: () => invoke<LearningPath[]>("learning_paths"),

  // 学习进度
  getProgress: () => invoke<LessonProgress[]>("get_progress"),
  setProgress: (lessonId: string, status: string) =>
    invoke<void>("set_progress", { lessonId, status }),
  saveQuizResult: (
    lessonId: string,
    total: number,
    correct: number,
    wrong?: { index: number; question: string; chosen: number; correct: number; explain?: string }[]
  ) => invoke<void>("save_quiz_result", { lessonId, total, correct, wrong }),
  saveLessonNote: (lessonId: string, note: string) =>
    invoke<void>("save_lesson_note", { lessonId, note }),
  learnOverview: () => invoke<LearnOverview>("learn_overview"),
  exportLearnReport: (path: string) => invoke<string>("export_learn_report", { path }),

  // 设置 / 合规
  complianceInfo: () => invoke<ComplianceInfo>("compliance_info"),
  backupDatabase: (targetDir?: string) =>
    invoke<BackupResult>("backup_database", { targetDir: targetDir ?? null }),
  restoreDatabase: (source: string) => invoke<string>("restore_database", { source }),
  openDataDir: () => invoke<string>("open_data_dir"),
  exportItemsJson: (limit?: number) =>
    invoke<ItemExportResult>("export_items_json", { limit: limit ?? null }),

  // 窗口
  windowState: () => invoke<{ x: number; y: number; width: number; height: number; maximized: boolean }>("window_state"),
  saveWindowState: (s: { x: number; y: number; width: number; height: number; maximized: boolean }) =>
    invoke<void>("save_window_state", s),
  quitApp: () => invoke<void>("quit_app"),
};
