<template>
  <div ref="console" class="console" style="max-height: 150px">
    <span v-for="(item, index) in model" :key="index" :style="{ color: item.type == 'stderr' ? 'red' : 'inherit' }">{{
      item.message }}</span>
  </div>
</template>

<script setup lang="ts">
import { defineModel, onBeforeUpdate, ref, nextTick } from "vue";

const model = defineModel<Array<{ message: string, type: string }>>({
  default: []
});

const console = ref(null);

onBeforeUpdate(() => {
  // Only autoscroll after update if the current scroll is at bottom
  const scrollEl = console.value;
  if (
    scrollEl.scrollTop >=
    scrollEl.scrollHeight - scrollEl.getBoundingClientRect().height
  ) {
    nextTick(() => {
      scrollEl.scrollTop = scrollEl.scrollHeight;
    });
  }
})
</script>

<style lang="scss" scoped>
.console {
  max-width: 100%;
  overflow-y: auto;
  white-space: pre;
  text-align: left;
  user-select: all;
}
</style>