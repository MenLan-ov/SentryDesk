<script setup lang="ts">
// 情报列表：带虚拟滚动，1000+ 条也不掉帧
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import Icon from "./Icon.vue";
import {
  doSearch, elapsedMs, filter, isFavorite, items, jumpToCwe, loading, moveSelection, sourceLabel,
  searchInput, selectItem, selectedId, theme, toggleFavorite, total,
} from "../store";
import type { Item } from "../types";

const zh = computed(() => theme.lang === "zh-CN");

const viewport = ref<HTMLDivElement | null>(null);
const scrollTop = ref(0);
const viewportH = ref(640);
const ROW_H = 96;        // 单行固定高度
const OVERSCAN = 6;      // 上下各多渲染几行

const totalH = computed(() => items.value.length * ROW_H);
const startIdx = computed(() =>
  Math.max(0, Math.floor(scrollTop.value / ROW_H) - OVERSCAN)
);
const endIdx = computed(() =>
  Math.min(
    items.value.length,
    Math.ceil((scrollTop.value + viewportH.value) / ROW_H) + OVERSCAN
  )
);
const visible = computed(() => {
  const from = Math.min(startIdx.value, Math.max(0, items.value.length - 1));
  const to = Math.min(endIdx.value, items.value.length);
  return from < to ? items.value.slice(from, to) : [];
});
const offsetY = computed(() =>
  Math.min(startIdx.value, Math.max(0, items.value.length - 1)) * ROW_H
);

/** 是否有任一生效的筛选条件（决定空状态该说什么） */
const hasFilter = computed(() =>
  !!(
    (filter.query ?? "").trim() ||
    filter.source_key ||
    filter.cwe ||
    filter.severity ||
    filter.cvss_min != null ||
    filter.days != null ||
    filter.kev_only ||
    filter.favorite_only
  )
);

/** 一键清空全部筛选，回到全量列表 */
async function clearFilters() {
  filter.query = "";
  // 同步清空顶栏输入框，保持「输入框内容 = 实际生效条件」
  searchInput.value = "";
  filter.source_key = null;
  filter.cwe = null;
  filter.severity = null;
  filter.cvss_min = null;
  filter.days = null;
  filter.kev_only = false;
  filter.favorite_only = false;
  filter.offset = 0;
  await doSearch();
}

function onScroll() {
  if (!viewport.value) return;
  scrollTop.value = viewport.value.scrollTop;
}

function measure() {
  if (viewport.value) viewportH.value = viewport.value.clientHeight;
}

/**
 * 结果集变短时把滚动位置夹回合法范围。
 *
 * 不做这一步会有一个很难复现但很致命的现象：
 * 从 530 条筛到 1 条时，容器滚动位置仍停在原来的高度，
 * startIdx = floor(scrollTop / ROW_H) - OVERSCAN 会远大于数组长度，
 * slice() 返回空数组 —— 列表一片空白，但结果其实是有的。
 */
function clampScroll() {
  const max = Math.max(0, totalH.value - viewportH.value);
  if (scrollTop.value > max) scrollTop.value = max;
  const el = viewport.value;
  if (el && el.scrollTop > max) el.scrollTop = max;
}

// 结果集变化（新检索条件、切换视图）后立刻夹回
watch(() => items.value, clampScroll, { flush: "post" });
// 视图高度变化（窗口缩放、三栏折叠）后也夹一次
watch(viewportH, clampScroll);

let ro: ResizeObserver | null = null;
onMounted(() => {
  measure();
  ro = new ResizeObserver(measure);
  if (viewport.value) ro.observe(viewport.value);
  window.addEventListener("keydown", onKeydown);
});
onUnmounted(() => {
  ro?.disconnect();
  window.removeEventListener("keydown", onKeydown);
});

function onKeydown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
  if (e.key === "ArrowDown") { e.preventDefault(); moveSelection(1); scrollToSelected(1); }
  if (e.key === "ArrowUp") { e.preventDefault(); moveSelection(-1); scrollToSelected(-1); }
}

/** 键盘切换时保证选中项在视口内 */
function scrollToSelected(dir: number) {
  const idx = items.value.findIndex((x) => x.id === selectedId.value);
  if (idx < 0 || !viewport.value) return;
  const top = idx * ROW_H;
  const vp = viewport.value;
  if (top < vp.scrollTop) vp.scrollTop = top;
  else if (top + ROW_H > vp.scrollTop + vp.clientHeight) {
    vp.scrollTop = top + ROW_H - vp.clientHeight;
  }
  void dir;
}

const sevOf = (s: string | null) => s ?? "UNKNOWN";

// ---- 右键菜单 ----
import { openMenu, copyText, openExternal, SEP } from "../composables/useContextMenu";

