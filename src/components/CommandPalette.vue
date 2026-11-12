<script setup lang="ts">
/**
 * 命令面板（Ctrl+K）：一处完成「跳到哪、看什么、做什么」。
 * 纯前端聚合现有数据（教学卡 / 术语 / 导航 / 动作），不新增后端接口。
 */
import { computed, nextTick, ref, watch } from "vue";
import Icon from "./Icon.vue";
import {
  allLessons, cycleTheme, doSearch, filter, glossary,
  goHome, jumpToCwe, openHelp, openLesson, paletteOpen, reviewDue, setLang, showToast, startReview, theme, view,
} from "../store";
import { api } from "../api";
import type { ViewMode } from "../store";

type Row = {
  key: string;
  group: string;
  title: string;
  sub?: string;
  icon: string;
  hint?: string;
  run: () => void;
};

const q = ref("");
const cursor = ref(0);
const inputRef = ref<HTMLInputElement | null>(null);
const listRef = ref<HTMLDivElement | null>(null);

const zh = computed(() => theme.lang === "zh-CN");

function close() {
  paletteOpen.value = false;
  q.value = "";
  cursor.value = 0;
}

function goto(v: ViewMode) {
  view.value = v;
  if (v === "items") doSearch();
}

// 用函数而不是常量数组：副标题里的「N 道待复习」要跟着实时计数走
const buildActions = (): Row[] => [
  { key: "nav-home", group: "nav", title: "学习 · 全部教程", sub: "Lessons", icon: "book", run: () => goHome() },
  { key: "nav-paths", group: "nav", title: "学习路径", sub: "Paths", icon: "layers", run: () => goto("paths") },
  { key: "nav-items", group: "nav", title: "情报检索", sub: "Intel", icon: "shield", run: () => goto("items") },
  { key: "nav-dash", group: "nav", title: "数据看板", sub: "Dashboard", icon: "chart", run: () => goto("dashboard") },
  { key: "nav-wrong", group: "nav", title: "错题本 · 列表", sub: "Mistakes", icon: "alert", run: () => goto("wrong") },
  {
    key: "act-review",
    group: "action",
    title: "开始今日复习",
    sub: reviewDue.value > 0 ? `Spaced repetition · ${reviewDue.value} due` : "Spaced repetition",
    icon: "target",
    run: () => startReview(),
  },
  { key: "nav-settings", group: "nav", title: "设置", sub: "Settings", icon: "settings", run: () => goto("settings") },
  {
    key: "act-help",
    group: "action",
    title: "快捷键一览",
    sub: "Keyboard shortcuts",
    icon: "help",
    hint: "?",
    run: () => openHelp(),
  },
  {
    key: "act-theme",
    group: "action",
    title: "切换主题（浅色 / 深色 / 护眼）",
    sub: "Cycle theme",
    icon: "sun",
    run: () => cycleTheme(),
  },
  {
    key: "act-lang",
    group: "action",
    title: "切换界面语言",
    sub: "Toggle language",
    icon: "globe",
    run: () => setLang(theme.lang === "zh-CN" ? "en-US" : "zh-CN"),
  },
  {
    key: "act-export",
    group: "action",
    title: "导出笔记备忘（Markdown）",
    sub: "Export memo",
    icon: "note",
    run: async () => {
      const name = `sentrydesk-memo-${new Date().toISOString().slice(0, 10)}.md`;
      try {
        const p = await api.exportMemo(name);
        showToast((zh.value ? "已导出 → " : "Exported → ") + p);
      } catch (e) {
        showToast(String(e));
      }
    },
  },
];

/** 拼音/大小写无关的轻量匹配：优先子串，退化为子序列 */
function score(text: string, query: string): number {
  const t = text.toLowerCase();
  const s = query.toLowerCase();
  if (!s) return 1;
  const i = t.indexOf(s);
  if (i >= 0) return 120 - Math.min(i, 50) - (t.length - s.length) * 0.05;
  let ti = 0;
  for (const ch of s) {
    const n = t.indexOf(ch, ti);
    if (n < 0) return -1;
    ti = n + 1;
  }
  return 20;
}

