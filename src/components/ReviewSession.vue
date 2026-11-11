<script setup lang="ts">
// 今日复习（v0.8.1）：把错题按间隔重复的节奏一张张过。
//
// 交互刻意做成「先答、再评分」：
//   1. 点选项 → 立即判定对错并给解析（保留答错的记忆冲击）
//   2. 再点「忘记了 / 有点印象 / 记住了」→ 决定下次什么时候再见到它
// 两步分开是必要的：只答对不等于记住了，评分交给用户自己判断。
import { computed, onMounted, onUnmounted, ref } from "vue";
import Icon from "./Icon.vue";
import type { ReviewItem } from "../types";
import { api, errMsg } from "../api";
import {
  allLessons, loadLessons, openLesson, refreshWrongCount, showToast, theme,
} from "../store";

const zh = computed(() => theme.lang === "zh-CN");

const queue = ref<ReviewItem[]>([]);
const idx = ref(0);
const loading = ref(true);
const picked = ref<number | null>(null);
const graded = ref(false);
const nextHint = ref("");
const tally = ref({ again: 0, hard: 0, good: 0 });

const current = computed<ReviewItem | null>(() => queue.value[idx.value] ?? null);
const total = computed(() => queue.value.length);
const done = computed(() => idx.value);
const pct = computed(() => (total.value ? Math.round((idx.value / total.value) * 100) : 0));

const lessonMap = computed(() => {
  const m = new Map<string, (typeof allLessons.value)[number]>();
  for (const c of allLessons.value) m.set(c.id, c);
  return m;
});

const card = computed(() => (current.value ? lessonMap.value.get(current.value.lesson_id) : undefined));
const quiz = computed(() => (current.value ? card.value?.quiz?.[current.value.quiz_index] : undefined));

/** 当前语言的题干 / 选项 / 解析，取不到就回退到入库时的中文快照 */
const questionText = computed(() =>
  quiz.value ? (zh.value ? quiz.value.q : (quiz.value.q_en ?? quiz.value.q)) : (current.value?.question ?? ""),
);
const options = computed<string[]>(() => {
  const q = quiz.value;
  if (!q) return [];
  return (zh.value ? q.options : (q.options_en ?? q.options)) ?? [];
});
const explainText = computed(() => {
  const q = quiz.value;
  if (!q) return current.value?.explain ?? "";
  return (zh.value ? q.explain : (q.explain_en ?? q.explain)) ?? "";
});

const letter = (i: number) => String.fromCharCode(65 + i);
const isPicked = (i: number) => picked.value === i;
const isCorrect = (i: number) => current.value?.correct === i;

async function load() {
  loading.value = true;
  try {
    if (!allLessons.value.length) await loadLessons().catch(() => {});
    queue.value = await api.reviewQueue(80);
    idx.value = 0;
    picked.value = null;
    graded.value = false;
    nextHint.value = "";
  } catch (e) {
    showToast(errMsg(e), "err");
  } finally {
    loading.value = false;
  }
}

onMounted(load);

function pick(i: number) {
  if (picked.value !== null || !current.value) return;
  picked.value = i;
}

async function grade(g: 0 | 1 | 2) {
  const it = current.value;
  if (!it || picked.value === null || graded.value) return;
  graded.value = true;
  try {
    const st = await api.reviewGrade(it.id, g);
    if (g === 0) tally.value.again++;
    else if (g === 1) tally.value.hard++;
    else tally.value.good++;
    nextHint.value = dueLabel(st.due_in_minutes, st.interval_days);
    await refreshWrongCount();
    // 让用户看到「下次 …」再翻页，避免点完就跳走不知道点了什么
    window.setTimeout(next, 620);
  } catch (e) {
    graded.value = false;
    showToast(errMsg(e), "err");
  }
}

function dueLabel(minutes: number, days: number): string {
  if (minutes < 60) return zh.value ? `${minutes} 分钟后` : `in ${minutes} min`;
  if (days <= 1) return zh.value ? "明天" : "tomorrow";
  return zh.value ? `${days} 天后` : `in ${days} days`;
}

function next() {
  if (idx.value < queue.value.length) {
    picked.value = null;
    graded.value = false;
    nextHint.value = "";
    idx.value = Math.min(idx.value + 1, queue.value.length);
  }
}

/** 键盘：1–4 选选项，评分阶段 1/2/3 打分，Enter 跳过 */
function onKey(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement | null)?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;
  const it = current.value;
  if (!it) return;
  const n = Number(e.key);
  if (!Number.isFinite(n)) return;
  if (picked.value === null) {
    if (n >= 1 && n <= options.value.length) {
      e.preventDefault();
      pick(n - 1);
    }
  } else if (!graded.value && n >= 1 && n <= 3) {
    e.preventDefault();
    grade((n - 1) as 0 | 1 | 2);
  }
}
window.addEventListener("keydown", onKey);
onUnmounted(() => window.removeEventListener("keydown", onKey));

const finished = computed(() => !loading.value && (total.value === 0 || idx.value >= total.value));
</script>

