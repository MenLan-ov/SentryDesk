// 全局状态：主题、语言、检索结果、统计。用 Vue reactive 实现，避免引入 Pinia。
//
// 依赖方向（单向，无环）：
//   stores/theme  ← stores/i18n、stores/format
//   stores/theme  ← store.ts
//   stores/guard  ← store.ts
// 组件一律从 store 导入，不直接依赖 stores/* 内部模块，
// 这样将来拆 store 时组件不用跟着改 import。
import { computed, reactive, ref } from "vue";
import { listen } from "@tauri-apps/api/event";
import { api, errMsg } from "./api";
import type {
  GlossaryTerm, Item, LearnOverview, LearningPath, LessonCard, LessonFilter,
  LessonProgress, LessonStats, RobotsStatus, SearchFilter, SourceDef, Stats, ThemeConfig,
} from "./types";
import { detailGuard, lessonGuard, searchGuard } from "./stores/guard";
import { persistTheme, theme } from "./stores/theme";
import zhCN from "./locales/zh-CN.json";
import enUS from "./locales/en-US.json";

// 对外统一出口：组件的 import 路径保持不变
// theme / persistTheme 同时被 store 内部使用，因此这里用 export 语法绑定本地已有的 import
export { applyTheme, fontTier, isZh, loadTheme, setFontTier } from "./stores/theme";
export { theme, persistTheme };
export { CATEGORY_EN, TAG_EN, categoryLabel, tagLabel } from "./stores/i18n";
export { fmtBytes, fmtDate, fmtRelative, severityClass } from "./stores/format";
export type { Guard, makeGuard } from "./stores/guard";

const LOCALES: Record<string, Record<string, string>> = {
  "zh-CN": zhCN as Record<string, string>,
  "en-US": enUS as Record<string, string>,
};

// ---------- i18n ----------// ---------- i18n ----------
const dict = computed(() => LOCALES[theme.lang] ?? LOCALES["zh-CN"]);

/** 取文案。缺键时回退到 key 本身，便于发现遗漏 */
export function t(key: string): string {
  return dict.value[key] ?? key;
}

export function setLang(lang: string) {
  theme.lang = lang as ThemeConfig["lang"];
  persistTheme();
}

// ---------- 应用数据 ----------
export const sources = ref<SourceDef[]>([]);
export const robots = ref<RobotsStatus[]>([]);
export const stats = ref<Stats | null>(null);
export const items = ref<Item[]>([]);
export const total = ref(0);
export const elapsedMs = ref(0);
export const selectedId = ref<number | null>(null);
export const selected = ref<Item | null>(null);

/**
 * 来源显示名：把内部 key（ghsa / cisa_kev …）换成人类可读的来源名称。
 * 情报页的每条记录都标注信息来源，用户看到的是「NVD CVE API 2.0」而不是 `nvd`。
 */
export function sourceLabel(key: string | null | undefined): string {
  if (!key) return "—";
  return sources.value.find((s) => s.key === key)?.name ?? key;
}

export const filter = reactive<SearchFilter>({
  query: "",
  source_key: null,
  cvss_min: null,
  days: null,
  kev_only: false,
  severity: null,
  cwe: null,
  favorite_only: false,
  limit: 100,
  offset: 0,
});

/** 顶栏搜索框的当前文本。
 * 放在 store 而不是 TopBar 本地 ref：清除筛选等功能需要同步清空输入框，
 * 本地 ref 会与 store 里的 query 脱节（清掉了结果但框里还留着旧词）。 */
export const searchInput = ref("");

export const loading = ref(false);
export const collecting = ref(false);
export const collectMsg = ref("");
/** 采集进度：由后端 collect://progress 事件驱动，5 个源逐个回报 */
export const collectProgress = ref<{ name: string; done: number; total: number; status: string } | null>(null);
export const toast = ref("");
/** toast 语义：错误用警示图标，别让「采集失败」配一个对勾 */
export const toastErr = ref(false);
let toastTimer: number | undefined;

