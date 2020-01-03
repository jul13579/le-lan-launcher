<template>
  <div id="app" class="outer-container" :style="{background: $store.state.backgroundColor}">
    <div class="outer-container"></div>
  </div>
</template>

<script>
export default {
  name: "app",
  components: {},
  beforeMount() {
    // this.init();
    // this.$store.subscribe(mutation => {
    //   if (mutation.type == "backgroundColor") {
    //     this.init();
    //   }
    // });
  },
  methods: {
    init() {
      // let backgroundColor = this.$store.state.backgroundColor
      // this.$vs.theme({
      //   primary: backgroundColor
      // });
    }
  }
};
</script>

<style lang="sass">
  .outer-container
    width: 100%
    height: 100%
    max-width: 100%
    max-height: 100%
    overflow: hidden
</style>
