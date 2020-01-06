<template>
  <div class="gameEntry">
    <img
      :src="'file://' + homeDir + '/Bibliothek/' + value.cover"
      alt=""
    >
  </div>
</template>

<script>
export default {
  props: {
    value: Object,
    homeDir: String
  }
};
</script>

<style lang="sass">
  .gameEntry
    display: inline-block
    width: 150px
    margin: 10px
    cursor: pointer
    transition: box-shadow .2s ease-in-out;
    &:hover
      box-shadow: 0px 0px 20px 5px white
    img
      width: 100%
      height: auto
</style>