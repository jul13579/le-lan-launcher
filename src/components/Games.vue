<template>
  <div class="container">
    <template v-if="!libExisting">
      <div style="height: calc(100vh - 70px)">
        <hollow-dots-spinner
          :animation-duration="1000"
          :dot-size="15"
          :dots-num="3"
          style="margin: 0 auto; padding-top: 40vh"
        />
        <h2 style="padding-top: 4vh; text-align: center">Spielebibliothek wird geladen...</h2>
      </div>
    </template>
    <template v-else>
      <h1 style="margin-bottom: 1rem">Spielebibliothek</h1>
      <game-entry
        v-for="(item, index) in lib.games"
        :key="index"
        :value="item"
        :homeDir="homeDir"
        :config="getGameFolder(item)"
        @download="downloadGame(item)"
        @pause="unPauseGame(item, true)"
        @resume="unPauseGame(item, false)"
        @delete="deleteGame(item)"
      />
    </template>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { HollowDotsSpinner } from "epic-spinners";
import fs from "fs-extra";

import AJAX from "../ajax";
import online from "../mixins/online";

import GameEntry from "./GameEntry";

const libJsonPath = "/Bibliothek/library.json";
let configInterval;

export default {
  mixins: [online],
  components: {
    HollowDotsSpinner,
    GameEntry
  },
  data() {
    return {
      config: {},
      lib: {},
      libExisting: false
    };
  },
  created() {
    this.getConfig();
    clearInterval(configInterval);
    configInterval = setInterval(this.getConfig, 5000);
    this.setLibWatcher();
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
        AJAX.System.Syncthing.setConfig(this.config);
      }
    },
    devices: {
      get() {
        return this.config.devices || [];
      }
    },
    folders: {
      get() {
        return this.config.folders || [];
      }
    },
    libConfigPath() {
      return this.homeDir + libJsonPath;
    },
    ...mapState(["nas", "homeDir"])
  },
  watch: {
    nas() {
      this.getConfig();
    }
  },
  methods: {
    getConfig() {
      AJAX.Syncthing.System.getConfig().then(response => {
        this.config = response.data;
        if (
          this.nas.id && // If nasId is defined (if discovery finds an ID with corresponding ip)
          !this.config.devices.find(this.nasDeviceFilter)
        ) {
          this.config.devices.push({
            deviceID: this.nas.id,
            _addressesStr: "dynamic",
            compression: "metadata",
            introducer: true,
            selectedFolders: {},
            pendingFolders: [],
            ignoredFolders: [],
            addresses: ["dynamic"]
          });
          AJAX.Syncthing.System.setConfig(this.config);
        }
        if (
          this.nasDevice && // If nasDevice is defined (after it has been set by previous if)
          this.nasDevice.pendingFolders.length > 0 &&
          this.config.folders.length == 0
        ) {
          this.config.folders.push(this.getFolderObj("gamelib", "Bibliothek"));
          AJAX.Syncthing.System.setConfig(this.config);
        }
      });
    },
    nasDeviceFilter(device) {
      return device.deviceID == this.nas.id;
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
        devices: this.devices.map(device => {
          return {
            deviceID: device.deviceID
          };
        })
      };
    },
    setLibWatcher() {
      this.libExisting = fs.existsSync(this.libConfigPath);
      if (this.libExisting) {
        this.getLib();
      }
      fs.watchFile(this.libConfigPath, curr => {
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
      AJAX.Syncthing.System.setConfig(this.config).then(() => {
        this.$toasted.global.success("Download gestartet: " + game.title);
      });
    },
    getGameFolder(game) {
      return this.folders.find(folder => folder.id == game.id);
    },
    getGameFolderIndex(game) {
      return this.folders.indexOf(this.getGameFolder(game));
    },
    unPauseGame(game, pause) {
      this.config.folders[this.getGameFolderIndex(game)].paused = pause;
      AJAX.Syncthing.System.setConfig(this.config).then(() => {
        if (pause) {
          this.$toasted.global.success("Download pausiert: " + game.title);
        } else {
          this.$toasted.global.success("Download forgesetzt: " + game.title);
        }
      });
    },
    deleteGame(game) {
      let gameFolder = this.getGameFolder(game);
      this.config.folders.splice(this.getGameFolderIndex(game), 1);
      AJAX.Syncthing.System.setConfig(this.config).then(() => {
        this.$toasted.global.success("Spiel gelöscht: " + game.title);
      });
      fs.removeSync(gameFolder.path);
    }
  }
};
</script>