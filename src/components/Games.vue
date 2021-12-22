<template>
  <v-container>
    <template v-if="!(lib && lib.games)">
      <div
        style="height: calc(100vh - 230px)"
        class="d-flex align-center justify-center flex-column"
      >
        <self-building-square-spinner
          :animation-duration="6000"
          :size="100"
          :color="$vuetify.theme.themes.dark.primary"
        />
        <div
          class="text-h5 mt-5"
          v-html="$t('games.lib_loading')"
        ></div>
      </div>
    </template>
    <template v-else>
      <div class="d-flex flex-wrap justify-center">
        <game-entry
          v-for="(item, index) in lib.games"
          ref="gameEntries"
          :key="index"
          :libFolderPath="libFolderPath"
          :gameConfig="item"
          :syncFolderConfig="getSyncFolderConfig(item)"
          :syncFolderStatus="folderStatus[item.id] || {}"
          @download="downloadGame"
          @pause="(...args) => unPauseGame(...args, true)"
          @resume="(...args) => unPauseGame(...args, false)"
          @delete="deleteGame"
          @browse="browseGame"
          @reset="resetGame"
          @execute="execute"
        />
      </div>
    </template>
    <v-dialog
      max-width="600"
      v-model="debugDialog"
    >
      <v-card>
        <v-card-title>
          <span>Debug</span>
          <v-spacer></v-spacer>
          <v-btn
            icon
            @click="debugDialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <div class="d-flex flex-column">
            <console v-model="debugMessages" />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapState } from "vuex";
import { SelfBuildingSquareSpinner } from "epic-spinners";

import SyncServiceController from "../controllers/SyncServiceRendererController";
import online from "../mixins/online";
import defaultFolderConfig, {
  gamelibDirId,
  gamelibConfig,
} from "../config/folder";

import GameEntry from "./GameEntry";
import Console from "./Console.vue";
import SyncEvents from "../enums/SyncEvents";
import GameOperations from "../enums/GameOperations";
import LibraryController from "../controllers/LibraryRendererController";

let configInterval;

