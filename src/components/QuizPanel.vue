<script setup lang="ts">
// 自测：逐题作答，提交后给分与解析
import { computed, ref, watch } from "vue";
import type { QuizQuestion } from "../types";
import { refreshWrongCount, showToast, theme } from "../store";
import { api, errMsg } from "../api";

const props = defineProps<{ lessonId: string; questions: QuizQuestion[]; savedScore?: number | null }>();

const picked = ref<Record<number, number>>({});
const submitted = ref(false);
const score = ref<number | null>(null);
const saving = ref(false);

// 兜底：万一组件被复用到另一张卡，重置全部作答状态
watch(
  () => props.lessonId,
  () => {
    picked.value = {};
    submitted.value = false;
    score.value = null;
    saving.value = false;
  }
);

const answered = computed(() => Object.keys(picked.value).length);
const correctCount = computed(() =>
  props.questions.reduce((n, q, i) => (picked.value[i] === q.answer ? n + 1 : n), 0)
);

const zh = computed(() => theme.lang === "zh-CN");

/** 按当前语言取题目字段；英文缺失时回退中文 */
const qText = (q: QuizQuestion) => (zh.value ? q.q : (q.q_en ?? q.q));
const qOptions = (q: QuizQuestion) => (zh.value ? q.options : (q.options_en ?? q.options));
const qExplain = (q: QuizQuestion) => (zh.value ? q.explain : (q.explain_en ?? q.explain));
/** 英文模式但该题没有英文时，标记出来供 UI 提示 */
const missingEn = computed(
  () => !zh.value && props.questions.some((q) => !q.q_en)
);

function pick(qi: number, oi: number) {
  if (submitted.value) return;
  picked.value = { ...picked.value, [qi]: oi };
}

async function submit() {
  if (answered.value < props.questions.length) {
    showToast(zh.value ? "还有题目未作答" : "Some questions are unanswered");
    return;
  }
  submitted.value = true;
  score.value = Math.round((correctCount.value / props.questions.length) * 100);
  saving.value = true;
  try {
    // 收集答错的题，随成绩一起提交，由后端写入错题本
    // 只存索引与作答结果；题干与解析在渲染时按当前语言从知识库取，
    // 避免存中文快照导致切换语言后错题本仍是中文
    const wrong = props.questions
      .map((q, i) => ({ q, i }))
      .filter(({ q, i }) => picked.value[i] !== q.answer)
      .map(({ q, i }) => ({
        index: i,
        question: q.q,
        chosen: picked.value[i] ?? -1,
        correct: q.answer,
        explain: q.explain,
      }));
    await api.saveQuizResult(props.lessonId, props.questions.length, correctCount.value, wrong);
    // 有新错题时同步刷新顶栏徽标
    if (wrong.length > 0) await refreshWrongCount();
  } catch (e) {
    showToast(errMsg(e), "err");
  } finally {
    saving.value = false;
  }
}

function reset() {
  picked.value = {};
  submitted.value = false;
  score.value = null;
}

const optClass = (qi: number, oi: number) => {
  const q = props.questions[qi];
  if (!submitted.value) return picked.value[qi] === oi ? "picked" : "";
  if (oi === q.answer) return "correct";
  if (picked.value[qi] === oi) return "wrong";
  return "muted";
};
</script>

