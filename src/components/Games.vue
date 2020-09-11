<template>
  <v-container>
    <template v-if="!libExisting">
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
          @cancel-download="deleteGame(item)"
          @pause="unPauseGame(item, true)"
          @resume="unPauseGame(item, false)"
          @delete="deleteGame(item)"
          @browse="browseGame(item)"
          @reset="resetGame(item)"
          @execute="(launch) => execute(getGameFolder(item), item, launch)"
        />
      </div>
    </template>
  </v-container>
</template>

<script>
import { mapState } from "vuex";
import { SelfBuildingSquareSpinner } from "epic-spinners";
import { shell } from "electron";
import fs from "fs-extra";
import { spawn } from "child_process";
import path from "path";

import AJAX from "../ajax";
import online from "../mixins/online";

import GameEntry from "./GameEntry";

const libJsonPath = "/Library/library.json";
let configInterval;

export default {
  mixins: [online],
  components: {
    SelfBuildingSquareSpinner,
    GameEntry,
  },
  data() {
    return {
      config: {},
      lib: {},
      libExisting: false,
      lastEventId: 0,
      folderStatus: {},
    };
  },
  created() {
    this.getConfig();
    clearInterval(configInterval);
    configInterval = setInterval(this.getConfig, 5000);
    this.setLibWatcher();
  },
  destroyed() {
    clearInterval(configInterval);
  },
  computed: {
    nasDevice: {
      get() {
        return this.config.devices.find(this.nasDeviceFilter);
      },
      set(nasDeviceConfig) {
        this.config.devices[
          this.config.devices.find(this.nasDeviceFilter)
        ] = nasDeviceConfig;
        AJAX.System.Syncthing.setConfig(this.config).catch();
      },
    },
    devices: {
      get() {
        return this.config.devices || [];
      },
    },
    folders: {
      get() {
        return this.config.folders || [];
      },
    },
    libConfigPath() {
      return this.homeDir + libJsonPath;
    },
    ...mapState(["nas", "homeDir"]),
  },
  watch: {
    nas() {
      this.getConfig();
    },
  },
  methods: {
    getConfig() {
      if (this.online) {
        // Get Config
        AJAX.Syncthing.System.getConfig()
          .then((response) => {
            this.config = response.data;
            if (
              this.nas && // If nasId is defined (if discovery finds an ID with corresponding ip)
              !this.config.devices.find(this.nasDeviceFilter)
            ) {
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
              AJAX.Syncthing.System.setConfig(this.config).catch();
            }
            if (
              this.nasDevice && // If nasDevice is defined (after it has been set by previous if)
              this.nasDevice.pendingFolders.length > 0
            ) {
              this.nasDevice.pendingFolders.forEach((folder) => {
                if (folder.id == "gamelib") {
                  this.config.folders.push(
                    this.getFolderObj("gamelib", "Library")
                  );
                  AJAX.Syncthing.System.setConfig(this.config).catch();
                }
              });
            }
          })
          .catch();

        // Get initial folder states
        if (Object.keys(this.folderStatus).length == 0) {
          this.folders.forEach((folder) => {
            if (folder.id != "gamelib") {
              AJAX.Syncthing.DB.folderStatus(folder.id)
                .then((response) => {
                  this.folderStatus[folder.id] = response.data;
                })
                .catch();
            }
          });
          AJAX.Syncthing.Events.latest().then((response) => {
            this.lastEventId = response.data[0].id;
          });
        } else {
          // Update folder states using events
          AJAX.Syncthing.Events.since(this.lastEventId)
            .then((response) => {
              if (response.data != false) {
                this.lastEventId = response.data[response.data.length - 1].id;
                for (var folderEvent of response.data) {
                  let eventData = folderEvent.data;
                  switch (folderEvent.type) {
                    case "FolderSummary":
                      this.folderStatus[eventData.folder] = eventData.summary;
                      break;
                    case "StateChanged":
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
      }
    },
    nasDeviceFilter(device) {
      return device.deviceID == this.nas;
    },
    getFolderObj(id, label) {
      return {
        type: "receiveonly",
        rescanIntervalS: 3600,
        fsWatcherDelayS: 10,
        fsWatcherEnabled: true,
        minDiskFree: { value: 1, unit: "%" },
        maxConflicts: 10,
        fsync: true,
        order: "random",
        fileVersioningSelector: "none",
        trashcanClean: 0,
        simpleKeep: 5,
        staggeredMaxAge: 365,
        staggeredCleanInterval: 3600,
        staggeredVersionsPath: "",
        externalCommand: "",
        autoNormalize: true,
        path: this.$store.state.homeDir + "/" + label,
        id: id,
        label: label,
        viewFlags: { importFromOtherDevice: true },
        devices: this.devices.map((device) => {
          return {
            deviceID: device.deviceID,
          };
        }),
      };
    },
    setLibWatcher() {
      this.libExisting = fs.existsSync(this.libConfigPath);
      if (this.libExisting) {
        this.getLib();
      }
      fs.watchFile(this.libConfigPath, (curr) => {
        this.libExisting = curr.size > 0;
        if (curr.size > 0) {
          this.getLib();
        }
      });
    },
    getLib() {
      this.lib = JSON.parse(fs.readFileSync(this.libConfigPath));
      this.lib.games.sort((game1, game2) => {
        if (game1.title == game2.title) {
          return 0;
        }
        if (game1.title < game2.title) {
          return -1;
        }
        if (game1.title > game2.title) {
          return 1;
        }
      });
    },
    downloadGame(game) {
      this.config.folders.push(this.getFolderObj(game.id, game.title));
      AJAX.Syncthing.System.setConfig(this.config)
        .then(() => {
          this.$toasted.success("Download gestartet: " + game.title);
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
      AJAX.Syncthing.System.setConfig(this.config)
        .then(() => {
          if (pause) {
            this.$toasted.success("Download pausiert: " + game.title);
          } else {
            this.$toasted.success("Download forgesetzt: " + game.title);
          }
        })
        .catch();
    },
    deleteGame(game) {
      let gameFolder = this.getGameFolder(game);
      this.config.folders.splice(this.getGameFolderIndex(game), 1);
      AJAX.Syncthing.System.setConfig(this.config)
        .then(() => {
          this.$toasted.success("Spiel gelöscht: " + game.title);
          fs.removeSync(gameFolder.path);
        })
        .catch();
    },
    browseGame(game) {
      shell.openItem(this.getGameFolder(game).path);
    },
    resetGame(game) {
      AJAX.Syncthing.DB.revertFolder(game.id)
        .then(() => {
          this.$toasted.success("Spiel wird zurückgesetzt: " + game.title);
        })
        .catch();
    },
    execute(game, config, launch) {
      require("electron").ipcRenderer.send("setPlayerName", game, config);
      let ls = spawn(path.join(game.path, launch.exe), launch.args, {
        cwd: game.path,
        detached: true,
      }); // Spawn executable detached, so it stays open if launcher is closed.
      ls.stdout.on("data", function (data) {
        // TODO: Idea: create debug window?
        // console.log("stdout: " + data);
        data;
      });
      ls.stderr.on("data", function (data) {
        // TODO: Idea: create debug window?
        // console.log("stderr: " + data);
        data;
      });
      ls.on("exit", function (code) {
        // TODO: Idea: create debug window?
        // console.log("child process exited with code " + code);
        code;
      });
    },
  },
};
</script>