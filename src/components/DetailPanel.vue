<script setup lang="ts">
import { ref, watch } from "vue";
import type { LessonCard } from "../types";
import Icon from "./Icon.vue";
import {
  fmtDate, fmtRelative, isFavorite, jumpToCwe, openLesson, selected, showToast, sourceLabel, t, theme, toggleFavorite,
} from "../store";
import { api, errMsg } from "../api";
import { openUrl } from "@tauri-apps/plugin-opener";
import { copyText } from "../composables/useContextMenu";

const noteBody = ref("");
const saving = ref(false);
const savedAt = ref("");

const zh = () => theme.lang === "zh-CN";

/** 相关教学卡：以当前条目的关联卡为中心，最多再推 3 张 */
const related = ref<LessonCard[]>([]);

watch(selected, async (v) => {
  noteBody.value = v?.note?.body ?? "";
  savedAt.value = "";
  related.value = [];
  if (v?.lesson) {
    try {
      const list = await api.relatedLessons(v.lesson.id);
      related.value = list.filter((c) => c.id !== v.lesson!.id).slice(0, 3);
    } catch {
      related.value = [];
    }
  }
}, { immediate: true });

async function saveNote() {
  if (!selected.value) return;
  if (!noteBody.value.trim()) {
    showToast(t("detail.noteEmpty"));
    return;
  }
  saving.value = true;
  try {
    const saved = await api.saveNote(selected.value.id, noteBody.value);
    // 同步到当前条目，避免 watch 把它重置
    selected.value.note = saved;
    savedAt.value = t("detail.saved");
    window.setTimeout(() => (savedAt.value = ""), 2000);
  } catch (e) {
    showToast(errMsg(e), "err");
  } finally {
    saving.value = false;
  }
}

async function openSource() {
  if (!selected.value) return;
  try {
    await openUrl(selected.value.source_url);
  } catch (e) {
    showToast(errMsg(e), "err");
  }
}

const sevOf = (s: string | null) => s ?? "UNKNOWN";
const scorePct = (n: number | null) => (n == null ? 0 : Math.min(100, (n / 10) * 100));
</script>

