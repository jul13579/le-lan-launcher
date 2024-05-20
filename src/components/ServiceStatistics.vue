<template>
  <v-footer app :height="66" class="statistics pa-0 w-100">
    <div class="d-flex">
      <div class="d-flex flex-grow-1">
        <v-container class="py-0 d-flex" style="height: 100%">
          <v-row no-gutters>
            <v-col cols="4" class="d-flex justify-center align-center">
              <template v-if="nasConnected">
                <div>
                  <v-icon class="mx-2">
                    {{ mdiCloudCheck }}
                  </v-icon>
                </div>
              </template>
              <template v-else-if="!nasConnected && online">
                <div>
                  <v-icon class="mx-2">
                    {{ mdiCloudSearch }}
                  </v-icon>
                </div>
              </template>
              <template v-else>
                <div>
                  <v-icon class="mx-2">
                    {{ mdiCloudOffOutline }}
                  </v-icon>
                </div>
              </template>
            </v-col>
            <v-col cols="4" class="d-flex justify-center align-center">
              <v-icon class="mx-2" color="green">
                {{ mdiDownload }}
              </v-icon>
              <i18n-n :value="inbps / 1024 ** 2" format="mbps" />
            </v-col>
            <v-col cols="4" class="d-flex justify-center align-center">
              <v-icon class="mx-2" color="red">
                {{ mdiUpload }}
              </v-icon>
              <i18n-n :value="outbps / 1024 ** 2" format="mbps" />
            </v-col>
          </v-row>
        </v-container>
      </div>
      <div class="d-flex popup backdrop">
        <v-container>
          <v-row no-gutters>
            <v-col cols="4" class="px-1">
              <v-card class="text-center" variant="text">
                <v-card-title>
                  <div class="d-flex w-100 justify-space-between flex-nowrap">
                    <div class="d-flex align-center" style="min-width: 0%">
                      <span class="header">{{ $t('statistics.service_controls') }}</span>
                      <v-btn icon variant="text" @click="openSyncthingUI()">
                        <v-icon>{{ mdiOpenInNew }}</v-icon>
                      </v-btn>
                    </div>
                    <div>
                      <v-btn icon variant="text" color="green" :disabled="online || !homeDir" @click="startService">
                        <v-icon>{{ mdiPlay }}</v-icon>
                      </v-btn>
                      <v-btn icon variant="text" color="yellow" :disabled="!online" @click="restartService">
                        <v-icon>{{ mdiRestart }}</v-icon>
                      </v-btn>
                      <v-btn icon variant="text" color="red" :disabled="!online" @click="stopService">
                        <v-icon>{{ mdiStop }}</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </v-card-title>
                <v-card-text>
                  <console-view v-model="syncthingMessages" />
                </v-card-text>
              </v-card>
            </v-col>
            <!-- <template
              v-for="(item, index) in [{ headline: 'statistics.download_speed', value: inbps / 1024 ** 2 }, { headline: 'statistics.upload_speed', value: outbps / 1024 ** 2 }]"
              :key="index">
              <v-col cols="4" class="px-1">
                <v-card class="text-center" variant="text">
                  <v-card-title class="justify-center">
                    <span>{{ $t(item.headline) }}</span>
                  </v-card-title>
                  <v-card-text>
                    <bar-chart ref="barchart" :value="item.value" unit="mbps" />
                  </v-card-text>
                </v-card>
              </v-col>
            </template> -->
          </v-row>
        </v-container>
      </div>
    </div>
  </v-footer>
</template>

<script setup lang="ts">
import { mdiCloudCheck, mdiCloudOffOutline, mdiCloudSearch, mdiDownload, mdiOpenInNew, mdiPlay, mdiRestart, mdiStop, mdiUpload } from "@mdi/js";
import { defineProps, ref, computed, onBeforeMount, onUnmounted, watchEffect } from "vue";
import BarChart from "./BarChart.vue";

import SyncServiceController from "../controllers/SyncServiceRendererController";
import ConsoleView from "./ConsoleView.vue";
import { useComputedStoreAttribute } from "../composables/useComputedStoreAttribute";
import { StoreAttributes } from "../plugins/store";

let statisticsInterval: ReturnType<typeof setTimeout>;

const { online } = defineProps<{ online: boolean }>();

const nas = useComputedStoreAttribute(StoreAttributes.NAS);
const homeDir = useComputedStoreAttribute(StoreAttributes.HOME_DIR);
const apiKey = useComputedStoreAttribute(StoreAttributes.API_KEY);

