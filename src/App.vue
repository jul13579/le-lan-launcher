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
    <div class="themeWrapper bgColor" :style="{
      background: `linear-gradient(hsl(${backgroundHue}, 75%, 8%), black)`,
    }" />
    <div class="themeWrapper texture" :style="{
      background: `url('${theme.path}')`,
      backgroundPosition: theme.cover ? 'center' : 'initial',
      backgroundSize: theme.cover ? 'cover' : 'initial',
    }" />

    <v-app-bar app elevate-on-scroll class="justify-center">
      <v-avatar class="mr-2" image="/icon.png" />
      <v-spacer></v-spacer>
      <v-toolbar-title class="centered"><span>LAN-Launcher</span></v-toolbar-title>
      <v-spacer></v-spacer>

      <v-btn icon @click="minimizeWindow()">
        <v-icon>{{ icons.mdiWindowMinimize }}</v-icon>
      </v-btn>
      <v-btn icon @click="maximizeWindow()">
        <v-icon>{{ icons.mdiWindowMaximize }}</v-icon>
      </v-btn>
      <v-btn icon class="justify-self-end" @click="closeWindow()">
        <v-icon>{{ icons.mdiClose }}</v-icon>
      </v-btn>

      <template v-slot:extension>
        <!-- Force re-render of tabs on locale change, else tab indicator width is wrong -->
        <v-tabs centered v-model="activeTab" :key="locale">
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
      <v-container fluid style="margin-bottom: 66px">
        <v-window v-model="activeTab" style="background-color: unset">
          <v-window-item :value="0">
            <!-- <games-view :online="online" /> -->
          </v-window-item>
          <v-window-item :value="1">
            <!-- <settings-view :online="online" /> -->
          </v-window-item>
        </v-window>
      </v-container>
    </v-main>

    <!-- <service-statistics :online="online"></service-statistics> -->
  </v-app>
</template>

<script setup lang="ts">
import { mdiClose, mdiCog, mdiGamepad, mdiWindowMaximize, mdiWindowMinimize } from "@mdi/js";
import { useStore } from "vuex";
// import GamesView from "./components/GamesView";
// import ServiceStatistics from "./components/ServiceStatistics";
// import SettingsView from "./components/SettingsView";
import SyncServiceController from "./controllers/SyncServiceRendererController";
import WindowOperations from "./enums/WindowOperations";

import hsl from "hsl-to-hex";
import SyncServiceRendererController from "./controllers/SyncServiceRendererController";
import Mutations from "./enums/Mutations";
import { ref } from "vue";
import { readonly } from "vue";
import { onBeforeMount } from "vue";
import { useI18n } from "vue-i18n";
import { useTheme } from "vuetify/lib/framework.mjs";
import { onUnmounted } from "vue";

let pingIntervalHandle: NodeJS.Timeout;
let storeSubscriptionCallback: () => void;

const activeTab = ref(1);
const online = ref(false);
const nasId = ref("");

const vuetifyTheme = useTheme();
const i18n = useI18n();
const store = useStore();
const { theme, playerName, homeDir, nas, backgroundHue, locale } = store.state;

const icons = {
  mdiWindowMinimize,
  mdiWindowMaximize,
  mdiClose,
  mdiGamepad,
  mdiCog
};

const setupCompleted = readonly(ref(playerName !== false && homeDir !== false && nas !== false))

const primaryColor = readonly(ref(hsl(backgroundHue, 100, 60)));

onBeforeMount(() => {
  // Setup API key handler
  window.ipcRenderer.on("setApiKey", async (event, apiKey) => {
    store.commit(Mutations.API_KEY, apiKey);
  });

  // Set vuetify primary color
  Object.assign(vuetifyTheme.themes.value, { dark: { colors: { primary: primaryColor } } })

  // Setup notification handles
  storeSubscriptionCallback = store.subscribe((mutation) => {
    switch (mutation.type) {
      case Mutations.BACKGROUND_HUE:
        Object.assign(vuetifyTheme.themes.value, { dark: { colors: { primary: primaryColor } } })
        break;
      case Mutations.LOCALE:
        i18n.locale.value = mutation.payload;
        break;
      case Mutations.API_KEY:
        // Skip showing a toast message for API key mutations
        return;
    }
    // this.$toasted.success(this.$t(`toast.${mutation.type}`));
  })

  // Start sync-service on app start
  SyncServiceController.System.start(homeDir);

  // Setup global service status poller
  clearInterval(pingIntervalHandle);
  pingIntervalHandle = setInterval(pingService, 5000);

  // Set initial tab
  activeTab.value = setupCompleted ? 0 : 1;

  window.addEventListener(
    "beforeunload",
    async () => await SyncServiceRendererController.System.stop()
  );
});

onUnmounted(() => {
  window.ipcRenderer.removeAllListeners();
  clearInterval(pingIntervalHandle);
  storeSubscriptionCallback();
});

// export default {
//   name: "app",
//   components: {
//     SettingsView,
//     GamesView,
//     ServiceStatistics,
//   },
//   watch: {
//     online(newVal, oldVal) {
//       if (newVal != oldVal) {
//         if (newVal) {
//           this.$toasted.success(this.$t("toast.service.connection.connected"));
//         } else {
//           this.$toasted.error(this.$t("toast.service.connection.disconnected"));
//         }
//       }
//     },
//   },
/**
 * Ping service and set `online` state attribute accordingly.
 */
function pingService() {
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
};

/**
 * Send window operations to main process.
 * @param {WindowOperations} action The window action.
 */
function sendWindowControl(action: WindowOperations) {
  window.ipcRenderer.send("controlWindow", action);
};

/**
 * Minimize window.
 */
function minimizeWindow() {
  this.sendWindowControl(WindowOperations.MINIMIZE);
};

/**
 * Maximize window.
 */
function maximizeWindow() {
  this.sendWindowControl(WindowOperations.MAXIMIZE);
};

/**
 * Close Window.
 */
function closeWindow() {
  this.sendWindowControl(WindowOperations.CLOSE);
};
</script>
