<template>
  <div id="app">
  </div>
</template>

<script>
export default {
  name: "app",
  components: {},
  beforeMount() {
    this.$vs.theme({
      primary: this.$store.state.primaryColor
    });

    this.$store.subscribe(mutation => {
      if (mutation.type == "primaryColor") {
        this.$vs.theme({
          primary: mutation.payload
        });
      }
    });
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
