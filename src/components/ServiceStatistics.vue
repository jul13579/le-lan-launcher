<style lang="scss" scoped>
.statistics {
  background: none;
  cursor: pointer;

  & > div {
    width: 100%;
    height: 100%;
    position: relative;
  }

  $popup-height: 250px;
  .popup {
    width: 100%;
    height: $popup-height;
    padding: 0px;
    padding-bottom: 66px;
    position: absolute;
    z-index: -1;
    transition: top 0.1s linear !important;
    top: 0px;
    box-sizing: content-box;

    & > .container {
      opacity: 0;
      box-sizing: border-box;
      height: 100%;
      max-height: 100%;
      overflow: hidden;
      transition: opacity 0.1s linear;

      .row {
        height: 100%;
        max-height: 100%;

        .col {
          height: 100%;
          max-height: 100%;
          overflow: hidden;
        }
      }

      .v-card {
        background: none !important;
        border: none !important;
        box-shadow: none !important;
      }
    }
  }

  &:hover {
    .popup {
      top: -$popup-height;

      & > .container {
        opacity: 1;
      }
    }
  }

  .header {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}
</style>

<template>
  <v-footer
    fixed
    :height="66"
    class="statistics pa-0"
  >
    <div class="d-flex">
      <div class="d-flex flex-grow-1">
        <v-container
          class="py-0 d-flex"
          style="height: 100%"
        >
          <v-row
            no-gutters
            sytle="height: 100%"
          >
            <v-col
              cols="4"
              class="d-flex justify-center align-center"
            >
              <template v-if="nasConnected">
                <div>
                  <v-icon class="mx-2">{{ icons.mdiCloudCheck }}</v-icon>
                </div>
              </template>
              <template v-else-if="!nasConnected && online">
                <div>
                  <v-icon class="mx-2">{{ icons.mdiCloudSearch }}</v-icon>
                </div>
              </template>
              <template v-else>
                <div>
                  <v-icon class="mx-2">{{ icons.mdiCloudOffOutline }}</v-icon>
                </div>
              </template>
            </v-col>
            <v-col
              cols="4"
              class="d-flex justify-center align-center"
            >
              <v-icon
                class="mx-2"
                color="green"
              >{{ icons.mdiDownload }}</v-icon>
              <i18n-n
                :value="inbps / 1024**2"
                format="mbps"
              ></i18n-n>
            </v-col>
            <v-col
              cols="4"
              class="d-flex justify-center align-center"
            >
              <v-icon
                class="mx-2"
                color="red"
              >{{ icons.mdiUpload }}</v-icon>
              <i18n-n
                :value="outbps / 1024**2"
                format="mbps"
              ></i18n-n>
            </v-col>
          </v-row>
        </v-container>
      </div>
      <div class="d-flex popup v-footer theme--dark backdrop">
        <v-container>
          <v-row
            no-gutters
            sytle="height: 100%"
          >
            <v-col
              cols="4"
              class="px-1"
            >
              <v-card class="text-center">
                <v-card-title class="justify-center flex-nowrap">
                  <span
                    class="header"
                    v-html="$t('statistics.service_controls')"
                  ></span>
                  <v-btn icon @click="openSyncthingUI()">
                    <v-icon>{{ icons.mdiOpenInNew }}</v-icon>
                  </v-btn>
                  <v-spacer></v-spacer>
                  <v-btn
                    icon
                    color="green"
                    :disabled="online || !homeDir"
                    @click="startService"
                  >
                    <v-icon>{{ icons.mdiPlay }}</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    color="yellow"
                    :disabled="!online"
                    @click="restartService"
                  >
                    <v-icon>{{ icons.mdiRestart }}</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    color="red"
                    :disabled="!online"
                    @click="stopService"
                  >
                    <v-icon>{{ icons.mdiStop }}</v-icon>
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <console-view v-model="syncthingMessages" />
                </v-card-text>
              </v-card>
            </v-col>
            <template v-for="(item, index) in [{headline: 'statistics.download_speed', value: inbps / 1024**2}, {headline: 'statistics.upload_speed', value: outbps / 1024**2}]">
              <v-col
                :key="index"
                cols="4"
                class="px-1"
              >
                <v-card class="text-center">
                  <v-card-title class="justify-center">
                    <span v-html="$t(item.headline)"></span>
                  </v-card-title>
                  <v-card-text>
                    <bar-chart
                      ref="barchart"
                      :value="item.value"
                      unit="mbps"
                    />
                  </v-card-text>
                </v-card>
              </v-col>
            </template>
          </v-row>
        </v-container>
      </div>
    </div>
  </v-footer>
</template>

<script>
import { mdiCloudCheck, mdiCloudOffOutline, mdiCloudSearch, mdiDownload, mdiOpenInNew, mdiPlay, mdiRestart, mdiStop, mdiUpload } from "@mdi/js";
import { mapState } from "vuex";
import BarChart from "./BarChart";

import SyncServiceController from "../controllers/SyncServiceRendererController";
import online from "../mixins/online";
import ConsoleView from "./ConsoleView.vue";

let statisticsInterval;

const connections = {
  connections: {},
  total: {},
};

export default {
  mixins: [online],
  components: {
    BarChart,
    ConsoleView,
  },
  data() {
    return {
      status: {},
      connections,
      prev: {
        time: new Date(),
        inBytesTotal: 0,
        outBytesTotal: 0,
      },
      inbps: 0,
      outbps: 0,
      syncthingMessages: [],
    };
  },
  computed: {
    icons() {
      return {
        mdiCloudCheck,
        mdiCloudSearch,
        mdiCloudOffOutline,
        mdiDownload,
        mdiUpload,
        mdiOpenInNew,
        mdiPlay,
        mdiRestart,
        mdiStop,
      }
    },
    nasConnected() {
      return (this.connections.connections[this.nas] || {}).connected;
    },
    ...mapState(["nas", "homeDir", "apiKey"]),
  },
  watch: {
    // Periodically fetch status from service if online
    online(online) {
      if (online) {
        statisticsInterval = setInterval(this.getStatus, 5000);
      } else {
        clearInterval(statisticsInterval);
        this.connections = connections;
      }
    },
  },
  beforeMount() {
    // Setup periodic task to fetch sync-service status
    clearInterval(statisticsInterval);
    if (this.online) {
      statisticsInterval = setInterval(this.getStatus, 5000);
    }

    // Setup IPC handler for sync-service startup notifications
    window.ipcRenderer.on("syncService", async (event, messageObj) => {
      this.syncthingMessages.push(messageObj);
    });
  },
  destroyed() {
    clearInterval(statisticsInterval);
  },
  methods: {
    /**
     * Periodic task to fetch Syncthing status (e.g. bandwidth).
     */
    getStatus() {
      SyncServiceController.System.status()
        .then((response) => {
          this.status = response.data;
        })
        .catch();
      SyncServiceController.System.connections()
        .then((response) => {
          this.connections = response.data;
          let now = new Date();
          let diffSec = (now - this.prev.time) / 1000;
          this.inbps =
            (this.connections.total.inBytesTotal - this.prev.inBytesTotal) /
            diffSec;
          this.outbps =
            (this.connections.total.outBytesTotal - this.prev.outBytesTotal) /
            diffSec;
          this.prev = {
            time: now,
            inBytesTotal: this.connections.total.inBytesTotal,
            outBytesTotal: this.connections.total.outBytesTotal,
          };
        })
        .catch()
        .then(() => {
          this.$refs.barchart.forEach((chart) => chart.updateChart());
        });
    },

    /**
     * Open the sync-service UI in the system's default browser
     */
    openSyncthingUI() {
      SyncServiceController.System.openSyncthingUI();
    },

    /**
     * Start the sync-service process.
     */
    startService() {
      if (!this.online) {
        this.$toasted.success(this.$t("toast.service.starting"));
        SyncServiceController.System.start(this.homeDir);
      }
    },

    /**
     * Restart the sync-service process.
     */
    restartService() {
      if (this.online) {
        SyncServiceController.System.restart().then((success) => {
          if (success) {
            this.$toasted.success(this.$t("toast.service.success.restart"));
          } else {
            this.$toasted.error(this.$t("toast.service.error.restart"));
          }
        });
      }
    },

    /**
     * Stop the sync-service process.
     */
    stopService() {
      if (this.online) {
        SyncServiceController.System.stop().then((success) => {
          if (success) {
            this.$toasted.success(this.$t("toast.service.success.stop"));
          } else {
            this.$toasted.error(this.$t("toast.service.error.stop"));
          }
        });
      }
    },
  },
};
</script>