<template>
  <div class="container">
    <h1>Einstellungen</h1>
    <vs-alert
      color="danger"
      title="Spielername nicht gesetzt"
      v-if="playerName == false"
    >
      Bevor du auf die Spielebibliothek zugreifen kannst musst du deinen Spielernamen eingeben!
    </vs-alert>
    <vs-alert
      color="danger"
      title="Spieleverzeichnis nicht gesetzt"
      v-if="homeDir == false"
    >
      Bevor du auf die Spielebibliothek zugreifen kannst musst du das Spieleverzeichnis setzen!
    </vs-alert>
    <vs-alert
      color="danger"
      title="NAS IP-Adresse nicht gesetzt"
      v-if="nas.ip == false"
    >
      Bevor du auf die Spielebibliothek zugreifen kannst musst du die IP-Adresse des NAS angeben!
    </vs-alert>
    <h2>Design</h2>
    <vs-images>
      <vs-image
        v-for="(item, index) in textures"
        :key="index"
        :src="item"
        @click.native="() => {$store.dispatch('setTheme', {theme: item})}"
      ></vs-image>
    </vs-images>
    <h2>Farbton</h2>
    <vs-row>
      <vs-col
        vs-w="12"
        style="padding: 0 1rem"
      >
        <vs-slider
          :min="0"
          :max="360"
          @input="(input) => {$store.dispatch('setBackgroundColor', {color: 'hsl(' + input + ', 75%, 8%)'})}"
          :color="backgroundColor"
          :value="parseInt(backgroundColor.replace('hsl(', '').split(',')[0])"
        />
      </vs-col>
    </vs-row>
    <h2>Umgebung</h2>
    <vs-row>
      <vs-col vs-w="3">
        <vs-input
          label-placeholder="Spielername"
          :value="playerName"
          @blur="(event) => {$store.dispatch('setPlayerName', {name: event.target.value})}"
          :danger="playerName == false"
        />
      </vs-col>
      <vs-col
        vs-w="6"
        style="padding: 0 .2rem"
      >
        <vs-input
          label-placeholder="Spieleverzeichnis"
          @click="openFolderChooser"
          @blur="(event) => {$store.dispatch('setHomeDir', {dir: event.target.value})}"
          :value="homeDir"
          :danger="homeDir == false"
          :disabled="started || online"
        />
      </vs-col>
      <vs-col vs-w="3">
        <vs-input
          label-placeholder="NAS IP-Adresse"
          :value="nas.ip"
          @blur="(event) => {$store.dispatch('setNasIp', {ip: event.target.value})}"
          :danger="nas.ip == false"
        />
      </vs-col>
    </vs-row>
  </div>
</template>

<script>
import online from "../mixins/online";
import { mapState } from "vuex";

export default {
  mixins: [online],
  data() {
    return {
      textures: [
        require("@/assets/funky-lines.png"),
        require("@/assets/gaming.png"),
        require("@/assets/prism.png"),
        require("@/assets/maze.png")
      ]
    };
  },
  computed: mapState(["backgroundColor", "playerName", "homeDir", "nas", "started"]),
  methods: {
    openFolderChooser() {
      require("electron")
        .remote.dialog.showOpenDialog()
        .then(result => {
          this.$store.dispatch("setHomeDir", { dir: result.filePaths[0] });
        });
    }
  }
};
</script>