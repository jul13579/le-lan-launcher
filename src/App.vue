<template>
  <v-app>
    <div
      class="themeWrapper bgColor"
      :style="{
        background: `linear-gradient(hsl(${backgroundHue}, 75%, 8%), black)`,
      }"
    />
    <div
      class="themeWrapper texture"
      :style="{
        background: `url('${theme.path}')`,
        backgroundPosition: theme.cover ? 'center' : 'initial',
        backgroundSize: theme.cover ? 'cover' : 'initial',
      }"
    />

    <v-app-bar
      app
      elevate-on-scroll
      class="justify-center"
    >
      <v-avatar class="mr-2"><img :src="require('../public/icon.png')" /></v-avatar>
      <v-spacer></v-spacer>
      <v-toolbar-title class="centered"><span>LAN-Launcher</span></v-toolbar-title>
      <v-spacer></v-spacer>

      <v-btn
        icon
        @click="minimizeWindow()"
      >
        <v-icon>mdi-window-minimize</v-icon>
      </v-btn>
      <v-btn
        icon
        @click="maximizeWindow()"
      >
        <v-icon>mdi-window-maximize</v-icon>
      </v-btn>
      <v-btn
        icon
        class="justify-self-end"
        @click="closeWindow()"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>

      <template v-slot:extension>
        <!-- Force re-render of tabs on locale change, else tab indicator width is wrong -->
        <v-tabs
          centered
          v-model="activeTab"
          :key="locale"
        >
          <v-tab :disabled="!setupCompleted">
            <v-icon left>mdi-gamepad</v-icon>{{ $t("nav.library") }}
          </v-tab>
          <v-tab>
            <v-icon left>mdi-cog</v-icon>{{ $t("nav.settings") }}
          </v-tab>
        </v-tabs>
      </template>
    </v-app-bar>

    <v-main>
      <v-container
        fluid
        style="margin-bottom: 66px"
      >
        <v-tabs-items
          v-model="activeTab"
          style="background-color: unset"
        >
          <v-tab-item>
            <games :online="online" />
          </v-tab-item>
          <v-tab-item>
            <settings :online="online"></settings>
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
import WindowOperations from "./enums/WindowOperations";
import { mapState } from "vuex";

import hsl from "hsl-to-hex";

import AJAX from "./ajax";

let pingIntervalHandle;
let unsubscribeCallback;

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
    };
  },
  computed: {
    setupCompleted() {
      return (
        this.playerName != false && this.homeDir != false && this.nas != false
      );
    },
    primaryColor() {
      return hsl(this.backgroundHue, 100, 60);
    },
    ...mapState([
      "theme",
      "playerName",
      "homeDir",
      "nas",
      "backgroundHue",
      "locale",
    ]),
  },
  beforeMount() {
    // Set vuetify primary color
    this.$vuetify.theme.themes.dark.primary = this.primaryColor;

    // Setup notification handles
    unsubscribeCallback = this.$store.subscribe(
      function (mutation) {
        switch (mutation.type) {
          case "theme":
            this.$toasted.success(this.$t("toast.theme"));
            break;
          case "backgroundHue":
            this.$toasted.success(this.$t("toast.backgroundHue"));
            this.$vuetify.theme.themes.dark.primary = this.primaryColor;
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
          case "locale":
            this.$i18n.locale = mutation.payload;
            this.$toasted.success(this.$t("toast.locale"));
            break;
          case "debug":
            this.$toasted.success(this.$t("toast.debug"));
        }
      }.bind(this)
    );

    // Setup global service status poller
    clearInterval(pingIntervalHandle);
    pingIntervalHandle = setInterval(this.pingService, 5000);

    // Set initial tab
    this.activeTab = this.setupCompleted ? 0 : 1;
  },
  destroyed() {
    clearInterval(pingIntervalHandle);
    unsubscribeCallback();
  },
  methods: {
    pingService() {
      AJAX.Syncthing.System.ping()
        .then(() => {
          this.online = true;
        })
        .catch(() => {
          this.online = false;
        });
    },
    sendWindowControl(action) {
      require("electron").ipcRenderer.send("controlWindow", action);
    },
    minimizeWindow() {
      this.sendWindowControl(WindowOperations.MINIMIZE);
    },
    maximizeWindow() {
      this.sendWindowControl(WindowOperations.MAXIMIZE);
    },
    closeWindow() {
      this.sendWindowControl(WindowOperations.CLOSE);
    },
  },
};
</script>
