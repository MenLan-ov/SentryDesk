<script setup lang="ts">
// 教学详情：原理 / 成因 / 发现 / 解决办法（含代码对比）/ 验证 + 自测 + 笔记 + 关联
import { computed, onMounted, ref, watch } from "vue";
import {
  activeLesson, categoryLabel, goHome, jumpToCwe, lessonCveCount, matchTerms, openLesson,
  progressOf, setLessonStatus, showToast, statusOf, tagLabel, theme,
} from "../store";
import { api, errMsg } from "../api";
// t 未使用，避免 lint 报错
import { openUrl } from "@tauri-apps/plugin-opener";
import CodeCompare from "./CodeCompare.vue";
import QuizPanel from "./QuizPanel.vue";
import GlossaryPopover from "./GlossaryPopover.vue";
import type { GlossaryTerm, LessonCard } from "../types";

const zh = computed(() => theme.lang === "zh-CN");
const related = ref<LessonCard[]>([]);
const noteBody = ref("");
const noteSaved = ref(false);
const popTerm = ref<GlossaryTerm | null>(null);
const popPos = ref({ x: 0, y: 0 });

const levelLabel = (lv: string | undefined) =>
  zh.value
    ? { beginner: "入门", intermediate: "进阶", advanced: "深入" }[lv ?? ""] ?? lv
    : { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" }[lv ?? ""] ?? lv;

const kindLabel = (k: string | undefined) =>
  zh.value
    ? { cwe: "缺陷类型", lesson: "方法论", lab: "实战实验" }[k ?? ""] ?? k
    : { cwe: "Weakness", lesson: "Method", lab: "Lab" }[k ?? ""] ?? k;

function isKey(h: string) {
  return /解决办法|修复|落地|配置|加固/.test(h);
}

/** 把正文切成可点击术语的分段（computed 保证 glossary 加载后自动刷新） */
const segCache = computed(() => {
  const m = new Map<string, { text: string; term?: GlossaryTerm }[]>();
  if (!activeLesson.value) return m;
  for (const s of activeLesson.value.sections) {
    m.set(s.p, matchTerms(s.p));
  }
  return m;
});
const segs = (text: string) => segCache.value.get(text) ?? [{ text }];

function openRelated(id: string) {
  openLesson(id);
}

function onTermClick(e: MouseEvent, term: GlossaryTerm) {
  e.preventDefault();
  popPos.value = { x: e.clientX - 40, y: e.clientY };
  popTerm.value = term;
}

async function loadRelated(id: string) {
  try {
    related.value = await api.relatedLessons(id);
  } catch {
    related.value = [];
  }
}

const curStatus = computed(() => (activeLesson.value ? statusOf(activeLesson.value.id) : "unread"));

async function mark(status: string) {
  if (!activeLesson.value) return;
  await setLessonStatus(activeLesson.value.id, status);
}

async function saveNote() {
  if (!activeLesson.value) return;
  try {
    await api.saveLessonNote(activeLesson.value.id, noteBody.value);
    noteSaved.value = true;
    window.setTimeout(() => (noteSaved.value = false), 1800);
  } catch (e) {
    showToast(errMsg(e), "err");
  }
}

watch(
  activeLesson,
  async (v) => {
    if (!v) return;
    noteBody.value = progressOf(v.id)?.note ?? "";
    // 并行执行，避免串行等待拖慢切卡
    const tasks: Promise<unknown>[] = [loadRelated(v.id)];
    if (statusOf(v.id) === "unread") {
      tasks.push(setLessonStatus(v.id, "reading"));
    }
    await Promise.allSettled(tasks);
  },
  { immediate: true }
);

onMounted(() => {
  if (activeLesson.value) noteBody.value = progressOf(activeLesson.value.id)?.note ?? "";
});
</script>

<template>
  <div class="learn">
    <div v-if="!activeLesson" class="none">{{ zh ? '未选择教学卡' : 'No lesson selected' }}</div>

    <template v-else>
      <header class="lh">
        <div class="crumb">
          <button class="crumb-btn" @click="goHome()">← {{ zh ? '全部教程' : 'All lessons' }}</button>
          <span class="sep">/</span>
          <span class="crumb-cur">{{ categoryLabel(activeLesson.category, zh) }}</span>
        </div>

        <h1 class="title">
          <span :class="['icon', 'ic-' + activeLesson.color]">{{ activeLesson.icon }}</span>
          <span>{{ zh ? activeLesson.title : (activeLesson.title_en || activeLesson.title) }}</span>
        </h1>

        <p class="summary">
          {{ zh ? activeLesson.summary : (activeLesson.summary_en || activeLesson.summary) }}
        </p>

        <div class="meta-line">
          <span class="pill">{{ kindLabel(activeLesson.kind) }}</span>
          <span class="pill">{{ levelLabel(activeLesson.level) }}</span>
          <span v-if="activeLesson.cwe" class="pill cwe mono">{{ activeLesson.cwe }}</span>
          <span v-for="tg in activeLesson.tags" :key="tg" class="pill tag">#{{ tagLabel(tg, zh) }}</span>
        </div>

        <!-- 学习状态 -->
        <div class="status-bar">
          <button
            :class="['st', { on: curStatus === 'reading' }]"
            @click="mark('reading')"
          >{{ zh ? '学习中' : 'In progress' }}</button>
          <button
            :class="['st', { on: curStatus === 'mastered' }]"
            @click="mark('mastered')"
          >{{ zh ? '标记掌握' : 'Mark mastered' }}</button>
          <span v-if="curStatus === 'mastered'" class="st-done">✓ {{ zh ? '已掌握' : 'Mastered' }}</span>
        </div>
      </header>

      <!-- 真实漏洞入口。
           计数为 0 时不渲染成可点击按钮：这些 CWE 是设计/过程类弱点，
           NVD 根本不会为它们分配 CVE 号，点进去必然是空列表。
           与其给一个假入口，不如如实说明为什么没有。 -->
      <button
        v-if="activeLesson.cwe && lessonCveCount > 0"
        class="real-entry"
        @click="jumpToCwe(activeLesson.cwe!)"
      >
        <span class="real-label">{{ zh ? '本地情报库中该类型的真实漏洞' : 'Real findings of this type in your local DB' }}</span>
        <span class="real-n mono">{{ lessonCveCount }}</span>
        <span class="real-arrow">→</span>
      </button>
      <div v-else-if="activeLesson.cwe" class="real-empty">
        <span class="real-label">{{ zh ? '本地情报库中该类型的真实漏洞' : 'Real findings of this type in your local DB' }}</span>
        <span class="real-n mono">0</span>
        <p class="real-why">
          {{
            zh
              ? '这一类属于设计/过程层面的弱点，NVD 不会为它分配 CVE 编号，因此没有可关联的条目。'
              : 'This class is a design/process weakness; NVD assigns no CVE IDs to it, so there are no linked items.'
          }}
        </p>
      </div>

      <!-- 正文 -->
      <article class="body">
        <section
          v-for="(s, i) in activeLesson.sections"
          :key="i"
          :class="['sec', { key: isKey(s.h) }]"
        >
          <h2 class="sec-h">
            <span class="sec-idx mono">{{ String(i + 1).padStart(2, '0') }}</span>
            {{ zh ? s.h : (s.h_en ?? s.h) }}
          </h2>
          <p class="sec-p">
            <template v-for="(sg, si) in segs(zh ? s.p : (s.p_en ?? s.p))" :key="si">
              <span
                v-if="sg.term"
                class="term"
                @click="onTermClick($event, sg.term)"
              >{{ sg.text }}</span>
              <span v-else>{{ sg.text }}</span>
            </template>
          </p>

          <CodeCompare
            v-for="(cb, ci) in (s.code || [])"
            :key="ci"
            :block="cb"
            :index="ci"
          />
        </section>
      </article>

      <!-- 自测 -->
      <!-- key 绑定 lessonId：切换卡片时强制重建组件，避免上一张卡的作答状态残留 -->
      <QuizPanel
        v-if="activeLesson.quiz && activeLesson.quiz.length"
        :key="activeLesson.id"
        :lesson-id="activeLesson.id"
        :questions="activeLesson.quiz"
        :saved-score="progressOf(activeLesson.id)?.quiz_score ?? null"
      />

      <!-- 学习笔记 -->
      <section class="note-sec">
        <h2 class="sec-h"><span class="sec-idx mono">NOTE</span>{{ zh ? '学习笔记' : 'My notes' }}</h2>
        <textarea
          v-model="noteBody"
          class="note"
          rows="3"
          :placeholder="zh ? '记录你的理解与疑问（仅存本机）' : 'Your takeaways and open questions (local only)'"
        ></textarea>
        <div class="note-foot">
          <button @click="saveNote">{{ zh ? '保存' : 'Save' }}</button>
          <span v-if="noteSaved" class="saved">✓ {{ zh ? '已保存' : 'Saved' }}</span>
        </div>
      </section>

      <!-- 关联卡 -->
      <section v-if="related.length" class="rel-sec">
        <h2 class="sec-h"><span class="sec-idx mono">NEXT</span>{{ zh ? '接着看' : 'Continue with' }}</h2>
        <div class="rel-list">
          <button
            v-for="r in related"
            :key="r.id"
            class="rel"
            @click="openRelated(r.id)"
          >
            <span :class="['rel-ic', 'ic-' + r.color]">{{ r.icon }}</span>
            <span class="rel-title">{{ zh ? r.title : (r.title_en || r.title) }}</span>
            <span class="rel-arrow">→</span>
          </button>
        </div>
      </section>

      <!-- 参考来源 -->
      <section v-if="activeLesson.refs.length" class="refs">
        <h2 class="sec-h"><span class="sec-idx mono">REF</span>{{ zh ? '参考来源' : 'References' }}</h2>
        <div class="ref-list">
          <button
            v-for="r in activeLesson.refs"
            :key="r.url"
            class="ref"
            @click="openUrl(r.url).catch(e => showToast(errMsg(e), 'err'))"
          >
            <span class="ref-name">{{ r.name }}</span>
            <span class="ref-url mono">{{ r.url }}</span>
          </button>
        </div>
        <p class="ref-note">
          {{ zh
            ? '正文为本项目根据上述公开来源自行撰写，非原文转载。'
            : 'Body text is original work based on the public sources above, not a reproduction.' }}
        </p>
      </section>
    </template>

    <GlossaryPopover :term="popTerm" :x="popPos.x" :y="popPos.y" @close="popTerm = null" />
  </div>
</template>

<style scoped>
.learn { flex: 1; overflow-y: auto; background: var(--color-bg-elevated); padding: var(--space-6) var(--space-6) var(--space-7); }
.none { color: var(--color-text-tertiary); padding: var(--space-6); }

.crumb { display: flex; align-items: center; gap: var(--space-2); font-size: var(--font-xs); color: var(--color-text-tertiary); margin-bottom: var(--space-3); }
.crumb-btn { border: none; background: transparent; color: var(--color-accent); padding: 0; font-size: var(--font-xs); font-weight: 600; }
.crumb-btn:hover { background: transparent; text-decoration: underline; }
.sep { opacity: 0.5; }
.crumb-cur { color: var(--color-text-secondary); }

.lh { max-width: 860px; }
.title { display: flex; align-items: center; gap: var(--space-3); margin: 0 0 var(--space-3); font-size: 24px; font-weight: 650; line-height: 1.32; letter-spacing: -0.025em; }
.icon { width: 40px; height: 40px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md); font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: #fff; }
.summary { margin: 0 0 var(--space-3); font-size: 14.5px; line-height: 1.8; color: var(--color-text-secondary); max-width: 760px; }
.meta-line { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-3); }
.pill { font-size: var(--font-2xs); padding: 2px 8px; border: 1px solid var(--color-border); border-radius: var(--radius-full); color: var(--color-text-tertiary); background: var(--color-bg-subtle); }
.pill.cwe { color: var(--color-accent); border-color: var(--color-accent); }

