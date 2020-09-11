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
        </div>
        <div
          v-else
          class="glass"
          v-on="on"
        >
        </div>
      </div>
    </template>
    <v-card>
      <div class="d-flex flex-column">
        <v-btn
          text
          block
          @click="$emit('execute', value.launch)"
          class="justify-start"
        >
          <v-icon left>mdi-play</v-icon>{{$t('gameEntry.play')}}
        </v-btn>
        <v-btn
          text
          block
          @click="$emit('reset')"
          v-if="status.receiveOnlyTotalItems > 0"
          class="justify-start"
        >
          <v-icon left>mdi-backup-restore</v-icon>{{$t('gameEntry.reset')}}
        </v-btn>
        <v-btn
          text
          block
          @click="$emit('execute', item)"
          v-for="(item, index) in value.moreLaunchs"
          :key="index"
          class="justify-start"
        >
          <v-icon left>mdi-dots-horizontal</v-icon>{{ item.text }}
        </v-btn>
        <v-btn
          text
          block
          @click="$emit('browse')"
          class="justify-start"
        >
          <v-icon left>mdi-folder-open</v-icon>{{$t('gameEntry.browse')}}
        </v-btn>
        <v-btn
          text
          block
          @click="$emit('delete')"
          class="justify-start"
        >
          <v-icon left>mdi-delete</v-icon>{{$t('gameEntry.delete')}}
        </v-btn>
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
    downloadFinished() {
      switch (this.status.state) {
        case "idle":
        case "scanning":
          return this.status.globalBytes == this.status.inSyncBytes;
        default:
          return false;
      }
    },
  },
};
</script>