<script setup lang="ts">
import { APP_VERSION_LABEL } from "../version";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import Icon from "./Icon.vue";
import {
  closeOverlays, cycleTheme, doSearch, filter, goHome, helpOpen, lessonFilter, loadLessons,
  openHelp, openPalette, paletteOpen, refreshWrongCount, reviewDue, searchInput, setLang, t, theme, view,
} from "../store";
import type { ViewMode } from "../store";

const searchRef = ref<HTMLInputElement | null>(null);
const query = searchInput;
const focused = ref(false);

const zh = computed(() => theme.lang === "zh-CN");

type Tab = { key: ViewMode; zh: string; en: string; icon: string; badge?: boolean };
const tabs: Tab[] = [
  { key: "home", zh: "学习", en: "Learn", icon: "book" },
  { key: "paths", zh: "路径", en: "Paths", icon: "layers" },
  { key: "items", zh: "情报", en: "Intel", icon: "shield" },
  { key: "dashboard", zh: "看板", en: "Board", icon: "chart" },
  { key: "wrong", zh: "错题", en: "Review", icon: "alert", badge: true },
];

const isActive = (k: ViewMode) =>
  k === "home" ? view.value === "home" || view.value === "learn" : view.value === k;

function go(k: ViewMode) {
  if (k === "home") goHome();
  else view.value = k;
  if (k === "items") doSearch();
  if (k === "wrong") refreshWrongCount();
}

/** 搜索框只在有列表的视图里出现，看板/设置页留着只会误导 */
const showSearch = computed(() =>
  ["home", "learn", "paths", "items"].includes(view.value),
);

const placeholder = () =>
  view.value === "items" ? t("topbar.search") : t("topbar.searchLesson");

// 搜索：首页搜教学卡，情报页搜漏洞
let timer: number | undefined;
watch(query, (v) => {
  window.clearTimeout(timer);
  timer = window.setTimeout(async () => {
    if (view.value === "home" || view.value === "learn" || view.value === "paths") {
      lessonFilter.query = v;
      await loadLessons();
      if (v.trim()) view.value = "home";
    } else {
      filter.query = v;
      filter.offset = 0;
      await doSearch();
    }
  }, 220);
});

// 切视图时把同一个关键词应用到当前视图的数据源
watch(view, async (v) => {
  const q = query.value.trim();
  if (!q) return;
  if (v === "items") {
    filter.query = q;
    filter.offset = 0;
    await doSearch();
  } else if (v === "home" || v === "learn" || v === "paths") {
    lessonFilter.query = q;
    await loadLessons();
  }
});

function clearQuery() {
  query.value = "";
  lessonFilter.query = "";
  filter.query = "";
  if (view.value === "items") doSearch();
  else loadLessons();
  searchRef.value?.focus();
}

function onKeydown(e: KeyboardEvent) {
  const mod = e.ctrlKey || e.metaKey;
  if (mod && e.key.toLowerCase() === "k") {
    e.preventDefault();
    // 再按一次 Ctrl+K 就关掉，开与关都走同一个键，不用起身找 Esc
    if (paletteOpen.value) closeOverlays();
    else openPalette();
    return;
  }
  if (mod && e.key.toLowerCase() === "f") {
    e.preventDefault();
    searchRef.value?.focus();
    searchRef.value?.select();
    return;
  }
  // 无输入焦点时按 / 直接聚焦搜索
  if (e.key === "/" && !mod) {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag !== "INPUT" && tag !== "TEXTAREA") {
      e.preventDefault();
      searchRef.value?.focus();
    }
    return;
  }
  if (mod && /^[1-6]$/.test(e.key)) {
    e.preventDefault();
    const map: Record<string, ViewMode> = {
      "1": "home", "2": "paths", "3": "items", "4": "dashboard", "5": "wrong", "6": "settings",
    };
    const v = map[e.key];
    if (v) go(v);
    return;
  }
  // 浮层打开时 Esc 归 App 的全局处理器管，这里不要顺手把搜索词也清了
  if (e.key === "Escape" && !paletteOpen.value && !helpOpen.value && document.activeElement === searchRef.value) {
    clearQuery();
    searchRef.value?.blur();
    return;
  }
  if (e.key === "?" && !mod) {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag !== "INPUT" && tag !== "TEXTAREA") {
      e.preventDefault();
      openHelp();
    }
  }
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));

const themeIcon = computed(() =>
  theme.mode === "dark" ? "moon" : theme.mode === "eyecare" ? "eye" : "sun",
);
const themeTitle = computed(() =>
  zh.value ? `主题：${t("theme." + theme.mode)}（点击切换）` : `Theme: ${theme.mode} (click to cycle)`,
);
</script>