.status-bar { display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-4); }
.st { font-size: var(--font-xs); height: 26px; padding: 0 11px; border-radius: var(--radius-full); }
.st.on { border-color: var(--color-accent); color: var(--color-accent); background: var(--color-accent-soft); font-weight: 600; }
.st-done { font-size: var(--font-xs); color: var(--color-sev-low); margin-left: var(--space-2); }

.real-entry { display: flex; align-items: center; gap: var(--space-3); width: 100%; max-width: 860px; padding: var(--space-3) var(--space-4); margin-bottom: var(--space-5); background: var(--color-accent-soft); border: 1px solid var(--color-accent-line); border-radius: var(--radius-md); text-align: left; }
.real-entry:hover { background: var(--color-accent-soft-strong); border-color: var(--color-accent-line); }
.real-label { font-size: var(--font-sm); color: var(--color-accent); flex: 1; }
.real-n { font-size: var(--font-lg); font-weight: 700; color: var(--color-accent); }
.real-arrow { color: var(--color-accent); }
/* 无 CVE 可关联时的静态说明块：保持同一视觉位置，但不给点击暗示 */
.real-empty { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--space-3); width: 100%; max-width: 860px; padding: var(--space-3) var(--space-4); margin-bottom: var(--space-5); background: var(--color-surface-2); border: 1px solid var(--color-line); border-radius: var(--radius-md); }
.real-empty .real-label { color: var(--color-text-secondary); }
.real-empty .real-n { color: var(--color-text-tertiary); }
.real-why { flex-basis: 100%; margin: 0; font-size: var(--font-xs); color: var(--color-text-tertiary); line-height: 1.7; }

