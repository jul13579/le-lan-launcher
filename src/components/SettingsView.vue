<style lang="scss" scoped>
.themePreview {
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  width: 200px;
  max-width: 200px;
  transition: transform 0.1s ease-in-out;

  &:hover {
    transform: scale(1.1);
  }
}
</style>

<template>
  <v-container>
    <v-alert
      type="error"
      text
      border="left"
      :title="$t('errors.playerNameUnset.title')"
      v-if="playerName == false"
    >
      {{ $t("errors.playerNameUnset.message") }}
    </v-alert>
    <v-alert
      type="error"
      text
      border="left"
      :title="$t('errors.homeDirUnset.title')"
      v-if="homeDir == false"
    >
      {{ $t("errors.homeDirUnset.message") }}
    </v-alert>
    <v-alert
      type="error"
      text
      border="left"
      :title="$t('errors.nasUnset.title')"
      v-if="nas == false"
    >
      {{ $t("errors.nasUnset.message") }}
    </v-alert>
    <div class="text-h4">{{ $t("settings.theme") }}</div>
    <div class="d-flex mx-n3 flex-wrap">
      <v-img
        v-for="(item, index) in textures"
        :key="index"
        class="themePreview ma-3"
        aspect-ratio="1"
        :src="item"
        @click.native="
          () => {
            $store.commit(require('../enums/Mutations').default.THEME, { path: item, cover: false });
          }
        "
        eager
      ></v-img>
      <div
        class="themePreview ma-3 bg-transparent-dark align-center justify-center"
        :style="{border: `1px solid hsl(${backgroundHue}, 100%, 35%)`}"
        @click="
          openFileChooser(
            (result) =>
              $store.commit(require('../enums/Mutations').default.THEME, {
                path: `theme://${result.filePaths[0].replace(/\\/g, '/')}`,
                cover: true,
              }),
            {
              properties: ['openFile'],
              filters: [
                {
                  name: $t('settings.images'),
                  extensions: ['jpg', 'jpeg', 'png'],
                },
              ],
            }
          )
        "
      >
        <span style="padding-bottom: 100%"></span>
        <v-icon x-large>{{ icons.mdiImageSearch }}</v-icon>
      </div>
    </div>

    <div class="mt-5 text-h4">{{ $t("settings.backgroundHue") }}</div>
    <v-row>
      <v-col cols="12">
        <v-slider
          :min="0"
          :max="360"
          thumb-label
          v-model="sliderValue"
          :color="'hsl(' + sliderValue + ', 100%, 50%)'"
          @change="
            (input) => {
              $store.commit(require('../enums/Mutations').default.BACKGROUND_HUE, input);
            }
          "
        />
      </v-col>
    </v-row>

    <div class="text-h4">{{ $t("settings.environment") }}</div>
    <v-row>
      <v-col cols="3">
        <v-select
          :label="$t('settings.language')"
          :value="locale"
          :items="Object.entries(langs)"
          :item-text="(lang) => lang[1].lang"
          :item-value="(lang) => lang[0]"
          @change="(input) => $store.commit(require('../enums/Mutations').default.LOCALE, input)"
        />
      </v-col>
      <v-col
        cols="5"
        class="offset-4"
      >
        <v-tooltip
          top
          max-width="400"
        >
          <template v-slot:activator="{ on }">
            <v-switch v-model="debug">
              <template v-slot:label>
                <span v-on="on">{{$t('settings.debug')}}</span>
              </template>
            </v-switch>
          </template>
          <span v-html="$t('settings.debug_explanation')"></span>
        </v-tooltip>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="3">
        <v-text-field
          :label="$t('settings.playerName')"
          :value="playerName"
          @blur="
            (event) => {
              $store.commit(require('../enums/Mutations').default.PLAYER_NAME, event.target.value);
            }
          "
          :error="playerName == false"
        />
      </v-col>
      <v-col cols="4">
        <div class="d-flex align-baseline">
          <v-text-field
            :label="$t('settings.homeDir')"
            @click="setHomeDir"
            :readonly="true"
            :value="homeDir"
            :disabled="online"
            :error="homeDir == false"
            class="mr-2"
          />
          <v-btn @click="setHomeDir" :disabled="online" color="primary">{{$t('settings.chooseHomeDir')}}</v-btn>
        </div>
      </v-col>
      <v-col cols="5">
        <v-select
          :disabled="!online"
          :label="$t('settings.nas')"
          :value="nas"
          :items="Object.entries(devices)"
          :item-value="(device) => device[0]"
          :item-text="(device) => device[0]"
          :error="nas == false"
          @change="(input) => $store.commit(require('../enums/Mutations').default.NAS, input)"
          :no-data-text="$t('settings.alerts.discovery')"
          :error-messages="!online ? $t('settings.alerts.service') : null"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mdiImageSearch } from "@mdi/js";
import { mapState } from "vuex";
import online from "../mixins/online";

import SyncServiceController from "../controllers/SyncServiceRendererController";

let discoveryInterval;

export default {
  mixins: [online],
  data() {
    return {
      textures: [
        "./funky-lines.png",
        "./gaming.png",
        "./prism.png",
        "./maze.png",
        "./unicorns.png",
      ],
      sliderValue: 0,
      devices: [],
      langs: require("../localization/langs").default,
    };
  },
  computed: {
    icons() {
      return {
        mdiImageSearch,
      }
    },
    // Manually setup a two-way computed prop for debug setting, as v-switch does not correctly react to the `value` prop
    debug: {
      get() {
        return this.$store.state.debug;
      },
      set(val) {
        this.$store.commit(require("../enums/Mutations").default.DEBUG, val);
      },
    },
    ...mapState(["playerName", "homeDir", "nas", "locale", "backgroundHue"]),
  },
  created() {
    this.discoveryTask();
    clearInterval(discoveryInterval);
    if (this.online) {
      discoveryInterval = setInterval(this.discoveryTask, 5000);
    }
  },
  beforeMount() {
    this.sliderValue = this.backgroundHue;
  },
  destroyed() {
    clearInterval(discoveryInterval);
  },
  watch: {
    online(online) {
      if (online) {
        discoveryInterval = setInterval(this.discoveryTask, 5000);
      } else {
        clearInterval(discoveryInterval);
      }
    },
    homeDir(homeDir) {
      if (!this.online && !!homeDir) {
        SyncServiceController.System.start(homeDir);
      }
    }
  },
  methods: {
    /**
     * Open the electron file-chooser-dialog with the specified options.
     * @param {Function} callback The function to call when a file was picked.
     * @param {Object} options The options object for the electron file chooser.
     */
    openFileChooser(callback, options) {
      window.ipcRenderer.invoke("showOpenDialog", options).then((result) => {
        if (!result.canceled) callback(result);
      });
    },

    setHomeDir() {
      this.openFileChooser(
        (result) => {
          this.$store.commit(require('../enums/Mutations').default.HOME_DIR, result.filePaths[0]);
        },
        { properties: ['openDirectory'] }
      )
    },

    /**
     * Periodic task to fetch discovered Syncthing devices.
     */
    discoveryTask() {
      SyncServiceController.System.getDiscovery()
        .then((response) => {
          this.devices = response.data;
        })
        .catch();
    },
  },
};
</script>
