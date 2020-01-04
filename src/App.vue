<template>
  <div
    id="app"
    class="frame"
    :style="{background: backgroundColor}"
  >
    <div
      class="frame texture"
      :style="{background: 'url('+theme+')'}"
    ></div>
    <vs-tabs
      v-model="activeTab"
      position="left"
    >
      <vs-tab
        label="Spielebibliothek"
        icon="gamepad"
        :disabled="!setupCompleted"
      >
        <div>
          Home
        </div>
      </vs-tab>
      <vs-tab
        label="Einstellungen"
        icon="settings"
      >
        <settings></settings>
      </vs-tab>
    </vs-tabs>
  </div>
</template>

<script>
import Settings from "./components/Settings";

export default {
  name: "app",
  components: {
    Settings
  },
  data() {
    return {
      backgroundColor: this.$store.state.backgroundColor,
      theme: this.$store.state.theme,
      setupCompleted: this.$store.state.setupCompleted,
      activeTab: this.$store.state.setupCompleted ? 0 : 1
    };
  },
  beforeMount() {
    this.$store.subscribe(mutation => {
      if (mutation.type == "backgroundColor") {
        this.backgroundColor = mutation.payload;
      }
      if (mutation.type == "theme") {
        this.theme = mutation.payload;
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
      filter: opacity(0.1)
</style>