.body { max-width: 860px; display: flex; flex-direction: column; gap: var(--space-5); }
.sec { padding-left: var(--space-4); border-left: 1px solid var(--color-border); }
.sec.key { border-left-color: var(--color-accent); background: var(--color-bg-subtle); padding: var(--space-3) var(--space-4); border-radius: 0 var(--radius-md) var(--radius-md) 0; }
.sec-h { display: flex; align-items: center; gap: var(--space-2); margin: 0 0 var(--space-2); font-size: var(--font-lg); font-weight: 650; color: var(--color-text-primary); }
.sec-idx { font-size: 11px; color: var(--color-text-tertiary); font-weight: 400; }
.sec.key .sec-h { color: var(--color-accent); }
.sec-p { margin: 0; font-size: 13.8px; line-height: 1.95; color: var(--color-text-secondary); }

.term {
  color: var(--color-accent);
  border-bottom: 1px dashed var(--color-accent-line);
  cursor: help;
}
.term:hover { background: var(--color-accent-soft); }

.note-sec { max-width: 860px; margin-top: var(--space-5); padding-top: var(--space-4); border-top: 1px solid var(--color-border); }
.note { width: 100%; font-size: var(--font-sm); line-height: 1.7; resize: vertical; }
.note-foot { display: flex; align-items: center; gap: var(--space-3); margin-top: var(--space-2); }
.saved { font-size: var(--font-xs); color: var(--color-sev-low); }

