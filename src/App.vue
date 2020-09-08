<style lang="sass">
// .frame
//   width: 100%
//   height: 100%
//   max-width: 100%
//   max-height: 100%
//   overflow: hidden
//   padding: 10px
//   padding-left: 0px

//   .texture
//     position: absolute
//     top: 0
//     left: 0
//     filter: opacity(0.1)

// Make frameless window draggable while excluding buttons and tabs, which still have to be clickable
.app
  &__bar
    -webkit-app-region: drag

    .v-tabs,button
      -webkit-app-region: no-drag
</style>

<template>
  <!-- class="frame"
    :style="{background: 'linear-gradient(' + cachedBackgroundColor + ', black)'}" -->
  <v-app>
    <v-app-bar
      app
      elevate-on-scroll
      class="app__bar"
    >
      <v-app-bar-nav-icon></v-app-bar-nav-icon>
      <v-toolbar-title>{{ require('./config/app').default.title }}</v-toolbar-title>
      <v-spacer></v-spacer>

      <v-btn
        icon
        @click="require('electron').ipcRenderer.send('minimizeWindow')"
      >
        <v-icon>mdi-window-minimize</v-icon>
      </v-btn>
      <v-btn
        icon
        @click="require('electron').ipcRenderer.send('maximizeWindow')"
      >
        <v-icon>mdi-window-maximize</v-icon>
      </v-btn>
      <v-btn
        icon
        @click="require('electron').ipcRenderer.send('closeWindow')"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>

      <template v-slot:extension>
        <v-tabs centered>
          <v-tab>
            <v-icon left>mdi-gamepad</v-icon>{{ $t('nav.library') }}
          </v-tab>
          <v-tab>
            <v-icon left>mdi-cog</v-icon>{{ $t('nav.settings') }}
          </v-tab>
        </v-tabs>
      </template>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <games :online="online" />
      </v-container>
    </v-main>
  </v-app>
  <!-- <div
      class="frame texture"
      :style="{background: 'url('+theme+')'}"
    ></div>
    <vs-tabs
      v-model="activeTab"
      position="left"
    >
      <vs-tab
        :label="$t('nav.library')"
        icon="gamepad"
        :disabled="!setupCompleted"
      >
        <games :online="online"></games>
      </vs-tab>
      <vs-tab
        :label="$t('nav.settings')"
        icon="settings"
      >
        <settings
          :online="online"
          :backgroundColor.sync="cachedBackgroundColor"
        ></settings>
      </vs-tab>
    </vs-tabs>
    <statistics :online="online"></statistics> -->
</template>

<script>
// import Settings from "./components/Settings";
import Games from "./components/Games";
// import Statistics from "./components/Statistics";
import { mapState } from "vuex";

import AJAX from "./ajax";

let backgroundColorTimeout, pingIntervalHandle;

export default {
  name: "app",
  components: {
    // Settings,
    Games,
    // Statistics,
  },
  data() {
    return {
      activeTab: 1,
      online: false,
      nasId: "",
      cachedBackgroundColor: this.$store.state.backgroundColor,
    };
  },
  computed: {
    setupCompleted() {
      return (
        this.playerName != false && this.homeDir != false && this.nas != false
      );
    },
    ...mapState(["theme", "playerName", "homeDir", "nas"]),
  },
  watch: {
    cachedBackgroundColor(value) {
      clearTimeout(backgroundColorTimeout);
      backgroundColorTimeout = setTimeout(
        function () {
          this.$store.dispatch("setBackgroundColor", {
            color: value,
          });
        }.bind(this),
        1000
      );
    },
  },
  beforeMount() {
    // Setup notification handles
    this.$store.subscribe(
      function (mutation) {
        switch (mutation.type) {
          case "theme":
            this.$toasted.global.success(this.$t("toast.theme"));
            break;
          case "backgroundColor":
            this.$toasted.global.success(this.$t("toast.backgroundColor"));
            break;
          case "playerName":
            this.$toasted.global.success(this.$t("toast.playerName"));
            break;
          case "homeDir":
            this.$toasted.global.success(this.$t("toast.homeDir"));
            break;
          case "nas":
            this.$toasted.global.success(this.$t("toast.nas"));
            break;
          case "started":
            if (mutation.payload == true) {
              this.$toasted.global.success(this.$t("toast.service.started"));
            } else {
              this.online = false;
              this.$toasted.global.success(this.$t("toast.service.stopped"));
            }
            break;
          case "locale":
            this.$i18n.locale = mutation.payload;
            this.$toasted.global.success(this.$t("toast.locale"));
            break;
        }
      }.bind(this)
    );

    // Setup global service status poller
    clearInterval(pingIntervalHandle);
    pingIntervalHandle = setInterval(() => {
      if (!this.online) {
        AJAX.Syncthing.System.ping()
          .then(() => {
            this.online = true;
          })
          .catch(() => {
            this.online = false;
          });
      }
    }, 5000);

    // Set initial tab
    this.activeTab = this.setupCompleted ? 0 : 1;
  },
  destroyed() {
    clearInterval(pingIntervalHandle);
  },
};
</script>