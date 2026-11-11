<script setup lang="ts">
// 易受攻击代码 / 修复代码 对比展示
import { computed, ref } from "vue";
import type { CodeBlock } from "../types";
import { theme } from "../store";

const props = defineProps<{ block: CodeBlock; index?: number }>();
const copied = ref<"bad" | "good" | "">("");

const label = computed(() =>
  theme.lang === "zh-CN"
    ? { bad: "易受攻击", good: "修复后" }
    : { bad: "Vulnerable", good: "Fixed" }
);

const langName = computed(() => props.block.lang.toUpperCase());
// 英文界面没有对应标题时回退到语言名，避免中文串入
const title = computed(() => {
  if (theme.lang === "zh-CN") return props.block.title || langName.value;
  return props.block.title_en || langName.value;
});
const note = computed(() => {
  if (theme.lang === "zh-CN") return props.block.note;
  return props.block.note_en || "";
});


// ---- 右键菜单 ----
import { openMenu, copyText, SEP } from "../composables/useContextMenu";

function onCodeContext(e: MouseEvent, code: string, what: string) {
  openMenu(e, [
    {
      key: "copy",
      label: `复制${what}代码`,
      hint: "Ctrl+C",
      action: () => copyText(code, what),
    },
    {
      key: "copy-md",
      label: "复制为代码块（含语言标记）",
      action: () =>
        copyText("```" + props.block.lang + "\n" + code + "\n```", what),
    },
    SEP,
    {
      key: "select-all",
      label: "全选这段",
      action: () => {
        const sel = window.getSelection();
        const pre = (e.target as HTMLElement).closest("pre");
        if (sel && pre) {
          const r = document.createRange();
          r.selectNodeContents(pre);
          sel.removeAllRanges();
          sel.addRange(r);
        }
      },
    },
  ]);
}
async function copy(text: string, which: "bad" | "good") {
  try {
    await navigator.clipboard.writeText(text);
    copied.value = which;
    window.setTimeout(() => (copied.value = ""), 1400);
  } catch {
    /* 剪贴板不可用时静默失败，不影响阅读 */
  }
}
</script>

<template>
  <div class="cmp">
    <div class="cmp-head">
      <span class="cmp-title">{{ title }}</span>
      <span class="cmp-lang mono">{{ langName }}</span>
    </div>

    <div class="cmp-grid">
      <div class="pane bad">
        <div class="pane-head">
          <span class="dot"></span>
          <span class="pane-label">{{ label.bad }}</span>
          <button class="copy" @click="copy(block.bad, 'bad')">
            {{ copied === 'bad' ? '✓' : '⧉' }}
          </button>
        </div>
        <pre
          class="code"
          tabindex="0"
          data-ctx="code"
          @contextmenu="onCodeContext($event, block.bad, label.bad)"
        ><code>{{ block.bad }}</code></pre>
      </div>

      <div class="pane good">
        <div class="pane-head">
          <span class="dot"></span>
          <span class="pane-label">{{ label.good }}</span>
          <button class="copy" @click="copy(block.good, 'good')">
            {{ copied === 'good' ? '✓' : '⧉' }}
          </button>
        </div>
        <pre
          class="code"
          tabindex="0"
          data-ctx="code"
          @contextmenu="onCodeContext($event, block.good, label.good)"
        ><code>{{ block.good }}</code></pre>
      </div>
    </div>

    <p v-if="note" class="cmp-note">{{ note }}</p>
  </div>
</template>

<style scoped>
.cmp {
  margin: var(--space-3) 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-bg-elevated);
}
.cmp-head {
  display: flex; align-items: center; gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-subtle);
}
.cmp-title { font-size: var(--font-xs); font-weight: 600; color: var(--color-text-secondary); }
.cmp-lang {
  margin-left: auto;
  font-size: 10px;
  padding: 0 6px;
  border: 1px solid var(--color-border);
  border-radius: 3px;
  color: var(--color-text-tertiary);
}

.cmp-grid { display: grid; grid-template-columns: 1fr 1fr; }
@media (max-width: 860px) { .cmp-grid { grid-template-columns: 1fr; } }

.pane { min-width: 0; }
.pane.bad { border-right: 1px solid var(--color-border); }
.pane-head {
  display: flex; align-items: center; gap: 6px;
  padding: 5px var(--space-3);
  font-size: 11px;
}
.pane.bad .pane-head { background: color-mix(in srgb, #e05a4f 8%, transparent); }
.pane.good .pane-head { background: color-mix(in srgb, var(--color-sev-low) 8%, transparent); }
.dot { width: 6px; height: 6px; border-radius: 50%; }
.pane.bad .dot { background: #e05a4f; }
.pane.good .dot { background: var(--color-sev-low); }
.pane-label { font-weight: 600; }
.pane.bad .pane-label { color: #c0392b; }
.pane.good .pane-label { color: #4d7c0f; }
.copy {
  margin-left: auto;
  border: none; background: transparent;
  padding: 0 4px;
  font-size: 12px;
  color: var(--color-text-tertiary);
  cursor: pointer;
}
.copy:hover { background: transparent; color: var(--color-text-primary); }

.code {
  margin: 0;
  padding: var(--space-3);
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.7;
  overflow-x: auto;
  color: var(--color-text-primary);
  background: transparent;
  white-space: pre;
  tab-size: 2;
}
.cmp-note {
  margin: 0;
  padding: var(--space-2) var(--space-3);
  border-top: 1px solid var(--color-border);
  font-size: 11px;
  color: var(--color-text-tertiary);
  background: var(--color-bg-subtle);
  line-height: 1.6;
}
</style>