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
        @mouseenter="showOptions = 'visible'"
        @mouseleave="showOptions = 'hidden'"
      >
        <v-img
          :src="`${homeDir}/Library/${value.cover}`"
          :aspect-ratio="600/900"
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
          <v-btn
            fab
            x-large
            @click="$emit('download')"
            v-if="subscribed && Object.keys(status).length == 0"
            loading
          />
          <template v-else>
            <!-- Download button to be displayed whenever !subscribed -->
            <v-btn
              fab
              x-large
              @click="$emit('download')"
              v-if="!subscribed"
            >
              <v-icon>mdi-download</v-icon>
            </v-btn>
            <!-- Pause button to be displayed whenever config is existing and paused == false -->
            <v-btn
              fab
              x-large
              @click="$emit('pause')"
              v-if="config && !config.paused"
            >
              <v-icon>mdi-pause</v-icon>
            </v-btn>
            <!-- Resume button to be displayed whenever config is existing and paused == true -->
            <v-btn
              fab
              x-large
              @click="$emit('resume')"
              v-if="config && config.paused"
            >
              <v-icon>mdi-chevron-double-right</v-icon>
            </v-btn>
            <!-- Cancel button to be displayed whenever subscribed -->
            <v-btn
              fab
              x-large
              @click="$emit('delete')"
              v-if="subscribed"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
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
    value: Object,
    homeDir: String,
    config: Object,
    status: Object,
  },
  data() {
    return {
      showOptions: "hidden",
    };
  },
  computed: {
    subscribed() {
      return this.config != null;
    },
    downloadProgress() {
      return this.subscribed && this.status.globalBytes > 0
        ? this.status.inSyncBytes / this.status.globalBytes
        : 0;
    },
    // downloadButtons() {

    // },
    gameMenuButtons() {
      let buttons = [
        {
          click: () => this.$emit("execute", this.value.launch),
          show: true,
          icon: "mdi-play",
          text: this.$t("gameEntry.play"),
        },
        {
          click: () => this.$emit("pause"),
          show: this.config && !this.config.paused,
          icon: "mdi-pause",
          text: this.$t("gameEntry.pause"),
        },
        {
          click: () => this.$emit("resume"),
          show: this.config && this.config.paused,
          icon: "mdi-chevron-double-right",
          text: this.$t("gameEntry.resume"),
        },
        {
          click: () => this.$emit("reset"),
          show: this.status.receiveOnlyTotalItems > 0,
          icon: "mdi-backup-restore",
          text: this.$t("gameEntry.reset"),
        },
        {
          click: () => this.$emit("browse"),
          show: true,
          icon: "mdi-folder-open",
          text: this.$t("gameEntry.browse"),
        },
        {
          click: () => this.$emit("delete"),
          show: true,
          icon: "mdi-delete",
          text: this.$t("gameEntry.delete"),
        },
      ];

      for (var item in this.value.moreLaunchs) {
        buttons.splice(-2, 0, {
          click: () => this.$emit("execute", item),
          show: true,
          icon: "mdi-dots-horizontal",
          text: item.text,
        });
      }

      return buttons;
    },
  },
};
</script>