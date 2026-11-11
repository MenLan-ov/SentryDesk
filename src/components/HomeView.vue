<script setup lang="ts">
// 首页：学习台（Hero + 分类 + 卡片墙）
import { computed } from "vue";
import Icon from "./Icon.vue";
import {
  doSearch, jumpToCwe, lessonFilter, lessonLoading, lessons, lessonStats,
  loadLessons, openLesson, overview, paths, progressOf, reviewDue, searchInput, startReview, stats, statusOf, theme, view, categoryLabel,
} from "../store";
import type { LessonCard } from "../types";

const zh = computed(() => theme.lang === "zh-CN");

const cats = computed(() => {
  const m = new Map<string, number>();
  for (const c of lessons.value ?? []) m.set(c.category, (m.get(c.category) ?? 0) + 1);
  return [...m.entries()].map(([name, count]) => ({ name, count }));
});

const levelLabel = (lv: string) =>
  zh.value
    ? { beginner: "入门", intermediate: "进阶", advanced: "深入" }[lv] ?? lv
    : { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" }[lv] ?? lv;

const kindLabel = (k: string) =>
  zh.value
    ? { cwe: "缺陷类型", lesson: "方法论", lab: "实战" }[k] ?? k
    : { cwe: "Weakness", lesson: "Method", lab: "Lab" }[k] ?? k;

async function pickCategory(cat: string | null) {
  lessonFilter.category = cat;
  await loadLessons();
}

/** 清除检索与分类筛选，回到全部教程 */
async function resetFilter() {
  lessonFilter.query = "";
  lessonFilter.category = null;
  lessonFilter.kind = null;
  lessonFilter.level = null;
  // 同步清空顶栏输入框，否则框里还留着旧关键词，用户会以为没生效
  searchInput.value = "";
  await loadLessons();
}

async function goItems() {
  view.value = "items";
  await doSearch();
}

const titleOf = (c: { title: string; title_en: string | null }) =>
  zh.value ? c.title : (c.title_en || c.title);
const summaryOf = (c: { summary: string; summary_en: string | null }) =>
  zh.value ? c.summary : (c.summary_en || c.summary);

/** 卡片角标：预计算成 Map，避免每次渲染都线性查找 */
const badgeMap = computed(() => {
  const m = new Map<string, { text: string; cls: string; label: string }>();
  for (const c of lessons.value) {
    const b = computeBadge(c.id);
    if (b) m.set(c.id, b);
  }
  return m;
});
function badge(id: string) {
  return badgeMap.value.get(id) ?? null;
}

function computeBadge(id: string): { text: string; cls: string; label: string } | null {
  const st = statusOf(id);
  const p = progressOf(id);
  if (st === "mastered") {
    return { text: "✓", cls: "b-done", label: zh.value ? "已掌握" : "Mastered" };
  }
  if (p?.quiz_score !== null && p?.quiz_score !== undefined) {
    return {
      text: String(p.quiz_score),
      cls: p.quiz_score >= 60 ? "b-ok" : "b-weak",
      label: (zh.value ? "自测得分 " : "Quiz score ") + p.quiz_score,
    };
  }
  if (st === "reading") {
    return { text: "…", cls: "b-reading", label: zh.value ? "学习中" : "In progress" };
  }
  return null;
}

// ---- 右键菜单 ----
import { openMenu, copyText, SEP } from "../composables/useContextMenu";
import { setLessonStatus } from "../store";

function onTileContext(e: MouseEvent, c: LessonCard) {
  const st = statusOf(c.id);
  openMenu(e, [
    { key: "open", label: zh.value ? "打开这张卡" : "Open card", action: () => openLesson(c.id) },
    SEP,
    {
      key: "mark-mastered",
      label: zh.value ? "标记为已掌握" : "Mark mastered",
      disabled: st === "mastered",
      action: () => setLessonStatus(c.id, "mastered"),
    },
    {
      key: "mark-reading",
      label: zh.value ? "标记为学习中" : "Mark in progress",
      disabled: st === "reading",
      action: () => setLessonStatus(c.id, "reading"),
    },
    {
      key: "mark-unread",
      label: zh.value ? "重置为未读" : "Reset to unread",
      disabled: st === "unread",
      action: () => setLessonStatus(c.id, "unread"),
    },
    SEP,
    {
      key: "copy-cwe",
      label: zh.value ? "复制 CWE 编号" : "Copy CWE",
      disabled: !c.cwe,
      action: () => copyText(c.cwe ?? "", "CWE"),
    },
    {
      key: "copy-title",
      label: zh.value ? "复制标题" : "Copy title",
      action: () => copyText(c.title, zh.value ? "标题" : "Title"),
    },
    {
      key: "to-intel",
      label: zh.value ? "看该类型的真实漏洞" : "See real findings",
      disabled: !c.cwe,
      action: () => {
        if (c.cwe) jumpToCwe(c.cwe);
      },
    },
  ]);
}

const pct = computed(() => {
  if (!overview.value || !overview.value.total_cards) return 0;
  return Math.round((overview.value.mastered_count / overview.value.total_cards) * 100);
});

// ---- 学习台（Hero） ----
const LAST_KEY = "sentrydesk:last-lesson";

const lastId = computed(() => localStorage.getItem(LAST_KEY));
const lastCard = computed(() => {
  const id = lastId.value;
  if (!id) return null;
  return lessons.value.find((c) => c.id === id) ?? null;
});

const greeting = computed(() => {
  const h = new Date().getHours();
  if (h < 6) return zh.value ? "夜深了" : "Late night";
  if (h < 12) return zh.value ? "早上好" : "Good morning";
  if (h < 18) return zh.value ? "下午好" : "Good afternoon";
  return zh.value ? "晚上好" : "Good evening";
});

function resume() {
  const c = lastCard.value ?? lessons.value[0];
  if (c) openLesson(c.id);
}

function randomCard() {
  const pool = lessons.value;
  if (!pool.length) return;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  openLesson(pick.id);
}

const totalCards = computed(() => overview.value?.total_cards ?? lessonStats.value?.total ?? 107);
const avgScore = computed(() => Math.round(overview.value?.avg_score ?? 0));
const noteCount = computed(() => overview.value?.note_count ?? 0);
</script>

<template>
  <div class="home">
    <!-- 左侧分类 -->
    <aside class="cats">
      <header class="cats-head">
        <span class="section-label">{{ zh ? "分类" : "Categories" }}</span>
        <span class="cats-n mono">{{ lessons?.length ?? 0 }}</span>
      </header>

      <button :class="['cat', { active: !lessonFilter.category }]" @click="pickCategory(null)">
        <span class="cat-name">{{ zh ? "全部教程" : "All lessons" }}</span>
        <span class="cat-n mono">{{ lessons?.length ?? 0 }}</span>
      </button>
      <button
        v-for="c in cats"
        :key="c.name"
        :class="['cat', { active: lessonFilter.category === c.name }]"
        @click="pickCategory(c.name)"
      >
        <span class="cat-name">{{ categoryLabel(c.name, zh) }}</span>
        <span class="cat-n mono">{{ c.count }}</span>
      </button>

      <div class="cats-sep"></div>

      <button class="cat entry" @click="view = 'paths'">
        <Icon name="layers" :size="13" class="entry-ico" />
        <span class="cat-name">{{ zh ? "学习路径" : "Learning paths" }}</span>
        <span class="cat-n mono">{{ paths?.length ?? 0 }}</span>
      </button>
      <button class="cat entry" @click="goItems">
        <Icon name="shield" :size="13" class="entry-ico" />
        <span class="cat-name">{{ zh ? "情报检索" : "Intel search" }}</span>
        <span class="cat-n mono">{{ stats?.total ?? 0 }}</span>
      </button>

      <!-- 学习总览 -->
      <div v-if="overview" class="ov">
        <div class="ov-top">
          <span class="ov-k">{{ zh ? "掌握进度" : "Mastered" }}</span>
          <span class="ov-v mono">{{ pct }}%</span>
        </div>
        <div class="ov-bar"><div class="ov-fill" :style="{ width: pct + '%' }"></div></div>
        <div class="ov-sub">
          {{ overview.mastered_count }} / {{ overview.total_cards }}
          {{ zh ? "张已掌握" : "cards" }}
        </div>
      </div>
    </aside>

    <!-- 主内容 -->
    <main class="wall">
      <!-- 学习台 -->
      <section class="hero">
        <div class="hero-main">
          <span class="kicker">
            <span class="k-dot"></span>{{ greeting }} · {{ zh ? "学习台" : "Study desk" }}
          </span>
          <h1 class="hero-title">
            {{ zh ? "把漏洞看懂，而不只是知道名字" : "Understand the flaw, not just its name" }}
          </h1>
          <p class="hero-sub">
            {{ totalCards }} {{ zh ? "张中英双语卡片 · 329 道自测 · 91 条术语" : "bilingual cards · 329 quizzes · 91 terms" }}
          </p>
          <div class="hero-actions">
            <button class="primary" @click="resume()">
              <Icon :name="lastCard ? 'arrow-right' : 'book'" :size="13" />
              {{ lastCard
                ? (zh ? "继续：" : "Resume: ") + titleOf(lastCard)
                : (zh ? "从第一张开始" : "Start with the first") }}
            </button>
            <button @click="randomCard()">
              <Icon name="sparkles" :size="13" />{{ zh ? "随机一张" : "Random" }}
            </button>
          </div>
        </div>

        <div class="hero-stats">
          <div class="hs">
            <span class="hs-n mono">{{ overview?.mastered_count ?? 0 }}</span>
            <span class="hs-k">{{ zh ? "已掌握" : "Mastered" }}</span>
          </div>
          <div class="hs">
            <span class="hs-n mono">{{ avgScore }}</span>
            <span class="hs-k">{{ zh ? "自测均分" : "Avg score" }}</span>
          </div>
          <div class="hs">
            <span class="hs-n mono">{{ noteCount }}</span>
            <span class="hs-k">{{ zh ? "笔记" : "Notes" }}</span>
          </div>
          <!-- 待复习：有到期题时变成可点入口，没到期就不占视觉 -->
          <button v-if="reviewDue > 0" class="hs hs-btn" @click="startReview()">
            <span class="hs-n mono due">{{ reviewDue }}</span>
            <span class="hs-k">{{ zh ? "待复习 · 开始" : "Due · start" }}</span>
          </button>
        </div>
      </section>

      <header class="wall-head">
        <h2 class="wall-title">
          {{ lessonFilter.category ? categoryLabel(lessonFilter.category, zh) : (zh ? "全部教程" : "All lessons") }}
        </h2>
        <span class="wall-sub">
          {{ lessons?.length ?? 0 }}
          {{ lessonFilter.query
            ? (zh ? `个匹配「${lessonFilter.query}」` : `matching "${lessonFilter.query}"`)
            : (zh ? "个主题" : "topics") }}
        </span>
        <span class="grow"></span>
        <button v-if="lessonFilter.query || lessonFilter.category" class="reset" @click="resetFilter()">
          <Icon name="x" :size="11" />{{ zh ? "清除筛选" : "Clear" }}
        </button>
      </header>

      <div v-if="lessonLoading" class="grid">
        <div v-for="i in 9" :key="i" class="tile sk">
          <div class="skeleton" style="height: 34px; width: 34px; border-radius: 8px"></div>
          <div class="sk-lines">
            <div class="skeleton" style="height: 11px; width: 78%"></div>
            <div class="skeleton" style="height: 9px; width: 96%"></div>
            <div class="skeleton" style="height: 9px; width: 64%"></div>
          </div>
        </div>
      </div>

      <!-- 空结果提示 -->
      <div v-else-if="!lessons.length" class="empty">
        <div class="empty-ico"><Icon name="search" :size="20" /></div>
        <p class="empty-title">
          {{ lessonFilter.query
            ? (zh ? "没有匹配的教程" : "No lessons match")
            : (zh ? "该分类下暂无教程" : "No lessons in this category") }}
        </p>
        <p class="empty-hint">
          {{ lessonFilter.query
            ? (zh ? `关键词「${lessonFilter.query}」没有命中任何主题` : `"${lessonFilter.query}" matched no topics`)
            : (zh ? "换一个分类试试" : "Try another category") }}
        </p>
        <button class="empty-btn" @click="resetFilter()">
          {{ zh ? "清除筛选" : "Clear filters" }}
        </button>
      </div>

      <div v-else class="grid">
        <button
          v-for="c in lessons"
          :key="c.id"
          class="tile"
          data-ctx="tile"
          @click="openLesson(c.id)"
          @contextmenu="onTileContext($event, c)"
        >
          <div class="tile-top">
            <span :class="['tile-icon', 'ic-' + c.color]">{{ c.icon }}</span>
            <span class="tile-title">{{ titleOf(c) }}</span>
            <span
              v-if="badge(c.id)"
              :class="['badge', badge(c.id)!.cls]"
              :aria-label="badge(c.id)!.label"
              role="img"
            >{{ badge(c.id)!.text }}</span>
          </div>
          <p class="tile-desc">{{ summaryOf(c) }}</p>
          <div class="tile-foot">
            <span class="kind">{{ kindLabel(c.kind) }}</span>
            <span class="lvl">{{ levelLabel(c.level) }}</span>
            <span v-if="c.cwe" class="cwe mono">{{ c.cwe }}</span>
            <span v-if="c.quiz?.length" class="quiz-n mono">{{ c.quiz.length }}{{ zh ? " 题" : "Q" }}</span>
            <Icon name="arrow-right" :size="13" class="arrow" />
          </div>
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.home { flex: 1; display: flex; min-height: 0; background: var(--color-bg-base); }

/* ---------- 分类 ---------- */
.cats {
  width: 216px;
  flex-shrink: 0;
  padding: var(--space-4) var(--space-3);
  border-right: 1px solid var(--color-border);
  background: var(--color-bg-elevated);
  overflow-y: auto;
}
.cats-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-2) var(--space-3);
}
.cats-n { font-size: var(--font-2xs); color: var(--color-text-tertiary); }
.cat {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  height: 30px;
  padding: 0 var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  text-align: left;
}
.cat:hover:not(:disabled) { background: var(--color-bg-hover); border-color: transparent; color: var(--color-text-primary); }
.cat.active {
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-weight: 600;
}
.cat-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cat-n { font-size: var(--font-2xs); color: var(--color-text-tertiary); }
.cat.active .cat-n { color: var(--color-accent); }
.cats-sep { height: 1px; background: var(--color-border); margin: var(--space-3) var(--space-2); }
.entry { color: var(--color-text-primary); font-weight: 500; }
.entry-ico { color: var(--color-text-tertiary); }

