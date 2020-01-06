<template>
  <div class="overlay">
    <template v-if="started && !online">
      <div class="offline">
        <breeding-rhombus-spinner
          :animation-duration="2000"
          :size="65"
          color="rgb(200,200,200)"
        />
        <div>Verbindung zum Service wird hergestellt...</div>
      </div>
    </template>
    <template v-else-if="started && online">
      <div class="online">
        <h3>Statistiken</h3>
        <table>
          <tr>
            <td>
              <vs-icon
                icon="desktop_windows"
                size="small"
              ></vs-icon><span>CPU:</span>
            </td>
            <td>{{(status.cpuPercent || 0.00).toFixed(2)}} %</td>
          </tr>
          <tr>
            <td>
              <vs-icon
                icon="arrow_drop_up"
                size="small"
              ></vs-icon><span>NAS:</span>
            </td>
            <td>
              <vs-icon
                v-if="nasConnected"
                icon="cloud_done"
                size="small"
              ></vs-icon>
              <vs-icon
                v-else
                icon="cloud_off"
                size="small"
              ></vs-icon>
            </td>
          </tr>
          <tr>
            <td>
              <vs-icon
                icon="arrow_drop_down"
                size="small"
              ></vs-icon><span>Downl.:</span>
            </td>
            <td>{{(inbps / 1024**2).toFixed(2)}} MB/s</td>
          </tr>
          <tr>
            <td>
              <vs-icon
                icon="arrow_drop_up"
                size="small"
              ></vs-icon><span>Upl.:</span>
            </td>
            <td>{{(outbps / 1024**2).toFixed(2)}} MB/s</td>
          </tr>
        </table>
      </div>
    </template>
    <div class="controls">
      <vs-icon
        icon="play_arrow"
        size="medium"
        color="success"
        @click="startService"
        :style="{filter: !started ? 'opacity(1)' : 'opacity(.2)'}"
      ></vs-icon>
      <vs-icon
        icon="stop"
        size="medium"
        color="danger"
        @click="stopService"
        :style="{filter: started ? 'opacity(1)' : 'opacity(.2)'}"
      ></vs-icon>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { BreedingRhombusSpinner } from "epic-spinners";

import AJAX from "../ajax";
import online from "../mixins/online";

let statisticsInterval;

export default {
  mixins: [online],
  components: {
    BreedingRhombusSpinner
  },
  data() {
    return {
      status: {},
      connections: {
        connections: {},
        total: {}
      },
      prev: {
        time: new Date(),
        inBytesTotal: 0,
        outBytesTotal: 0
      },
      inbps: 0,
      outbps: 0
    };
  },
  computed: {
    nasConnected() {
      return this.connections.connections[this.nas.id].connected;
    },
    ...mapState(["nas"])
  },
  created() {
    clearInterval(statisticsInterval);
    statisticsInterval = setInterval(() => {
      if (online) {
        AJAX.Syncthing.System.status().then(response => {
          this.status = response.data;
        });
        AJAX.Syncthing.System.connections().then(response => {
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
            outBytesTotal: this.connections.total.outBytesTotal
          };
        });
      }
    }, 5000);
  },
  methods: {
    startService() {
      if (!this.started) {
        require("electron").ipcRenderer.send("startService");
      }
    },
    stopService() {
      if (this.started) {
        AJAX.Syncthing.System.shutdown()
          .then(() => {
            this.$store.dispatch("setStarted", { started: false });
          })
          .catch(() => {
            this.$toasted.global.error("Fehler beim Stoppen des Services");
          });
      }
    }
  }
};
</script>

<style lang="sass">
.offline
    width: 100%
    height: 200px
    div:nth-child(1)
        margin: 0 auto
        top: 2rem
    div:nth-child(2)
        top: 4rem
        width: 100% 
        text-align: center
        position: relative
.online
    text-align: center
    table
      width: 100%
      .vs-icon
        height: 1rem
        width: 1rem
        font-size: 1rem
        margin-right: .4rem
        vertical-align: bottom
      tr td
        width: auto
        &:nth-child(1)
          max-width: 50%
          text-align: right
          padding-right: .2rem
        &:nth-child(2)
          min-width: 50%
          text-align: left
          padding-left: .2rem

.controls
    position: absolute
    bottom: 0px
    overflow-y: hidden
    width: 100%
    height: 2rem
    text-align: center
    .vs-icon
        cursor: pointer
</style>