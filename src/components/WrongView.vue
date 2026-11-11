<script setup lang="ts">
// 错题本：自测答错的题集中复习
import { computed, onMounted, ref } from "vue";
import type { WrongAnswer } from "../types";
import { api, errMsg } from "../api";
import { allLessons, loadLessons, openLesson, refreshWrongCount, reviewDue, showToast, theme, wrongMode } from "../store";
import ReviewSession from "./ReviewSession.vue";

const zh = computed(() => theme.lang === "zh-CN");
const list = ref<WrongAnswer[]>([]);
const loading = ref(true);
const showReviewed = ref(false);
/** 列表 / 今日复习（v0.8.1：错题本升级成带排期的复习队列）。
 * 状态放 store：首页磁贴、命令面板都能直接跳到复习模式 */
const mode = wrongMode;

async function load() {
  loading.value = true;
  try {
    list.value = await api.listWrongAnswers(showReviewed.value);
  } catch (e) {
    showToast(errMsg(e), "err");
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  // 错题本依赖知识库按语言取题干，先保证已加载
  if (!allLessons.value.length) {
    try {
      await loadLessons();
    } catch {
      /* 加载失败时回退到存储的中文快照 */
    }
  }
  await load();
});

async function markDone(w: WrongAnswer) {
  try {
    await api.markWrongReviewed(w.lesson_id, w.quiz_index);
    // 重新拉列表，同时刷新顶栏徽标
    await Promise.all([load(), refreshWrongCount()]);
  } catch (e) {
    showToast(errMsg(e), "err");
  }
}

const pending = computed(() => list.value.filter((x) => !x.reviewed).length);
const letter = (i: number) => String.fromCharCode(65 + i);

/** 知识库索引：按 lesson_id 取卡片，再按 quiz_index 取题目 */
const lessonMap = computed(() => {
  const m = new Map<string, typeof allLessons.value[number]>();
  for (const c of allLessons.value) m.set(c.id, c);
  return m;
});

/** 按当前语言取题干；取不到时回退到存储的中文快照 */
function questionOf(w: WrongAnswer): string {
  const card = lessonMap.value.get(w.lesson_id);
  const q = card?.quiz?.[w.quiz_index];
  if (!q) return w.question;
  return zh.value ? q.q : (q.q_en ?? q.q);
}

/** 按当前语言取解析 */
function explainOf(w: WrongAnswer): string | null {
  const card = lessonMap.value.get(w.lesson_id);
  const q = card?.quiz?.[w.quiz_index];
  if (!q) return w.explain;
  return zh.value ? q.explain : (q.explain_en ?? q.explain);
}

/** 按当前语言取选项文本（错题本要显示你选了哪个） */
function optionOf(w: WrongAnswer, idx: number): string {
  const card = lessonMap.value.get(w.lesson_id);
  const q = card?.quiz?.[w.quiz_index];
  if (!q) return letter(idx);
  const opts = zh.value ? q.options : (q.options_en ?? q.options);
  return opts[idx] ?? letter(idx);
}
</script>

<template>
  <div class="wrong">
    <header class="wh">
      <div>
        <h1 class="wh-title">{{ zh ? '错题本' : 'Mistakes' }}</h1>
        <p class="wh-sub">
          {{ mode === 'review'
            ? (zh
              ? '按间隔重复排期：到期的题今天过一遍，答对几次后间隔自然拉长。'
              : 'Spaced repetition: due items surface today, and intervals grow as you get them right.')
            : (zh
              ? '自测答错的题会自动收进这里。搞懂一题，划掉一题。'
              : 'Wrong answers are collected here automatically. Clear them one by one.') }}
        </p>
      </div>
      <div class="wh-actions">
        <div class="seg">
          <button :class="{ on: mode === 'list' }" @click="mode = 'list'">
            {{ zh ? '列表' : 'List' }}
          </button>
          <button :class="{ on: mode === 'review' }" @click="mode = 'review'">
            {{ zh ? '今日复习' : 'Review' }}
            <span v-if="reviewDue > 0" class="seg-badge mono">{{ reviewDue }}</span>
          </button>
        </div>
        <template v-if="mode === 'list'">
          <label class="chk">
            <input type="checkbox" v-model="showReviewed" @change="load" />
            <span>{{ zh ? '显示已复习' : 'Show cleared' }}</span>
          </label>
          <span class="badge mono">{{ pending }}</span>
        </template>
      </div>
    </header>

    <ReviewSession v-if="mode === 'review'" />

    <template v-else>

    <div v-if="loading" class="skeleton" style="height: 200px"></div>

    <div v-else-if="list.length === 0" class="empty">
      <p class="e-t">{{ zh ? '没有待复习的错题' : 'No mistakes to review' }}</p>
      <p class="e-h">
        {{ zh
          ? '去做几张教学卡的自测，答错的题会自动出现在这里。'
          : 'Take a few quizzes; wrong answers will show up here.' }}
      </p>
    </div>

    <div v-else class="list">
      <article v-for="w in list" :key="w.id" :class="['wa', { done: w.reviewed }]">
        <header class="wa-head">
          <span class="wa-q">{{ questionOf(w) }}</span>
          <span v-if="w.wrong_times > 1" class="wa-times mono">×{{ w.wrong_times }}</span>
        </header>

        <div class="wa-opts">
          <div class="wa-opt wrong">
            <span class="wa-l mono">{{ letter(w.chosen) }}</span>
            <span class="wa-t">{{ optionOf(w, w.chosen) }}</span>
          </div>
          <div class="wa-opt right">
            <span class="wa-l mono">{{ letter(w.correct) }}</span>
            <span class="wa-t">{{ optionOf(w, w.correct) }}</span>
          </div>
        </div>

        <p v-if="explainOf(w)" class="wa-explain">{{ explainOf(w) }}</p>

        <footer class="wa-foot">
          <button class="link" @click="openLesson(w.lesson_id)">
            {{ zh ? '回到这张卡' : 'Open the card' }} →
          </button>
          <button v-if="!w.reviewed" @click="markDone(w)">
            {{ zh ? '我懂了' : 'Got it' }}
          </button>
          <span v-else class="wa-done">✓ {{ zh ? '已复习' : 'Cleared' }}</span>
        </footer>
      </article>
    </div>
    </template>
  </div>