.rel-sec { max-width: 860px; margin-top: var(--space-5); padding-top: var(--space-4); border-top: 1px solid var(--color-border); }
.rel-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-2); margin-top: var(--space-3); }
@media (max-width: 780px) { .rel-list { grid-template-columns: 1fr; } }
.rel { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: transparent; text-align: left; }
.rel:hover { background: var(--color-bg-hover); border-color: var(--color-accent-line); }
.rel-ic { width: 24px; height: 24px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: 3px; font-family: var(--font-mono); font-size: 8px; font-weight: 700; color: #fff; }
.rel-title { flex: 1; font-size: var(--font-xs); color: var(--color-text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rel-arrow { color: var(--color-text-tertiary); font-size: 11px; }

.refs { max-width: 860px; margin-top: var(--space-6); padding-top: var(--space-4); border-top: 1px solid var(--color-border); }
.ref-list { display: flex; flex-direction: column; gap: var(--space-2); margin-top: var(--space-3); }
.ref { display: flex; flex-direction: column; gap: 2px; padding: var(--space-2) var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: transparent; text-align: left; }
.ref:hover { background: var(--color-bg-hover); }
.ref-name { font-size: var(--font-sm); color: var(--color-text-primary); }
.ref-url { font-size: 11px; color: var(--color-text-tertiary); word-break: break-all; }
.ref-note { margin: var(--space-3) 0 0; font-size: 11px; color: var(--color-text-tertiary); line-height: 1.6; }

.ic-injection { background: #e05a4f; }
.ic-access { background: #d9903d; }
.ic-auth { background: #4f7fd9; }
.ic-memory { background: #8a5cd9; }
.ic-deser { background: #c94a7a; }
.ic-input { background: #4aa3a3; }
.ic-web { background: #3d8fd9; }
.ic-parse { background: #a3763d; }
.ic-file { background: var(--color-sev-low); }
.ic-secret { background: #b5544a; }
.ic-concurrency { background: #7a7ad9; }
.ic-numeric { background: #4a8f8f; }
.ic-dos { background: #996b3d; }
.ic-leak { background: #9a9a4a; }
.ic-crypto { background: #5a5ab5; }
.ic-lang { background: #b5843d; }
.ic-assess { background: var(--color-accent); }
.ic-process { background: #5c8a5c; }
.ic-source { background: #4a8fb5; }
.ic-harden { background: #5c8a5c; }
.ic-audit { background: #b57a3d; }
.ic-audit2 { background: #b57a3d; }
.ic-test { background: #4a8fb5; }
.ic-check { background: #4a8fb5; }
.ic-check2 { background: #4a8fb5; }
.ic-method { background: var(--color-accent); }
.ic-ir { background: #c0392b; }
</style>