/**
 * 提示条停留时长跟着信息量走：
 * 固定 2.6 秒对「采集失败：xxx」这种长句根本读不完（v0.7.5 遗留问题）。
 * 短句 2.4 秒起，长句按长度加，最多 8 秒；点一下立即关掉。
 */
export function showToast(msg: string, tone: "ok" | "err" = "ok") {
  toast.value = msg;
  toastErr.value = tone === "err";
  window.clearTimeout(toastTimer);
  const ms = Math.min(8000, Math.max(2400, msg.length * 110));
  toastTimer = window.setTimeout(() => (toast.value = ""), ms);
}

export function hideToast() {
  window.clearTimeout(toastTimer);
  toast.value = "";
}

/** 订阅后端采集进度事件：单源耗时可达数秒，必须有逐源反馈 */
export async function initCollectEvents() {
  try {
    await listen<{ source_name: string; done: number; total: number; status: string }>(
      "collect://progress",
      (e) => {
        const p = e.payload;
        collectProgress.value = {
          name: p.source_name,
          done: p.done,
          total: p.total,
          status: p.status,
        };
      },
    );
    await listen<{
      ok_sources: number;
      failed_sources: number;
      inserted: number;
      skipped: number;
      details?: { name: string; message?: string | null }[];
    }>("collect://done", (e) => {
      collectProgress.value = null;
      const s = e.payload;
      if (s.failed_sources > 0) {
        const first = (s.details ?? []).find((d) => d.message)?.message ?? "";
        const tail = first ? `｜${first.slice(0, 60)}` : "";
        showToast(
          (theme.lang === "en-US" ? "Collection: " : "采集完成：") +
            `${s.ok_sources} ok / ${s.failed_sources} failed · +${s.inserted}${tail}`,
        );
      }
    });
  } catch {
    // 事件通道不可用时静默降级，不影响采集主流程
  }
}

export async function refreshSources() {
  try {
    sources.value = await api.listSources();
    robots.value = await api.getRobots();
  } catch (e) {
    showToast(errMsg(e), "err");
  }
}

export async function refreshStats() {
  try {
    stats.value = await api.getStats();
  } catch (e) {
    showToast(errMsg(e), "err");
  }
}

export async function doSearch() {
  const tok = searchGuard.next();
  loading.value = true;
  try {
    const r = await api.search({ ...filter });
    // 期间又发起了新检索：本次结果已过期，直接丢弃
    if (!searchGuard.isCurrent(tok)) return;
    items.value = r.items;
    total.value = r.total;
    elapsedMs.value = r.elapsed_ms;
    // 选中项若不在新结果里，自动选第一条
    // 注意：列表项不含 lesson / note，必须走详情接口补全
    if (!r.items.some((x) => x.id === selectedId.value)) {
      selectedId.value = r.items.length > 0 ? r.items[0].id : null;
      if (r.items.length > 0) {
        await selectItem(r.items[0].id);
      } else {
        selected.value = null;
      }
    }
  } catch (e) {
    if (searchGuard.isCurrent(tok)) showToast(errMsg(e), "err");
  } finally {
    if (searchGuard.isCurrent(tok)) loading.value = false;
  }
}

export async function selectItem(id: number) {
  const tok = detailGuard.next();
  selectedId.value = id;
  try {
    const it = await api.getItem(id);
    // 期间又点了别的条目：旧详情不能覆盖新详情
    if (!detailGuard.isCurrent(tok)) return;
    selected.value = it;
  } catch (e) {
    if (detailGuard.isCurrent(tok)) showToast(errMsg(e), "err");
  }
}

export function moveSelection(delta: number) {
  if (items.value.length === 0) return;
  const idx = items.value.findIndex((x) => x.id === selectedId.value);
  const next = Math.min(Math.max(idx + delta, 0), items.value.length - 1);
  selectItem(items.value[next].id);
}