<template>
  <section class="quiz">
    <header class="qz-head">
      <h2 class="qz-title">
        {{ zh ? "自测" : "Self-check" }}
        <span class="qz-count mono">{{ questions.length }}</span>
      </h2>
      <span v-if="missingEn" class="qz-fallback">
        {{ zh ? "" : "Chinese fallback for some questions" }}
      </span>
      <span v-if="savedScore !== null && savedScore !== undefined && !submitted" class="qz-prev">
        {{ zh ? '上次得分' : 'Last score' }} {{ savedScore }}
      </span>
    </header>

    <div v-for="(q, qi) in questions" :key="qi" class="qz-item">
      <p class="qz-q">
        <span class="qz-idx mono">{{ qi + 1 }}</span>{{ qText(q) }}
      </p>
      <div class="qz-opts">
        <button
          v-for="(o, oi) in qOptions(q)"
          :key="oi"
          :class="['qz-opt', optClass(qi, oi)]"
          :disabled="submitted"
          @click="pick(qi, oi)"
        >
          <span class="qz-mark mono">{{ String.fromCharCode(65 + oi) }}</span>
          <span class="qz-text">{{ o }}</span>
        </button>
      </div>
      <p v-if="submitted" class="qz-explain">
        <span class="qz-tag" :class="picked[qi] === q.answer ? 'ok' : 'no'">
          {{ picked[qi] === q.answer ? (zh ? '正确' : 'Correct') : (zh ? '错误' : 'Wrong') }}
        </span>
        {{ qExplain(q) }}
      </p>
    </div>

    <div class="qz-foot">
      <template v-if="!submitted">
        <span class="qz-progress mono">{{ answered }} / {{ questions.length }}</span>
        <button class="primary" :disabled="saving" @click="submit">
          {{ zh ? "提交答案" : "Submit" }}
        </button>
      </template>
      <template v-else>
        <span class="qz-score mono">{{ score }}</span>
        <span class="qz-score-label">
          {{ zh ? '分' : 'points' }} · {{ correctCount }} / {{ questions.length }}
        </span>
        <button @click="reset">{{ zh ? "再做一次" : "Retry" }}</button>
      </template>
    </div>
  </section>
</template>

<style scoped>
.quiz {
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
  max-width: 860px;
}
.qz-head { display: flex; align-items: baseline; gap: var(--space-3); margin-bottom: var(--space-4); }
.qz-title { margin: 0; font-size: var(--font-md); font-weight: 600; display: flex; align-items: center; gap: var(--space-2); }
.qz-count {
  font-size: 11px; padding: 0 6px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  color: var(--color-text-tertiary);
}
.qz-prev { font-size: var(--font-xs); color: var(--color-text-tertiary); }
.qz-fallback { font-size: 10px; color: var(--color-sev-medium); margin-left: auto; }

.qz-item { margin-bottom: var(--space-4); }
.qz-q {
  display: flex; gap: var(--space-2);
  margin: 0 0 var(--space-2);
  font-size: var(--font-sm);
  line-height: 1.7;
  color: var(--color-text-primary);
}
.qz-idx {
  flex-shrink: 0;
  width: 18px; height: 18px;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px;
  border-radius: 3px;
  background: var(--color-bg-subtle);
  color: var(--color-text-tertiary);
  margin-top: 3px;
}
.qz-opts { display: flex; flex-direction: column; gap: 6px; padding-left: 26px; }
.qz-opt {
  display: flex; align-items: flex-start; gap: var(--space-2);
  padding: 7px var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  text-align: left;
  font-size: var(--font-sm);
  line-height: 1.6;
  color: var(--color-text-secondary);
}
.qz-opt:hover:not(:disabled) { border-color: var(--color-text-tertiary); background: var(--color-bg-hover); }
.qz-opt.picked { border-color: var(--color-accent); color: #4d7c0f; background: var(--color-accent-soft); }
.qz-opt.correct { border-color: var(--color-sev-low); background: var(--color-accent-soft); color: var(--color-accent); font-weight: 500; }
.qz-opt.wrong { border-color: #e05a4f; background: #fdf1f0; color: #c0392b; }
.qz-opt.muted { opacity: 0.55; }
.qz-mark {
  flex-shrink: 0;
  width: 18px; height: 18px;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px;
  border-radius: 3px;
  border: 1px solid currentColor;
  margin-top: 2px;
}
.qz-explain {
  margin: var(--space-2) 0 0 26px;
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
  line-height: 1.7;
  color: var(--color-text-secondary);
}
.qz-tag {
  font-weight: 600;
  margin-right: var(--space-2);
}
.qz-tag.ok { color: #4d7c0f; }
.qz-tag.no { color: #c0392b; }

.qz-foot {
  display: flex; align-items: center; gap: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}
.qz-progress { font-size: var(--font-xs); color: var(--color-text-tertiary); margin-right: auto; }
.qz-score { font-size: 26px; font-weight: 700; color: var(--color-accent); }
.qz-score-label { font-size: var(--font-xs); color: var(--color-text-tertiary); margin-right: auto; }
</style>