<template>
  <aside class="detail">
    <div v-if="!selected" class="empty">
      <div class="empty-ico"><Icon name="shield" :size="22" /></div>
      <p class="empty-title">{{ t("detail.empty") }}</p>
      <p class="empty-hint">{{ zh() ? "用 ↑ ↓ 或点击左侧条目浏览" : "Use ↑ ↓ or click an item on the left" }}</p>
    </div>

    <div v-else class="content">
      <!-- 头部 -->
      <header class="head">
        <div class="id-line">
          <span class="cve mono">{{ selected.cve_id ?? selected.external_id ?? "—" }}</span>
          <span v-if="selected.in_kev" class="kev"><Icon name="flame" :size="10" />{{ t("detail.kev") }}</span>
          <span class="grow"></span>
          <button
            :class="['icon-btn', 'fav', { on: isFavorite(selected.id) }]"
            @click="toggleFavorite(selected.id)"
            :title="zh() ? '稍后读' : 'Save for later'"
          ><Icon name="star" :size="15" /></button>
          <button class="icon-btn" @click="copyText(selected.source_url, zh() ? '链接' : 'URL')"
            :title="zh() ? '复制原文链接' : 'Copy link'">
            <Icon name="copy" :size="14" />
          </button>
        </div>

        <div v-if="selected.cvss_score !== null" class="cvss-block">
          <div class="cvss-line">
            <span :class="['cvss', 'v-' + sevOf(selected.cvss_severity)]">{{ selected.cvss_score.toFixed(1) }}</span>
            <span class="cvss-max mono">/ 10</span>
            <span :class="['sev-chip', 'c-' + sevOf(selected.cvss_severity)]">
              <span :class="['sev-dot', 'sev-' + sevOf(selected.cvss_severity)]"></span>
              {{ t("severity." + sevOf(selected.cvss_severity)) }}
            </span>
          </div>
          <div class="meter">
            <div :class="['meter-fill', 'f-' + sevOf(selected.cvss_severity)]"
              :style="{ width: scorePct(selected.cvss_score) + '%' }"></div>
          </div>
        </div>

        <h2 class="title">{{ selected.title }}</h2>
      </header>

      <!-- 元数据 -->
      <section class="meta">
        <div class="meta-row">
          <span class="k">{{ t("detail.source") }}</span>
          <span class="v">{{ sourceLabel(selected.source_key) }}</span>
        </div>
        <div class="meta-row" v-if="selected.products.length">
          <span class="k">{{ t("detail.products") }}</span>
          <span class="v">{{ selected.products.join(", ") }}</span>
        </div>
        <div class="meta-row">
          <span class="k">{{ t("detail.published") }}</span>
          <span class="v mono">{{ fmtDate(selected.published_at) }}</span>
        </div>
        <div class="meta-row">
          <span class="k">{{ t("detail.collected") }}</span>
          <span class="v mono">{{ fmtRelative(selected.collected_at) }}</span>
        </div>
        <div class="meta-row" v-if="selected.external_id && selected.external_id !== selected.cve_id">
          <span class="k">{{ t("detail.externalId") }}</span>
          <span class="v mono">{{ selected.external_id }}</span>
        </div>
      </section>

      <!-- 学习闭环：情报 → 教学卡 → 接着学 → 同类型情报 -->
      <button v-if="selected.lesson" class="lesson-entry" @click="openLesson(selected.lesson.id)">
        <span class="le-icon">{{ selected.lesson.icon }}</span>
        <span class="le-body">
          <span class="le-kicker">{{ t("detail.learnMore") }} · {{ selected.cwe }}</span>
          <span class="le-title">{{ selected.lesson.title }}</span>
        </span>
        <Icon name="arrow-right" :size="14" class="le-arrow" />
      </button>

      <div v-if="related.length" class="related">
        <h3 class="block-title">{{ zh() ? "接着学" : "Keep learning" }}</h3>
        <button
          v-for="c in related"
          :key="c.id"
          class="related-item"
          @click="openLesson(c.id)"
        >
          <span class="ri-icon">{{ c.icon }}</span>
          <span class="ri-title">{{ zh() ? c.title : (c.title_en ?? c.title) }}</span>
          <Icon name="arrow-right" :size="12" class="ri-arrow" />
        </button>
      </div>

      <div v-if="selected.cwe" class="cwe-bare">
        <button class="cwe-link" @click="jumpToCwe(selected.cwe)">
          <Icon name="tag" :size="11" /><span class="mono">{{ selected.cwe }}</span>
          <span class="cwe-note">{{ zh() ? "查看同类型的全部情报" : "All intel with this CWE" }}</span>
        </button>
        <span v-if="!selected.lesson" class="cwe-note dim">{{ zh() ? "暂无对应教学卡" : "No lesson yet" }}</span>
      </div>

      <!-- 处置要求（KEV） -->
      <section class="block" v-if="selected.action">
        <h3 class="block-title">{{ t("detail.action") }}</h3>
        <p class="action-text">{{ selected.action }}</p>
      </section>

      <!-- 摘要 -->
      <section class="block" v-if="selected.summary">
        <h3 class="block-title">{{ t("detail.summary") }}</h3>
        <p class="summary">{{ selected.summary }}</p>
      </section>

      <!-- 笔记 -->
      <section class="block">
        <h3 class="block-title">
          {{ t("detail.note") }}
          <span v-if="savedAt" class="saved"><Icon name="check" :size="11" />{{ savedAt }}</span>
        </h3>
        <textarea
          v-model="noteBody"
          class="note"
          rows="4"
          :placeholder="t('detail.notePlaceholder')"
        ></textarea>
        <button class="save" :disabled="saving" @click="saveNote">
          {{ t("detail.saveNote") }}
        </button>
      </section>

      <div class="spacer"></div>

      <!-- 操作 -->
      <footer class="foot">
        <button class="primary wide" @click="openSource">
          <Icon name="external" :size="13" />{{ t("detail.openSource") }}
        </button>
      </footer>
    </div>
  </aside>
</template>

<style scoped>
.detail {
  width: var(--layout-detail);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-elevated);
  overflow: hidden;
}
.empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--color-text-tertiary);
  padding: var(--space-6);
  text-align: center;
}
.empty-ico {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-bottom: var(--space-2);
  border-radius: var(--radius-lg);
  background: var(--color-bg-subtle);
}
.empty-title { margin: 0; font-size: var(--font-sm); color: var(--color-text-secondary); }
.empty-hint { margin: 0; font-size: var(--font-2xs); }
.content { flex: 1; display: flex; flex-direction: column; overflow-y: auto; }

/* ---- 头部 ---- */
.head {
  padding: var(--space-4) var(--space-4) var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.id-line { display: flex; align-items: center; gap: var(--space-2); }
.grow { flex: 1; }
.cve {
  font-size: var(--font-md);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
}
.kev {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 9.5px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: var(--radius-xs);
  color: var(--color-sev-critical);
  background: var(--color-critical-soft);
}
.fav.on { color: var(--color-accent); background: var(--color-accent-soft); }
.fav.on svg { fill: var(--color-accent); fill-opacity: 0.2; }

.cvss-block { display: flex; flex-direction: column; gap: 7px; }
.cvss-line { display: flex; align-items: baseline; gap: 6px; }
.cvss { font-size: var(--font-3xl); font-weight: 700; font-family: var(--font-mono); letter-spacing: -0.04em; line-height: 1; }
.cvss-max { font-size: var(--font-2xs); color: var(--color-text-tertiary); }
.v-CRITICAL { color: var(--color-sev-critical); }
.v-HIGH { color: var(--color-sev-high); }
.v-MEDIUM { color: var(--color-sev-medium); }
.v-LOW { color: var(--color-sev-low); }
.v-UNKNOWN { color: var(--color-sev-unknown); }

.sev-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-left: auto;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--font-2xs);
  font-weight: 600;
}
.c-CRITICAL { color: var(--color-sev-critical); background: var(--color-critical-soft); }
.c-HIGH { color: var(--color-sev-high); background: var(--color-warn-soft); }
.c-MEDIUM { color: var(--color-sev-medium); background: var(--color-warn-soft); }
.c-LOW { color: var(--color-sev-low); background: var(--color-ok-soft); }
.c-UNKNOWN { color: var(--color-sev-unknown); background: var(--color-bg-subtle); }