export default {
  mixins: [online],
  components: {
    SelfBuildingSquareSpinner,
    GameEntry,
    Console,
  },
  data() {
    return {
      config: {},
      lib: {},
      lastEventId: 0,
      folderStatus: {},
      debugDialog: false,
      debugMessages: [],
    };
  },
  beforeMount() {
    // Setup periodic config fetch task
    configInterval = setInterval(this.getConfig, 5000);
    this.getConfig();

    // Setup handler for game debug messages
    window.ipcRenderer.on("game", (event, debugMsgObj) => {
      this.debugMessages.push(debugMsgObj);
    });
  },
  destroyed() {
    // Unwatch library if `this.libConfigPath` is set
    if (this.libConfigPath) LibraryController.unwatch(this.libConfigPath);

    // Cancel periodic config-fetch-task
    clearInterval(configInterval);
  },
  computed: {
    // List of devices present in config
    devices() {
      return this.config.devices || [];
    },
    // List of folders present in config
    folders() {
      return this.config.folders || [];
    },
    // Device object of currently configured NAS device
    nasDevice() {
      return (
        this.devices.find((device) => device.deviceID == this.nas) || undefined
      );
    },
    // Folder object of library folder
    libFolder() {
      return (
        this.folders.find((folder) => folder.id == gamelibDirId) || undefined
      );
    },
    // Library folder path
    libFolderPath() {
      if (!this.libFolder) return undefined;
      return `${this.homeDir}/${this.libFolder.label}`;
    },
    // Library config path
    libConfigPath() {
      if (!this.libFolderPath) return undefined;
      return `${this.libFolderPath}/${gamelibConfig}`;
    },
    homeDir() {
      return this.$store.state.homeDir.replace(/\\/g, "/");
    },
    ...mapState(["nas", "playerName", "debug"]),
  },
  watch: {
    nas() {
      // Immediately refresh config if the NAS ID changed
      this.getConfig();
    },
    libConfigPath(newVal, oldVal) {
      // Since `libConfigPath` is not statically defined, setup watcher when the prop changes.
      if (oldVal) LibraryController.unwatch(oldVal);
      if (newVal)
        LibraryController.watch(newVal, (event, lib) => (this.lib = lib));
    },
  },
  methods: {
    /**
     * Periodic task that includes the following operations:
     * - Fetch Syncthing config
     * - Add NAS to device list if not already included
     * - Hide all pending folders from the Syncthing GUI
     * - Add library folder to list of synchronized folders
     * - Fetch initial folder status for all synchronized folders
     * - Fetch latest event ID to init folder event processing
     */
    getConfig() {
      // Abort if service is not online
      if (!this.online) {
        return;
      }

      // Get Config
      SyncServiceController.System.getConfig()
        .then((response) => {
          this.config = response.data;

          // If nas is not yet part of devices list, add it
          if (!this.nasDevice) {
            this.config.devices.push({
              deviceID: this.nas,
              _addressesStr: "dynamic",
              compression: "metadata",
              introducer: true,
              selectedFolders: {},
              pendingFolders: [],
              ignoredFolders: [],
              addresses: ["dynamic"],
            });
            SyncServiceController.System.setConfig(this.config).catch();
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
            this.config.folders.push(
              this.newSyncFolderObject(gamelibDirId, label)
            );
          } else {
            // Else add folder to ignored folders
            this.nasDevice.ignoredFolders.push({ id, label, time });
          }
        });

        if (Object.entries(folders).length > 0) {
          SyncServiceController.System.setConfig(this.config).catch();
        }
      });

      // Get initial folder states for folder that or not yet part of `this.folderStatus`
      // ! This is necessary for instances where folder states did not change since the app started (e.g. after startup)
      this.folders.forEach((folder) => {
        if (Object.keys(this.folderStatus).includes(folder.id)) return;
        SyncServiceController.DB.folderStatus(folder.id)
          .then((response) => {
            this.folderStatus[folder.id] = response.data;
          })
          .catch();
      });

      // Update folder sync states if `this.lastEventId` is set
      if (this.lastEventId) {
        // Update folder states using events
        SyncServiceController.Events.since(this.lastEventId)
          .then((response) => {
            // Catches empty arrays
            if (response.data == false) return;

            // Update last event id
            this.lastEventId = Math.max(
              ...response.data.map((event) => event.id)
            );

            for (var folderEvent of response.data) {
              let eventData = folderEvent.data;
              switch (folderEvent.type) {
                case SyncEvents.FOLDER_SUMMARY:
                  this.folderStatus[eventData.folder] = eventData.summary;
                  break;
                case SyncEvents.STATE_CHANGED:
                  if (!this.folderStatus[eventData.folder]) {
                    continue; // Skip state update if there is no folder data present
                  }
                  this.folderStatus[eventData.folder].state = eventData.to;
                  break;
                case SyncEvents.FOLDER_REJECTED:
                  delete this.folderStatus[eventData.folder];
                  break;
              }
            }

            let progress = Math.min(
              ...Object.values(this.$refs.gameEntries)
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
          this.lastEventId = response.data[0].id;
        });
      }
    },

    /**
     * Create a new Syncthing folder configuration object.
     * @param {String} id The id of the folder.
     * @param {String} label The label of the folder.
     * @returns {Object} The Syncthing folder object.
     */
    newSyncFolderObject(id, label) {
      return {
        ...defaultFolderConfig,
        path: `${this.homeDir}/${label}`,
        id: id,
        label: label,
        viewFlags: { importFromOtherDevice: true },
        // Share with all devices
        devices: this.devices.map((device) => {
          return {
            deviceID: device.deviceID,
          };
        }),
      };
    },

    /**
     * Get the Syncthing folder config for a given game.
     * @param {Object} gameConfig The config object of the game.
     * @returns {Object} The Syncthing folder object for the given game.
     */
    getSyncFolderConfig(gameConfig) {
      return this.folders.find((folder) => folder.id == gameConfig.id);
    },

    /**
     * Queue a game for syncing.
     * @param {Object} gameConfig The config object of the game.
     */
    downloadGame(gameConfig) {
      this.config.folders.push(
        this.newSyncFolderObject(gameConfig.id, gameConfig.title)
      );
      SyncServiceController.System.setConfig(this.config)
        .then(() => {
          this.$toasted.success(
            this.$t("toast.download.started", { gameTitle: gameConfig.title })
          );
        })
        .catch();
    },

    /**
     * Pause/Unpause a game from syncing.
     * @param {Object} gameConfig The config object of the game.
     * @param {Object} syncFolderConfig The Syncthing config object of the folder.
     * @param {Boolean} pause Wether to pause (true) or unpause (false).
     */
    unPauseGame(gameConfig, syncFolderConfig, pause) {
      syncFolderConfig.paused = pause;
      SyncServiceController.System.setConfig(this.config)
        .then(() => {
          if (pause) {
            this.$toasted.success(
              this.$t("toast.download.paused", { gameTitle: gameConfig.title })
            );
          } else {
            this.$toasted.success(
              this.$t("toast.download.resumed", { gameTitle: gameConfig.title })
            );
          }
        })
        .catch();
    },

    /**
     * Remove a game from the sync queue.
     * @param {Object} gameConfig The config object of the game.
     * @param {Object} syncFolderConfig The Syncthing config object of the folder.
     */
    deleteGame(gameConfig, syncFolderConfig) {
      this.config.folders = this.config.folders.filter(
        (folder) => folder.id != gameConfig.id
      );
      SyncServiceController.System.setConfig(this.config)
        .then(() => {
          this.$toasted.success(
            this.$t("toast.game.delete.success", {
              gameTitle: gameConfig.title,
            })
          );
          window.ipcRenderer
            .invoke("controlGame", GameOperations.DELETE, syncFolderConfig)
            .then((error) => {
              if (error)
                this.$toasted.success(
                  this.$t("toast.game.delete.error", { error: error })
                );
            });
          this.folderStatus[gameConfig.id] = null;
        })
        .catch();
    },

    /**
     * Browse the files of a game.
     * @param {Object} syncFolderConfig The Syncthing config object of the folder.
     */
    browseGame(syncFolderConfig) {
      window.ipcRenderer.invoke(
        "controlGame",
        GameOperations.BROWSE,
        syncFolderConfig
      );
    },

    /**
     * Reset the files of a game to their original state.
     * @param {Object} gameConfig The config object of the game.
     * @param {Object} syncFolderConfig The Syncthing config object of the folder.
     */
    resetGame(gameConfig, syncFolderConfig) {
      SyncServiceController.DB.revertFolder(syncFolderConfig.id)
        .then(() => {
          this.$toasted.success(
            this.$t("toast.game.reset", { gameTitle: gameConfig.title })
          );
        })
        .catch();
    },

    /**
     * Launch an executable of a game.
     * @param {Object} gameConfig The config object of the game.
     * @param {Object} syncFolderConfig The Syncthing config object of the folder.
     * @param {Object} launchConfig The config of the executable to launch.
     */
    execute(gameConfig, syncFolderConfig, launchConfig) {
      if (this.debug) {
        this.debugMessages = [];
        this.debugDialog = true;
      }
      window.ipcRenderer.invoke(
        "controlGame",
        GameOperations.LAUNCH,
        gameConfig,
        syncFolderConfig,
        launchConfig,
        this.playerName,
        this.debug
      );
    },
  },
};
</script>