<template>
  <header class="topbar">
    <button class="brand" @click="goHome()" :title="zh ? '返回学习首页' : 'Back to lessons'">
      <span class="logo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <defs>
            <linearGradient id="sd-logo" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
              <stop stop-color="var(--color-accent-hover)" />
              <stop offset="1" stop-color="var(--color-accent)" />
            </linearGradient>
          </defs>
          <path
            d="M12 2.6l8.2 3.4v6.2c0 4.7-3.4 8.5-8.2 9.9-4.8-1.4-8.2-5.2-8.2-9.9V6L12 2.6Z"
            fill="url(#sd-logo)"
          />
          <path d="M8.6 12.1l2.4 2.4 4.5-4.9" stroke="var(--color-on-accent)" stroke-width="1.8"
            stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
      <span class="brand-text">
        <span class="name">SentryDesk</span>
        <span class="ver mono">{{ APP_VERSION_LABEL }}</span>
      </span>
    </button>

    <nav class="tabs">
      <button
        v-for="tb in tabs"
        :key="tb.key"
        :class="['tab', { active: isActive(tb.key) }]"
        @click="go(tb.key)"
      >
        <Icon :name="tb.icon" :size="14" />
        <span>{{ zh ? tb.zh : tb.en }}</span>
        <span v-if="tb.badge && reviewDue > 0" class="tab-badge mono">{{ reviewDue }}</span>
      </button>
    </nav>

    <span class="grow"></span>

    <div v-if="showSearch" :class="['search', { on: focused }]">
      <Icon name="search" :size="14" class="s-ico" />
      <input
        ref="searchRef"
        v-model="query"
        :placeholder="placeholder()"
        spellcheck="false"
        @focus="focused = true"
        @blur="focused = false"
      />
      <button v-if="query" class="s-clear" @click="clearQuery" :title="zh ? '清空' : 'Clear'">
        <Icon name="x" :size="12" />
      </button>
      <span v-else class="kbd s-kbd">Ctrl F</span>
    </div>

    <div class="actions">
      <button
        :class="['icon-btn', 'cmd', { on: paletteOpen }]"
        @click="paletteOpen ? closeOverlays() : openPalette()"
        :title="zh ? '命令面板 · Ctrl+K（再点关闭）' : 'Command palette · Ctrl+K (click again to close)'"
        :aria-expanded="paletteOpen"
      >
        <Icon name="command" :size="15" />
      </button>
      <button class="icon-btn" @click="cycleTheme()" :title="themeTitle">
        <Icon :name="themeIcon" :size="15" />
      </button>
      <button
        class="icon-btn lang"
        @click="setLang(theme.lang === 'zh-CN' ? 'en-US' : 'zh-CN')"
        :title="zh ? '切换到 English' : '切换到中文'"
      >{{ zh ? 'EN' : '中' }}</button>
      <button class="icon-btn" @click="openHelp" :title="zh ? '快捷键 · ?' : 'Shortcuts · ?'">
        <Icon name="help" :size="15" />
      </button>
      <button
        :class="['icon-btn', { on: view === 'settings' }]"
        @click="view = 'settings'"
        :title="t('topbar.settings')"
      >
        <Icon name="settings" :size="15" />
      </button>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  height: var(--layout-topbar);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 0 var(--space-4) 0 var(--space-3);
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
  position: relative;
  z-index: 20;
}

/* ---------- 品牌 ---------- */
.brand {
  display: flex;
  align-items: center;
  gap: 9px;
  height: 36px;
  padding: 0 8px 0 4px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
}
.brand:hover:not(:disabled) { background: var(--color-bg-hover); border-color: transparent; }
.logo { display: flex; align-items: center; justify-content: center; }
.brand-text { display: flex; align-items: baseline; gap: 6px; }
.name {
  font-size: var(--font-md);
  font-weight: 650;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
}
.ver {
  font-size: var(--font-2xs);
  color: var(--color-text-tertiary);
  padding: 1px 4px;
  border-radius: var(--radius-xs);
  background: var(--color-bg-subtle);
}

/* ---------- 导航 ---------- */
.tabs {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  margin-left: var(--space-2);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}
.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 11px;
  font-size: var(--font-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  white-space: nowrap;
  flex-shrink: 0;
}
.tab:hover:not(:disabled) {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
  border-color: transparent;
}
.tab.active {
  background: var(--color-bg-elevated);
  color: var(--color-accent);
  font-weight: 600;
  box-shadow: var(--shadow-xs);
  border-color: var(--color-border);
}
.tab.active:hover:not(:disabled) { background: var(--color-bg-elevated); }
.tab-badge {
  min-width: 15px;
  height: 15px;
  padding: 0 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9.5px;
  font-weight: 700;
  color: var(--color-on-accent);
  background: var(--color-accent);
  border-radius: var(--radius-full);
}

.grow { flex: 1; }

/* ---------- 搜索 ---------- */
.search {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 300px;
  flex: 0 1 300px;
  min-width: 0;
  height: 32px;
  padding: 0 8px 0 10px;
  background: var(--color-bg-subtle);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  transition:
    background var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}
.search.on {
  background: var(--color-bg-elevated);
  border-color: var(--color-accent-line);
  box-shadow: var(--shadow-focus);
}
.s-ico { color: var(--color-text-tertiary); }
.search.on .s-ico { color: var(--color-accent); }
.search input {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0;
  border: none;
  background: transparent;
  font-size: var(--font-sm);
}
.search input:focus { border: none; box-shadow: none; }
.s-kbd { flex-shrink: 0; opacity: 0.85; }
.s-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border: none;
  border-radius: var(--radius-full);
  background: var(--color-bg-active);
  color: var(--color-text-secondary);
}
.s-clear:hover:not(:disabled) { background: var(--color-border-strong); border-color: transparent; }

/* ---------- 右侧动作 ---------- */
.actions { display: flex; align-items: center; gap: 2px; }
.icon-btn.lang {
  font-size: var(--font-2xs);
  font-weight: 700;
  letter-spacing: 0.02em;
}
.cmd { color: var(--color-text-secondary); }

/* ---------- 窄窗口自适应：优先保住导航与搜索 ---------- */
@media (max-width: 1200px) {
  .tab { padding: 0 9px; gap: 5px; }
  .search { flex-basis: 220px; }
}
@media (max-width: 1080px) {
  .tab :deep(svg) { display: none; }
  .tab { padding: 0 10px; }
  .search { flex-basis: 170px; }
  .s-kbd { display: none; }
  .brand-text .ver { display: none; }
}
@media (max-width: 900px) {
  .brand-text { display: none; }
}
</style>
