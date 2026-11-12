<script setup lang="ts">
import { computed } from "vue";
import Icon from "./Icon.vue";
import { doSearch, favoriteCount, filter, showToast, sources, stats, t, theme, total } from "../store";

const zh = computed(() => theme.lang === "zh-CN");

const sevOptions = computed(() => [
  { v: null, label: zh.value ? "全部" : "All", dot: "" },
  { v: "CRITICAL", label: t("severity.CRITICAL"), dot: "var(--color-sev-critical)" },
  { v: "HIGH", label: t("severity.HIGH"), dot: "var(--color-sev-high)" },
  { v: "MEDIUM", label: t("severity.MEDIUM"), dot: "var(--color-sev-medium)" },
  { v: "LOW", label: t("severity.LOW"), dot: "var(--color-sev-low)" },
]);

const windows = computed(() => [
  { v: null as number | null, label: zh.value ? "不限" : "Any" },
  { v: 7, label: zh.value ? "7 天" : "7d" },
  { v: 30, label: zh.value ? "30 天" : "30d" },
  { v: 90, label: zh.value ? "90 天" : "90d" },
]);

function pickSource(key: string | null) {
  filter.source_key = key;
  filter.offset = 0;
  doSearch();
}

function refresh() {
  filter.offset = 0;
  doSearch();
}

/**
 * 切换「稍后读」。
 * 之前直接内联在模板里，收藏为空时点完只是列表变空，
 * 没有任何提示，看起来像按钮坏了。这里补上状态提示。
 */
async function toggleFavOnly() {
  filter.favorite_only = !filter.favorite_only;
  filter.offset = 0;
  await doSearch();
  if (!filter.favorite_only) return;
  showToast(
    favoriteCount.value === 0
      ? (zh.value ? "还没有收藏，点条目右上角星标" : "Nothing saved yet — use the star on an item")
      : (zh.value ? `只看稍后读：${total.value} 条` : `Saved only: ${total.value}`)
  );
}

function setSeverity(v: string | null) {
  filter.severity = v;
  refresh();
}

function setDays(v: number | null) {
  filter.days = v;
  refresh();
}

function setCvss(e: Event) {
  const raw = Number((e.target as HTMLInputElement).value);
  filter.cvss_min = raw > 0 ? raw : null;
  refresh();
}

const sourceCount = (key: string) =>
  stats.value?.by_source.find((s) => s.source_key === key) ?? null;
</script>

