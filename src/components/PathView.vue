<script setup lang="ts">
// 学习路径：按推荐顺序串起若干张卡，显示完成进度
import { computed, ref } from "vue";
import type { LearningPath, LessonCard, LessonProgress } from "../types";
import { openLesson, showToast, theme } from "../store";
import { api, errMsg } from "../api";

const props = defineProps<{
  paths: LearningPath[];
  cards: LessonCard[];
  progress: LessonProgress[];
}>();

/** 导出学习报告：掌握情况 + 自测成绩 + 薄弱项 + 笔记 */
const exporting = ref(false);
async function exportReport() {
  if (exporting.value) return;
  exporting.value = true;
  try {
    const name = `sentrydesk-学习报告-${new Date().toISOString().slice(0, 10)}.md`;
    const saved = await api.exportLearnReport(name);
    showToast((zh.value ? "已导出 → " : "Exported → ") + saved);
  } catch (e) {
    showToast(errMsg(e), "err");
  } finally {
    exporting.value = false;
  }
}

const zh = computed(() => theme.lang === "zh-CN");

const titleOf = (p: LearningPath) => (zh.value ? p.title : (p.title_en || p.title));
const descOf = (p: LearningPath) => (zh.value ? p.desc : (p.desc_en || p.desc));

function cardOf(id: string): LessonCard | undefined {
  return props.cards.find((c) => c.id === id);
}
function statusOf(id: string): string {
  return props.progress.find((p) => p.lesson_id === id)?.status ?? "unread";
}
function doneCount(p: LearningPath): number {
  return p.steps.filter((s) => statusOf(s) === "mastered").length;
}
function pct(p: LearningPath): number {
  return p.steps.length ? Math.round((doneCount(p) / p.steps.length) * 100) : 0;
}
/** 找到第一个未掌握的卡，作为「继续」入口 */
function nextId(p: LearningPath): string | null {
  return p.steps.find((s) => statusOf(s) !== "mastered") ?? null;
}
</script>

<template>
  <div class="paths">
    <div class="pv-top">
      <div>
        <h1 class="pv-title">{{ zh ? '学习路径' : 'Learning paths' }}</h1>
        <p class="pv-sub">
          {{ zh ? '按推荐顺序学习，每完成一张卡可标记掌握。' : 'Follow the suggested order; mark a card mastered when done.' }}
        </p>
      </div>
      <button class="pv-export" :disabled="exporting" @click="exportReport">
        {{ exporting ? '…' : (zh ? '导出学习报告' : 'Export report') }}
      </button>
    </div>

    <div class="pv-list">
      <section v-for="p in paths" :key="p.id" class="pv-card">
        <header class="pv-head">
          <div class="pv-head-main">
            <h2 class="pv-name">{{ titleOf(p) }}</h2>
            <span class="pv-meta mono">
              {{ p.steps.length }} {{ zh ? '步' : 'steps' }} · {{ p.minutes }} min
            </span>
          </div>
          <button
            v-if="nextId(p)"
            class="pv-go"
            @click="openLesson(nextId(p)!)"
          >{{ doneCount(p) ? (zh ? '继续' : 'Continue') : (zh ? '开始' : 'Start') }} →</button>
          <span v-else class="pv-done">✓ {{ zh ? '已完成' : 'Completed' }}</span>
        </header>

        <p class="pv-desc">{{ descOf(p) }}</p>

        <div class="pv-bar">
          <div class="pv-bar-fill" :style="{ width: pct(p) + '%' }"></div>
        </div>
        <span class="pv-pct mono">{{ doneCount(p) }} / {{ p.steps.length }} · {{ pct(p) }}%</span>

        <ol class="pv-steps">
          <li
            v-for="(s, i) in p.steps"
            :key="s"
            :class="['pv-step', statusOf(s)]"
            @click="openLesson(s)"
          >
            <span class="pv-idx mono">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="pv-step-title">{{ cardOf(s)?.title ?? s }}</span>
            <span v-if="statusOf(s) === 'mastered'" class="pv-check">✓</span>
            <span v-else-if="statusOf(s) === 'reading'" class="pv-reading">{{ zh ? '学习中' : 'In progress' }}</span>
          </li>
        </ol>
      </section>
    </div>
  </div>
</template>

<style scoped>
.paths { flex: 1; overflow-y: auto; background: var(--color-bg-elevated); padding: var(--space-6) var(--space-6) var(--space-7); }
.pv-top { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-4); margin-bottom: var(--space-4); }
.pv-title { margin: 0 0 var(--space-2); font-size: 21px; font-weight: 650; color: var(--color-text-primary); letter-spacing: -0.02em; }
.pv-sub { margin: 0; font-size: var(--font-sm); color: var(--color-text-tertiary); }
.pv-export { flex-shrink: 0; font-size: var(--font-xs); }

.pv-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-5); max-width: 1100px; }
@media (max-width: 1050px) { .pv-list { grid-template-columns: 1fr; } }

.pv-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  display: flex; flex-direction: column; gap: var(--space-2);
}
.pv-head { display: flex; align-items: flex-start; gap: var(--space-3); }
.pv-head-main { flex: 1; min-width: 0; }
.pv-name { margin: 0 0 2px; font-size: var(--font-md); font-weight: 600; color: var(--color-text-primary); }
.pv-meta { font-size: 11px; color: var(--color-text-tertiary); }
.pv-go {
  flex-shrink: 0;
  border-color: var(--color-accent); color: var(--color-accent);
  background: var(--color-accent-soft);
  font-size: var(--font-xs);
  padding: 3px 10px;
}
.pv-go:hover { background: var(--color-accent-soft-strong); }
.pv-done { flex-shrink: 0; font-size: var(--font-xs); color: var(--color-sev-low); }

.pv-desc { margin: 0; font-size: var(--font-xs); line-height: 1.7; color: var(--color-text-secondary); }
.pv-bar { height: 3px; background: var(--color-bg-subtle); border-radius: 2px; overflow: hidden; margin-top: var(--space-1); }
.pv-bar-fill { height: 100%; background: var(--color-accent); transition: width var(--duration-base) ease; }
.pv-pct { font-size: 10px; color: var(--color-text-tertiary); }

.pv-steps { margin: var(--space-2) 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 1px; }
.pv-step {
  display: flex; align-items: center; gap: var(--space-2);
  padding: 5px var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
  cursor: pointer;
}
.pv-step:hover { background: var(--color-bg-hover); }
.pv-step.mastered { color: #4d7c0f; }
.pv-idx { color: var(--color-text-tertiary); font-size: 10px; flex-shrink: 0; }
.pv-step-title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pv-check { color: var(--color-accent); flex-shrink: 0; }
.pv-reading { font-size: 10px; color: #b5843d; flex-shrink: 0; }
</style>
