<template>
  <div
    class="gameEntry"
    :style="coverWidth"
    ref="coverFace"
    @mouseenter="showOptions = 'visible'"
    @mouseleave="showOptions = 'hidden'"
  >
    <img
      :src="'file://' + homeDir + '/Bibliothek/' + value.cover"
      alt=""
    />
    <div :class="['gameOptions', showOptions]">
      <div>
        <ul>
          <template v-if="!subscribed">
            <li @click="$emit('download')">
              <vs-icon
                icon="cloud_download"
                size="small"
              ></vs-icon>Herunterladen
            </li>
          </template>
          <template v-else>
            <template v-if="downloadFinished">
              <li
                @click="$emit('execute', value.launch)"
                v-if="status.globalBytes > 0"
              >
                <vs-icon
                  icon="play_arrow"
                  size="small"
                ></vs-icon>Spielen
              </li>
              <li
                @click="$emit('reset')"
                v-if="status.receiveOnlyTotalItems > 0"
              >
                <vs-icon
                  icon="restore"
                  size="small"
                ></vs-icon>Zurücksetzen
              </li>
              <li
                v-for="(item, index) in value.moreLaunchs"
                :key="index"
                @click="
                  $emit('execute', item)
                "
              >
                <vs-icon
                  icon="more_horizontal"
                  size="small"
                ></vs-icon>{{ item.text }}
              </li>
            </template>
            <li
              @click="$emit('pause')"
              v-if="!config.paused"
            >
              <vs-icon
                icon="pause"
                size="small"
              ></vs-icon>Pause
            </li>
            <li
              @click="$emit('resume')"
              v-if="config.paused"
            >
              <vs-icon
                icon="double_arrow"
                size="small"
              ></vs-icon>Fortsetzen
            </li>
            <li @click="$emit('browse')">
              <vs-icon
                icon="folder_open"
                size="small"
              ></vs-icon>Durchsuchen
            </li>
            <li @click="$emit('delete')">
              <vs-icon
                icon="delete"
                size="small"
              ></vs-icon>Löschen
            </li>
          </template>
        </ul>
      </div>
    </div>
    <vs-progress
      v-if="subscribed && status.state != 'idle'"
      class="downloadProgress"
      :percent="(status.inSyncBytes / status.globalBytes) * 100"
    ></vs-progress>
  </div>
</template>

<script>
const coverWidth = 170;

export default {
  props: {
    value: Object,
    homeDir: String,
    config: Object,
    status: Object
  },
  data() {
    return {
      showOptions: "hidden"
    };
  },
  computed: {
    coverWidth() {
      return {
        "--cover-width": coverWidth + "px"
      };
    },
    subscribed() {
      return this.config != null;
    },
    downloadFinished() {
      if (this.status.state != "idle") {
        return false;
      }
      return this.status.globalBytes == this.status.inSyncBytes;
    }
  }
};
</script>

<style lang="sass">
.gameEntry
  display: inline-block
  position: relative
  width: var(--cover-width)
  margin: 10px
  cursor: pointer
  transition: box-shadow .2s ease-in-out;
  overflow: hidden;
  &:hover
    box-shadow: 0px 0px 20px 5px white
  img
    width: 100%
    height: auto

.gameOptions
  position: absolute
  width: 100%
  padding-top: 100%
  overflow-x: hidden
  bottom: 0
  z-index: 2
  left: 100%
  transition: left .2s ease-in-out
  &.visible
      left: 0%
  >div
      position: relative
      font-size: 1.2rem
      box-shadow: 0px 0px 20px 5px black
      background: rgba(0,0,0,.8)
      padding-bottom: 5px;
  ul
      list-style: none
  li
      padding: 5px 5px
      transition: padding-left .2s ease-in-out
      &:hover
          padding-left: .8rem
  .vs-icon
      margin-right: .5rem
      vertical-align: bottom
</style>
