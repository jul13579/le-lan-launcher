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

let backgroundColorTimeout, pingIntervalHandle, findIntervalHandle;

export default {
  name: "app",
  components: {
    Settings,
    Games,
    Statistics
  },
  data() {
    return {
      activeTab: 1,
      online: false,
      nasId: ""
    };
  },
  computed: {
    setupCompleted() {
      return (
        this.playerName != false &&
        this.homeDir != false &&
        this.nas.ip != false
      );
    },
    ...mapState(["backgroundColor", "theme", "playerName", "homeDir", "nas"])
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
          this.$toasted.global.success("Spielername gespeichert");
          break;
        case "homeDir":
          this.$toasted.global.success("Spieleverzeichnis-Pfad gespeichert");
          break;
        case "nasIp":
          this.$toasted.global.success("NAS IP-Adresse gespeichert");
          clearInterval(findIntervalHandle);
          findIntervalHandle = setInterval(this.findNas, 5000);
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
    clearInterval(pingIntervalHandle);
    pingIntervalHandle = setInterval(() => {
      AJAX.Syncthing.System.ping()
        .then(() => {
          this.online = true;
        })
        .catch(() => {
          this.online = false;
        });
    }, 5000);

    // Set initial tab
    this.activeTab = this.setupCompleted ? 0 : 1;
  },
  destroyed() {
    clearInterval(pingIntervalHandle);
    clearInterval(findIntervalHandle);
  },
  methods: {
    findNas() {
      AJAX.Syncthing.System.getDiscovery().then(response => {
        for (var hostId in response.data) {
          let addresses = response.data[hostId].addresses;
          for (var address of addresses) {
            if (address.includes(this.nas.ip)) {
              this.$store.dispatch("setNasId", {
                id: hostId
              });
              clearInterval(findIntervalHandle);
              break;
            }
          }
        }
      }).catch();
    }
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
