<style lang="scss" scoped>
// Styling for background ("theme")
.themeWrapper {
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;

  &.texture {
    opacity: 0.1;
  }
}

.v-toolbar__title {
  &.centered {
    position: absolute;
    display: flex;
    left: 0px;
    width: 100%;
    justify-content: center;
    letter-spacing: 5px;
  }
}
</style>

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
        <v-icon>{{ icons.mdiWindowMinimize }}</v-icon>
      </v-btn>
      <v-btn
        icon
        @click="maximizeWindow()"
      >
        <v-icon>{{ icons.mdiWindowMaximize }}</v-icon>
      </v-btn>
      <v-btn
        icon
        class="justify-self-end"
        @click="closeWindow()"
      >
        <v-icon>{{ icons.mdiClose }}</v-icon>
      </v-btn>

      <template v-slot:extension>
        <!-- Force re-render of tabs on locale change, else tab indicator width is wrong -->
        <v-tabs
          centered
          v-model="activeTab"
          :key="locale"
        >
          <v-tab :disabled="!setupCompleted">
            <v-icon left>{{ icons.mdiGamepad }}</v-icon>{{ $t("nav.library") }}
          </v-tab>
          <v-tab>
            <v-icon left>{{ icons.mdiCog }}</v-icon>{{ $t("nav.settings") }}
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
            <games-view :online="online" />
          </v-tab-item>
          <v-tab-item>
            <settings-view :online="online" />
          </v-tab-item>
        </v-tabs-items>
      </v-container>
    </v-main>

    <service-statistics :online="online"></service-statistics>
  </v-app>
</template>

<script>
import { mdiClose, mdiCog, mdiGamepad, mdiWindowMaximize, mdiWindowMinimize } from "@mdi/js";
import { mapState } from "vuex";
import GamesView from "./components/GamesView";
import ServiceStatistics from "./components/ServiceStatistics";
import SettingsView from "./components/SettingsView";
import SyncServiceController from "./controllers/SyncServiceRendererController";
import WindowOperation from "./enums/WindowOperation";

import hsl from "hsl-to-hex";
import SyncServiceRendererController from "./controllers/SyncServiceRendererController";
import Mutations from "./enums/Mutations";

let pingIntervalHandle;
let storeSubscriptionCallback;

export default {
  name: "app",
  components: {
    SettingsView,
    GamesView,
    ServiceStatistics,
  },
  data() {
    return {
      activeTab: 1,
      online: false,
      nasId: "",
    };
  },
  computed: {
    icons() {
      return {
        mdiWindowMinimize,
        mdiWindowMaximize,
        mdiClose,
        mdiGamepad,
        mdiCog
      }
    },
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
  watch: {
    online(newVal, oldVal) {
      if (newVal != oldVal) {
        if (newVal) {
          this.$toasted.success(this.$t("toast.service.connection.connected"));
        } else {
          this.$toasted.error(this.$t("toast.service.connection.disconnected"));
        }
      }
    },
  },
  beforeMount() {
    // Setup API key handler
    window.ipcRenderer.on("setApiKey", async (event, apiKey) => {
      this.$store.commit(Mutations.API_KEY, apiKey);
    });

    // Set vuetify primary color
    this.$vuetify.theme.themes.dark.primary = this.primaryColor;

    // Setup notification handles
    storeSubscriptionCallback = this.$store.subscribe((mutation) => {
      switch (mutation.type) {
        case Mutations.BACKGROUND_HUE:
          this.$vuetify.theme.themes.dark.primary = this.primaryColor;
          break;
        case Mutations.LOCALE:
          this.$i18n.locale = mutation.payload;
          break;
        case Mutations.API_KEY:
          // Skip showing a toast message for API key mutations
          return;
      }
      this.$toasted.success(this.$t(`toast.${mutation.type}`));
    });

    // Start sync-service on app start
    SyncServiceController.System.start(this.homeDir);

    // Setup global service status poller
    clearInterval(pingIntervalHandle);
    pingIntervalHandle = setInterval(this.pingService, 5000);

    // Set initial tab
    this.activeTab = this.setupCompleted ? 0 : 1;

    window.addEventListener(
      "beforeunload",
      async () => await SyncServiceRendererController.System.stop()
    );
  },
  destroyed() {
    window.ipcRenderer.removeAllListeners();
    clearInterval(pingIntervalHandle);
    storeSubscriptionCallback();
  },
  methods: {
    /**
     * Ping service and set `online` state attribute accordingly.
     */
    pingService() {
      SyncServiceController.System.ping()
        .then(() => {
          this.online = true;
        })
        .catch(() => {
          this.online = false;

          // Get current API key if ping fails
          SyncServiceRendererController.System.getApiKey(this.homeDir).then(
            (apiKey) => {
              this.$store.commit(Mutations.API_KEY, apiKey);
            }
          );
        });
    },

    /**
     * Send window operations to main process.
     * @param {String} action The window action.
     */
    sendWindowControl(action) {
      window.ipcRenderer.send("controlWindow", action);
    },

    /**
     * Minimize window.
     */
    minimizeWindow() {
      this.sendWindowControl(WindowOperation.MINIMIZE);
    },

    /**
     * Maximize window.
     */
    maximizeWindow() {
      this.sendWindowControl(WindowOperation.MAXIMIZE);
    },

    /**
     * Close Window.
     */
    closeWindow() {
      this.sendWindowControl(WindowOperation.CLOSE);
    },
  },
};
</script>