export function robotsOf(key: string): RobotsStatus | undefined {
  return robots.value.find((r) => r.source_key === key);
}

// ---------- 收藏（稍后读） ----------
export const favoriteIds = ref<number[]>([]);

export const favoriteCount = computed(() => favoriteIds.value.length);

export function isFavorite(id: number | null | undefined): boolean {
  return id != null && favoriteIds.value.includes(id);
}

export async function loadFavorites() {
  try {
    const [, ids] = await api.favoriteSummary();
    favoriteIds.value = ids;
  } catch {
    favoriteIds.value = [];
  }
}

/** 切换收藏：先本地改状态保证点击即反馈，再落库 */
export async function toggleFavorite(id: number) {
  const prev = favoriteIds.value;
  const on = !isFavorite(id);
  favoriteIds.value = on ? [id, ...prev] : prev.filter((x) => x !== id);
  if (selected.value?.id === id) selected.value.favorite = on;
  const hit = items.value.find((x) => x.id === id);
  if (hit) hit.favorite = on;
  showToast(on ? (theme.lang === "zh-CN" ? "已加入稍后读" : "Saved for later") : (theme.lang === "zh-CN" ? "已取消收藏" : "Removed from saved"));
  try {
    const real = await api.toggleFavorite(id);
    if (real !== on) {
      // 落库结果与本地不一致时以库为准，避免界面长期说谎
      favoriteIds.value = real ? [id, ...prev.filter((x) => x !== id)] : prev.filter((x) => x !== id);
    }
  } catch (e) {
    favoriteIds.value = prev;
    showToast(errMsg(e), "err");
  }
}

// ---------- 教学知识库 ----------
export type ViewMode = "home" | "learn" | "items" | "paths" | "dashboard" | "wrong" | "settings";

/** 待复习错题数（顶栏徽标） */
export const wrongPending = ref(0);

/** 待复习题数（间隔重复队列；顶栏徽标显示这个数） */
export const reviewDue = ref(0);

/** 错题视图的子模式：列表 / 今日复习。提到全局是因为首页磁贴和命令面板都要能一键进入复习 */
export const wrongMode = ref<"list" | "review">("list");

/** 直接开始复习：切视图 + 切模式 + 刷新计数 */
export function startReview() {
  wrongMode.value = "review";
  view.value = "wrong";
  refreshWrongCount();
}

export async function refreshWrongCount() {
  try {
    const [, pending] = await api.wrongAnswerCount();
    wrongPending.value = pending;
  } catch {
    wrongPending.value = 0;
  }
  try {
    reviewDue.value = await api.reviewDueCount();
  } catch {
    reviewDue.value = 0;
  }
}

/** 当前视图：home 首页磁贴 / learn 教学详情 / items 情报检索 */
export const view = ref<ViewMode>("home");

// ---------- 全局浮层 ----------
/** 命令面板（Ctrl+K）：跨模块跳转与动作执行 */
export const paletteOpen = ref(false);
/** 快捷键总览（?） */
export const helpOpen = ref(false);

export function openPalette() {
  helpOpen.value = false;
  paletteOpen.value = true;
}

export function openHelp() {
  paletteOpen.value = false;
  helpOpen.value = true;
}

export function closeOverlays() {
  paletteOpen.value = false;
  helpOpen.value = false;
}

/** 主题三态循环：浅色 → 深色 → 护眼 */
export function cycleTheme() {
  const order = ["light", "dark", "eyecare"] as const;
  const i = order.indexOf(theme.mode as (typeof order)[number]);
  theme.mode = order[(i + 1) % order.length];
  persistTheme();
}

