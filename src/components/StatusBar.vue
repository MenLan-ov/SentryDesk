<script setup lang="ts">
import { computed } from "vue";
import Icon from "./Icon.vue";
import { fmtBytes, collecting, collectProgress, showToast, stats, t, theme } from "../store";
import { api, errMsg } from "../api";

/** 采集中显示「第 N/M 个源 · 源名」，否则显示就绪 */
const statusText = computed(() => {
  if (!collecting.value) return t("status.ready");
  const p = collectProgress.value;
  return p ? `${t("status.collecting")} ${p.done}/${p.total} · ${p.name}` : t("status.collecting");
});

const dbSize = computed(() => (stats.value ? fmtBytes(stats.value.db_bytes) : "—"));
const zh = computed(() => theme.lang === "zh-CN");
/** 数据截至：库内最新一条情报的日期；种子快照没有采集记录，必须靠它说明时点 */
const dataAsOf = computed(() => stats.value?.latest_published ?? "");

async function exportMemo() {
  try {
    const rows = await api.previewMemo();
    if (rows.length === 0) {
      showToast(theme.lang === "zh-CN" ? "没有带笔记的条目可导出" : "No items with notes to export");
      return;
    }
    const name = `sentrydesk-memo-${new Date().toISOString().slice(0, 10)}.md`;
    // 只传文件名，后端会落到可用于写入的数据目录并回传完整路径
    const saved = await api.exportMemo(name);
    showToast(t("status.exported") + " → " + saved);
  } catch (e) {
    showToast(errMsg(e), "err");
  }
}
</script>

<template>
  <footer class="statusbar">
    <span :class="['dot', collecting ? 'busy' : 'idle']"></span>
    <span :class="['label', { live: collecting }]">{{ statusText }}</span>

    <span class="sep"></span>
    <span class="item">
      <Icon name="database" :size="11" />
      <span class="mono v">{{ stats?.total ?? 0 }}</span>
    </span>
    <span class="item">
      <span class="k">{{ t("status.dbSize") }}</span>
      <span class="mono v">{{ dbSize }}</span>
    </span>
    <span
      v-if="dataAsOf"
      class="item asof"
      :title="zh
        ? '随安装包内置的情报快照的截止日期。可在「设置 → 信息来源」在线刷新。'
        : 'Snapshot date of the bundled intel. Refresh online in Settings → Sources.'"
    >
      <Icon name="clock" :size="11" />
      <span class="k">{{ zh ? "数据截至" : "Data as of" }}</span>
      <span class="mono v">{{ dataAsOf }}</span>
    </span>
    <span class="chip chip-accent offline">
      <Icon name="shield" :size="10" />{{ t("status.offline") }}
    </span>

    <button class="export" @click="exportMemo">
      <Icon name="note" :size="11" />{{ t("status.export") }}
    </button>
  </footer>
</template>

<style scoped>
.statusbar {
  height: var(--layout-statusbar);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 0 var(--space-3) 0 var(--space-4);
  background: var(--color-bg-elevated);
  border-top: 1px solid var(--color-border);
  font-size: var(--font-2xs);
  color: var(--color-text-tertiary);
  user-select: none;
}
.dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.dot.idle { background: var(--color-sev-low); box-shadow: 0 0 0 3px var(--color-ok-soft); }
.dot.busy { background: var(--color-accent); animation: pulse 1.1s var(--ease-in-out) infinite; }
@keyframes pulse { 50% { opacity: 0.25; } }
.label { color: var(--color-text-secondary); }
.label.live { color: var(--color-accent); font-weight: 600; }
.sep { width: 1px; height: 12px; background: var(--color-border); }
.item { display: inline-flex; gap: 4px; align-items: center; }
.k { color: var(--color-text-tertiary); opacity: 0.9; }
.v { color: var(--color-text-secondary); }
.offline { height: 18px; font-size: 9.5px; }
.export {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 20px;
  padding: 0 8px;
  font-size: var(--font-2xs);
  border-color: transparent;
  background: transparent;
  color: var(--color-text-secondary);
}
.export:hover:not(:disabled) { background: var(--color-bg-hover); border-color: transparent; color: var(--color-text-primary); }
</style>
