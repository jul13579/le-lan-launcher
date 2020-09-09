<template>
  <v-container>
    <v-alert
      type="error"
      text
      border="left"
      :title="$t('errors.playerNameUnset.title')"
      v-if="playerName == false"
    >
      {{$t('errors.playerNameUnset.message')}}
    </v-alert>
    <v-alert
      type="error"
      text
      border="left"
      :title="$t('errors.homeDirUnset.title')"
      v-if="homeDir == false"
    >
      {{$t('errors.homeDirUnset.message')}}
    </v-alert>
    <v-alert
      type="error"
      text
      border="left"
      :title="$t('errors.nasUnset.title')"
      v-if="nas == false"
    >
      {{$t('errors.nasUnset.message')}}
    </v-alert>
    <div class="text-h4">{{$t('settings.theme')}}</div>
    <v-row>
      <v-img
        v-for="(item, index) in textures"
        :key="index"
        class="themePreview ma-3"
        aspect-ratio="1"
        :src="item"
        @click.native="() => {$store.dispatch('setTheme', {theme: item})}"
      ></v-img>
    </v-row>

    <div class="mt-5 text-h4">{{$t('settings.backgroundHue')}}</div>
    <v-row>
      <v-col cols="12">
        <v-slider
          :min="0"
          :max="360"
          thumb-label
          v-model="sliderValue"
          :color="'hsl(' + sliderValue + ', 100%, 50%)'"
          @change="(input) => {$store.dispatch('setBackgroundHue', {color: input})}"
        />
      </v-col>
    </v-row>

    <div class="text-h4">{{$t('settings.environment')}}</div>
    <v-row>
      <v-col cols="3">
        <v-select
          :label="$t('settings.language')"
          v-model="langs[locale].lang"
          :items="langs"
          @change="(input) => $store.dispatch('setLocale', {locale: input})"
        ></v-select>
        <!-- <v-dropdown>
          <v-input
            :label-placeholder="$t('settings.language')"
            :value="langs[locale].lang"
          />
          <v-dropdown-menu class="langDropdown">
            <v-dropdown-item
              v-for="(item, index) in langs"
              :key="index"
              @click.native="$store.dispatch('setLocale', {locale: index})"
            >
              {{item.lang}}
            </v-dropdown-item>
          </v-dropdown-menu>
        </v-dropdown> -->
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="3">
        <v-input
          :label-placeholder="$t('settings.playerName')"
          :value="playerName"
          @blur="(event) => {$store.dispatch('setPlayerName', {name: event.target.value})}"
          :danger="playerName == false"
        />
      </v-col>
      <v-col
        cols="4"
        style="padding: 0 .2rem"
      >
        <v-input
          :label-placeholder="$t('settings.homeDir')"
          @click="openFolderChooser"
          @blur="(event) => {if (event.target.value) $store.dispatch('setHomeDir', {dir: event.target.value})}"
          :value="homeDir"
          :danger="homeDir == false"
          :disabled="started || online"
        />
      </v-col>
      <v-col cols="5">
        <v-dropdown>
          <v-input
            :disabled="!online"
            :label-placeholder="$t('settings.nas')"
            :value="nas"
            :danger="nas == false"
          />
          <v-dropdown-menu class="nasDropdown">
            <template v-if="online">
              <v-dropdown-item
                v-for="(item, index) in devices"
                :key="index"
                @click.native="$store.dispatch('setNas', {id: index})"
              >
                {{index}}
              </v-dropdown-item>
              <v-dropdown-item v-if="Object.keys(devices).length == 0">
                <v-alert
                  color="danger"
                  title="Keine Geräte gefunden"
                >
                  {{$t('settings.alerts.discovery')}}
                </v-alert>
              </v-dropdown-item>
            </template>
            <v-dropdown-item v-else>
              <v-alert
                color="danger"
                title="Service nicht gestartet"
              >
                {{$t('settings.alerts.service')}}
              </v-alert>
            </v-dropdown-item>
          </v-dropdown-menu>
        </v-dropdown>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import online from "../mixins/online";
import { mapState } from "vuex";

import AJAX from "../ajax";

let discoveryInterval;

export default {
  mixins: [online],
  data() {
    return {
      textures: [
        require("@/assets/funky-lines.png"),
        require("@/assets/gaming.png"),
        require("@/assets/prism.png"),
        require("@/assets/maze.png"),
        require("@/assets/unicorns.png"),
      ],
      sliderValue: 0,
      devices: [],
      langs: require("../langs").default,
    };
  },
  computed: mapState([
    "playerName",
    "homeDir",
    "nas",
    "started",
    "locale",
    "backgroundHue",
  ]),
  created() {
    this.discovery();
    clearInterval(discoveryInterval);
    discoveryInterval = setInterval(this.discovery, 5000);
  },
  beforeMount() {
    this.sliderValue = this.backgroundHue;
  },
  destroyed() {
    clearInterval(discoveryInterval);
  },
  methods: {
    openFolderChooser() {
      require("electron")
        .remote.dialog.showOpenDialog({ properties: ["openDirectory"] })
        .then((result) => {
          if (!result.canceled)
            this.$store.dispatch("setHomeDir", { dir: result.filePaths[0] });
        });
    },
    discovery() {
      AJAX.Syncthing.System.getDiscovery()
        .then((response) => {
          this.devices = response.data;
        })
        .catch();
    },
  },
};
</script>