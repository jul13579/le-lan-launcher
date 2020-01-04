<template>
  <div
    id="app"
    class="frame"
    :style="{background: 'linear-gradient(' + backgroundColor + ', black)'}"
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
import { mapState } from "vuex";

let backgroundColorTimeout, playerNameTimeout;

export default {
  name: "app",
  components: {
    Settings
  },
  data() {
    return {
      activeTab: this.$store.state.setupCompleted ? 0 : 1,
      setupCompleted: false
    };
  },
  computed: mapState(["backgroundColor", "theme"]),
  beforeMount() {
    this.$store.subscribe(mutation => {
      switch (mutation.type) {
        case "theme":
          this.$toasted.global.success("Design gespeichert");
          break;
        case "backgroundColor":
          clearTimeout(backgroundColorTimeout);
          backgroundColorTimeout = setTimeout(function() {
            this.$toasted.global.success("Farbton gespeichert");
          }.bind(this), 1000);
          break;
        case "playerName":
          clearTimeout(playerNameTimeout);
          playerNameTimeout = setTimeout(function() {
            this.$toasted.global.success("Spielername gespeichert");
          }.bind(this), 1000);
          break;
        case "homeDir":
          this.$toasted.global.success("Spieleverzeichnis-Pfad gespeichert");
          break;
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
