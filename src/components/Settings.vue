<template>
  <div class="container">
    <h1>Einstellungen</h1>
    <h2>Design</h2>
    <vs-images>
      <vs-image
        v-for="(item, index) in textures"
        :key="index"
        :src="item"
        @click.native="() => {$store.dispatch('setTheme', {theme: item})}"
      ></vs-image>
    </vs-images>
    <h2>Farbton</h2>
    <div style="padding: 0 1rem">
      <vs-slider
        :min="0"
        :max="360"
        @input="(input) => {$store.dispatch('setBackgroundColor', {color: 'hsl(' + input + ', 75%, 8%)'})}"
        :color="backgroundColor"
        :value="parseInt(backgroundColor.replace('hsl(', '').split(',')[0])"
      />
    </div>
    <h2>Spielerinformationen</h2>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  data() {
    return {
      textures: [
        require("@/assets/funky-lines.png"),
        require("@/assets/gaming.png"),
        require("@/assets/prism.png"),
        require("@/assets/maze.png")
      ]
    };
  },
  computed: mapState(["backgroundColor"])
};
</script>