function onRowContext(e: MouseEvent, it: Item) {
  openMenu(e, [
    {
      key: "fav",
      label: isFavorite(it.id)
        ? (zh.value ? "取消稍后读" : "Remove from saved")
        : (zh.value ? "加入稍后读" : "Save for later"),
      action: () => toggleFavorite(it.id),
    },
    SEP,
    {
      key: "copy-cve",
      label: zh.value ? "复制 CVE 编号" : "Copy CVE ID",
      disabled: !it.cve_id,
      action: () => copyText(it.cve_id ?? "", "CVE"),
    },
    {
      key: "copy-url",
      label: zh.value ? "复制原文链接" : "Copy source URL",
      action: () => copyText(it.source_url, zh.value ? "链接" : "URL"),
    },
    {
      key: "copy-title",
      label: zh.value ? "复制标题" : "Copy title",
      action: () => copyText(it.title, zh.value ? "标题" : "Title"),
    },
    SEP,
    {
      key: "open-src",
      label: zh.value ? "打开原文" : "Open source",
      hint: "↗",
      action: () => openExternal(it.source_url),
    },
    {
      key: "to-lesson",
      label: zh.value ? "看该缺陷类型的教学" : "Learn this weakness",
      disabled: !it.cwe,
      action: () => {
        if (it.cwe) jumpToCwe(it.cwe);
      },
    },
    SEP,
    {
      key: "select",
      label: zh.value ? "选中此项" : "Select",
      action: () => selectItem(it.id),
    },
  ]);
}
</script>

<template>
  <section class="list-col">
    <header class="list-head">
      <span class="count">
        <strong class="mono">{{ total }}</strong>
        <span class="count-label">{{ zh ? "条结果" : "results" }}</span>
      </span>
      <span v-if="filter.cwe" class="chip chip-mono chip-accent">{{ filter.cwe }}</span>
      <span v-if="filter.favorite_only" class="chip chip-accent">
        <Icon name="star" :size="10" />{{ zh ? "稍后读" : "Saved" }}
      </span>
      <span class="grow"></span>
      <span class="meta mono">{{ elapsedMs }} ms</span>
      <span class="sort">
        <Icon name="clock" :size="11" />
        {{ zh ? "最新优先" : "Newest" }}
      </span>
    </header>

    <!-- 骨架屏 -->
    <div v-if="loading" class="skeleton-list">
      <div v-for="i in 8" :key="i" class="sk-row">
        <div class="skeleton sk-a"></div>
        <div class="skeleton sk-b"></div>
        <div class="skeleton sk-c"></div>
      </div>
    </div>

    <!-- 空结果：必须区分「库里还没有数据」和「筛选条件太严」，
         否则用户在有 530 条数据的情况下被提示"去采集"，会以为程序坏了 -->
    <div v-else-if="items.length === 0" class="state">
      <div class="empty-ico"><Icon name="filter" :size="20" /></div>
      <template v-if="hasFilter">
        <p class="empty-title">{{ zh ? "没有符合条件的条目" : "No items match" }}</p>
        <p class="empty-hint">
          {{ zh ? "当前筛选组合过窄，可放宽条件再试" : "The filter combination is too narrow; try relaxing it" }}
        </p>
        <button class="empty-btn" @click="clearFilters()">
          {{ zh ? "清除全部筛选" : "Clear all filters" }}
        </button>
      </template>
      <template v-else>
        <p class="empty-title">{{ zh ? "本地库还没有数据" : "The local database is empty" }}</p>
        <p class="empty-hint">
          {{ zh ? "点击左下角「开始合规采集」获取公开安全情报" : 'Click "Start collection" to fetch public security intelligence' }}
        </p>
      </template>
    </div>

    <!-- 虚拟滚动容器 -->
    <div v-else ref="viewport" class="vp" @scroll.passive="onScroll">
      <div class="spacer" :style="{ height: totalH + 'px' }">
        <div class="window" :style="{ transform: 'translateY(' + offsetY + 'px)' }">
          <button
            v-for="it in visible"
            :key="it.id"
            :class="['row', { active: it.id === selectedId }]"
            :style="{ height: ROW_H + 'px' }"
            tabindex="0"
            role="option"
            data-ctx="item"
            :aria-selected="it.id === selectedId"
            @click="selectItem(it.id)"
            @contextmenu="onRowContext($event, it)"
            @keydown.enter.prevent="selectItem(it.id)"
            @keydown.space.prevent="selectItem(it.id)"
          >
            <div class="row-top">
              <span :class="['sev-dot', 'sev-' + sevOf(it.cvss_severity)]"></span>
              <span class="cve mono">{{ it.cve_id ?? it.external_id ?? "—" }}</span>
              <span v-if="it.in_kev" class="kev">
                <Icon name="flame" :size="10" />KEV
              </span>
              <span class="grow"></span>
              <span
                v-if="it.cvss_score !== null"
                :class="['score', 'score-' + sevOf(it.cvss_severity)]"
              >{{ it.cvss_score.toFixed(1) }}</span>
              <span
                :class="['star-btn', { on: isFavorite(it.id) }]"
                :title="zh ? '稍后读' : 'Save for later'"
                role="button"
                @click.stop="toggleFavorite(it.id)"
              ><Icon name="star" :size="13" /></span>
            </div>
            <div class="row-title">{{ it.title }}</div>
            <div class="row-foot">
              <span class="product">{{ it.products.join(" · ") || "—" }}</span>
              <span v-if="it.cwe" class="cwe-tag mono">{{ it.cwe }}</span>
              <span class="src">{{ sourceLabel(it.source_key) }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.list-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-base);
  border-right: 1px solid var(--color-border);
}
.list-head {
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0 var(--space-4);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
  background: var(--color-bg-elevated);
}
.count { display: flex; align-items: baseline; gap: 5px; }
.count strong { font-size: var(--font-md); color: var(--color-text-primary); font-weight: 650; }
.count-label { color: var(--color-text-tertiary); }
.grow { flex: 1; }
.meta { color: var(--color-text-tertiary); font-size: var(--font-2xs); }
.sort {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-text-tertiary);
  font-size: var(--font-2xs);
}

