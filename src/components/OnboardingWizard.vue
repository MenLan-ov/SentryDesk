<script setup lang="ts">
// 首次启动引导：三步 —— 选语言 → 认识内容 → 做一道题。
// 只在第一次启动出现（localStorage 标记），随时可跳过。
import { computed, ref } from "vue";
import { allLessons, openLesson, setLang, theme } from "../store";

const emit = defineEmits<{ done: [] }>();
const zh = computed(() => theme.lang === "zh-CN");
const step = ref(0);

function finish() {
  localStorage.setItem("sd_onboarded_v1", "1");
  emit("done");
}

function pickLang(lang: "zh-CN" | "en-US") {
  setLang(lang);
}

/** 样例卡：优先第一张带自测题的 CWE 卡，退化为任意带题卡 */
const sample = computed(() => {
  const withQuiz = allLessons.value.filter((c) => c.quiz?.length);
  return withQuiz.find((c) => c.kind === "cwe") ?? withQuiz[0] ?? null;
});
const sampleQ = computed(() => sample.value?.quiz?.[0] ?? null);
const picked = ref<number | null>(null);

function pick(i: number) {
  if (picked.value !== null) return;
  picked.value = i;
}
const pickedRight = computed(() => picked.value !== null && picked.value === sampleQ.value?.answer);

async function openSample() {
  if (sample.value) {
    await openLesson(sample.value.id);
  }
  finish();
}

const steps = computed(() => [
  zh.value ? "选择语言" : "Language",
  zh.value ? "里面有什么" : "What's inside",
  zh.value ? "试一试" : "Try it",
]);
</script>

<template>
  <div class="ob-mask" role="dialog" aria-modal="true" :aria-label="zh ? '首次使用引导' : 'Welcome'">
    <div class="ob-card">
      <!-- 进度 -->
      <div class="ob-steps">
        <span v-for="(_, i) in steps" :key="i" :class="['ob-dot', { on: i === step, done: i < step }]"></span>
        <span class="ob-step-label">{{ steps[step] }} · {{ step + 1 }}/3</span>
      </div>

      <!-- 第 1 步：语言 -->
      <template v-if="step === 0">
        <h2 class="ob-title">{{ zh ? '欢迎使用 SentryDesk' : 'Welcome to SentryDesk' }}</h2>
        <p class="ob-sub">
          {{ zh
            ? '离线优先的漏洞知识库与学习工作台。先选一下界面语言，之后随时可以改。'
            : 'An offline-first vulnerability knowledge base and study workbench. Pick a language — you can change it anytime.' }}
        </p>
        <div class="ob-langs">
          <button :class="['ob-lang', { on: theme.lang === 'zh-CN' }]" @click="pickLang('zh-CN')">
            <span class="ob-lang-name">简体中文</span>
            <span class="ob-lang-sub">界面与教学内容均为中文</span>
          </button>
          <button :class="['ob-lang', { on: theme.lang === 'en-US' }]" @click="pickLang('en-US')">
            <span class="ob-lang-name">English</span>
            <span class="ob-lang-sub">UI and all lesson content in English</span>
          </button>
        </div>
      </template>

      <!-- 第 2 步：内容导览 -->
      <template v-else-if="step === 1">
        <h2 class="ob-title">{{ zh ? '安装包里已经装好了全部内容' : 'Everything is already inside' }}</h2>
        <p class="ob-sub">
          {{ zh ? '无需联网，打开就能用：' : 'No network needed. You get:' }}
        </p>
        <ul class="ob-feats">
          <li>
            <strong>{{ zh ? '情报库' : 'Intel' }}</strong>
            {{ zh ? '—— 2900+ 条漏洞条目，全文检索，每条标注来源与 CWE 弱点' : ' — 2900+ vulnerability records, full-text search, each with source and CWE' }}
          </li>
          <li>
            <strong>{{ zh ? '教学卡' : 'Lesson cards' }}</strong>
            {{ zh ? '—— 107 张双语卡片，从 CWE 弱点到实战实验' : ' — 107 bilingual cards, from CWE weaknesses to hands-on labs' }}
          </li>
          <li>
            <strong>{{ zh ? '自测与复习' : 'Quiz & review' }}</strong>
            {{ zh ? '—— 329 道题，答错自动进错题本，按间隔重复提醒复习' : ' — 329 questions; mistakes go to a spaced-repetition review queue' }}
          </li>
        </ul>
        <p class="ob-sub dim">
          {{ zh
            ? '看到一条漏洞情报，可以一键跳到对应的教学卡，学完马上自测。'
            : 'From any vulnerability record you can jump to its lesson card and quiz yourself right after.' }}
        </p>
      </template>

      <!-- 第 3 步：做一道题 -->
      <template v-else>
        <h2 class="ob-title">{{ zh ? '来，做一道题感受一下' : 'Try one question' }}</h2>
        <template v-if="sample && sampleQ">
          <p class="ob-sub">
            {{ zh ? '出自教学卡' : 'From the card' }}
            <strong>「{{ zh ? sample.title : (sample.title_en ?? sample.title) }}」</strong>
          </p>
          <p class="ob-q">{{ zh ? sampleQ.q : (sampleQ.q_en ?? sampleQ.q) }}</p>
          <div class="ob-opts">
            <button
              v-for="(opt, i) in (zh ? sampleQ.options : (sampleQ.options_en ?? sampleQ.options))"
              :key="i"
              :class="['ob-opt', {
                right: picked !== null && i === sampleQ.answer,
                wrong: picked === i && i !== sampleQ.answer,
              }]"
              @click="pick(i)"
            >{{ opt }}</button>
          </div>
          <p v-if="picked !== null" :class="['ob-fb', pickedRight ? 'ok' : 'bad']">
            {{ pickedRight
              ? (zh ? '答对了！' : 'Correct!')
              : (zh ? '答错了，没关系——' : 'Not quite — ') }}
            {{ zh ? sampleQ.explain : (sampleQ.explain_en ?? sampleQ.explain) }}
          </p>
        </template>
        <p v-else class="ob-sub">{{ zh ? '（教学库加载中，直接进入即可）' : '(Lessons still loading — just jump in)' }}</p>
      </template>

      <!-- 按钮区 -->
      <div class="ob-actions">
        <button class="ob-skip" @click="finish">{{ zh ? '跳过' : 'Skip' }}</button>
        <div class="ob-right">
          <button v-if="step > 0" class="ob-back" @click="step--">{{ zh ? '上一步' : 'Back' }}</button>
          <button v-if="step < 2" class="ob-next" @click="step++">{{ zh ? '下一步' : 'Next' }}</button>
          <template v-else>
            <button v-if="sample" class="ob-next" @click="openSample">
              {{ zh ? '打开这张卡，开始学习' : 'Open this card & start' }}
            </button>
            <button class="ob-next ghost" @click="finish">{{ zh ? '直接开始' : 'Just start' }}</button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ob-mask {
  position: fixed; inset: 0; z-index: 900;
  background: color-mix(in srgb, var(--color-bg) 55%, transparent);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
}
.ob-card {
  width: 520px; max-width: calc(100vw - 48px);
  max-height: calc(100vh - 96px); overflow-y: auto;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg, 12px);
  padding: var(--space-6);
  box-shadow: 0 18px 60px rgb(0 0 0 / 0.25);
}
.ob-steps { display: flex; align-items: center; gap: 6px; margin-bottom: var(--space-4); }
.ob-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-border); }
.ob-dot.on { background: var(--color-accent); }
.ob-dot.done { background: var(--color-accent); opacity: 0.45; }
.ob-step-label { margin-left: 8px; font-size: 11px; color: var(--color-text-tertiary); }