<template>
  <aside class="sidebar">
    <!-- 数据源 -->
    <section class="block">
      <header class="b-head">
        <span class="section-label">{{ t("sidebar.sources") }}</span>
        <span class="b-count mono">{{ sources.length }}</span>
      </header>
      <button :class="['row', { active: !filter.source_key }]" @click="pickSource(null)">
        <span class="dot dot-all"></span>
        <span class="row-label">{{ t("sidebar.all") }}</span>
        <span class="row-count mono">{{ stats?.total ?? 0 }}</span>
      </button>
      <button
        v-for="s in sources"
        :key="s.key"
        :class="['row', { active: filter.source_key === s.key }]"
        @click="pickSource(s.key)"
      >
        <span class="dot dot-on"></span>
        <span class="row-label">{{ s.name }}</span>
        <span class="row-count mono">{{ sourceCount(s.key)?.count ?? 0 }}</span>
      </button>
    </section>

    <div class="divider"></div>

    <!-- 收藏 -->
    <section class="block tight">
      <button
        :class="['row', 'fav-row', { active: filter.favorite_only }]"
        @click="toggleFavOnly()"
      >
        <Icon name="star" :size="13" :class="['fav-ico', { on: filter.favorite_only }]" />
        <span class="row-label">{{ zh ? "稍后读" : "Saved" }}</span>
        <span class="row-count mono">{{ favoriteCount }}</span>
      </button>
    </section>

    <div class="divider"></div>

    <!-- 筛选 -->
    <section class="block">
      <header class="b-head">
        <span class="section-label">{{ t("sidebar.filter") }}</span>
        <button
          v-if="filter.severity || filter.days || filter.cvss_min || filter.kev_only || filter.favorite_only"
          class="reset"
          @click="filter.severity = null; filter.days = null; filter.cvss_min = null; filter.kev_only = false; filter.favorite_only = false; refresh()"
        >{{ zh ? "重置" : "Reset" }}</button>
      </header>

      <div class="field">
        <span class="f-label">{{ t("sidebar.severity") }}</span>
        <div class="chips">
          <button
            v-for="o in sevOptions"
            :key="String(o.v)"
            :class="['mini-chip', { on: filter.severity === o.v }]"
            @click="setSeverity(o.v)"
          >
            <span v-if="o.dot" class="mini-dot" :style="{ background: o.dot }"></span>
            {{ o.label }}
          </button>
        </div>
      </div>

      <div class="field">
        <span class="f-label">{{ t("sidebar.days") }}</span>
        <div class="chips">
          <button
            v-for="w in windows"
            :key="String(w.v)"
            :class="['mini-chip', { on: filter.days === w.v }]"
            @click="setDays(w.v)"
          >{{ w.label }}</button>
        </div>
      </div>

      <div class="field">
        <span class="f-label">
          {{ zh ? "CVSS 最低" : "Min CVSS" }}
          <span class="f-val mono">{{ filter.cvss_min != null ? filter.cvss_min.toFixed(1) : "—" }}</span>
        </span>
        <input
          class="range"
          type="range"
          min="0" max="10" step="0.5"
          :value="filter.cvss_min ?? 0"
          @change="setCvss"
        />
      </div>

      <button
        :class="['switch-row', { on: filter.kev_only }]"
        @click="filter.kev_only = !filter.kev_only; refresh()"
      >
        <span class="switch"><span class="knob"></span></span>
        <span class="sw-label">{{ t("sidebar.kevOnly") }}</span>
      </button>
    </section>

    <div class="divider"></div>

    <div class="spacer"></div>

    <!-- 内容说明：内容随安装包分发，更新走覆盖安装 -->
    <section class="collect">
      <p class="hint">
        {{ zh
          ? "知识点、题目与条目内容随安装包分发，离线可用。升级时运行新版安装包，自动覆盖更新。"
          : "Cards, questions and records ship with the installer and work offline. Run a newer installer to update in place." }}
      </p>
    </section>

  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--layout-sidebar);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-elevated);
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
}

.block { padding: var(--space-3) var(--space-3) var(--space-4); display: flex; flex-direction: column; gap: 1px; }
.block.tight { padding: var(--space-2) var(--space-3); }
.b-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: 0 var(--space-2) var(--space-2);
}
.b-count { font-size: var(--font-2xs); color: var(--color-text-tertiary); }
.reset, .link-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 0;
  border: none;
  background: transparent;
  font-size: var(--font-2xs);
  color: var(--color-accent);
}
.reset:hover:not(:disabled), .link-btn:hover:not(:disabled) {
  background: transparent;
  text-decoration: underline;
}

/* ---- 数据源行 ---- */
.row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  height: 30px;
  padding: 0 var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  text-align: left;
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
}
.row:hover:not(:disabled) { background: var(--color-bg-hover); border-color: transparent; }
.row.active {
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-weight: 600;
}
.row-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.row-count { font-size: var(--font-2xs); color: var(--color-text-tertiary); }
.row.active .row-count { color: var(--color-accent); }

.dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.dot-on { background: var(--color-sev-low); }
.dot-off { background: var(--color-sev-critical); }
.dot-all { background: var(--color-text-tertiary); }

.fav-ico { color: var(--color-text-tertiary); }
.fav-ico.on { color: var(--color-accent); }

