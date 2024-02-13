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

    <v-app-bar scroll-behavior="elevate" class="justify-center">
      <v-avatar image="/icon.png" />
      <v-spacer />
      <v-app-bar-title class="w-100 d-flex justify-center position-absolute">
        <span>LAN-Launcher</span>
      </v-app-bar-title>
      <v-spacer />

      <v-btn icon @click="minimizeWindow()">
        <v-icon :icon="mdiWindowMinimize" />
      </v-btn>
      <v-btn icon @click="maximizeWindow()">
        <v-icon :icon="mdiWindowMaximize" />
      </v-btn>
      <v-btn icon @click="closeWindow()">
        <v-icon :icon="mdiClose" />
      </v-btn>

      <template #extension>
        <!-- Force re-render of tabs on locale change, else tab indicator width is wrong -->
        <v-tabs :key="locale" v-model="activeTab" align-tabs="center" class="w-100">
          <v-tab :disabled="!setupCompleted" :prepend-icon="mdiGamepad">
            {{ $t("nav.library") }}
          </v-tab>
          <v-tab :prepend-icon="mdiCog">
            {{ $t("nav.settings") }}
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
            <settings-view :online="online" />
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
import SettingsView from "./components/SettingsView.vue";
import SyncServiceController from "./controllers/SyncServiceRendererController";
import WindowOperations from "./enums/WindowOperations";

import hsl from "hsl-to-hex";
import { ref, readonly, onBeforeMount, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useTheme } from "vuetify/lib/framework.mjs";
import { Store, StoreAttributes } from "./plugins/store";

let pingIntervalHandle: ReturnType<typeof setTimeout>;
let storeSubscriptionCallback: () => void;

const vuetifyTheme = useTheme();
const i18n = useI18n();
const store = useStore<Store>();
const { theme, playerName, homeDir, nas, backgroundHue, locale } = store.state;

const setupCompleted = readonly(ref(!!playerName && !!homeDir && !!nas))
const primaryColor = readonly(ref(hsl(backgroundHue, 100, 60)));

const activeTab = ref(setupCompleted.value ? 0 : 1);
const online = ref(false);
const nasId = ref("");

onBeforeMount(() => {
  // Setup API key handler
  window.ipcRenderer.on("setApiKey", async (event, apiKey) => {
    store.commit(StoreAttributes.API_KEY, apiKey);
  });

  // Set vuetify primary color
  vuetifyTheme.themes.value.dark.colors.primary = primaryColor.value;

  // Setup notification handles
  storeSubscriptionCallback = store.subscribe((mutation) => {
    switch (mutation.type) {
      case StoreAttributes.BACKGROUND_HUE:
        vuetifyTheme.themes.value.dark.colors.primary = primaryColor.value;
        break;
      case StoreAttributes.LOCALE:
        i18n.locale.value = mutation.payload;
        break;
      case StoreAttributes.API_KEY:
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

  window.addEventListener(
    "beforeunload",
    async () => await SyncServiceController.System.stop()
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
      online.value = true;
    })
    .catch(() => {
      online.value = false;

      // Get current API key if ping fails
      SyncServiceController.System.getApiKey(homeDir).then(
        (apiKey) => {
          store.commit(StoreAttributes.API_KEY, apiKey);
        }
      );
    });
}

/**
 * Send window operations to main process.
 * @param {WindowOperations} action The window action.
 */
function sendWindowControl(action: WindowOperations) {
  window.ipcRenderer.send("controlWindow", action);
}

/**
 * Minimize window.
 */
function minimizeWindow() {
  sendWindowControl(WindowOperations.MINIMIZE);
}

/**
 * Maximize window.
 */
function maximizeWindow() {
  sendWindowControl(WindowOperations.MAXIMIZE);
}

/**
 * Close Window.
 */
function closeWindow() {
  sendWindowControl(WindowOperations.CLOSE);
}
</script>

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

.v-app-bar.v-toolbar {
  background: rgba(var(--v-theme-surface), .45);
}

.v-toolbar__content>*:first-child {
  margin-inline-start: 10px;
}

.v-toolbar-title {
  letter-spacing: 5px;
}
</style>