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
        <games :online="online"></games>
      </vs-tab>
      <vs-tab
        label="Einstellungen"
        icon="settings"
      >
        <settings :online="online"></settings>
      </vs-tab>
    </vs-tabs>
    <statistics :online="online"></statistics>
  </div>
</template>

<script>
import Settings from "./components/Settings";
import Games from "./components/Games";
import Statistics from "./components/Statistics";
import { mapState } from "vuex";

import AJAX from "./ajax";

let backgroundColorTimeout, playerNameTimeout, intervalHandle;

export default {
  name: "app",
  components: {
    Settings,
    Games,
    Statistics
  },
  data() {
    return {
      activeTab: this.$store.state.homeDir != false ? 0 : 1,
      online: false
    };
  },
  computed: {
    setupCompleted() {
      return this.playerName != false && this.homeDir != false;
    },
    ...mapState(["backgroundColor", "theme", "playerName", "homeDir"])
  },
  beforeMount() {
    // Setup notification handles
    this.$store.subscribe(mutation => {
      switch (mutation.type) {
        case "theme":
          this.$toasted.global.success("Design gespeichert");
          break;
        case "backgroundColor":
          clearTimeout(backgroundColorTimeout);
          backgroundColorTimeout = setTimeout(
            function() {
              this.$toasted.global.success("Farbton gespeichert");
            }.bind(this),
            1000
          );
          break;
        case "playerName":
          clearTimeout(playerNameTimeout);
          playerNameTimeout = setTimeout(
            function() {
              this.$toasted.global.success("Spielername gespeichert");
            }.bind(this),
            1000
          );
          break;
        case "homeDir":
          this.$toasted.global.success("Spieleverzeichnis-Pfad gespeichert");
          break;
        case "started":
          if (mutation.payload == true) {
            this.$toasted.global.success("Service startet...");
          } else {
            this.$toasted.global.success("Service gestoppt");
          }
      }
    });

    // Setup global service status poller
    clearInterval(intervalHandle);
    intervalHandle = setInterval(() => {
      AJAX.Syncthing.System.ping()
        .then(() => {
          this.online = true;
        })
        .catch(() => {
          this.online = false;
        });
    }, 5000);
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
    padding-left: 0px

    .texture
      position: absolute
      top: 0
      left: 0
      filter: opacity(0.1)
</style>
