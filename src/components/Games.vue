<template>
  <div>

  </div>
</template>

<script>
import AJAX from "../ajax";
import online from "../mixins/online";
import { mapState } from "vuex";

let nasDeviceInterval;

export default {
  mixins: [online],
  data() {
    return {
      config: {}
    };
  },
  created() {
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
    ...mapState(["nas"])
  },
  watch: {
    nasId() {
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
            deviceID: this.nasId,
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
          this.config.folders.push({
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
            path: this.$store.state.homeDir + "/Bibliothek",
            id: "gamelib",
            label: "Bibliothek",
            viewFlags: { importFromOtherDevice: true }
            // devices: [
            //   {
            //     deviceID:
            //       "ACZ6RZG-BXTPNX4-KMK3CB7-F7DWWCG-THBQTN2-TUXG2OD-R76BSHQ-NQDLNAL"
            //   },
            //   {
            //     deviceID:
            //       "IMHH2OP-ZDC3AOD-766RJPT-BXAAZ76-M7RX6FR-G3MDF4U-NBXKHVC-ZSFA3AM"
            //   }
            // ]
          });
        }
      });
    },
    nasDeviceFilter(device) {
      return device.deviceID == this.nas.id;
    }
  }
};
</script>