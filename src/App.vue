<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import TopBar from "./components/TopBar.vue";
import Sidebar from "./components/Sidebar.vue";
import ResultList from "./components/ResultList.vue";
import DetailPanel from "./components/DetailPanel.vue";
import StatusBar from "./components/StatusBar.vue";
import HomeView from "./components/HomeView.vue";
import LearnView from "./components/LearnView.vue";
import PathView from "./components/PathView.vue";
import DashboardView from "./components/DashboardView.vue";
import WrongView from "./components/WrongView.vue";
import ContextMenu from "./components/ContextMenu.vue";
import SettingsView from "./components/SettingsView.vue";
import ErrorBoundary from "./components/ErrorBoundary.vue";
import CommandPalette from "./components/CommandPalette.vue";
import ShortcutsOverlay from "./components/ShortcutsOverlay.vue";
import OnboardingWizard from "./components/OnboardingWizard.vue";
import Icon from "./components/Icon.vue";
import {
  allLessons, closeOverlays, doSearch, helpOpen, initCollectEvents, loadFavorites, loadGlossary, loadLessons,
  loadPaths, loadProgress, loadTheme, paletteOpen, paths, progress, refreshSources, refreshStats,
  hideToast, refreshWrongCount, toast, toastErr, view,
} from "./store";
import { initWindow } from "./composables/useWindow";
import { installGlobalContextMenu } from "./composables/useGlobalContext";

/**
 * 全局 Esc：任何浮层（命令面板 / 快捷键表 / 右键菜单）都应能一键关掉。
 * 之前只把 Esc 绑在搜索框和浮层自身元素上，用鼠标点开快捷键表后焦点仍在顶栏按钮上，
 * 按 Esc 毫无反应，只能用鼠标点背景或叉号。
 */
function onGlobalKey(e: KeyboardEvent) {
  if (e.key !== "Escape") return;
  if (paletteOpen.value || helpOpen.value) {
    e.preventDefault();
    closeOverlays();
  }
  // 右键菜单由 ContextMenu 自己监听，这里不越权
}
window.addEventListener("keydown", onGlobalKey);
onUnmounted(() => window.removeEventListener("keydown", onGlobalKey));

// 首次启动引导：只在从没见过向导时出现
const showOnboarding = ref(false);

onMounted(async () => {
  installGlobalContextMenu();
  await initCollectEvents();
  await loadTheme();
  // 术语表先加载，保证教学卡正文的术语高亮一次到位
  await loadGlossary();
  await Promise.all([
    refreshSources(),
    refreshStats(),
    loadLessons(),
    loadPaths(),
    loadProgress(),
    refreshWrongCount(),
    loadFavorites(),
  ]);
  await doSearch();
  // 窗口最后再显示，保证用户看到的第一帧就是完整界面
  await initWindow();
  if (!localStorage.getItem("sd_onboarded_v1")) {
    showOnboarding.value = true;
  }
});
</script>

<template>
  <TopBar />

  <!-- 所有视图用错误边界包裹，单点异常不会导致整页白屏 -->
  <ErrorBoundary>
  <template v-if="view === 'home'">
    <HomeView class="view-enter" />
  </template>
  <template v-else-if="view === 'learn'">
    <LearnView class="view-enter" />
  </template>
  <template v-else-if="view === 'paths'">
    <PathView class="view-enter" :paths="paths" :cards="allLessons" :progress="progress" />
  </template>
  <template v-else-if="view === 'dashboard'">
    <DashboardView class="view-enter" />
  </template>
  <template v-else-if="view === 'wrong'">
    <WrongView class="view-enter" />
  </template>
  <template v-else-if="view === 'settings'">
    <SettingsView class="view-enter" />
  </template>

  <!-- 情报视图：三栏 -->
  <template v-else>
    <div class="main view-enter">
      <Sidebar />
      <ResultList />
      <DetailPanel />
    </div>
  </template>
  </ErrorBoundary>

  <StatusBar />

  <!-- 全局右键菜单（单例） -->
  <ContextMenu />
  <CommandPalette />
  <ShortcutsOverlay />
  <OnboardingWizard v-if="showOnboarding" @done="showOnboarding = false" />

  <Transition name="toast">
    <div v-if="toast" :class="['toast', { err: toastErr }]" @click="hideToast">
      <Icon :name="toastErr ? 'alert' : 'check'" :size="13" class="t-ico" />
      <span>{{ toast }}</span>
    </div>
  </Transition>
</template>

<style scoped>
.main {
  flex: 1;
  display: flex;
  min-height: 0;
  background: var(--color-bg-base);
}
.toast {
  position: fixed;
  bottom: calc(var(--layout-statusbar) + var(--space-4));
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--color-text-primary);
  color: var(--color-bg-elevated);
  padding: 8px 14px;
  border-radius: var(--radius-md);
  font-size: var(--font-sm);
  z-index: 100;
  box-shadow: var(--shadow-md);
  max-width: 70vw;
}
.t-ico { opacity: 0.75; flex-shrink: 0; }
/* 错误提示：颜色区分 + 可点击关闭，长句也不会一闪而过 */
.toast.err { background: #b3261e; color: #fff; }
.toast { cursor: pointer; }
.toast-enter-active, .toast-leave-active { transition: opacity var(--duration-base) var(--ease-out), transform var(--duration-base) var(--ease-out); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 6px); }
</style>
