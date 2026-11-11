<script setup lang="ts">
// 错误边界：任何子组件抛异常时显示可恢复界面，避免整页白屏
import { onErrorCaptured, ref } from "vue";
import { theme } from "../store";

const err = ref<Error | null>(null);
const info = ref("");

onErrorCaptured((e, instance, trace) => {
  err.value = e as Error;
  // 带上出错组件名，否则只看到一句 TypeError，定位全靠猜
  const name =
    (instance as { $options?: { __name?: string } } | null)?.$options?.__name ?? "unknown";
  info.value = [String(e), "at <" + name + ">", (e as Error)?.stack?.split("\n").slice(1, 4).join("\n"), trace].filter(Boolean).join("\n").slice(0, 900);
  // 返回 false 阻止继续向上传播
  return false;
});

function reload() {
  err.value = null;
  window.location.reload();
}

function dismiss() {
  err.value = null;
}
</script>

<template>
  <div v-if="err" class="eb">
    <div class="eb-card">
      <h2 class="eb-title">
        {{ theme.lang === "zh-CN" ? "界面出现了异常" : "Something went wrong" }}
      </h2>
      <p class="eb-sub">
        {{ theme.lang === "zh-CN"
          ? "数据仍安全保存在本机。可以尝试关闭提示继续使用，或刷新界面。"
          : "Your data is still safe locally. You can dismiss this and continue, or reload the interface." }}
      </p>
      <pre class="eb-trace mono">{{ info }}</pre>
      <div class="eb-actions">
        <button class="primary" @click="reload">
          {{ theme.lang === "zh-CN" ? "刷新界面" : "Reload" }}
        </button>
        <button @click="dismiss">
          {{ theme.lang === "zh-CN" ? "关闭提示" : "Dismiss" }}
        </button>
      </div>
    </div>
  </div>
  <!-- 必须包一层真实 DOM：<slot> 本身是 Vue 片段，不产生元素，
       子视图的 flex:1 / overflow-y:auto 会因缺少 flex 父容器而失效，
       表现是教学卡详情页滚不动（内容被裁在视口内）。 -->
  <div v-else class="eb-pass">
    <slot />
  </div>
</template>

<style scoped>
.eb-pass { flex: 1; display: flex; flex-direction: column; min-height: 0; min-width: 0; }
.eb { flex: 1; display: flex; align-items: center; justify-content: center; padding: var(--space-6); background: var(--color-bg-elevated); }
.eb-card { max-width: 640px; width: 100%; border: 1px solid var(--color-sev-critical); border-radius: var(--radius-md); padding: var(--space-5); display: flex; flex-direction: column; gap: var(--space-3); }
.eb-title { margin: 0; font-size: var(--font-lg); font-weight: 600; color: var(--color-sev-critical); }
.eb-sub { margin: 0; font-size: var(--font-sm); line-height: 1.7; color: var(--color-text-secondary); }
.eb-trace { margin: 0; padding: var(--space-3); background: var(--color-bg-subtle); border-radius: var(--radius-sm); font-size: 11px; line-height: 1.6; color: var(--color-text-tertiary); max-height: 200px; overflow: auto; white-space: pre-wrap; word-break: break-all; }
.eb-actions { display: flex; gap: var(--space-2); }
</style>