<template>
  <div class="rv">
    <!-- 顶部进度 -->
    <header class="rv-head">
      <div class="rv-title-wrap">
        <h2 class="rv-title">{{ zh ? '今日复习' : 'Today’s review' }}</h2>
        <p class="rv-sub">
          {{ zh
            ? '按间隔重复排期：答对了隔几天再问，答错了十分钟后重来。'
            : 'Spaced repetition: right answers come back in days, wrong ones in ten minutes.' }}
        </p>
      </div>
      <div class="rv-meta">
        <span v-if="total" class="rv-count mono">{{ Math.min(done + 1, total) }} / {{ total }}</span>
        <button class="ghost" @click="load" :title="zh ? '重新载入队列' : 'Reload queue'">
          {{ zh ? '刷新' : 'Reload' }}
        </button>
      </div>
    </header>
    <div v-if="total" class="rv-bar"><div class="rv-fill" :style="{ width: pct + '%' }"></div></div>

    <div v-if="loading" class="skeleton" style="height: 240px"></div>

    <!-- 队列清空 / 本来就没有 -->
    <div v-else-if="finished" class="done-box">
      <div class="done-ico"><Icon :name="'check'" :size="26" /></div>
      <p class="done-t">{{ zh ? '这一轮复习完了' : 'Round complete' }}</p>
      <p class="done-h">
        {{ tally.again + tally.hard + tally.good > 0
          ? (zh
            ? `答了 ${tally.again + tally.hard + tally.good} 题：忘记 ${tally.again} · 有点印象 ${tally.hard} · 记住了 ${tally.good}。到期的题会在下次打开时自动回来。`
            : `${tally.again + tally.hard + tally.good} reviewed: ${tally.again} forgot, ${tally.hard} shaky, ${tally.good} solid. Due items come back automatically.`)
          : (zh
            ? '今天没有到期的题。做几张教学卡的自测，答错的题会自动排进复习队列。'
            : 'Nothing due today. Take a quiz; wrong answers enter the review queue automatically.') }}
      </p>
      <button class="ghost" @click="load">{{ zh ? '再检查一次' : 'Check again' }}</button>
    </div>

    <!-- 题目卡 -->
    <article v-else-if="current" class="qv">
      <div class="qv-top">
        <span class="qv-src">{{ card?.title ?? current.lesson_id }}</span>
        <span v-if="current.overdue_days > 0" class="qv-late mono">
          {{ zh ? `逾期 ${current.overdue_days} 天` : `${current.overdue_days}d late` }}
        </span>
        <span v-if="current.wrong_times > 1" class="qv-times mono">×{{ current.wrong_times }}</span>
        <span v-if="current.reps > 0" class="qv-reps mono">
          {{ zh ? `第 ${current.reps + 1} 次` : `rep ${current.reps + 1}` }}
        </span>
      </div>

      <p class="qv-q">{{ questionText }}</p>

      <div class="qv-opts">
        <button
          v-for="(o, i) in options"
          :key="i"
          :class="[
            'opt',
            {
              picked: isPicked(i),
              right: picked !== null && isCorrect(i),
              wrong: picked !== null && isPicked(i) && !isCorrect(i),
              dim: picked !== null && !isPicked(i) && !isCorrect(i),
            },
          ]"
          :disabled="picked !== null"
          @click="pick(i)"
        >
          <span class="opt-l mono">{{ letter(i) }}</span>
          <span class="opt-t">{{ o }}</span>
          <span v-if="picked !== null && isCorrect(i)" class="opt-flag ok">✓</span>
          <span v-else-if="picked !== null && isPicked(i)" class="opt-flag no">✕</span>
        </button>
      </div>

      <div v-if="picked !== null" class="qv-after">
        <p v-if="explainText" class="qv-explain">{{ explainText }}</p>
        <div class="qv-grades">
          <button class="g g-again" :disabled="graded" @click="grade(0)">
            {{ zh ? '忘记了' : 'Forgot' }}<span class="g-k mono">1</span>
          </button>
          <button class="g g-hard" :disabled="graded" @click="grade(1)">
            {{ zh ? '有点印象' : 'Shaky' }}<span class="g-k mono">2</span>
          </button>
          <button class="g g-good" :disabled="graded" @click="grade(2)">
            {{ zh ? '记住了' : 'Got it' }}<span class="g-k mono">3</span>
          </button>
        </div>
        <p class="qv-next">
          <span v-if="nextHint">{{ zh ? '下次：' : 'Next: ' }}{{ nextHint }}</span>
          <button class="link" @click="openLesson(current.lesson_id)">
            {{ zh ? '看整张卡' : 'Open the card' }} →
          </button>
        </p>
      </div>
      <p v-else class="qv-tip">
        {{ zh ? '选一个答案（也可以按 1–4）' : 'Pick an answer (or press 1–4)' }}
      </p>
    </article>
  </div>
</template>

