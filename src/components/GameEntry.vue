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
    <div
      :class="['gameOptions', optionsPosition, showOptions]"
      :style="optionsWidth"
      @mouseenter="showOptions = 'hidden'"
    >
      <div
        @mouseenter="showOptions = 'visible'"
        @mouseleave="showOptions = 'hidden'"
      >
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
const optionsWidth = 200;
const coverWidth = 150;

export default {
  props: {
    value: Object,
    homeDir: String,
    status: Object
  },
  data() {
    return {
      bodyWidth: 0,
      coverX: 0,
      showOptions: "hidden"
    };
  },
  computed: {
    optionsPosition() {
      return this.coverX + coverWidth + optionsWidth < this.bodyWidth
        ? "right"
        : "left";
    },
    coverWidth() {
      return {
        "--cover-width": coverWidth + "px"
      };
    },
    optionsWidth() {
      return {
        "--options-width": optionsWidth + "px"
      };
    },
    subscribed() {
      return this.status != null;
    }
  },
  mounted() {
    this.bodyWidth = window.innerWidth;
    this.coverX = this.$refs.coverFace.getBoundingClientRect().x;
    window.addEventListener("resize", () => {
      this.bodyWidth = window.innerWidth;
      this.coverX = this.$refs.coverFace.getBoundingClientRect().x;
    });
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
    &:hover
      box-shadow: 0px 0px 20px 5px white
    img
      width: 100%
      height: auto

  .gameOptions
    position: absolute
    width: var(--options-width)
    height: 0px
    overflow: hidden
    top: 0px
    z-index: 2
    transition: height .2s ease-in-out
    &.left
        left: calc(0px - var(--options-width))
        >div
            margin-left: 25px
    &.right
        right: calc(0px - var(--options-width))
        >div
            margin-right: 25px
    &.visible
        height: 200px
    >div
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