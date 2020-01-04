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
    <vs-row>
      <vs-col
        vs-type="flex"
        vs-justify="flex-end"
        vs-w="12"
      >
        <vs-button
          color="success"
          icon="save"
        >Speichern</vs-button>
      </vs-col>
    </vs-row>
  </div>
</template>

<script>
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
  }
};
</script>