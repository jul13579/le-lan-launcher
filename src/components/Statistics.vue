<template>
  <v-footer
    fixed
    :height="66"
    style="cursor: default"
  >
    <v-container
      class="py-0 d-flex"
      style="height: 100%"
    >
      <v-row
        no-gutters
        sytle="height: 100%"
      >
        <v-menu
          top
          offset-y
          open-on-hover
          transition="slide-y-reverse-transition"
        >
          <template v-slot:activator="{ on }">
            <v-col
              cols="3"
              class="d-flex justify-center align-center"
              v-on="on"
            >
              <template v-if="nasConnected">
                <div>
                  <v-icon class="mx-2">mdi-cloud-check</v-icon>
                </div>
              </template>
              <template v-else-if="!nasConnected && online">
                <div>
                  <v-icon class="mx-2">mdi-cloud-search</v-icon>
                </div>
              </template>
              <template v-else>
                <div>
                  <v-icon class="mx-2">mdi-cloud-off-outline</v-icon>
                </div>
              </template>
            </v-col>
          </template>
          <v-card class="text-center">
            <v-card-title class="justify-center">
              <span v-html="$t('statistics.service_controls')"></span>
            </v-card-title>
            <v-card-text>
              <v-btn
                icon
                color="green"
                :disabled="online || !homeDir"
                @click="startService"
              >
                <v-icon>mdi-play</v-icon>
              </v-btn>
              <v-btn
                icon
                color="yellow"
                :disabled="!online"
                @click="restartService"
              >
                <v-icon>mdi-restart</v-icon>
              </v-btn>
              <v-btn
                icon
                color="red"
                :disabled="!online"
                @click="stopService"
              >
                <v-icon>mdi-stop</v-icon>
              </v-btn>
            </v-card-text>
          </v-card>
        </v-menu>
        <v-menu
          top
          offset-y
          open-on-hover
          transition="slide-y-reverse-transition"
          eager
        >
          <template v-slot:activator="{ on }">
            <v-col
              cols="3"
              class="d-flex justify-center align-center"
              v-on="on"
            >
              <v-icon class="mx-2">mdi-chip</v-icon>
              <i18n-n
                :value="status.cpuPercent || 0"
                format="percent"
              ></i18n-n>
            </v-col>
          </template>
          <v-card class="text-center">
            <v-card-title class="justify-center">
              <span v-html="$t('statistics.cpu_load')"></span>
            </v-card-title>
            <v-card-text>
              <bar-chart
                :value="status.cpuPercent"
                unit="percent"
                :max="100"
              />
            </v-card-text>
          </v-card>
        </v-menu>
        <v-menu
          top
          offset-y
          open-on-hover
          transition="slide-y-reverse-transition"
          eager
        >
          <template v-slot:activator="{ on }">
            <v-col
              cols="3"
              class="d-flex justify-center align-center"
              v-on="on"
            >
              <v-icon
                class="mx-2"
                color="green"
              >mdi-download</v-icon>
              <i18n-n
                :value="inbps / 1024**2"
                format="mbps"
              ></i18n-n>
            </v-col>
          </template>
          <v-card class="text-center">
            <v-card-title class="justify-center">
              <span v-html="$t('statistics.download_speed')"></span>
            </v-card-title>
            <v-card-text>
              <bar-chart
                :value="inbps / 1024**2"
                unit="mbps"
              />
            </v-card-text>
          </v-card>
        </v-menu>
        <v-menu
          top
          offset-y
          open-on-hover
          transition="slide-y-reverse-transition"
          eager
        >
          <template v-slot:activator="{ on }">
            <v-col
              cols="3"
              class="d-flex justify-center align-center"
              v-on="on"
            >
              <v-icon
                class="mx-2"
                color="red"
              >mdi-upload</v-icon>
              <i18n-n
                :value="outbps / 1024**2"
                format="mbps"
              ></i18n-n>
            </v-col>
          </template>
          <v-card class="text-center">
            <v-card-title class="justify-center">
              <span v-html="$t('statistics.upload_speed')"></span>
            </v-card-title>
            <v-card-text>
              <bar-chart
                :value="outbps / 1024**2"
                unit="mbps"
              />
            </v-card-text>
          </v-card>
        </v-menu>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script>
import { mapState } from "vuex";
import { ipcRenderer } from "electron";
import BarChart from "./BarChart";

import AJAX from "../ajax";
import online from "../mixins/online";
import SyncService_Operations from "../syncservice_operations";

let statisticsInterval;

const connections = {
  connections: {},
  total: {},
};

export default {
  mixins: [online],
  components: {
    BarChart,
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
    };
  },
  computed: {
    nasConnected() {
      return (this.connections.connections[this.nas] || {}).connected;
    },
    ...mapState(["nas", "homeDir"]),
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
    clearInterval(statisticsInterval);
    if (this.online) {
      statisticsInterval = setInterval(this.getStatus, 5000);
    }
  },
  destroyed() {
    clearInterval(statisticsInterval);
  },
  methods: {
    getStatus() {
      AJAX.Syncthing.System.status()
        .then((response) => {
          this.status = response.data;
        })
        .catch();
      AJAX.Syncthing.System.connections()
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
        .catch();
    },
    startService() {
      if (!this.online) {
        this.$toasted.success(this.$t("toast.service.success.start"));
        ipcRenderer
          .invoke("controlService", SyncService_Operations.START)
          .then((success) => {
            if (!success) {
              this.$toasted.error(this.$t("toast.service.error.start"));
            }
          });
      }
    },
    restartService() {
      if (this.online) {
        ipcRenderer
          .invoke("controlService", SyncService_Operations.RESTART)
          .then((success) => {
            if (success) {
              this.$toasted.success(this.$t("toast.service.success.restart"));
            } else {
              this.$toasted.error(this.$t("toast.service.error.restart"));
            }
          });
      }
    },
    stopService() {
      if (this.online) {
        ipcRenderer
          .invoke("controlService", SyncService_Operations.STOP)
          .then((success) => {
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