/* ---- 筛选控件 ---- */
.field { display: flex; flex-direction: column; gap: 6px; padding: var(--space-2) var(--space-2) 0; }
.f-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
  font-weight: 500;
}
.f-val { color: var(--color-accent); font-size: var(--font-xs); }
.chips { display: flex; flex-wrap: wrap; gap: 4px; }
.mini-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 22px;
  padding: 0 7px;
  font-size: var(--font-2xs);
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-bg-subtle);
  border: 1px solid transparent;
  border-radius: var(--radius-xs);
}
.mini-chip:hover:not(:disabled) { background: var(--color-bg-hover); border-color: transparent; }
.mini-chip.on {
  background: var(--color-bg-elevated);
  border-color: var(--color-accent-line);
  color: var(--color-accent);
  font-weight: 600;
  box-shadow: var(--shadow-xs);
}
.mini-dot { width: 5px; height: 5px; border-radius: 50%; }

.range {
  width: 100%;
  height: 4px;
  padding: 0;
  border: none;
  border-radius: var(--radius-full);
  background: var(--color-bg-active);
  accent-color: var(--color-accent);
  cursor: pointer;
}
.range:focus { box-shadow: none; }

.switch-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  margin: var(--space-2) var(--space-2) 0;
  width: calc(100% - var(--space-4));
  padding: 6px 8px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  text-align: left;
}
.switch-row:hover:not(:disabled) { background: var(--color-bg-hover); border-color: transparent; }
.switch {
  width: 26px;
  height: 15px;
  flex-shrink: 0;
  border-radius: var(--radius-full);
  background: var(--color-border-strong);
  padding: 2px;
  transition: background var(--duration-base) var(--ease-out);
}
.knob {
  display: block;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #fff;
  box-shadow: var(--shadow-xs);
  transition: transform var(--duration-base) var(--ease-out);
}
.switch-row.on .switch { background: var(--color-accent); }
.switch-row.on .knob { transform: translateX(11px); }
.sw-label { font-size: var(--font-sm); color: var(--color-text-secondary); }
.switch-row.on .sw-label { color: var(--color-text-primary); font-weight: 500; }

/* ---- robots ---- */
.robots-row { display: flex; align-items: center; gap: var(--space-2); padding: 2px var(--space-2); }
.robots-name { font-size: var(--font-2xs); color: var(--color-text-tertiary); font-family: var(--font-mono); }
.badge {
  font-size: 9.5px;
  font-weight: 600;
  padding: 1px 5px;
  border-radius: var(--radius-xs);
  border: 1px solid transparent;
}
.badge-allowed { color: var(--color-sev-low); background: var(--color-ok-soft); }
.badge-disallowed { color: var(--color-sev-critical); background: var(--color-critical-soft); }
.badge-not_found, .badge-unknown { color: var(--color-text-tertiary); background: var(--color-bg-subtle); }

.spacer { flex: 1; min-height: var(--space-3); }
.collect {
  padding: var(--space-3);
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-base);
}
.wide { width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 32px; }
.collect-msg { margin: var(--space-2) 0 0; font-size: var(--font-2xs); color: var(--color-accent); }
.hint { margin: 6px 0 0; font-size: var(--font-2xs); line-height: 1.5; color: var(--color-text-tertiary); }
.muted { color: var(--color-text-tertiary); font-size: var(--font-xs); }

.cp-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 6px; }
.cp-label { font-size: var(--font-xs); font-weight: 600; color: var(--color-accent); }
.cp-n { font-size: var(--font-2xs); color: var(--color-text-tertiary); }
.cp-bar { height: 4px; border-radius: var(--radius-full); background: var(--color-bg-active); overflow: hidden; }
.cp-fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: var(--radius-full);
  transition: width var(--duration-slow) var(--ease-out);
}
.cp-src { margin: 6px 0 0; font-size: var(--font-2xs); color: var(--color-text-tertiary); }
</style>