.skeleton-list { flex: 1; overflow: hidden; padding: var(--space-2) 0; }
.sk-row { padding: var(--space-3) var(--space-4); display: flex; flex-direction: column; gap: 8px; }
.sk-a { height: 10px; width: 42%; }
.sk-b { height: 10px; width: 92%; }
.sk-c { height: 8px; width: 30%; }

.state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
  font-size: var(--font-sm);
  gap: 6px;
  padding: var(--space-6);
  text-align: center;
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
.empty-btn {
  margin-top: var(--space-3);
  padding: 5px 14px;
  font-size: var(--font-xs);
  color: var(--color-accent);
  background: var(--color-accent-soft);
  border: 1px solid var(--color-accent-line);
  border-radius: var(--radius-sm);
}
.empty-btn:hover:not(:disabled) { background: var(--color-accent-soft-strong); }
.empty-title { margin: 0; font-size: var(--font-md); color: var(--color-text-secondary); font-weight: 600; }
.empty-hint { margin: 0; font-size: var(--font-xs); max-width: 300px; line-height: 1.7; }

.vp { flex: 1; overflow-y: auto; overflow-x: hidden; }
.spacer { position: relative; }
.window { position: absolute; top: 0; left: 0; right: 0; will-change: transform; }

.row {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  width: 100%;
  padding: 0 var(--space-4);
  border: none;
  border-bottom: 1px solid var(--color-border);
  border-radius: 0;
  background: transparent;
  text-align: left;
  box-sizing: border-box;
  contain: layout style;
  position: relative;
}
.row:hover:not(:disabled) { background: var(--color-bg-hover); border-color: var(--color-border); }
.row.active {
  background: var(--color-accent-soft);
  box-shadow: inset 2px 0 0 var(--color-accent);
}

.row-top { display: flex; align-items: center; gap: 7px; }
.cve {
  font-size: var(--font-xs);
  font-weight: 650;
  color: var(--color-text-secondary);
  letter-spacing: -0.01em;
}
.row.active .cve { color: var(--color-accent); }
.kev {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 9px;
  font-weight: 700;
  font-family: var(--font-mono);
  padding: 0 4px;
  border-radius: var(--radius-xs);
  color: var(--color-sev-critical);
  background: var(--color-critical-soft);
  line-height: 14px;
}
.score {
  font-size: var(--font-xs);
  font-weight: 700;
  font-family: var(--font-mono);
  padding: 0 5px;
  border-radius: var(--radius-xs);
  background: var(--color-bg-active);
  color: var(--color-text-secondary);
}
.score-CRITICAL { background: var(--color-critical-soft); color: var(--color-sev-critical); }
.score-HIGH { background: var(--color-warn-soft); color: var(--color-sev-high); }
.score-MEDIUM { background: var(--color-warn-soft); color: var(--color-sev-medium); }
.score-LOW { background: var(--color-ok-soft); color: var(--color-sev-low); }

.star-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: var(--radius-xs);
  color: var(--color-text-tertiary);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out);
}
.row:hover .star-btn, .star-btn.on { opacity: 1; }
.star-btn:hover { background: var(--color-bg-active); color: var(--color-accent); }
.star-btn.on { color: var(--color-accent); }
.star-btn.on svg { fill: var(--color-accent); fill-opacity: 0.18; }

.row-title {
  font-size: var(--font-sm);
  color: var(--color-text-primary);
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.row.active .row-title { color: var(--color-text-primary); }
.row-foot { display: flex; gap: var(--space-2); font-size: var(--font-2xs); color: var(--color-text-tertiary); align-items: center; }
.product { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cwe-tag { color: var(--color-accent); font-family: var(--font-mono); flex-shrink: 0; }
.src { flex-shrink: 0; opacity: 0.85; }
</style>
