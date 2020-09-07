<template>
  <div class="container">
    <h1>{{$t('nav.settings')}}</h1>
    <vs-alert
      color="danger"
      :title="$t('errors.playerNameUnset.title')"
      v-if="playerName == false"
    >
      {{$t('errors.playerNameUnset.message')}}
    </vs-alert>
    <vs-alert
      color="danger"
      :title="$t('errors.homeDirUnset.title')"
      v-if="homeDir == false"
    >
      {{$t('errors.homeDirUnset.message')}}
    </vs-alert>
    <vs-alert
      color="danger"
      :title="$t('errors.nasUnset.title')"
      v-if="nas == false"
    >
      {{$t('errors.nasUnset.message')}}
    </vs-alert>
    <h2>{{$t('settings.theme')}}</h2>
    <vs-images>
      <vs-image
        v-for="(item, index) in textures"
        :key="index"
        :src="item"
        @click.native="() => {$store.dispatch('setTheme', {theme: item})}"
      ></vs-image>
    </vs-images>
    <h2>{{$t('settings.backgroundColor')}}</h2>
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
    <h2>{{$t('settings.environment')}}</h2>
    <vs-row>
      <vs-col vs-w="3">
        <vs-dropdown>
          <vs-input
            :label-placeholder="$t('settings.language')"
            :value="langs[locale].lang"
          />
          <vs-dropdown-menu class="langDropdown">
            <vs-dropdown-item
              v-for="(item, index) in langs"
              :key="index"
              @click.native="$store.dispatch('setLocale', {locale: index})"
            >
              {{item.lang}}
            </vs-dropdown-item>
          </vs-dropdown-menu>
        </vs-dropdown>
      </vs-col>
    </vs-row>
    <vs-row>
      <vs-col vs-w="3">
        <vs-input
          :label-placeholder="$t('settings.playerName')"
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
          :label-placeholder="$t('settings.homeDir')"
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
            :label-placeholder="$t('settings.nas')"
            :value="nas"
            :danger="nas == false"
          />
          <vs-dropdown-menu class="nasDropdown">
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
                  {{$t('settings.alerts.discovery')}}
                </vs-alert>
              </vs-dropdown-item>
            </template>
            <vs-dropdown-item v-else>
              <vs-alert
                color="danger"
                title="Service nicht gestartet"
              >
                {{$t('settings.alerts.service')}}
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
        require("@/assets/unicorns.png")
      ],
      devices: [],
      langs: require("../langs").default
    };
  },
  computed: mapState(["playerName", "homeDir", "nas", "started", "locale"]),
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