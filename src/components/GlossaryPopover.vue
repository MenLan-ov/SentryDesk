<script setup lang="ts">
import { computed } from "vue";
import type { GlossaryTerm } from "../types";
import { openLesson, theme } from "../store";

const props = defineProps<{ term: GlossaryTerm | null; x: number; y: number }>();
const emit = defineEmits<{ close: [] }>();

const zh = computed(() => theme.lang === "zh-CN");
const style = computed(() => ({
  left: Math.min(props.x, window.innerWidth - 360) + "px",
  top: Math.min(props.y + 12, window.innerHeight - 220) + "px",
}));
</script>

<template>
  <Teleport to="body">
    <div v-if="term" class="mask" @click="emit('close')"></div>
    <div v-if="term" class="pop" :style="style" @click.stop>
      <div class="pop-head">
        <span class="pop-term">{{ zh ? term.term : (term.term_en || term.term) }}</span>
        <span v-if="term.term_en" class="pop-en mono">{{ term.term_en }}</span>
        <button class="pop-x" @click="emit('close')">×</button>
      </div>
      <p class="pop-def">{{ zh ? term.definition : (term.definition_en || term.definition) }}</p>
      <div v-if="term.related?.length" class="pop-rel">
        <button
          v-for="r in term.related.slice(0, 3)"
          :key="r"
          class="pop-link"
          @click="openLesson(r); emit('close')"
        >{{ zh ? '相关' : 'Related' }} → {{ r }}</button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.mask { position: fixed; inset: 0; z-index: 200; }
.pop {
  position: fixed;
  z-index: 201;
  width: 340px;
  padding: var(--space-3);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
.pop-head { display: flex; align-items: baseline; gap: var(--space-2); margin-bottom: var(--space-2); }
.pop-term { font-size: var(--font-md); font-weight: 600; color: var(--color-accent); }
.pop-en { font-size: 10px; color: var(--color-text-tertiary); flex: 1; }
.pop-x {
  border: none; background: transparent; padding: 0 4px;
  font-size: 16px; line-height: 1; color: var(--color-text-tertiary);
}
.pop-x:hover { background: transparent; color: var(--color-text-primary); }
.pop-def { margin: 0; font-size: var(--font-sm); line-height: 1.75; color: var(--color-text-secondary); }
.pop-rel { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-top: var(--space-2); padding-top: var(--space-2); border-top: 1px solid var(--color-border); }
.pop-link {
  border: none; background: transparent; padding: 0;
  font-size: 11px; color: var(--color-accent);
}
.pop-link:hover { background: transparent; text-decoration: underline; }
</style>