.ov {
  margin: var(--space-4) var(--space-2) 0;
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-subtle);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ov-top { display: flex; align-items: baseline; justify-content: space-between; }
.ov-k { font-size: var(--font-2xs); color: var(--color-text-tertiary); }
.ov-v { font-size: var(--font-sm); font-weight: 700; color: var(--color-accent); }
.ov-bar { height: 4px; background: var(--color-bg-active); border-radius: var(--radius-full); overflow: hidden; }
.ov-fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: var(--radius-full);
  transition: width var(--duration-slow) var(--ease-out);
}
.ov-sub { font-size: var(--font-2xs); color: var(--color-text-tertiary); }

/* ---------- 主区 ---------- */
.wall { flex: 1; min-width: 0; overflow-y: auto; overflow-x: hidden; padding: var(--space-4) var(--space-5) var(--space-6); }

.hero {
  display: flex;
  align-items: flex-end;
  gap: var(--space-5);
  padding: var(--space-4) var(--space-5);
  margin-bottom: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background:
    radial-gradient(120% 140% at 100% 0%, var(--color-accent-soft) 0%, transparent 55%),
    var(--color-bg-elevated);
  box-shadow: var(--shadow-xs);
}
.hero-main { flex: 1; min-width: 0; }
.kicker {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-2xs);
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
}
.k-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--color-accent); }
.hero-title {
  margin: 6px 0 4px;
  font-size: var(--font-2xl);
  font-weight: 650;
  letter-spacing: -0.025em;
  color: var(--color-text-primary);
  line-height: 1.3;
}
.hero-sub { margin: 0; font-size: var(--font-xs); color: var(--color-text-tertiary); }
.hero-actions { display: flex; gap: var(--space-2); margin-top: var(--space-3); }
.hero-actions button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  max-width: 340px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hero-stats {
  display: flex;
  gap: var(--space-4);
  padding: 0 var(--space-1) 2px;
  flex-shrink: 0;
}
.hs { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; }
.hs-n { font-size: var(--font-xl); font-weight: 700; color: var(--color-text-primary); letter-spacing: -0.03em; }
.hs-k { font-size: var(--font-2xs); color: var(--color-text-tertiary); }
.hs-btn {
  padding: 2px 8px;
  border: 1px solid var(--color-accent-line);
  border-radius: var(--radius-sm);
  background: var(--color-accent-soft);
}
.hs-btn:hover:not(:disabled) { background: var(--color-accent); border-color: var(--color-accent); }
.hs-btn:hover:not(:disabled) .hs-n, .hs-btn:hover:not(:disabled) .hs-k { color: #fff; }
.hs .due { color: var(--color-accent); }

.wall-head { display: flex; align-items: center; gap: var(--space-2); margin: 0 0 var(--space-3); padding: 0 2px; }
.wall-title { margin: 0; font-size: var(--font-lg); font-weight: 650; color: var(--color-text-primary); }
.wall-sub { font-size: var(--font-2xs); color: var(--color-text-tertiary); }
.grow { flex: 1; }
.reset {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 22px;
  padding: 0 8px;
  font-size: var(--font-2xs);
  color: var(--color-text-secondary);
  background: var(--color-bg-subtle);
  border-color: transparent;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 300px;
  padding: var(--space-6);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
  background: var(--color-bg-elevated);
}
.empty-ico {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin-bottom: var(--space-2);
  border-radius: var(--radius-md);
  background: var(--color-bg-subtle);
  color: var(--color-text-tertiary);
}
.empty-title { margin: 0; font-size: var(--font-md); font-weight: 600; color: var(--color-text-secondary); }
.empty-hint { margin: 0; font-size: var(--font-xs); color: var(--color-text-tertiary); }
.empty-btn {
  margin-top: var(--space-3);
  padding: 5px 14px;
  font-size: var(--font-xs);
  color: var(--color-accent);
  background: var(--color-accent-soft);
  border-color: var(--color-accent-line);
}

.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(268px, 1fr)); gap: var(--space-3); }

