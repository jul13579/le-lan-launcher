<template>
  <div
    id="app"
    class="frame"
    :style="{background: backgroundColor}"
  >
    <div class="frame texture"></div>
    <vs-tabs v-model="activeTab" position="left">
      <vs-tab label="Spielebibliothek" icon="gamepad" :disabled="!setupCompleted">
        <div>
          Home
        </div>
      </vs-tab>
      <vs-tab label="Einstellungen" icon="settings">
        <div>
          Lorem ipsum dolor sit amet
        </div>
      </vs-tab>
    </vs-tabs>
  </div>
</template>

<script>
export default {
  name: "app",
  components: {},
  data() {
    return {
      backgroundColor: this.$store.state.backgroundColor,
      setupCompleted: this.$store.state.setupCompleted,
      activeTab: this.$store.state.setupCompleted ? 0 : 1,
    };
  },
  beforeMount() {
    this.$store.subscribe(mutation => {
      if (mutation.type == "backgroundColor") {
        this.backgroundColor = mutation.payload;
      }
      if (mutation.type == "setupCompleted") {
        this.setupCompleted = mutation.payload;
      }
    });
  }
};
</script>

<style lang="sass">
  .frame
    width: 100%
    height: 100%
    max-width: 100%
    max-height: 100%
    overflow: hidden
    padding: 10px

    .texture
      position: absolute
      top: 0
      left: 0
      background: url('assets/gaming-pattern-alpha.png')
      filter: opacity(0.1)
</style>
