<template>
  <div id="app" class="frame" :style="{background: backgroundColor}">
    <div class="frame texture"></div>
  </div>
</template>

<script>
export default {
  name: "app",
  components: {},
  data() {
    return {
      backgroundColor: this.$store.state.backgroundColor
    };
  },
  beforeMount() {
    this.$store.subscribe(mutation => {
      if (mutation.type == "backgroundColor") {
        this.backgroundColor = mutation.payload;
      }
    });
  },
};
</script>

<style lang="sass">
  .frame
    width: 100%
    height: 100%
    max-width: 100%
    max-height: 100%
    overflow: hidden
    .texture
      background: url('assets/gaming-pattern-alpha.png')
      filter: opacity(0.1)
</style>
