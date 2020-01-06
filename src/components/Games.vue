<template>
  <div>
    <template v-if="!libDirAdded">
      <div style="height: calc(100vh - 40px)">
        <hollow-dots-spinner
          :animation-duration="1000"
          :dot-size="15"
          :dots-num="3"
          style="margin: 0 auto; padding-top: 40vh"
        />
        <h2 style="padding-top: 4vh; text-align: center">Spielebibliothek wird geladen...</h2>
      </div>
    </template>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { HollowDotsSpinner } from "epic-spinners";

import AJAX from "../ajax";
import online from "../mixins/online";

let nasDeviceInterval;

export default {
  mixins: [online],
  components: {
    HollowDotsSpinner
  },
  data() {
    return {
      config: {}
    };
  },
  created() {
    this.addNasDevice();
    clearInterval(nasDeviceInterval);
    nasDeviceInterval = setInterval(this.addNasDevice, 5000);
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
    devices() {
      return this.config.devices.map(device => {
        return {
          deviceID: device.deviceID
        };
      });
    },
    libDirAdded() {
      if (!this.config.folders) return false;
      return this.config.folders.find(folder => folder.id == "gamelib") != null;
    },
    ...mapState(["nas"])
  },
  watch: {
    nas() {
      this.addNasDevice();
    }
  },
  methods: {
    addNasDevice() {
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
          this.config.folders.push(this.getDeviceObj("gamelib", "Bibliothek"));
          AJAX.Syncthing.System.setConfig(this.config);
        }
      });
    },
    nasDeviceFilter(device) {
      return device.deviceID == this.nas.id;
    },
    getDeviceObj(id, label) {
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
        devices: this.devices
      };
    }
  }
};
</script>