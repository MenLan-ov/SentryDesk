<script setup lang="ts">
import { APP_VERSION_LABEL } from "../version";
/** 快捷键总览：? 唤出，纯展示，不拦截其它操作 */
import { computed } from "vue";
import Icon from "./Icon.vue";
import { helpOpen, theme } from "../store";

const zh = computed(() => theme.lang === "zh-CN");

const groups = computed(() => [
  {
    label: zh.value ? "全局" : "Global",
    icon: "command",
    rows: [
      { keys: ["Ctrl", "K"], zh: "命令面板", en: "Command palette" },
      { keys: ["Ctrl", "F"], zh: "聚焦搜索框", en: "Focus search" },
      { keys: ["/"], zh: "快速搜索", en: "Quick search" },
      { keys: ["?"], zh: "打开这张表", en: "This panel" },
      { keys: ["Esc"], zh: "关闭浮层 / 清空搜索", en: "Close overlay / clear" },
    ],
  },
  {
    label: zh.value ? "视图" : "Views",
    icon: "layers",
    rows: [
      { keys: ["Ctrl", "1"], zh: "学习", en: "Learn" },
      { keys: ["Ctrl", "2"], zh: "学习路径", en: "Paths" },
      { keys: ["Ctrl", "3"], zh: "情报检索", en: "Intel" },
      { keys: ["Ctrl", "4"], zh: "数据看板", en: "Dashboard" },
      { keys: ["Ctrl", "5"], zh: "错题本", en: "Review" },
      { keys: ["Ctrl", "6"], zh: "设置", en: "Settings" },
    ],
  },
  {
    label: zh.value ? "列表" : "Lists",
    icon: "list",
    rows: [
      { keys: ["↑", "↓"], zh: "上一条 / 下一条", en: "Previous / next item" },
      { keys: ["Enter"], zh: "打开选中项", en: "Open selection" },
      { keys: ["右键"], zh: "上下文菜单", en: "Context menu" },
    ],
  },
  {
    label: zh.value ? "复习" : "Review",
    icon: "target",
    rows: [
      { keys: ["1", "–", "4"], zh: "选择答案", en: "Pick an answer" },
      { keys: ["1", "2", "3"], zh: "忘记 / 有点印象 / 记住了", en: "Forgot / shaky / got it" },
    ],
  },
]);

function close() {
  helpOpen.value = false;
}
</script>

<template>
  <Transition name="help">
    <div v-if="helpOpen" class="backdrop" @mousedown.self="close">
      <div class="panel" role="dialog" aria-modal="true" @keydown.esc="close">
        <header class="head">
          <span class="h-ico"><Icon name="command" :size="16" /></span>
          <div class="h-text">
            <h2>{{ zh ? "快捷键与操作" : "Shortcuts" }}</h2>
            <p>{{ zh ? "全部功能都能用键盘走完，不依赖鼠标。" : "Everything can be driven from the keyboard." }}</p>
          </div>
          <button class="icon-btn" @click="close" :title="zh ? '关闭' : 'Close'">
            <Icon name="x" :size="15" />
          </button>
        </header>

        <div class="body">
          <section v-for="g in groups" :key="g.label" class="group">
            <h3 class="g-title"><Icon :name="g.icon" :size="13" />{{ g.label }}</h3>
            <div class="g-rows">
              <div v-for="r in g.rows" :key="r.zh" class="r">
                <span class="r-keys">
                  <span v-for="k in r.keys" :key="k" class="kbd">{{ k }}</span>
                </span>
                <span class="r-label">{{ zh ? r.zh : r.en }}</span>
              </div>
            </div>
          </section>
        </div>

        <footer class="foot">
          <span class="dot"></span>
          <span>SentryDesk {{ APP_VERSION_LABEL }} · {{ zh ? "本地运行，数据不出机器" : "local-first, nothing leaves your machine" }}</span>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 210;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(12, 18, 16, 0.34);
  backdrop-filter: blur(3px);
}
.panel {
  width: min(560px, calc(100vw - 64px));
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  animation: pop-in 180ms var(--ease-out);
}

.head {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}
.h-ico {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  background: var(--color-accent-soft);
  color: var(--color-accent);
}
.h-text { flex: 1; min-width: 0; }
.h-text h2 {
  margin: 0 0 2px;
  font-size: var(--font-lg);
  font-weight: 650;
  color: var(--color-text-primary);
}
.h-text p { margin: 0; font-size: var(--font-xs); color: var(--color-text-tertiary); }

.body {
  padding: var(--space-4);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.group { display: flex; flex-direction: column; gap: var(--space-2); }
.g-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: var(--font-2xs);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}
.g-rows { display: flex; flex-direction: column; gap: 1px; }
.r {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 6px 8px;
  border-radius: var(--radius-xs);
}
.r:hover { background: var(--color-bg-subtle); }
.r-keys { display: flex; gap: 4px; min-width: 108px; }
.r-label { font-size: var(--font-sm); color: var(--color-text-secondary); }

.foot {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 10px var(--space-4);
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-subtle);
  font-size: var(--font-2xs);
  color: var(--color-text-tertiary);
}
.dot { width: 6px; height: 6px; border-radius: 50%; background: var(--color-accent); }

.help-enter-active, .help-leave-active { transition: opacity 150ms var(--ease-out); }
.help-enter-from, .help-leave-to { opacity: 0; }
</style>
