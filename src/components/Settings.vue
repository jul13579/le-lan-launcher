<template>
  <div class="container">
    <h1>Einstellungen</h1>
    <h2>Design</h2>
    <vs-images>
      <vs-image
        v-for="(item, index) in textures"
        :key="index"
        :src="item"
        @click.native="() => {$store.commit('theme', item)}"
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
var img1 = require('@/assets/funky-lines.png')
var img2 = require('@/assets/gaming.png')
var img3 = require('@/assets/prism.png')

export default {
  data() {
    return {
      textures: [img1, img2, img3]
    };
  }
};
</script>