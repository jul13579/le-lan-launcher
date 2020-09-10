<template>
  <div
    class="gameEntry"
    @mouseenter="showOptions = 'visible'"
    @mouseleave="showOptions = 'hidden'"
  >
    <img
      :class="{'installed': subscribed && downloadFinished}"
      :src="'gamethumb://' + homeDir + '/Library/' + value.cover"
      alt=""
    />
    <!-- <div :class="['gameOptions', showOptions]">
      <div>
        <ul>
          <template v-if="!subscribed">
            <li @click="$emit('download')">
              <v-icon small>mdi-cloud-download</v-icon>{{$t('gameEntry.download')}}
            </li>
          </template>
          <template v-else>
            <template v-if="downloadFinished">
              <li
                @click="$emit('execute', value.launch)"
                v-if="status.globalBytes > 0"
              >
                <v-icon small>mdi-play</v-icon>{{$t('gameEntry.play')}}
              </li>
              <li
                @click="$emit('reset')"
                v-if="status.receiveOnlyTotalItems > 0"
              >
                <v-icon small>mdi-backup-restore</v-icon>{{$t('gameEntry.reset')}}
              </li>
              <li
                v-for="(item, index) in value.moreLaunchs"
                :key="index"
                @click="
                  $emit('execute', item)
                "
              >
                <v-icon small>mdi-dots-horizontal</v-icon>{{ item.text }}
              </li>
            </template>
            <li
              @click="$emit('pause')"
              v-if="!config.paused"
            >
              <v-icon small>mdi-pause</v-icon>{{$t('gameEntry.pause')}}
            </li>
            <li
              @click="$emit('resume')"
              v-if="config.paused"
            >
              <v-icon small>mdi-chevron-double-right</v-icon>{{$t('gameEntry.resume')}}
            </li>
            <li @click="$emit('browse')">
              <v-icon small>mdi-folder-open</v-icon>{{$t('gameEntry.browse')}}
            </li>
            <li @click="$emit('delete')">
              <v-icon small>mdi-delete</v-icon>{{$t('gameEntry.delete')}}
            </li>
          </template>
        </ul>
      </div>
    </div> -->
    <!-- <vs-progress
      v-if="subscribed && status.state == 'syncing'"
      class="downloadProgress"
      :percent="(status.inSyncBytes / status.globalBytes) * 100"
    ></vs-progress> -->
  </div>
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