const rows = computed<Row[]>(() => {
  const query = q.value.trim();
  const out: Row[] = [];

  const picks: { row: Row; s: number }[] = [];
  for (const a of buildActions()) {
    const s = Math.max(score(a.title, query), score(a.sub ?? "", query));
    if (s > 0) picks.push({ row: a, s: s + 8 });
  }

  for (const c of allLessons.value) {
    const label = zh.value ? c.title : c.title_en || c.title;
    const s = Math.max(score(label, query), score(c.cwe ?? "", query), score(c.category, query));
    if (s > 0) {
      picks.push({
        row: {
          key: "lesson-" + c.id,
          group: "lesson",
          title: label,
          sub: [c.cwe, zh.value ? c.category : c.category].filter(Boolean).join(" · "),
          icon: "book",
          run: () => openLesson(c.id),
        },
        s,
      });
    }
  }

  for (const g of glossary.value) {
    const s = Math.max(score(g.term, query), score(g.term_en ?? "", query));
    if (s > 0) {
      picks.push({
        row: {
          key: "gloss-" + g.term,
          group: "glossary",
          title: g.term,
          sub: g.term_en || (g.definition ?? "").slice(0, 40),
          icon: "tag",
          run: () => {
            const cwe = g.related?.[0];
            if (cwe) jumpToCwe(cwe);
            else goto("home");
          },
        },
        s: s - 30,
      });
    }
  }

  // 关键词本身作为「在情报库中搜索」的动作
  if (query) {
    picks.push({
      row: {
        key: "search-items",
        group: "search",
        title: (zh.value ? "在情报库中搜索「" : "Search intel for \"") + query + (zh.value ? "」" : "\""),
        sub: "SQLite FTS5 · 本地",
        icon: "search",
        hint: "Enter",
        run: () => {
          filter.query = query;
          filter.offset = 0;
          view.value = "items";
          doSearch();
        },
      },
      s: 60,
    });
  }

  picks.sort((a, b) => b.s - a.s);
  const seen = new Set<string>();
  for (const p of picks) {
    if (out.length >= 14) break;
    if (seen.has(p.row.key)) continue;
    seen.add(p.row.key);
    out.push(p.row);
  }
  return out;
});

/**
 * 分组只是「显示用的重排」。
 * v1.0.5 的 bug：rows 按匹配分数排序，grouped 按固定分组顺序重排，
 * 但键盘 Enter / 点击都用分组后的下标去索引按分数排序的 rows，
 * 两个下标体系不同源 —— 点「设置」实际执行的是「开始今日复习」。
 * 修复：分组的 start 不再自己累加，改为在「显示顺序」里反查真实下标。
 */
const grouped = computed(() => {
  const order: { id: string; label: string }[] = [
    { id: "search", label: zh.value ? "检索" : "Search" },
    { id: "nav", label: zh.value ? "跳转" : "Go to" },
    { id: "action", label: zh.value ? "动作" : "Actions" },
    { id: "lesson", label: zh.value ? "教学卡" : "Lessons" },
    { id: "glossary", label: zh.value ? "术语" : "Glossary" },
  ];
  const out: { label: string; rows: Row[]; idxs: number[]; offset: number }[] = [];
  let offset = 0;
  for (const g of order) {
    const idxs: number[] = [];
    rows.value.forEach((r, i) => {
      if (r.group === g.id) idxs.push(i);
    });
    if (!idxs.length) continue;
    out.push({ label: g.label, rows: idxs.map((i) => rows.value[i]), idxs, offset });
    offset += idxs.length;
  }
  return out;
});

/** 显示顺序（分组后）的扁平下标 → rows 里的真实下标 */
const flatIdxs = computed(() => grouped.value.flatMap((g) => g.idxs));

watch(rows, () => {
  cursor.value = Math.min(cursor.value, Math.max(0, rows.value.length - 1));
});

watch(paletteOpen, async (open) => {
  if (!open) return;
  q.value = "";
  cursor.value = 0;
  await nextTick();
  inputRef.value?.focus();
});

function move(delta: number) {
  if (!rows.value.length) return;
  cursor.value = (cursor.value + delta + rows.value.length) % rows.value.length;
  nextTick(() => {
    const el = listRef.value?.querySelector<HTMLElement>(".row.active");
    el?.scrollIntoView({ block: "nearest" });
  });
}

/** i 是「显示顺序」的下标（分组重排后的位置），需映射回 rows 的真实下标 */
function runAt(i: number) {
  const real = flatIdxs.value[i];
  const r = real == null ? undefined : rows.value[real];
  if (!r) return;
  close();
  r.run();
}
</script>

