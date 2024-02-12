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
    <v-alert type="error" border="start" :title="$t('errors.playerNameUnset.title')" v-if="playerName == false">
      {{ $t("errors.playerNameUnset.message") }}
    </v-alert>
    <v-alert type="error" border="start" :title="$t('errors.homeDirUnset.title')" v-if="homeDir == false">
      {{ $t("errors.homeDirUnset.message") }}
    </v-alert>
    <v-alert type="error" border="start" :title="$t('errors.nasUnset.title')" v-if="nas == false">
      {{ $t("errors.nasUnset.message") }}
    </v-alert>
    <div class="text-h4">{{ $t("settings.theme") }}</div>
    <div class="d-flex mx-n3 flex-wrap">
      <v-img v-for="(item, index) in textures" :key="index" class="themePreview ma-3" aspect-ratio="1" :src="item"
        @click.native="() => {
          store.commit(Mutations.THEME, { path: item, cover: false });
        }
          " eager></v-img>
      <div class="themePreview ma-3 bg-transparent-dark align-center justify-center"
        :style="{ border: `1px solid hsl(${backgroundHue}, 100%, 35%)` }" @click="
          openFileChooser(
            (result) =>
              store.commit(Mutations.THEME, {
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
          ">
        <span style="padding-bottom: 100%"></span>
        <v-icon x-large :icon="mdiImageSearch" />
      </div>
    </div>

    <div class="mt-5 text-h4">{{ $t("settings.backgroundHue") }}</div>
    <v-row>
      <v-col cols="12">
        <v-slider :min="0" :max="360" thumb-label v-model="sliderValue" :color="'hsl(' + sliderValue + ', 100%, 50%)'"
          @change="(input) => {
            store.commit(Mutations.BACKGROUND_HUE, input);
          }
            " />
      </v-col>
    </v-row>

    <div class="text-h4">{{ $t("settings.environment") }}</div>
    <v-row>
      <v-col cols="3">
        <v-select :label="$t('settings.language')" :value="locale" :items="Object.entries(langs)"
          :item-text="(lang) => lang[1].lang" :item-value="(lang) => lang[0]"
          @change="(input) => store.commit(Mutations.LOCALE, input)" />
      </v-col>
      <v-col cols="5" class="offset-4">
        <v-tooltip top max-width="400">
          <template v-slot:activator="{ on }">
            <v-switch v-model="debug">
              <template v-slot:label>
                <span v-on="on">{{ $t('settings.debug') }}</span>
              </template>
            </v-switch>
          </template>
          <span v-html="$t('settings.debug_explanation')"></span>
        </v-tooltip>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="3">
        <v-text-field :label="$t('settings.playerName')" :value="playerName" @blur="(event) => {
          store.commit(Mutations.PLAYER_NAME, event.target.value);
        }
          " :error="playerName == false" />
      </v-col>
      <v-col cols="4">
        <div class="d-flex align-baseline">
          <v-text-field :label="$t('settings.homeDir')" @click="setHomeDir" :readonly="true" :value="homeDir"
            :disabled="online" :error="homeDir == false" class="mr-2" />
          <v-btn @click="setHomeDir" :disabled="online" color="primary">{{ $t('settings.chooseHomeDir') }}</v-btn>
        </div>
      </v-col>
      <v-col cols="5">
        <v-select :disabled="!online" :label="$t('settings.nas')" :value="nas" :items="Object.entries(devices)"
          :item-value="(device) => device[0]" :item-text="(device) => device[0]" :error="nas == false"
          @change="(input) => store.commit(Mutations.NAS, input)"
          :no-data-text="$t('settings.alerts.discovery')"
          :error-messages="!online ? $t('settings.alerts.service') : null" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { mdiImageSearch } from "@mdi/js";

import SyncServiceController from "../controllers/SyncServiceRendererController";
import { ref } from "vue";
import { default as _langs } from "../localization/langs";
import { useStore } from "vuex";
import { onBeforeMount } from "vue";
import { onUnmounted } from "vue";
import { computed } from "vue";
import Mutations from "../enums/Mutations";
import { watchEffect } from "vue";

let discoveryInterval: NodeJS.Timeout;

const { online } = defineProps(['online']);

const textures = [
  "./funky-lines.png",
  "./gaming.png",
  "./prism.png",
  "./maze.png",
  "./unicorns.png",
];

const store = useStore();
const { playerName, homeDir, nas, locale, backgroundHue } = store.state;

const sliderValue = ref(backgroundHue);
const devices = ref([]);
const langs = Object.keys(_langs);

const debug = computed({
  get() {
    return store.state.debug
  },
  set(value) {
    store.commit(Mutations.DEBUG, value);
  }
})

onBeforeMount(() => {
  discoveryTask();
  clearInterval(discoveryInterval);
  if (online.value) {
    discoveryInterval = setInterval(discoveryTask, 5000);
  }
});

onUnmounted(() => {
  clearInterval(discoveryInterval);
})

watchEffect(() => {
  if (online) {
    discoveryInterval = setInterval(discoveryTask, 5000);
  } else {
    clearInterval(discoveryInterval);
  }
});

watchEffect(() => {
  if (online && !!homeDir) {
    SyncServiceController.System.start(homeDir);
  }
});

/**
 * Open the electron file-chooser-dialog with the specified options.
 * @param {Function} callback The function to call when a file was picked.
 * @param {Object} options The options object for the electron file chooser.
 */
function openFileChooser(callback: (result: any) => void, options: any) {
  window.ipcRenderer.invoke("showOpenDialog", options).then((result) => {
    if (!result.canceled) callback(result);
  });
}

function setHomeDir() {
  openFileChooser(
    (result) => {
      store.commit(Mutations.HOME_DIR, result.filePaths[0]);
    },
    { properties: ['openDirectory'] }
  )
}

/**
 * Periodic task to fetch discovered Syncthing devices.
 */
function discoveryTask() {
  SyncServiceController.System.getDiscovery()
    .then((response) => {
      devices.value = response.data;
    })
    .catch();
}
</script>
