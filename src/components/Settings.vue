<template>
  <div class="container">
    <h1>Einstellungen</h1>
    <vs-alert color="danger" title="Spielername nicht gesetzt" v-if="playerName == false">
      Bevor du auf die Spielebibliothek zugreifen kannst musst du deinen Spielernamen eingeben!
    </vs-alert>
    <vs-alert color="danger" title="Spieleverzeichnis nicht gesetzt" v-if="homeDir == false">
      Bevor du auf die Spielebibliothek zugreifen kannst musst du das Spieleverzeichnis setzen!
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
    <div style="padding: 0 1rem">
      <vs-slider
        :min="0"
        :max="360"
        @input="(input) => {$store.dispatch('setBackgroundColor', {color: 'hsl(' + input + ', 75%, 8%)'})}"
        :color="backgroundColor"
        :value="parseInt(backgroundColor.replace('hsl(', '').split(',')[0])"
      />
    </div>
    <h2>Spielerinfos</h2>
    <vs-row>
      <vs-col vs-w="3">
        <vs-input
          label-placeholder="Name"
          :value="playerName"
          @input="(input) => {$store.dispatch('setPlayerName', {name: input})}"
        />
      </vs-col>
    </vs-row>
    <h2>Dateien</h2>
    <vs-row>
      <vs-col vs-w="6">
        <vs-input
          label-placeholder="Spieleverzeichnis"
          @click="openFolderChooser"
          :value="homeDir"
        />
        <input
          id="folderInput"
          type="file"
          style="display: none"
          @change="(event) => {$store.dispatch('setHomeDir', {dir: event.target.files[0].path})}"
          webkitdirectory
        />
      </vs-col>
    </vs-row>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
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
  computed: mapState(["backgroundColor", "playerName", "homeDir"]),
  methods: {
    openFolderChooser() {
      document.getElementById('folderInput').click()
    }
  }
};
</script>