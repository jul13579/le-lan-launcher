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

.v-toolbar__title
  &.centered
    position: absolute
    display: flex
    left: 0px
    width: 100%
    justify-content: center
    letter-spacing: 5px

.themeWrapper
  position: fixed
  width: 100vw
  height: 100vh
  top: 0
  left: 0
  &.texture
    opacity: .1
  
</style>

<template>
  <v-app>
    <div
      class="themeWrapper bgColor"
      :style="{background: 'linear-gradient(' + cachedBackgroundColor + ', black)'}"
    />
    <div
      class="themeWrapper texture"
      :style="{background: 'url('+theme+')'}"
    />

    <v-app-bar
      app
      elevate-on-scroll
      class="app__bar blurry-backdrop justify-center"
    >
      <v-avatar class="mr-2"><img :src="require('../public/icon.png')"></v-avatar>
      <v-spacer></v-spacer>
      <v-toolbar-title class="centered"><span>{{ require('./config/app').default.title }}</span></v-toolbar-title>
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
        class="justify-self-end"
        @click="require('electron').ipcRenderer.send('closeWindow')"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>

      <template v-slot:extension>
        <v-tabs
          centered
          v-model="activeTab"
        >
          <v-tab :disabled="!setupCompleted">
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
        <v-tabs-items
          v-model="activeTab"
          style="background-color: unset"
        >
          <v-tab-item>
            <games :online="online" />
          </v-tab-item>
          <v-tab-item>
            <settings
              :online="online"
              :backgroundColor.sync="cachedBackgroundColor"
            ></settings>
          </v-tab-item>
        </v-tabs-items>
      </v-container>
    </v-main>

    <statistics :online="online"></statistics>
  </v-app>
</template>

<script>
import Settings from "./components/Settings";
import Games from "./components/Games";
import Statistics from "./components/Statistics";
import { mapState } from "vuex";

import AJAX from "./ajax";

let backgroundColorTimeout, pingIntervalHandle;

export default {
  name: "app",
  components: {
    Settings,
    Games,
    Statistics,
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
            this.$toasted.success(this.$t("toast.theme"));
            break;
          case "backgroundColor":
            this.$toasted.success(this.$t("toast.backgroundColor"));
            break;
          case "playerName":
            this.$toasted.success(this.$t("toast.playerName"));
            break;
          case "homeDir":
            this.$toasted.success(this.$t("toast.homeDir"));
            break;
          case "nas":
            this.$toasted.success(this.$t("toast.nas"));
            break;
          case "started":
            if (mutation.payload == true) {
              this.$toasted.success(this.$t("toast.service.started"));
            } else {
              this.online = false;
              this.$toasted.success(this.$t("toast.service.stopped"));
            }
            break;
          case "locale":
            this.$i18n.locale = mutation.payload;
            this.$toasted.success(this.$t("toast.locale"));
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