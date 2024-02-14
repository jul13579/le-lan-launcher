<template>
  <v-container>
    <!-- Loading animation -->
    <template v-if="!(lib && lib.games)">
      <div style="height: calc(100vh - 230px)" class="d-flex align-center justify-center flex-column">
        <self-building-square-spinner :animation-duration="6000" :size="100"
          :color="$vuetify.theme.themes.dark.primary" />
        <div class="text-h5 mt-5" v-html="$t('games.lib_loading')" />
      </div>
    </template>

    <!-- Game list -->
    <template v-else>
      <div class="d-flex flex-wrap justify-center">
        <game-entry v-for="(item, index) in lib.games" ref="gameEntries" :key="index" :lib-folder-path="libFolderPath"
          :game-config="item" :sync-folder-config="getSyncFolderConfig(item)"
          :sync-folder-status="folderStatus[item.id] || {}" @download="downloadGame"
          @pause="(...args) => unPauseGame(...args, true)" @resume="(...args) => unPauseGame(...args, false)"
          @delete="deleteGame" @browse="browseGame" @reset="resetGame" @execute="execute" />
      </div>
    </template>

    <!-- Delete dialog -->
    <v-dialog v-model="deleteDialog.show" max-width="500">
      <v-card>
        <v-card-title>
          {{ $t("games.deleteDialog.title", { gameTitle: deleteDialog.gameConfig.title }) }}
        </v-card-title>
        <v-card-text>
          <b>{{ $t("games.deleteDialog.message", { gameTitle: deleteDialog.gameConfig.title }) }}</b>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn @click="deleteDialog.show = false">
            {{ $t("cardActions.cancel") }}
          </v-btn>
          <v-btn color="error" @click="deleteDialog.confirmCb">
            {{ $t("cardActions.delete") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Debug dialog -->
    <v-dialog v-model="debugDialog" max-width="600">
      <v-card>
        <v-card-title>
          <span>Debug</span>
          <v-spacer />
          <v-btn icon @click="debugDialog = false">
            <v-icon>{{ mdiClose }}</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <div class="d-flex flex-column">
            <console-view v-model="debugMessages" />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { mdiClose } from "@mdi/js";
import { SelfBuildingSquareSpinner } from "epic-spinners";
import { defineProps, ref, onBeforeMount, onUnmounted, computed, watch } from "vue";

import defaultFolderConfig, {
  gamelibConfig, gamelibDirId
} from "../config/folder";
import SyncServiceController from "../controllers/SyncServiceRendererController";

import LibraryController from "../controllers/LibraryRendererController";
import GameOperations from "../enums/GameOperations";
import SyncEvents from "../enums/SyncEvents";
import ConsoleView from "./ConsoleView.vue";
import GameEntry from "./GameEntry.vue";
import { useComputedStoreAttribute } from "../composables/useComputedStoreAttribute";
import { StoreAttributes } from "../plugins/store";
import { useStore } from "vuex";

let configInterval: ReturnType<typeof setTimeout>;

const { online } = defineProps<{
  online: boolean
}>();

const gameEntries = ref(null);

const config = ref({});
const lib = ref({});
const lastEventId = ref(0);
const folderStatus = ref({});
const deleteDialog = ref({
  show: false,
  gameConfig: {},
  confirmCb: () => { }
});
const debugDialog = ref(false);
const debugMessages = ref([]);

const nas = useComputedStoreAttribute(StoreAttributes.NAS);
const playerName = useComputedStoreAttribute(StoreAttributes.PLAYER_NAME)
const debug = useComputedStoreAttribute(StoreAttributes.DEBUG);

onBeforeMount(() => {
  // Setup periodic config fetch task
  configInterval = setInterval(getConfig, 5000);
  getConfig();

  // Setup handler for game debug messages
  window.ipcRenderer.on("game", (event, debugMsgObj) => {
    debugMessages.value.push(debugMsgObj);
  });
})

onUnmounted(() => {
  // Unwatch library if `libConfigPath.value` is set
  if (libConfigPath.value) LibraryController.unwatch(libConfigPath.value);

  // Cancel periodic config-fetch-task
  clearInterval(configInterval);
})


// List of devices present in config
const devices = computed(() => config.value.devices || []);
// List of folders present in config
const folders = computed(() => config.value.folders || []);
// Device object of currently configured NAS device
const nasDevice = computed(() => devices.value.find((device) => device.deviceID == nas.value) || undefined);
// Folder object of library folder
const libFolder = computed(() => folders.value.find((folder) => folder.id == gamelibDirId) || undefined);
// Library folder path
const libFolderPath = computed(() => {
  if (!libFolder.value) return undefined;
  return `${homeDir.value}/${libFolder.value.label}`;
})
// Library config path
const libConfigPath = computed(() => {
  if (!libFolderPath.value) return undefined;
  return `${libFolderPath.value}/${gamelibConfig}`;
})
const homeDir = computed(() => useStore().state.homeDir.replace(/\\/g, "/"));

// Immediately refresh config if the NAS ID changed
watch(nas, getConfig);
watch(libConfigPath, (newVal, oldVal) => {
  // Since `libConfigPath` is not statically defined, setup watcher when the prop changes.
  if (oldVal) LibraryController.unwatch(oldVal);
  if (newVal)
    LibraryController.watch(newVal, (event, _lib) => (lib.value = _lib));
});

/**
 * Periodic task that includes the following operations:
 * - Fetch Syncthing config
 * - Add NAS to device list if not already included
 * - Hide all pending folders from the Syncthing GUI
 * - Add library folder to list of synchronized folders
 * - Fetch initial folder status for all synchronized folders
 * - Fetch latest event ID to init folder event processing
 */
function getConfig() {
  // Abort if service is not online
  if (!online) {
    return;
  }

  // Get Config
  SyncServiceController.System.getConfig()
    .then((response) => {
      config.value = response.data;

      // If nas is not yet part of devices list, add it
      if (!nasDevice.value) {
        config.value.devices.push({
          deviceID: nas.value,
          _addressesStr: "dynamic",
          compression: "metadata",
          introducer: true,
          selectedFolders: {},
          pendingFolders: [],
          ignoredFolders: [],
          addresses: ["dynamic"],
        });
        SyncServiceController.System.setConfig(config.value).catch();
      }
    })
    .catch();

  // Hide pending folders
  SyncServiceController.Cluster.pendingFolders().then((response) => {
    const folders = response.data;

    Object.entries(folders).forEach(([id, pendingFolderConfig]) => {
      const { label, time } = Object.values(
        pendingFolderConfig.offeredBy
      )[0];

      // If library folder is among pending folders, add it to shared folders
      if (id == gamelibDirId) {
        config.value.folders.push(
          newSyncFolderObject(gamelibDirId, label)
        );
      } else {
        // Else add folder to ignored folders
        nas.valueDevice.ignoredFolders.push({ id, label, time });
      }
    });

    if (Object.entries(folders).length > 0) {
      SyncServiceController.System.setConfig(config.value).catch();
    }
  });

  // Get initial folder states for folder that or not yet part of `folderStatus.value`
  // ! This is necessary for instances where folder states did not change since the app started (e.g. after startup)
  folders.value.forEach((folder) => {
    if (Object.keys(folderStatus.value).includes(folder.id)) return;
    SyncServiceController.DB.folderStatus(folder.id)
      .then((response) => {
        folderStatus.value[folder.id] = response.data;
      })
      .catch();
  });

  // Update folder sync states if `lastEventId.value` is set
  if (lastEventId.value) {
    // Update folder states using events
    SyncServiceController.Events.since(lastEventId.value)
      .then((response) => {
        // Catches empty arrays
        if (response.data == false) return;

        // Update last event id
        lastEventId.value = Math.max(
          ...response.data.map((event) => event.id)
        );

        for (var folderEvent of response.data) {
          let eventData = folderEvent.data;
          switch (folderEvent.type) {
            case SyncEvents.FOLDER_SUMMARY:
              folderStatus.value[eventData.folder] = eventData.summary;
              break;
            case SyncEvents.STATE_CHANGED:
              if (!folderStatus.value[eventData.folder]) {
                continue; // Skip state update if there is no folder data present
              }
              folderStatus.value[eventData.folder].state = eventData.to;
              break;
            case SyncEvents.FOLDER_REJECTED:
              delete folderStatus.value[eventData.folder];
              break;
          }
        }

        let progress = Math.min(
          ...Object.values(gameEntries)
            .filter((game) => game.subscribed)
            .map((game) => game.downloadProgress)
        );
        if (progress > 0 && progress < 1) {
          window.ipcRenderer.send("setProgress", progress);
        } else {
          // Disable progress bar
          window.ipcRenderer.send("setProgress", -1);
        }
      })
      .catch();
  }
  // Else init lastEventId by fetching the latest event
  else {
    SyncServiceController.Events.latest().then((response) => {
      lastEventId.value = response.data[0].id;
    });
  }
}

/**
 * Create a new Syncthing folder configuration object.
 * @param {string} id The id of the folder.
 * @param {string} label The label of the folder.
 * @returns {Object} The Syncthing folder object.
 */
function newSyncFolderObject(id: string, label: string) {
  return {
    ...defaultFolderConfig,
    path: `${homeDir.value}/${label}`,
    id: id,
    label: label,
    viewFlags: { importFromOtherDevice: true },
    // Share with all devices
    devices: devices.value.map((device) => {
      return {
        deviceID: device.deviceID,
      };
    }),
  };
}

/**
 * Get the Syncthing folder config for a given game.
 * @param {Object} gameConfig The config object of the game.
 * @returns {Object} The Syncthing folder object for the given game.
 */
function getSyncFolderConfig(gameConfig) {
  return folders.value.find((folder) => folder.id == gameConfig.id);
}

/**
 * Queue a game for syncing.
 * @param {Object} gameConfig The config object of the game.
 */
function downloadGame(gameConfig) {
  config.value.folders.push(
    newSyncFolderObject(gameConfig.id, gameConfig.title)
  );
  SyncServiceController.System.setConfig(config.value)
    .then(() => {
      // this.$toasted.success(
      //   this.$t("toast.download.started", { gameTitle: gameConfig.title })
      // );
    })
    .catch();
}

/**
 * Pause/Unpause a game from syncing.
 * @param {Object} gameConfig The config object of the game.
 * @param {Object} syncFolderConfig The Syncthing config object of the folder.
 * @param {Boolean} pause Wether to pause (true) or unpause (false).
 */
function unPauseGame(gameConfig, syncFolderConfig, pause) {
  syncFolderConfig.paused = pause;
  SyncServiceController.System.setConfig(config.value)
    .then(() => {
      if (pause) {
        // this.$toasted.success(
        //   this.$t("toast.download.paused", { gameTitle: gameConfig.title })
        // );
      } else {
        // this.$toasted.success(
        //   this.$t("toast.download.resumed", { gameTitle: gameConfig.title })
        // );
      }
    })
    .catch();
}

/**
 * Remove a game from the sync queue.
 * @param {Object} gameConfig The config object of the game.
 * @param {Object} syncFolderConfig The Syncthing config object of the folder.
 */
function deleteGame(gameConfig, syncFolderConfig) {
  deleteDialog.value.gameConfig = { ...gameConfig };
  deleteDialog.value.show = true;
  deleteDialog.value.confirmCb = () => {
    deleteDialog.value.show = false;
    config.value.folders = config.value.folders.filter(
      (folder) => folder.id != gameConfig.id
    );
    SyncServiceController.System.setConfig(config.value)
      .then(() => {
        // this.$toasted.success(
        //   this.$t("toast.game.delete.success", {
        //     gameTitle: gameConfig.title,
        //   })
        // );
        window.ipcRenderer
          .invoke("controlGame", GameOperations.DELETE, syncFolderConfig)
          .then((error) => {
            if (error)
              // this.$toasted.success(
              //   this.$t("toast.game.delete.error", { error: error })
              // );
          });
        folderStatus.value[gameConfig.id] = null;
      })
      .catch();
  }
}

/**
 * Browse the files of a game.
 * @param {Object} syncFolderConfig The Syncthing config object of the folder.
 */
function browseGame(syncFolderConfig) {
  window.ipcRenderer.invoke(
    "controlGame",
    GameOperations.BROWSE,
    syncFolderConfig
  );
}

/**
 * Reset the files of a game to their original state.
 * @param {Object} gameConfig The config object of the game.
 * @param {Object} syncFolderConfig The Syncthing config object of the folder.
 */
function resetGame(gameConfig, syncFolderConfig) {
  SyncServiceController.DB.revertFolder(syncFolderConfig.id)
    .then(() => {
      // this.$toasted.success(
      //   this.$t("toast.game.reset", { gameTitle: gameConfig.title })
      // );
    })
    .catch();
}

/**
 * Launch an executable of a game.
 * @param {Object} gameConfig The config object of the game.
 * @param {Object} syncFolderConfig The Syncthing config object of the folder.
 * @param {String} executable The executable to run.
 */
function execute(gameConfig, syncFolderConfig, executable) {
  if (debug.value) {
    debugMessages.value = [];
    debugDialog.value = true;
  }
  window.ipcRenderer.invoke(
    "controlGame",
    GameOperations.LAUNCH,
    gameConfig,
    syncFolderConfig,
    executable,
    playerName.value,
    debug.value
  );
}
</script>