export const lessons = ref<LessonCard[]>([]);
/** 全量教学卡（不受筛选影响），用于路径、关联等查标题 */
export const allLessons = ref<LessonCard[]>([]);
export const lessonStats = ref<LessonStats | null>(null);
export const activeLesson = ref<LessonCard | null>(null);
export const lessonLoading = ref(false);
export const lessonFilter = reactive<LessonFilter>({
  query: "",
  kind: null,
  category: null,
  level: null,
});
/** 教学卡关联的真实漏洞数 */
export const lessonCveCount = ref(0);
/** 从教学卡跳转到情报列表时使用的 CWE */
export const activeCwe = ref<string | null>(null);

// ---------- 学习进度 / 术语 / 路径 ----------
export const progress = ref<LessonProgress[]>([]);
export const glossary = ref<GlossaryTerm[]>([]);
export const paths = ref<LearningPath[]>([]);
export const overview = ref<LearnOverview | null>(null);

/** progress 的 Map 索引：卡片数量多时避免 O(n) 线性查找 */
const progressIndex = computed(() => {
  const m = new Map<string, LessonProgress>();
  for (const p of progress.value) m.set(p.lesson_id, p);
  return m;
});

export function progressOf(id: string): LessonProgress | undefined {
  return progressIndex.value.get(id);
}

export function statusOf(id: string): string {
  return progressIndex.value.get(id)?.status ?? "unread";
}

export async function loadProgress() {
  try {
    progress.value = await api.getProgress();
    overview.value = await api.learnOverview();
  } catch (e) {
    showToast(errMsg(e), "err");
  }
}

export async function setLessonStatus(id: string, status: string) {
  try {
    await api.setProgress(id, status);
    await loadProgress();
  } catch (e) {
    showToast(errMsg(e), "err");
  }
}

export async function loadGlossary() {
  try {
    glossary.value = await api.glossary();
  } catch {
    glossary.value = [];
  }
}

export async function loadPaths() {
  try {
    paths.value = await api.learningPaths();
  } catch {
    paths.value = [];
  }
}

/** 术语索引：只在 glossary 变化时重算一次，避免每次渲染都排序 */
let termIndexCache: { src: GlossaryTerm[]; sorted: GlossaryTerm[] } | null = null;
function sortedTerms(): GlossaryTerm[] {
  if (termIndexCache && termIndexCache.src === glossary.value) {
    return termIndexCache.sorted;
  }
  const sorted = [...glossary.value].sort((a, b) => b.term.length - a.term.length);
  termIndexCache = { src: glossary.value, sorted };
  return sorted;
}

/** 结果缓存：同一段文本不重复计算（正文长度做键） */
const matchCache = new Map<string, { text: string; term?: GlossaryTerm }[]>();
const MATCH_CACHE_MAX = 400;

/** 在文本里匹配术语，返回可用于渲染的分段 */
export function matchTerms(text: string): { text: string; term?: GlossaryTerm }[] {
  if (!glossary.value.length || !text) return [{ text }];
  const cached = matchCache.get(text);
  if (cached) return cached;

  const terms = sortedTerms();
  const hits: { start: number; end: number; term: GlossaryTerm }[] = [];
  const used = new Array(text.length).fill(false);
  for (const t of terms) {
    const keys = [t.term, ...(t.alias ?? [])].filter((k) => k && k.length >= 2);
    for (const k of keys) {
      let idx = text.indexOf(k);
      while (idx !== -1) {
        const end = idx + k.length;
        let free = true;
        for (let i = idx; i < end; i++) if (used[i]) { free = false; break; }
        if (free) {
          for (let i = idx; i < end; i++) used[i] = true;
          hits.push({ start: idx, end, term: t });
        }
        idx = text.indexOf(k, idx + 1);
      }
    }
  }
  if (!hits.length) {
    const plain = [{ text }];
    if (matchCache.size > MATCH_CACHE_MAX) matchCache.clear();
    matchCache.set(text, plain);
    return plain;
  }
  hits.sort((a, b) => a.start - b.start);
  const out: { text: string; term?: GlossaryTerm }[] = [];
  let cur = 0;
  for (const h of hits) {
    if (h.start > cur) out.push({ text: text.slice(cur, h.start) });
    out.push({ text: text.slice(h.start, h.end), term: h.term });
    cur = h.end;
  }
  if (cur < text.length) out.push({ text: text.slice(cur) });
  if (matchCache.size > MATCH_CACHE_MAX) matchCache.clear();
  matchCache.set(text, out);
  return out;
}

