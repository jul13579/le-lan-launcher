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
  & > :not(.v-image) {
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

<template>
  <v-menu
    offset-x
    open-on-click
    transition="slide-x-transition"
  >
    <template v-slot:activator="{ on }">
      <div
        class="gameEntry ma-3"
        :class="downloadProgress >= 1 ? 'installed' : ''"
      >
        <v-img
          :src="`game://${libFolderPath}/${gameConfig.cover}`"
          :aspect-ratio="600/900"
          eager
        />
        <!-- Progress indicator -->
        <div
          class="progress"
          :style="{top: `${-downloadProgress*100}%`}"
        ></div>
        <!-- Download buttons overlay. Only displayed when downloadProgress < 1, hence not completed -->
        <div
          class="download d-flex flex-column justify-center align-center"
          v-if="downloadProgress < 1"
        >
          <!-- If game is subscribed but there is no syncFolderStatus yet, show loader -->
          <v-btn
            fab
            x-large
            @click="$emit('download')"
            v-if="subscribed && Object.keys(syncFolderStatus).length == 0"
            loading
          />
          <!-- Else show applicable download buttons -->
          <template v-else>
            <template v-for="(item, index) in downloadButtons">
              <v-btn
                fab
                x-large
                @click="item.click"
                v-if="item.show"
                :key="index"
              >
                <v-icon>{{item.icon}}</v-icon>
              </v-btn>
            </template>
          </template>
        </div>
        <div
          v-else
          class="glass"
          v-on="on"
        >
        </div>
      </div>
    </template>

    <!-- Game menu -->
    <v-card>
      <div class="d-flex flex-column">
        <template v-for="(item, index) in gameMenuButtons">
          <v-btn
            text
            block
            @click="item.click"
            v-if="item.show"
            class="justify-start"
            :key="index"
          >
            <v-icon left>{{item.icon}}</v-icon>{{item.text}}
          </v-btn>
        </template>
      </div>
    </v-card>
  </v-menu>
</template>

<script>
export default {
  props: {
    libFolderPath: String,
    gameConfig: Object,
    syncFolderConfig: Object,
    syncFolderStatus: Object,
  },
  computed: {
    subscribed() {
      return this.syncFolderConfig != null;
    },
    downloadProgress() {
      return this.subscribed && this.syncFolderStatus.globalBytes > 0
        ? this.syncFolderStatus.inSyncBytes / this.syncFolderStatus.globalBytes
        : 0;
    },
    downloadButtons() {
      return [
        {
          click: () => this.$emit("download", this.gameConfig),
          show: !this.subscribed,
          icon: "mdi-download",
        },
        {
          click: () =>
            this.$emit("pause", this.gameConfig, this.syncFolderConfig),
          show: this.syncFolderConfig && !this.syncFolderConfig.paused,
          icon: "mdi-pause",
        },
        {
          click: () =>
            this.$emit("resume", this.gameConfig, this.syncFolderConfig),
          show: this.syncFolderConfig && this.syncFolderConfig.paused,
          icon: "mdi-chevron-double-right",
        },
        {
          click: () => this.$emit("delete", this.gameConfig, this.syncFolderConfig),
          show: this.subscribed,
          icon: "mdi-close",
        },
      ];
    },
    gameMenuButtons() {
      let buttons = [
        {
          click: () =>
            this.$emit(
              "execute",
              this.syncFolderConfig,
              this.gameConfig,
              this.gameConfig.launch
            ),
          show: true,
          icon: "mdi-play",
          text: this.$t("gameEntry.play"),
        },
        {
          click: () =>
            this.$emit("pause", this.gameConfig, this.syncFolderConfig),
          show: this.syncFolderConfig && !this.syncFolderConfig.paused,
          icon: "mdi-pause",
          text: this.$t("gameEntry.pause"),
        },
        {
          click: () =>
            this.$emit("resume", this.gameConfig, this.syncFolderConfig),
          show: this.syncFolderConfig && this.syncFolderConfig.paused,
          icon: "mdi-chevron-double-right",
          text: this.$t("gameEntry.resume"),
        },
        {
          click: () => this.$emit("reset", this.gameConfig, this.syncFolderConfig),
          show: this.syncFolderStatus.receiveOnlyTotalItems > 0,
          icon: "mdi-backup-restore",
          text: this.$t("gameEntry.reset"),
        },
        {
          click: () => this.$emit("browse", this.syncFolderConfig),
          show: true,
          icon: "mdi-folder-open",
          text: this.$t("gameEntry.browse"),
        },
        {
          click: () => this.$emit("delete", this.gameConfig, this.syncFolderConfig),
          show: true,
          icon: "mdi-delete",
          text: this.$t("gameEntry.delete"),
        },
      ];

      (this.gameConfig.moreLaunchs || []).forEach((item) => {
        buttons.splice(-2, 0, {
          click: () => this.$emit("execute", item),
          show: true,
          icon: "mdi-dots-horizontal",
          text: item.text,
        });
      });

      return buttons;
    },
  },
};
</script>