</template>

<style scoped>
.wrong { flex: 1; overflow-y: auto; background: var(--color-bg-elevated); padding: var(--space-6) var(--space-6) var(--space-7); }
.wh { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-4); margin-bottom: var(--space-5); }
.wh-title { margin: 0 0 2px; font-size: 21px; font-weight: 650; color: var(--color-text-primary); letter-spacing: -0.02em; }
.wh-sub { margin: 0; font-size: var(--font-xs); color: var(--color-text-tertiary); }
.wh-actions { display: flex; align-items: center; gap: var(--space-3); }
.chk { display: flex; align-items: center; gap: 6px; font-size: var(--font-xs); color: var(--color-text-secondary); cursor: pointer; }
.chk input { width: auto; }
.seg {
  display: inline-flex;
  padding: 2px;
  gap: 2px;
  border-radius: var(--radius-sm);
  background: var(--color-bg-subtle);
}
.seg button {
  display: inline-flex; align-items: center; gap: 5px;
  height: 24px; padding: 0 10px;
  font-size: var(--font-2xs); font-weight: 500;
  color: var(--color-text-secondary);
  background: transparent; border: 1px solid transparent;
  border-radius: var(--radius-xs);
}
.seg button:hover:not(:disabled) { background: transparent; color: var(--color-text-primary); }
.seg button.on {
  background: var(--color-bg-elevated);
  border-color: var(--color-border);
  color: var(--color-text-primary);
  font-weight: 600;
  box-shadow: var(--shadow-xs);
}
.seg-badge {
  font-size: 9px; font-weight: 700;
  padding: 0 5px; border-radius: var(--radius-full);
  background: var(--color-accent); color: #fff;
}

.badge {
  font-size: var(--font-sm); font-weight: 700;
  padding: 2px 10px; border-radius: 12px;
  background: #fde0dd; color: #c0392b;
}

.list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-4); max-width: 1100px; }
@media (max-width: 1000px) { .list { grid-template-columns: 1fr; } }

.wa {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  display: flex; flex-direction: column; gap: var(--space-2);
}
.wa.done { opacity: 0.6; }
.wa-head { display: flex; gap: var(--space-2); align-items: flex-start; }
.wa-q { flex: 1; font-size: var(--font-sm); line-height: 1.7; color: var(--color-text-primary); }
.wa-times { font-size: 10px; color: #c0392b; flex-shrink: 0; }
.wa-zh { font-size: 9px; padding: 0 4px; border-radius: 3px; background: var(--color-bg-subtle); color: var(--color-text-tertiary); flex-shrink: 0; }

.wa-opts { display: flex; gap: var(--space-2); }
.wa-opt { display: flex; align-items: center; gap: 5px; padding: 3px 8px; border-radius: var(--radius-sm); font-size: 11px; }
.wa-opt.wrong { background: #fdf1f0; color: #c0392b; border: 1px solid #f5c6c0; }
.wa-opt.right { background: var(--color-accent-soft); color: var(--color-accent); border: 1px solid var(--color-accent-line); }
.wa-l { font-weight: 700; }
.wa-t { color: inherit; opacity: 0.8; }

.wa-explain {
  margin: 0;
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
  line-height: 1.7;
  color: var(--color-text-secondary);
}

.wa-foot { display: flex; align-items: center; gap: var(--space-2); margin-top: auto; }
.link { border: none; background: transparent; padding: 0; font-size: var(--font-xs); color: var(--color-accent); }
.link:hover { background: transparent; text-decoration: underline; }
.wa-foot button:last-child { margin-left: auto; font-size: var(--font-xs); }
.wa-done { margin-left: auto; font-size: var(--font-xs); color: var(--color-sev-low); }

.empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px var(--space-6); text-align: center; gap: var(--space-2); }
.e-t { margin: 0; font-size: var(--font-lg); color: var(--color-text-secondary); }
.e-h { margin: 0; font-size: var(--font-sm); color: var(--color-text-tertiary); max-width: 380px; line-height: 1.7; }
</style>
