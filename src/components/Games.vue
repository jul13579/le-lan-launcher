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
          :key="index"
          :value="item"
          :homeDir="homeDir"
          :config="getGameFolder(item)"
          :status="folderStatus[item.id] || {}"
          @download="downloadGame(item)"
          @pause="unPauseGame(item, true)"
          @resume="unPauseGame(item, false)"
          @delete="deleteGame(item)"
          @browse="browseGame(item)"
          @reset="resetGame(item)"
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
import defaultFolderconfig, {
  gamelibDirId,
  gamelibDirName,
  gamelibConfig,
} from "../config/folder";

import GameEntry from "./GameEntry";
import Console from "./Console.vue";
import GameOperations from "../enums/GameOperations";
import LibraryController from "../controllers/LibraryRendererController";
import GameController from "../controllers/GameRendererController";

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

    // Setup library watcher
    LibraryController.watch(
      this.libConfigPath,
      (event, lib) => (this.lib = lib)
    );

    // Setup handler for game debug messages
    GameController.onDebugMsg((event, debugMsgObj) => {
      this.debugMessages.push(debugMsgObj);
    });
  },
  destroyed() {
    clearInterval(configInterval);
    LibraryController.unwatch(this.libConfigPath);
  },
  computed: {
    nasDevice() {
      return (this.config.devices || []).find(
        (device) => device.deviceID == this.nas
      );
    },
    devices() {
      return this.config.devices || [];
    },
    folders() {
      return this.config.folders || [];
    },
    libConfigPath() {
      return `${this.homeDir}/${gamelibDirName}/${gamelibConfig}`;
    },
    ...mapState(["nas", "homeDir", "debug"]),
  },
  watch: {
    nas() {
      this.getConfig();
    },
  },
  methods: {
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

          // If nas is set but gamelib folder is not yet subscribed, add it
          // ! Dont do this in one step, e.g. with above nas-setup. Scenarios might come up where the gamelib folder will never be set-up!
          if (
            this.nasDevice && // If nasDevice is defined
            !this.config.folders.find((folder) => folder.id == gamelibDirId)
          ) {
            this.config.folders.push(
              this.getFolderObj(gamelibDirId, gamelibDirName)
            );
            SyncServiceController.System.setConfig(this.config).catch();
          }
        })
        .catch();

      SyncServiceController.Cluster.pendingFolders().then((response) => {
        const folders = response.data;

        Object.entries(folders).forEach(([id, pendingFolderConfig]) => {
          const { label, time } = Object.values(
            pendingFolderConfig.offeredBy
          )[0];
          this.nasDevice.ignoredFolders.push({ id, label, time });
        });

        if (Object.entries(folders).length > 0) {
          SyncServiceController.System.setConfig(this.config).catch();
        }
      });

      // Get initial folder states and last event id
      if (Object.keys(this.folderStatus).length == 0) {
        this.folders.forEach((folder) => {
          // Only get status of game directories, not the library!
          if (folder.id != gamelibDirId) {
            SyncServiceController.DB.folderStatus(folder.id)
              .then((response) => {
                this.folderStatus[folder.id] = response.data;
              })
              .catch();
          }
        });
        SyncServiceController.Events.latest().then((response) => {
          this.lastEventId = response.data[0].id;
        });
      } else {
        // Update folder states using events
        SyncServiceController.Events.since(this.lastEventId)
          .then((response) => {
            // Catches empty arrays
            if (response.data != false) {
              // Update last event id
              this.lastEventId = response.data[response.data.length - 1].id;

              for (var folderEvent of response.data) {
                let eventData = folderEvent.data;
                switch (folderEvent.type) {
                  case "FolderSummary":
                    this.folderStatus[eventData.folder] = eventData.summary;
                    break;
                  case "StateChanged":
                    if (!this.folderStatus[eventData.folder]) {
                      continue; // Skip state update if there is no folder data present
                    }
                    this.folderStatus[eventData.folder].state = eventData.to;
                    break;
                  case "FolderRejected":
                    this.folderStatus[eventData.folder] = null;
                    break;
                }
              }
            }
          })
          .catch();
      }
    },

    // Get folder object to be used in config
    getFolderObj(id, label) {
      return {
        ...defaultFolderconfig,
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

    // Game actions
    downloadGame(game) {
      this.config.folders.push(this.getFolderObj(game.id, game.title));
      SyncServiceController.System.setConfig(this.config)
        .then(() => {
          this.$toasted.success(
            this.$t("toast.download.started", { gameTitle: game.title })
          );
        })
        .catch();
    },
    getGameFolder(game) {
      return this.folders.find((folder) => folder.id == game.id);
    },
    getGameFolderIndex(game) {
      return this.folders.indexOf(this.getGameFolder(game));
    },
    unPauseGame(game, pause) {
      this.config.folders[this.getGameFolderIndex(game)].paused = pause;
      SyncServiceController.System.setConfig(this.config)
        .then(() => {
          if (pause) {
            this.$toasted.success(
              this.$t("toast.download.paused", { gameTitle: game.title })
            );
          } else {
            this.$toasted.success(
              this.$t("toast.download.resumed", { gameTitle: game.title })
            );
          }
        })
        .catch();
    },
    deleteGame(game) {
      let gameFolder = this.getGameFolder(game);
      this.config.folders.splice(this.getGameFolderIndex(game), 1);
      SyncServiceController.System.setConfig(this.config)
        .then(() => {
          this.$toasted.success(
            this.$t("toast.game.delete.success", { gameTitle: game.title })
          );
          window.ipcRenderer
            .invoke("controlGame", GameOperations.DELETE, gameFolder)
            .then((error) => {
              if (error)
                this.$toasted.success(
                  this.$t("toast.game.delete.error", { error: error })
                );
            });
          this.folderStatus[game.id] = null;
        })
        .catch();
    },
    browseGame(game) {
      window.ipcRenderer.invoke(
        "controlGame",
        GameOperations.BROWSE,
        this.getGameFolder(game)
      );
    },
    resetGame(game) {
      SyncServiceController.DB.revertFolder(game.id)
        .then(() => {
          this.$toasted.success(
            this.$t("toast.game.reset", { gameTitle: game.title })
          );
        })
        .catch();
    },
    execute(game, config, launch) {
      if (this.debug) {
        this.debugMessages = [];
        this.debugDialog = true;
      }
      window.ipcRenderer.invoke(
        "controlGame",
        GameOperations.LAUNCH,
        game,
        config,
        launch,
        this.debug
      );
    },
  },
};
</script>