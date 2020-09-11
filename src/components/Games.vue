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
import defaultFolderconfig, { gamelibDirId } from "../folderconfig";

import GameEntry from "./GameEntry";

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
      lastEventId: 0,
      folderStatus: {},
    };
  },
  created() {
    this.setLibWatcher();
    this.getConfig();

    clearInterval(configInterval);
    configInterval = setInterval(this.getConfig, 5000);
  },
  destroyed() {
    clearInterval(configInterval);
    fs.unwatchFile(this.libConfigPath);
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
      return `${this.homeDir}/Library/library.json`;
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
      if (!this.online) {
        return;
      }

      // Get Config
      AJAX.Syncthing.System.getConfig()
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
            AJAX.Syncthing.System.setConfig(this.config).catch();
          }

          // If nas is set but gamelib folder is not yet subscribed, add it
          // ! Dont do this in one step, e.g. with above nas-setup. Scenarios might come up where the gamelib folder will never be set-up!
          if (
            this.nasDevice && // If nasDevice is defined
            !this.config.folders.find((folder) => folder.id == gamelibDirId)
          ) {
            this.config.folders.push(
              this.getFolderObj(gamelibDirId, "Library")
            );
            AJAX.Syncthing.System.setConfig(this.config).catch();
          }
        })
        .catch();

      // Get initial folder states and last event id
      if (Object.keys(this.folderStatus).length == 0) {
        this.folders.forEach((folder) => {
          // Only get status of game directories, not the library!
          if (folder.id != gamelibDirId) {
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
            if (response.data) {
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

    // Watch library folder for changes
    setLibWatcher() {
      // Setup library watcher
      // ! Use fs.watchFile as it handles ENOENT (file not existing) and also calls listener when file is created
      fs.watchFile(this.libConfigPath, (curr) => {
        if (curr.size > 0) {
          this.lib = this.getLib();
        }
      });

      // If library was already existing before app start, we have to fetch the library config now
      if (fs.existsSync(this.libConfigPath)) {
        this.lib = this.getLib();
      }
    },

    // Parse library config
    getLib() {
      let lib = JSON.parse(fs.readFileSync(this.libConfigPath));
      lib.games.sort((game1, game2) => {
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
      return lib;
    },

    // Game actions
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
      shell.openPath(this.getGameFolder(game).path);
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