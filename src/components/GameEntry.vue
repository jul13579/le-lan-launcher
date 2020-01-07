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
    >
    <div :class="['gameOptionsContainer', showOptions]">
      <div ref="gameOptions">
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
            <li
              @click="$emit('pause')"
              v-if="!status.paused"
            >
              <vs-icon
                icon="pause"
                size="small"
              ></vs-icon>Pause
            </li>
            <li
              @click="$emit('resume')"
              v-if="status.paused"
            >
              <vs-icon
                icon="play_arrow"
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
          <!-- <li
            v-for="(item, index) in options"
            :key="index"
          >
            <vs-icon :icon="item.icon" size="small"></vs-icon>{{item.text}}
          </li> -->
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
const coverWidth = 170;

export default {
  props: {
    value: Object,
    homeDir: String,
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
      return this.status != null;
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

  .gameOptionsContainer
    position: absolute
    width: 100%
    margin-top: 100%
    overflow: hidden
    bottom: 0
    z-index: 2
    left: 100%
    transition: left .2s ease-in-out
    &.visible
        left: 0%
    >div
        position: relative
        background: rgba(0,0,0,.8)
        font-size: 1.2rem
        box-shadow: 0px 0px 20px 5px black
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