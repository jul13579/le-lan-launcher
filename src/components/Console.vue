<style lang="scss" scoped>
.console {
  max-width: 100%;
  overflow-y: auto;
  white-space: pre;
  text-align: left;
}
</style>

<template>
  <div
    class="console"
    ref="console"
    :style="{maxHeight}"
  >
    <span
      v-for="(item, index) in messages"
      :key="index"
      :style="{color: item.type == 'stderr' ? 'red' : 'inherit'}"
    >{{item.message}}</span>
  </div>
</template>

<script>
export default {
  model: {
    prop: "messages",
    event: "change",
  },
  props: {
    messages: {
      type: Array,
      default: null,
    },
    maxHeight: {
      type: String,
      default: "200px",
    },
  },
  beforeUpdate() {
    // Only autoscroll after update if the current scroll is at bottom
    const scrollEl = this.$refs.console;
    if (
      scrollEl.scrollTop >=
      scrollEl.scrollHeight - scrollEl.getBoundingClientRect().height
    ) {
      this.$nextTick(() => {
        scrollEl.scrollTop = scrollEl.scrollHeight;
      });
    }
  },
};
</script>