.tile {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-elevated);
  text-align: left;
  align-self: start;
  box-shadow: var(--shadow-xs);
}
.tile:hover:not(:disabled) {
  border-color: var(--color-accent-line);
  background: var(--color-bg-elevated);
  box-shadow: var(--shadow-sm);
  transform: translateY(-2px);
}
.tile.sk { pointer-events: none; }
.sk-lines { display: flex; flex-direction: column; gap: 6px; flex: 1; }

.tile-top { display: flex; align-items: flex-start; gap: 9px; }
.tile-icon {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #fff;
}
.tile-title {
  flex: 1;
  font-size: var(--font-sm);
  font-weight: 650;
  color: var(--color-text-primary);
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.badge {
  font-size: 9.5px;
  font-weight: 700;
  padding: 0 5px;
  border-radius: var(--radius-xs);
  line-height: 16px;
  flex-shrink: 0;
}
.b-done { background: var(--color-accent-soft); color: var(--color-accent); }
.b-ok { background: var(--color-ok-soft); color: var(--color-sev-low); }
.b-weak { background: var(--color-critical-soft); color: var(--color-sev-critical); }
.b-reading { background: var(--color-bg-subtle); color: var(--color-text-tertiary); }

.tile-desc {
  margin: 0;
  font-size: var(--font-xs);
  color: var(--color-text-tertiary);
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.6em;
}
.tile-foot {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-2xs);
  color: var(--color-text-tertiary);
  margin-top: 2px;
}
.kind { color: var(--color-text-secondary); }
.lvl { padding: 0 4px; border: 1px solid var(--color-border); border-radius: var(--radius-xs); line-height: 15px; }
.cwe { color: var(--color-accent); }
.quiz-n { opacity: 0.9; }
.arrow { margin-left: auto; transition: transform var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out); }
.tile:hover .arrow { transform: translateX(2px); color: var(--color-accent); }

/* 卡片图标配色：统一降低饱和度，避免糖果色 */
.ic-injection { background: #c25a4e; }
.ic-access { background: #c2803a; }
.ic-auth { background: #4f74c2; }
.ic-memory { background: #7f5bc0; }
.ic-deser { background: #b74e77; }
.ic-input { background: #3f8f8c; }
.ic-web { background: #3c7fbf; }
.ic-parse { background: #96703c; }
.ic-file { background: #628145; }
.ic-secret { background: #a8504a; }
.ic-concurrency { background: #6f72c0; }
.ic-numeric { background: #478484; }
.ic-dos { background: #8c6239; }
.ic-leak { background: #8a8a46; }
.ic-crypto { background: #5656a8; }
.ic-lang { background: #a37c3c; }
.ic-assess { background: #3f8f6a; }
.ic-process { background: #567f56; }
.ic-source { background: #417f9e; }
.ic-harden { background: #567f56; }
.ic-audit { background: #a3723c; }
.ic-audit2 { background: #a3723c; }
.ic-test { background: #417f9e; }
.ic-check { background: #417f9e; }
.ic-check2 { background: #417f9e; }
.ic-method { background: #3f8f6a; }
.ic-ir { background: #b0473a; }
</style>
