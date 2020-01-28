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
      title="NAS ID nicht gesetzt"
      v-if="nas == false"
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
          @input="(input) => {$emit('update:backgroundColor', 'hsl(' + input + ', 75%, 8%)')}"
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
        vs-w="4"
        style="padding: 0 .2rem"
      >
        <vs-input
          label-placeholder="Spieleverzeichnis"
          @click="openFolderChooser"
          @blur="(event) => {if (event.target.value) $store.dispatch('setHomeDir', {dir: event.target.value})}"
          :value="homeDir"
          :danger="homeDir == false"
          :disabled="started || online"
        />
      </vs-col>
      <vs-col vs-w="5">
        <vs-dropdown>
          <vs-input
            :disabled="!online"
            label-placeholder="NAS ID"
            :value="nas"
            :danger="nas == false"
          />
          <vs-dropdown-menu>
            <template v-if="online">
              <vs-dropdown-item
                v-for="(item, index) in devices"
                :key="index"
                @click.native="$store.dispatch('setNas', {id: index})"
              >
                {{index}}
              </vs-dropdown-item>
              <vs-dropdown-item v-if="Object.keys(devices).length == 0">
                <vs-alert
                  color="danger"
                  title="Keine Geräte gefunden"
                >
                  Bitte warte einen Moment, während verfügbare Geräte gesucht werden...
                </vs-alert>
              </vs-dropdown-item>
            </template>
            <vs-dropdown-item v-else>
              <vs-alert
                color="danger"
                title="Service nicht gestartet"
              >
                Der Synchronisationsservice muss gestartet sein, damit verfügbare Netzwerkgeräte angezeigt werden können.
              </vs-alert>
            </vs-dropdown-item>
          </vs-dropdown-menu>
        </vs-dropdown>
      </vs-col>
    </vs-row>
  </div>
</template>

<script>
import online from "../mixins/online";
import { mapState } from "vuex";

import AJAX from "../ajax";

let discoveryInterval;

export default {
  mixins: [online],
  props: {
    backgroundColor: String
  },
  data() {
    return {
      textures: [
        require("@/assets/funky-lines.png"),
        require("@/assets/gaming.png"),
        require("@/assets/prism.png"),
        require("@/assets/maze.png"),
        require("@/assets/unicorn.png")
      ],
      devices: []
    };
  },
  computed: mapState([
    "playerName",
    "homeDir",
    "nas",
    "started"
  ]),
  created() {
    this.discovery();
    clearInterval(discoveryInterval);
    discoveryInterval = setInterval(this.discovery, 5000);
  },
  destroyed() {
    clearInterval(discoveryInterval);
  },
  methods: {
    openFolderChooser() {
      require("electron")
        .remote.dialog.showOpenDialog({ properties: ["openDirectory"] })
        .then(result => {
          console.log(result.canceled);
          if (!result.canceled)
            this.$store.dispatch("setHomeDir", { dir: result.filePaths[0] });
        });
    },
    discovery() {
      AJAX.Syncthing.System.getDiscovery()
        .then(response => {
          this.devices = response.data;
        })
        .catch();
    }
  }
};
</script>