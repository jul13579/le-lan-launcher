<template>
  <v-footer
    fixed
    :height="66"
  >
    <v-container>
      <template v-if="started && !online">
        <div class="d-flex justify-center align-center">
          <half-circle-spinner
            :animation-duration="1000"
            :size="30"
            color="rgb(200,200,200)"
          />
          <div class="px-5">{{$t('statistics.connecting')}}</div>
          <half-circle-spinner
            :animation-duration="1000"
            :size="30"
            color="rgb(200,200,200)"
          />
        </div>
      </template>
      <template v-else-if="started && online">
        <v-row
          no-gutters
          class="align-center"
        >
          <v-col
            cols="3"
            class="d-flex justify-center"
          >
            <v-icon class="mx-2">mdi-monitor</v-icon><span>{{$t('statistics.cpu')}}:</span>
            <span>{{(status.cpuPercent || 0.00).toFixed(2)}} {{$t('statistics.percent')}}</span>
          </v-col>
          <v-col
            cols="3"
            class="d-flex justify-center"
          >
            <v-icon class="mx-2">mdi-cloud</v-icon><span>{{$t('statistics.nas')}}:</span>
            <v-icon
              v-if="nasConnected"
              class="mx-2"
            >mdi-cloud-check</v-icon>
            <v-icon
              v-else
              class="mx-2"
            >mdi-cloud-off-outline</v-icon>
          </v-col>
          <v-col
            cols="3"
            class="d-flex justify-center"
          >
            <v-icon
              class="mx-2"
              color="green"
            >mdi-download</v-icon><span>{{$t('statistics.download')}}:</span>
            <span>{{(inbps / 1024**2).toFixed(2)}} {{$t('statistics.mbps')}}</span>
          </v-col>
          <v-col
            cols="3"
            class="d-flex justify-center"
          >
            <v-icon
              class="mx-2"
              color="red"
            >mdi-upload</v-icon><span>{{$t('statistics.upload')}}:</span>
            <span>{{(outbps / 1024**2).toFixed(2)}} {{$t('statistics.mbps')}}</span>
          </v-col>
        </v-row>
      </template>
    </v-container>
  </v-footer>
  <!-- <div class="overlay">
    <div class="controls">
      <vs-icon
        :class="{'enabled' : !started && homeDir}"
        icon="play_arrow"
        size="medium"
        color="success"
        @click="startService"
      ></vs-icon>
      <vs-icon
        :class="{'enabled' : started}"
        icon="autorenew"
        size="medium"
        color="warning"
        @click="restartService"
      ></vs-icon>
      <vs-icon
        :class="{'enabled' : started}"
        icon="stop"
        size="medium"
        color="danger"
        @click="stopService"
      ></vs-icon>
    </div>
  </div> -->
</template>

<script>
import { mapState } from "vuex";
import { HalfCircleSpinner } from "epic-spinners";

import AJAX from "../ajax";
import online from "../mixins/online";

let statisticsInterval;

export default {
  mixins: [online],
  components: {
    HalfCircleSpinner,
  },
  data() {
    return {
      status: {},
      connections: {
        connections: {},
        total: {},
      },
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
  created() {
    clearInterval(statisticsInterval);
    statisticsInterval = setInterval(() => {
      if (this.online) {
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
      }
    }, 5000);
  },
  destroyed() {
    clearInterval(statisticsInterval);
  },
  methods: {
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