.ob-title { margin: 0 0 6px; font-size: 19px; font-weight: 650; color: var(--color-text-primary); letter-spacing: -0.01em; }
.ob-sub { margin: 0 0 var(--space-4); font-size: var(--font-sm); color: var(--color-text-secondary); line-height: 1.6; }
.ob-sub.dim { color: var(--color-text-tertiary); font-size: var(--font-xs); }

.ob-langs { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
.ob-lang {
  display: flex; flex-direction: column; gap: 4px; align-items: flex-start;
  padding: var(--space-4);
  border: 1px solid var(--color-border); border-radius: var(--radius-md);
  background: transparent; cursor: pointer; text-align: left;
}
.ob-lang.on { border-color: var(--color-accent); background: color-mix(in srgb, var(--color-accent) 8%, transparent); }
.ob-lang-name { font-size: var(--font-md); font-weight: 600; color: var(--color-text-primary); }
.ob-lang-sub { font-size: 11px; color: var(--color-text-tertiary); }

.ob-feats { margin: 0 0 var(--space-4); padding-left: 18px; font-size: var(--font-sm); color: var(--color-text-secondary); line-height: 1.9; }
.ob-feats strong { color: var(--color-text-primary); }

.ob-q { margin: 0 0 var(--space-3); font-size: var(--font-sm); font-weight: 600; color: var(--color-text-primary); line-height: 1.6; }
.ob-opts { display: flex; flex-direction: column; gap: var(--space-2); margin-bottom: var(--space-3); }
.ob-opt {
  padding: 8px var(--space-3); text-align: left;
  border: 1px solid var(--color-border); border-radius: var(--radius-sm);
  background: transparent; color: var(--color-text-primary); font-size: var(--font-sm);
  cursor: pointer; transition: border-color var(--duration-fast) ease;
}
.ob-opt:hover { border-color: var(--color-accent); }
.ob-opt.right { border-color: var(--color-sev-low); background: color-mix(in srgb, var(--color-sev-low) 12%, transparent); }
.ob-opt.wrong { border-color: var(--color-sev-critical); background: color-mix(in srgb, var(--color-sev-critical) 10%, transparent); }
.ob-fb { margin: 0 0 var(--space-2); font-size: var(--font-xs); line-height: 1.6; }
.ob-fb.ok { color: var(--color-sev-low); }
.ob-fb.bad { color: var(--color-sev-high); }

.ob-actions { display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-4); }
.ob-right { display: flex; gap: var(--space-2); }
.ob-skip { background: none; border: none; color: var(--color-text-tertiary); font-size: var(--font-xs); cursor: pointer; }
.ob-skip:hover { color: var(--color-text-primary); }
.ob-back { font-size: var(--font-sm); }
.ob-next {
  background: var(--color-accent); color: #fff; border: none;
  padding: 7px var(--space-4); border-radius: var(--radius-sm);
  font-size: var(--font-sm); font-weight: 600; cursor: pointer;
}
.ob-next.ghost { background: transparent; color: var(--color-text-secondary); border: 1px solid var(--color-border); }
</style>