<style scoped>
.rv { max-width: 760px; margin: 0 auto; padding: var(--space-5) 0 var(--space-7); }
.rv-head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-4); }
.rv-title { margin: 0 0 3px; font-size: 18px; font-weight: 650; color: var(--color-text-primary); letter-spacing: -0.02em; }
.rv-sub { margin: 0; font-size: var(--font-xs); line-height: 1.6; color: var(--color-text-tertiary); }
.rv-meta { display: flex; align-items: center; gap: var(--space-3); }
.rv-count { font-size: var(--font-xs); color: var(--color-text-tertiary); }
.ghost {
  height: 26px; padding: 0 10px; font-size: var(--font-2xs);
  border-radius: var(--radius-sm); border: 1px solid var(--color-border);
  background: var(--color-bg-elevated); color: var(--color-text-secondary);
}
.ghost:hover:not(:disabled) { background: var(--color-bg-hover); color: var(--color-text-primary); }

.rv-bar { height: 3px; margin: var(--space-3) 0 var(--space-4); border-radius: var(--radius-full); background: var(--color-bg-active); overflow: hidden; }
.rv-fill { height: 100%; background: var(--color-accent); transition: width var(--duration-slow) var(--ease-out); }

.qv {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-elevated);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
  display: flex; flex-direction: column; gap: var(--space-4);
}
.qv-top { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; }
.qv-src { font-size: var(--font-2xs); color: var(--color-accent); background: var(--color-accent-soft); padding: 2px 8px; border-radius: var(--radius-full); }
.qv-late { font-size: 10px; color: #b45309; background: #fef3c7; padding: 2px 6px; border-radius: var(--radius-xs); }
.qv-times { font-size: 10px; color: #c0392b; }
.qv-reps { font-size: 10px; color: var(--color-text-tertiary); margin-left: auto; }

.qv-q { margin: 0; font-size: var(--font-lg); line-height: 1.75; color: var(--color-text-primary); }

.qv-opts { display: flex; flex-direction: column; gap: var(--space-2); }
.opt {
  display: flex; align-items: center; gap: var(--space-3);
  width: 100%; padding: 10px var(--space-3);
  text-align: left; font-size: var(--font-sm); line-height: 1.6;
  color: var(--color-text-secondary);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: background var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out);
}
.opt:hover:not(:disabled) { background: var(--color-bg-hover); border-color: var(--color-border-strong); color: var(--color-text-primary); }
.opt:disabled { cursor: default; }
.opt-l {
  width: 20px; height: 20px; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700;
  border-radius: var(--radius-xs);
  background: var(--color-bg-subtle); color: var(--color-text-tertiary);
}
.opt-t { flex: 1; }
.opt-flag { flex-shrink: 0; font-weight: 700; }
.opt-flag.ok { color: var(--color-sev-low); }
.opt-flag.no { color: #c0392b; }
.opt.right { background: var(--color-accent-soft); border-color: var(--color-accent-line); color: var(--color-accent); }
.opt.right .opt-l { background: var(--color-accent); color: #fff; }
.opt.wrong { background: #fdf1f0; border-color: #f5c6c0; color: #c0392b; }
.opt.wrong .opt-l { background: #c0392b; color: #fff; }
.opt.dim { opacity: 0.5; }

.qv-after { display: flex; flex-direction: column; gap: var(--space-3); }
.qv-explain {
  margin: 0; padding: var(--space-2) var(--space-3);
  font-size: var(--font-xs); line-height: 1.8;
  color: var(--color-text-secondary);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-sm);
  border-left: 2px solid var(--color-accent-line);
}
.qv-grades { display: flex; gap: var(--space-2); }
.g {
  flex: 1; height: 34px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  font-size: var(--font-xs); font-weight: 600;
  border-radius: var(--radius-sm); border: 1px solid var(--color-border);
  background: var(--color-bg-base); color: var(--color-text-secondary);
}
.g:hover:not(:disabled) { background: var(--color-bg-hover); }
.g-k { font-size: 9px; color: var(--color-text-tertiary); }
.g-again:hover:not(:disabled) { border-color: #f5c6c0; color: #c0392b; }
.g-hard:hover:not(:disabled) { border-color: #fcd34d; color: #b45309; }
.g-good:hover:not(:disabled) { border-color: var(--color-accent-line); color: var(--color-accent); }
.qv-next { display: flex; align-items: center; justify-content: space-between; margin: 0; font-size: var(--font-2xs); color: var(--color-accent); min-height: 16px; }
.link { border: none; background: transparent; padding: 0; font-size: var(--font-2xs); color: var(--color-text-tertiary); }
.link:hover { background: transparent; color: var(--color-accent); text-decoration: underline; }
.qv-tip { margin: 0; font-size: var(--font-2xs); color: var(--color-text-tertiary); }

.done-box {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: var(--space-2); padding: 64px var(--space-6); text-align: center;
  border: 1px dashed var(--color-border); border-radius: var(--radius-lg);
}
.done-ico {
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--color-accent-soft); color: var(--color-accent);
  margin-bottom: var(--space-2);
}
.done-t { margin: 0; font-size: var(--font-lg); color: var(--color-text-primary); font-weight: 600; }
.done-h { margin: 0 0 var(--space-3); font-size: var(--font-sm); line-height: 1.8; color: var(--color-text-tertiary); max-width: 460px; }
</style>