const barchart = ref(null);
const status = ref({});
const connections = ref({
  connections: {} as Record<string, { connected: boolean }>,
  total: {
    inBytesTotal: 0,
    outBytesTotal: 0
  },
});
const prev = ref({
  time: new Date(),
  inBytesTotal: 0,
  outBytesTotal: 0,
});
const inbps = ref(0);
const outbps = ref(0);
const syncthingMessages = ref([]);

const nasConnected = computed(() => connections.value.connections[nas.value]?.connected)

onBeforeMount(() => {
  // Setup periodic task to fetch sync-service status
  clearInterval(statisticsInterval);
  if (online) {
    statisticsInterval = setInterval(getStatus, 5000);
  }

  // Setup IPC handler for sync-service startup notifications
  window.ipcRenderer.on("syncService", async (event, messageObj) => {
    syncthingMessages.value.push(messageObj);
  });
});

onUnmounted(() => {
  clearInterval(statisticsInterval);
})

watchEffect(() => {
  // Periodically fetch status from service if online
  if (online) {
    statisticsInterval = setInterval(getStatus, 5000);
  } else {
    clearInterval(statisticsInterval);
    connections.value = { connections: {}, total: { inBytesTotal: 0, outBytesTotal: 0 } };
  }
})

/**
 * Periodic task to fetch Syncthing status (e.g. bandwidth).
 */
function getStatus() {
  SyncServiceController.System.status()
    .then((response) => {
      status.value = response.data;
    })
    .catch();
  SyncServiceController.System.connections()
    .then((response) => {
      connections.value = response.data;
      let now = new Date();
      let diffSec = (now - prev.value.time) / 1000;
      inbps.value =
        (connections.value.total.inBytesTotal - prev.value.inBytesTotal) /
        diffSec;
      outbps.value =
        (connections.value.total.outBytesTotal - prev.value.outBytesTotal) /
        diffSec;
      prev.value = {
        time: now,
        inBytesTotal: connections.value.total.inBytesTotal,
        outBytesTotal: connections.value.total.outBytesTotal,
      };
    })
    .catch()
    .then(() => {
      barchart.value.forEach((chart) => chart.updateChart());
    });
}

/**
 * Open the sync-service UI in the system's default browser
 */
function openSyncthingUI() {
  SyncServiceController.System.openSyncthingUI();
}

/**
 * Start the sync-service process.
 */
function startService() {
  if (!online) {
    // this.$toasted.success(this.$t("toast.service.starting"));
    SyncServiceController.System.start(homeDir.value);
  }
}

/**
 * Restart the sync-service process.
 */
function restartService() {
  if (online) {
    SyncServiceController.System.restart().then((success) => {
      if (success) {
        // this.$toasted.success(this.$t("toast.service.success.restart"));
      } else {
        // this.$toasted.error(this.$t("toast.service.error.restart"));
      }
    });
  }
}

/**
 * Stop the sync-service process.
 */
function stopService() {
  if (online) {
    SyncServiceController.System.stop().then((success) => {
      if (success) {
        // this.$toasted.success(this.$t("toast.service.success.stop"));
      } else {
        // this.$toasted.error(this.$t("toast.service.error.stop"));
      }
    });
  }
}
</script>

<style lang="scss" scoped>
.statistics {
  background: none;
  // cursor: pointer;

  &>div {
    width: 100%;
    height: 100%;
    position: relative;
    user-select: none;
  }

  $popup-height: 250px;

  .popup {
    width: 100%;
    height: $popup-height;
    padding: 0px;
    padding-bottom: 66px;
    position: absolute;
    z-index: -1;
    transition: top 0.1s linear !important;
    top: 0px;
    box-sizing: content-box;

    &>.v-container {
      opacity: 0;
      box-sizing: border-box;
      height: 100%;
      max-height: 100%;
      overflow: hidden;
      transition: opacity 0.1s linear;

      .row {
        height: 100%;
        max-height: 100%;

        .col {
          height: 100%;
          max-height: 100%;
          overflow: hidden;
        }
      }

      .v-card {
        background: none !important;
        border: none !important;
        box-shadow: none !important;
      }
    }
  }

  &:hover {
    .popup {
      top: -$popup-height;

      &>.v-container {
        opacity: 1;
      }
    }
  }

  .header {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}
</style>