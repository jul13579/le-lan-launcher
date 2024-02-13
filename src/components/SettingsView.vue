<template>
  <v-container>
    <v-alert v-if="!playerName" type="error" variant="tonal" border="start" class="my-1"
      :title="$t('errors.playerNameUnset.title')">
      {{ $t("errors.playerNameUnset.message") }}
    </v-alert>
    <v-alert v-if="!homeDir" type="error" variant="tonal" border="start" class="my-1"
      :title="$t('errors.homeDirUnset.title')">
      {{ $t("errors.homeDirUnset.message") }}
    </v-alert>
    <v-alert v-if="!nas" type="error" variant="tonal" border="start" class="my-1"
      :title="$t('errors.nasUnset.title')">
      {{ $t("errors.nasUnset.message") }}
    </v-alert>
    <div class="text-h4">
      {{ $t("settings.theme") }}
    </div>
    <div class="d-flex mx-n3 flex-wrap">
      <v-img v-for="(item, index) in textures" :key="index" class="themePreview ma-3" aspect-ratio="1" :src="item" eager
        @click="() => {
          store.commit(StoreAttributes.THEME, { path: item, cover: false });
        }" />
      <div class="themePreview ma-3 bg-transparent-dark align-center justify-center"
        :style="{ border: `1px solid hsl(${backgroundHue}, 100%, 35%)` }" @click="
          openFileChooser(
            (result) =>
              store.commit(StoreAttributes.THEME, {
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
        <span style="padding-bottom: 100%" />
        <v-icon size="x-large" :icon="mdiImageSearch" />
      </div>
    </div>

    <div class="mt-5 text-h4">
      {{ $t("settings.backgroundHue") }}
    </div>
    <v-row>
      <v-col cols="12">
        <v-slider v-model="backgroundHue" :min="0" :max="360" thumb-label
          :color="'hsl(' + backgroundHue + ', 100%, 50%)'" />
      </v-col>
    </v-row>

    <div class="text-h4">
      {{ $t("settings.environment") }}
    </div>
    <v-row>
      <v-col cols="3">
        <v-select v-model="locale" :label="$t('settings.language')" :items="langs"
          :item-title="(lang) => $t(`langs.${lang}`)" :item-value="(lang) => lang" />
      </v-col>
      <v-col cols="5" class="offset-4">
        <v-tooltip location="top" max-width="400">
          <template #activator="{ props }">
            <v-switch v-model="debug" color="primary">
              <template #label>
                <span v-bind="props">{{ $t('settings.debug') }}</span>
              </template>
            </v-switch>
          </template>
          <span>{{ $t('settings.debug_explanation') }}</span>
        </v-tooltip>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="3">
        <v-text-field v-model="playerName" :label="$t('settings.playerName')" :error="!playerName" />
      </v-col>
      <v-col cols="4">
        <div class="d-flex align-baseline">
          <v-text-field :label="$t('settings.homeDir')" :readonly="true" :model-value="homeDir" :disabled="online"
            :error="!homeDir" class="mr-2" @click="setHomeDir" />
          <v-btn :disabled="online" color="primary" @click="setHomeDir">
            {{ $t('settings.chooseHomeDir') }}
          </v-btn>
        </div>
      </v-col>
      <v-col cols="5">
        <v-select :disabled="!online" :label="$t('settings.nas')" :model-value="nas" :items="Object.entries(devices)"
          :item-value="(device) => device[0]" :item-title="(device) => device[0]" :error="!nas"
          :no-data-text="$t('settings.alerts.discovery')" :error-messages="!online ? $t('settings.alerts.service') : null"
          @update:model-value="(input) => store.commit(StoreAttributes.NAS, input)" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { mdiImageSearch } from "@mdi/js";

import SyncServiceController from "../controllers/SyncServiceRendererController";
import { ref, onBeforeMount, onUnmounted, watchEffect } from "vue";
import { default as _langs } from "../localization/langs";
import { useStore } from "vuex";
import { useComputedStoreAttribute } from '../composables/useComputedStoreAttribute';
import { StoreAttributes } from "../plugins/store";

let discoveryInterval: ReturnType<typeof setTimeout>;

const { online } = defineProps<{
  online: boolean
}>();

const textures = [
  "./funky-lines.png",
  "./gaming.png",
  "./prism.png",
  "./maze.png",
  "./unicorns.png",
];

const store = useStore();

const devices = ref([]);
const langs = Object.keys(_langs);

const playerName = useComputedStoreAttribute(StoreAttributes.PLAYER_NAME);
const homeDir = useComputedStoreAttribute(StoreAttributes.HOME_DIR);
const nas = useComputedStoreAttribute(StoreAttributes.NAS);
const backgroundHue = useComputedStoreAttribute(StoreAttributes.BACKGROUND_HUE);
const locale = useComputedStoreAttribute(StoreAttributes.LOCALE);
const debug = useComputedStoreAttribute(StoreAttributes.DEBUG);

onBeforeMount(() => {
  discoveryTask();
  clearInterval(discoveryInterval);
  if (online) {
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
    SyncServiceController.System.start(homeDir.value);
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
      store.commit(StoreAttributes.HOME_DIR, result.filePaths[0]);
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