<template>
  <Transition name="pal">
    <div v-if="paletteOpen" class="backdrop" @mousedown.self="close">
      <div class="palette" role="dialog" aria-modal="true">
        <div class="in-wrap">
          <Icon name="search" :size="16" class="in-ico" />
          <input
            ref="inputRef"
            v-model="q"
            class="in"
            :placeholder="zh ? '搜索教程、术语，或直接跳到某个页面…' : 'Search lessons, glossary, or jump to a page…'"
            spellcheck="false"
            @keydown.down.prevent="move(1)"
            @keydown.up.prevent="move(-1)"
            @keydown.enter.prevent="runAt(cursor)"
            @keydown.esc.prevent="close"
          />
          <span class="kbd esc-hint">Esc</span>
          <!-- 可点的关闭：鼠标用户不必记快捷键；按下时不抢走输入框焦点 -->
          <button
            type="button"
            class="icon-btn pal-close"
            :title="zh ? '关闭（Esc）' : 'Close (Esc)'"
            :aria-label="zh ? '关闭命令面板' : 'Close command palette'"
            @mousedown.prevent
            @click="close"
          >
            <Icon name="x" :size="15" />
          </button>
        </div>

        <div ref="listRef" class="list">
          <template v-for="g in grouped" :key="g.label">
            <div class="group">{{ g.label }}</div>
            <button
              v-for="(r, i) in g.rows"
              :key="r.key"
              :class="['row', { active: cursor === g.offset + i }]"
              @mouseenter="cursor = g.offset + i"
              @click="runAt(g.offset + i)"
            >
              <span class="r-ico"><Icon :name="r.icon" :size="14" /></span>
              <span class="r-main">
                <span class="r-title">{{ r.title }}</span>
                <span v-if="r.sub" class="r-sub">{{ r.sub }}</span>
              </span>
              <span v-if="r.hint" class="kbd">{{ r.hint }}</span>
              <Icon v-else name="arrow-right" :size="13" class="r-arrow" />
            </button>
          </template>

          <div v-if="!rows.length" class="none">
            {{ zh ? "没有匹配项" : "No matches" }}
          </div>
        </div>

        <footer class="foot">
          <span><span class="kbd">↑</span><span class="kbd">↓</span> {{ zh ? "选择" : "move" }}</span>
          <span><span class="kbd">↵</span> {{ zh ? "打开" : "open" }}</span>
          <span class="grow"></span>
          <span class="muted"><span class="kbd">Esc</span> {{ zh ? "关闭" : "close" }}</span>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 12vh;
  background: rgba(12, 18, 16, 0.34);
  backdrop-filter: blur(3px);
}
.palette {
  width: min(640px, calc(100vw - 64px));
  max-height: 68vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  animation: pop-in 180ms var(--ease-out);
}

.in-wrap {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0 var(--space-4);
  height: 52px;
  border-bottom: 1px solid var(--color-border);
}
.in-ico { color: var(--color-accent); }
.in {
  flex: 1;
  height: 100%;
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  font-size: var(--font-lg);
  padding: 0 !important;
}
/* Esc 提示：给键盘用户的锚点。窗口最小 1024，面板恒为 640，永远放得下 */
.esc-hint { flex-shrink: 0; }
.pal-close {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  color: var(--color-text-tertiary);
}
.pal-close:hover:not(:disabled) {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}
.pal-close:active { transform: scale(0.94); }
.pal-close:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
}

.list {
  flex: 1; overflow-y: auto; padding: var(--space-2);
  /* 底部渐隐：滚动到一半时最后一行不会被硬切 */
  mask-image: linear-gradient(to bottom, #000 calc(100% - 20px), transparent);
  -webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 20px), transparent);
}
.group {
  padding: var(--space-2) var(--space-3) var(--space-1);
  font-size: var(--font-2xs);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}
.row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  min-height: 38px;
  padding: 6px var(--space-3);
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  text-align: left;
}
.row:hover:not(:disabled) { background: var(--color-bg-hover); border-color: transparent; }
.row.active {
  background: var(--color-accent-soft);
  box-shadow: inset 2px 0 0 var(--color-accent);
}
.r-ico {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border-radius: var(--radius-xs);
  background: var(--color-bg-subtle);
  color: var(--color-text-secondary);
}
.row.active .r-ico { background: var(--color-bg-elevated); color: var(--color-accent); }
.r-main { display: flex; flex-direction: column; gap: 1px; min-width: 0; flex: 1; }
.r-title {
  font-size: var(--font-sm);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.r-sub {
  font-size: var(--font-2xs);
  color: var(--color-text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.r-arrow { color: var(--color-text-tertiary); flex-shrink: 0; }
.row.active .r-arrow { color: var(--color-accent); }

.none {
  padding: var(--space-6);
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: var(--font-sm);
}

.foot {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  height: 34px;
  padding: 0 var(--space-4);
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-subtle);
  font-size: var(--font-2xs);
  color: var(--color-text-tertiary);
}
.foot .kbd { margin-right: 3px; }
.grow { flex: 1; }
.muted { opacity: 0.8; }

.pal-enter-active, .pal-leave-active { transition: opacity 150ms var(--ease-out); }
.pal-enter-from, .pal-leave-to { opacity: 0; }
</style>
