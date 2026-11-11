<script setup lang="ts">
// 通用右键菜单：由 useContextMenu 驱动，全局单例
import { computed, onMounted, onUnmounted } from "vue";
import { menuState, closeMenu } from "../composables/useContextMenu";

const items = computed(() => menuState.items);
const style = computed(() => {
  const x = Math.min(menuState.x, window.innerWidth - 220);
  const y = Math.min(menuState.y, window.innerHeight - Math.max(60, items.value.length * 30 + 16));
  return { left: x + "px", top: y + "px" };
});

function run(it: { key: string; action: () => void; disabled?: boolean }) {
  if (it.disabled) return;
  it.action();
  closeMenu();
}

function onKey(e: KeyboardEvent) {
  if (e.key === "Escape") closeMenu();
}

onMounted(() => {
  window.addEventListener("keydown", onKey);
  window.addEventListener("blur", closeMenu);
});
onUnmounted(() => {
  window.removeEventListener("keydown", onKey);
  window.removeEventListener("blur", closeMenu);
});
</script>

<template>
  <Teleport to="body">
    <div v-if="menuState.open" class="cm-mask" @click="closeMenu" @contextmenu.prevent="closeMenu"></div>
    <div v-if="menuState.open" class="cm" :style="style" role="menu">
      <template v-for="it in items" :key="it.key">
        <div v-if="it.separator" class="cm-sep"></div>
        <button
          v-else
          class="cm-item"
          :class="{ disabled: it.disabled, danger: it.danger }"
          role="menuitem"
          :disabled="it.disabled"
          @click="run(it)"
        >
          <span class="cm-label">{{ it.label }}</span>
          <span v-if="it.hint" class="cm-hint mono">{{ it.hint }}</span>
        </button>
      </template>
    </div>
  </Teleport>
</template>

<style scoped>
.cm-mask { position: fixed; inset: 0; z-index: 900; }
.cm {
  position: fixed;
  z-index: 901;
  min-width: 200px;
  padding: 4px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
}
.cm-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: 6px var(--space-3);
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  text-align: left;
  font-size: var(--font-sm);
  color: var(--color-text-primary);
}
.cm-item:hover:not(.disabled) { background: var(--color-bg-hover); }
.cm-item.disabled { opacity: 0.4; cursor: not-allowed; }
.cm-item.danger { color: var(--color-sev-critical); }
.cm-label { flex: 1; }
.cm-hint { font-size: 10px; color: var(--color-text-tertiary); }
.cm-sep { height: 1px; background: var(--color-border); margin: 4px 6px; }
</style>
