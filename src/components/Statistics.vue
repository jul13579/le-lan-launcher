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
      <div>
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
import { BreedingRhombusSpinner } from "epic-spinners";

import AJAX from "../ajax";
import online from "../mixins/online";

export default {
  mixins: [online],
  components: {
    BreedingRhombusSpinner
  },
  methods: {
    startService() {
      if (!this.started) {
        require("electron").ipcRenderer.send("startService");
        this.$store.dispatch("setStarted", { started: true });
        this.$toasted.global.success("Service startet...");
      }
    },
    stopService() {
      if (this.started) {
        AJAX.Syncthing.System.shutdown()
          .then(() => {
            this.$store.dispatch("setStarted", { started: false });
            this.$toasted.global.success("Service gestoppt");
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
.controls
    position: absolute
    overflow-y: hidden
    width: 100%
    height: 2rem
    text-align: center
    .vs-icon
        cursor: pointer
</style>