.meter { height: 4px; border-radius: var(--radius-full); background: var(--color-bg-active); overflow: hidden; }
.meter-fill { height: 100%; border-radius: var(--radius-full); transition: width var(--duration-slow) var(--ease-out); }
.f-CRITICAL { background: var(--color-sev-critical); }
.f-HIGH { background: var(--color-sev-high); }
.f-MEDIUM { background: var(--color-sev-medium); }
.f-LOW { background: var(--color-sev-low); }
.f-UNKNOWN { background: var(--color-sev-unknown); }

.title {
  margin: 0;
  font-size: var(--font-lg);
  font-weight: 600;
  line-height: 1.45;
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
}

/* ---- 元数据 ---- */
.meta {
  padding: 0 var(--space-4) var(--space-3);
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.meta-row { display: flex; gap: var(--space-3); font-size: var(--font-xs); }
.k { width: 68px; flex-shrink: 0; color: var(--color-text-tertiary); }
.v { flex: 1; color: var(--color-text-secondary); word-break: break-word; }

/* ---- 教学入口 ---- */
.lesson-entry {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin: 0 var(--space-4) var(--space-3);
  padding: var(--space-3);
  background: var(--color-accent-soft);
  border: 1px solid var(--color-accent-line);
  border-radius: var(--radius-md);
  text-align: left;
}
.lesson-entry:hover:not(:disabled) { background: var(--color-accent-soft-strong); border-color: var(--color-accent-line); }
.le-icon {
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
  color: var(--color-on-accent);
  background: var(--color-accent);
}
.le-body { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
.le-kicker { font-size: var(--font-2xs); color: var(--color-accent); font-weight: 600; }
.le-title {
  font-size: var(--font-sm);
  color: var(--color-text-primary);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.le-arrow { color: var(--color-accent); flex-shrink: 0; }

.cwe-bare {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 var(--space-4) var(--space-3);
  padding: 6px 10px;
  font-size: var(--font-xs);
  color: var(--color-text-tertiary);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-sm);
}
.cwe-note { margin-left: auto; font-size: var(--font-2xs); }

/* ---- 正文块 ---- */
.block {
  padding: var(--space-3) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  border-top: 1px solid var(--color-border);
}
.block-title {
  margin: 0;
  font-size: var(--font-2xs);
  font-weight: 700;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  display: flex;
  gap: var(--space-2);
  align-items: center;
}
.saved {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: var(--color-sev-low);
  text-transform: none;
  letter-spacing: 0;
  font-weight: 600;
}
.action-text {
  margin: 0;
  font-size: var(--font-sm);
  line-height: 1.7;
  color: var(--color-text-secondary);
  padding: var(--space-2) var(--space-3);
  background: var(--color-warn-soft);
  border-radius: var(--radius-sm);
  border-left: 2px solid var(--color-sev-medium);
}
.summary {
  margin: 0;
  font-size: var(--font-sm);
  line-height: var(--lh-loose);
  color: var(--color-text-secondary);
}
.note { width: 100%; resize: vertical; font-size: var(--font-sm); line-height: 1.7; }
.save { align-self: flex-start; }
.spacer { flex: 1; min-height: var(--space-4); }
.foot {
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-elevated);
  position: sticky;
  bottom: 0;
}
.wide {
  width: 100%;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

/* 学习闭环：相关卡 */
.related { margin-top: var(--space-2); }
.related .block-title { margin-bottom: 4px; }
.related-item {
  display: flex; align-items: center; gap: var(--space-2);
  width: 100%; padding: 6px 8px; margin-bottom: 2px;
  border: 1px solid var(--color-border); border-radius: var(--radius-sm);
  background: transparent; cursor: pointer; text-align: left;
  color: var(--color-text-primary); font-size: var(--font-xs);
}
.related-item:hover { border-color: var(--color-accent); background: var(--color-bg-hover); }
.ri-icon { flex-shrink: 0; }
.ri-title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ri-arrow { color: var(--color-text-tertiary); flex-shrink: 0; }
.cwe-link {
  display: inline-flex; align-items: center; gap: 6px;
  border: none; background: transparent; cursor: pointer;
  color: var(--color-accent); font-size: var(--font-xs); padding: 0;
}
.cwe-link:hover { text-decoration: underline; }
.cwe-note.dim { color: var(--color-text-tertiary); margin-left: 8px; }
</style>
