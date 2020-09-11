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
              <template v-if="nasConnected && started">
                <div>
                  <v-icon class="mx-2">mdi-cloud-check</v-icon>
                </div>
              </template>
              <template v-else-if="!started">
                <div>
                  <v-icon class="mx-2">mdi-cloud-off-outline</v-icon>
                </div>
              </template>
              <template v-else>
                <div>
                  <half-circle-spinner
                    :animation-duration="1000"
                    :size="30"
                    color="rgb(200,200,200)"
                  />
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
                :disabled="started || !homeDir"
                @click="startService"
              >
                <v-icon>mdi-play</v-icon>
              </v-btn>
              <v-btn
                icon
                color="yellow"
                :disabled="!started"
                @click="restartService"
              >
                <v-icon>mdi-restart</v-icon>
              </v-btn>
              <v-btn
                icon
                color="red"
                :disabled="!started"
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
              <line-chart :value="status.cpuPercent" />
            </v-card-text>
          </v-card>
        </v-menu>
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
              <line-chart :value="inbps / 1024**2" />
            </v-card-text>
          </v-card>
        </v-menu>
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
              <line-chart :value="outbps / 1024**2" />
            </v-card-text>
          </v-card>
        </v-menu>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script>
import { mapState } from "vuex";
import { HalfCircleSpinner } from "epic-spinners";
import LineChart from "./LineChart";

import AJAX from "../ajax";
import online from "../mixins/online";

let statisticsInterval;

const connections = {
  connections: {},
  total: {},
};

export default {
  mixins: [online],
  components: {
    HalfCircleSpinner,
    LineChart,
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
      if (!this.started) {
        require("electron").ipcRenderer.send("startService");
      }
    },
    restartService() {
      if (this.started) {
        AJAX.Syncthing.System.restart()
          .then(() => {
            this.$toasted.success(this.$t("toast.service.restarting"));
          })
          .catch(() => {
            this.$toasted.error(this.$t("toast.service.error.restarting"));
          });
      }
    },
    stopService() {
      if (this.started) {
        AJAX.Syncthing.System.shutdown()
          .then(() => {
            this.$store.dispatch("setStarted", { started: false });
          })
          .catch(() => {
            this.$toasted.error(this.$t("toast.service.error.stopping"));
          });
      }
    },
  },
};
</script>