export async function loadLessons() {
  const tok = lessonGuard.next();
  lessonLoading.value = true;
  try {
    const found = await api.searchLessons({ ...lessonFilter });
    // 期间筛选条件又变了：丢弃过期结果
    if (!lessonGuard.isCurrent(tok)) return;
    lessons.value = found;
    // 全量只在首次或筛选为空时更新，避免路径页拿到子集
    if (!allLessons.value.length || !lessonFilter.category) {
      const all = await api.searchLessons({ query: "", kind: null, category: null, level: null });
      if (all.length >= allLessons.value.length) allLessons.value = all;
    }
    if (!lessonStats.value) {
      lessonStats.value = await api.lessonStats();
    }
  } catch (e) {
    if (lessonGuard.isCurrent(tok)) showToast(errMsg(e), "err");
  } finally {
    if (lessonGuard.isCurrent(tok)) lessonLoading.value = false;
  }
}

export async function openLesson(id: string) {
  const tok = detailGuard.next();
  try {
    const card = await api.getLesson(id);
    if (!card || !detailGuard.isCurrent(tok)) return;
    activeLesson.value = card;
    view.value = "learn";
    // 记住最后打开的卡，首页「继续」用它，重启后仍然有效
    try {
      localStorage.setItem("sentrydesk:last-lesson", id);
    } catch {
      // 存储不可用时不影响主流程
    }
    const cwe = card.cwe;
    const n = cwe ? await api.countItemsByCwe(cwe) : 0;
    // 等待期间又打开了别的卡：本次关联计数不能写进新卡
    if (!detailGuard.isCurrent(tok)) return;
    lessonCveCount.value = n;
  } catch (e) {
    if (detailGuard.isCurrent(tok)) showToast(errMsg(e), "err");
  }
}

/** 从教学卡跳到「该 CWE 的真实漏洞」 */
export async function jumpToCwe(cwe: string) {
  activeCwe.value = cwe;
  filter.query = "";
  filter.cwe = cwe;
  filter.source_key = null;
  filter.severity = null;
  filter.cvss_min = null;
  filter.days = null;
  filter.kev_only = false;
  view.value = "items";
  await doSearch();
}

export function goHome() {
  view.value = "home";
  activeLesson.value = null;
  activeCwe.value = null;
}

/**
 * 刷新「当前视图」的数据，而不是整页重载。
 *
 * 旧实现是 window.location.reload()：WebView 整页重载后 store 全部重新初始化，
 * view 回到默认的 "home"，于是用户在详情页/看板/错题本点「刷新界面」，
 * 会被弹回主页 —— 看起来像「刷新把我踢走了」。
 * 这里按视图分别重取数据，停留在原地。
 */
export async function refreshCurrentView() {
  const jobs: Promise<unknown>[] = [refreshStats(), refreshSources()];
  switch (view.value) {
    case "home":
      jobs.push(doSearch(), loadFavorites());
      break;
    case "items":
      jobs.push(doSearch(), loadFavorites());
      break;
    case "learn":
      jobs.push(loadLessons(), loadProgress(), loadGlossary(), loadPaths());
      break;
    case "paths":
      jobs.push(loadPaths(), loadLessons(), loadProgress());
      break;
    case "dashboard":
      jobs.push(refreshWrongCount(), loadFavorites());
      break;
    case "wrong":
      jobs.push(refreshWrongCount());
      break;
    case "settings":
      break;
  }
  await Promise.allSettled(jobs);
}

