<template>
  <v-menu offset-x open-on-click transition="slide-x-transition">
    <template #activator="{ props }">
      <div class="gameEntry ma-3" :class="downloadProgress >= 1 ? 'installed' : ''">
        <v-img :src="`game://${libFolderPath}/${gameConfig.cover}`" :aspect-ratio="600 / 900" eager />
        <!-- Progress indicator -->
        <div class="progress" :style="{ top: `${-downloadProgress * 100}%` }" />
        <!-- Download buttons overlay. Only displayed when downloadProgress < 1, hence not completed -->
        <div v-if="downloadProgress < 1" class="download d-flex flex-column justify-center align-center">
          <!-- If game is subscribed but there is no syncFolderStatus yet, show loader -->
          <v-btn v-if="subscribed && Object.keys(syncFolderStatus).length == 0" fab size="x-large" loading
            @click="$emit('download')" />
          <!-- Else show applicable download buttons -->
          <template v-else>
            <template v-for="(item, index) in downloadButtons">
              <v-btn v-if="item.show" :key="index" fab size="x-large" @click="item.click">
                <v-icon>{{ item.icon }}</v-icon>
              </v-btn>
            </template>
          </template>
        </div>
        <div v-else class="glass" v-bind="props" />
      </div>
    </template>

    <!-- Game menu -->
    <v-card>
      <div class="d-flex flex-column">
        <template v-for="(item, index) in gameMenuButtons">
          <v-btn v-if="item.show" :key="index" variant="text" block class="justify-start" @click="item.click">
            <v-icon start>
              {{ item.icon }}
            </v-icon>{{ item.text }}
          </v-btn>
        </template>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { mdiBackupRestore, mdiChevronDoubleRight, mdiClose, mdiDelete, mdiDotsHorizontal, mdiDownload, mdiFolderOpen, mdiPause, mdiPlay } from "@mdi/js";
import { computed, defineEmits, defineProps } from "vue";
import { useI18n } from "vue-i18n";

const { libFolderPath, gameConfig, syncFolderConfig, syncFolderStatus } = defineProps<{
  libFolderPath: string,
  gameConfig: any,
  syncFolderConfig: any,
  syncFolderStatus: any
}>();

const emit = defineEmits(['download', 'pause', 'resume', 'delete', 'execute', 'reset', 'browse']);

const { t } = useI18n();

const subscribed = computed(() => syncFolderConfig != null);
const downloadProgress = computed(() => subscribed.value && syncFolderStatus.globalBytes > 0
  ? syncFolderStatus.inSyncBytes / syncFolderStatus.globalBytes
  : 0);
const downloadButtons = [
  {
    click: () => emit("download", gameConfig),
    show: !subscribed.value,
    icon: mdiDownload,
  },
  {
    click: () =>
      emit("pause", gameConfig, syncFolderConfig),
    show: syncFolderConfig && !syncFolderConfig.paused,
    icon: mdiPause,
  },
  {
    click: () =>
      emit("resume", gameConfig, syncFolderConfig),
    show: syncFolderConfig && syncFolderConfig.paused,
    icon: mdiChevronDoubleRight,
  },
  {
    click: () => emit("delete", gameConfig, syncFolderConfig),
    show: subscribed.value,
    icon: mdiClose,
  },
];

const gameMenuButtons = computed(() => {
  let buttons = [
    {
      click: () =>
        emit(
          "execute",
          syncFolderConfig,
          gameConfig,
          gameConfig.launch.exe
        ),
      show: true,
      icon: mdiPlay,
      text: t("gameEntry.play"),
    },
    {
      click: () =>
        emit("pause", gameConfig, syncFolderConfig),
      show: syncFolderConfig && !syncFolderConfig.paused,
      icon: mdiPause,
      text: t("gameEntry.pause"),
    },
    {
      click: () =>
        emit("resume", gameConfig, syncFolderConfig),
      show: syncFolderConfig && syncFolderConfig.paused,
      icon: mdiChevronDoubleRight,
      text: t("gameEntry.resume"),
    },
    {
      click: () => emit("reset", gameConfig, syncFolderConfig),
      show: syncFolderStatus.receiveOnlyTotalItems > 0,
      icon: mdiBackupRestore,
      text: t("gameEntry.reset"),
    },
    {
      click: () => emit("browse", syncFolderConfig),
      show: true,
      icon: mdiFolderOpen,
      text: t("gameEntry.browse"),
    },
    {
      click: () => emit("delete", gameConfig, syncFolderConfig),
      show: true,
      icon: mdiDelete,
      text: t("gameEntry.delete"),
    },
  ];

  (gameConfig.moreLaunchs || []).forEach((item) => {
    buttons.splice(-2, 0, {
      click: () => emit("execute", syncFolderConfig, gameConfig, item.exe),
      show: true,
      icon: mdiDotsHorizontal,
      text: item.text,
    });
  });

  return buttons;
});
</script>

<style lang="scss" scoped>
$hover-animation: 0.2s ease-in-out;

.gameEntry {
  width: 190px;
  position: relative;
  overflow: hidden;

  &.installed {
    transition: transform $hover-animation;
    cursor: pointer;

    // Game entry hover effect adjustments
    &:hover {
      transform: perspective(10px) rotateX(0.1deg);

      // Glass hover effect adjustments
      .glass {
        top: -70%;
      }
    }
  }

  // Game thumbnail styling
  &::v-deep img {
    width: 100%;
    height: auto;
  }

  // Every child element that is not the game thumbnail is absolutely positioned => stacked on each other
  &> :not(.v-image) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  // Download progress styling
  .progress {
    background: rgba(0, 0, 0, 0.7);
    transition: top 0.1s linear;
  }

  // Glass effect base styling
  .glass {
    transition: top $hover-animation;
    top: -175%;
    height: 200%;
    width: 200%;
    box-shadow: 0px 0px 20px 5px white, inset 0px 0px 20px 5px white;
    transform: rotate(-45deg);
  }
}
</style>