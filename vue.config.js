module.exports = {
  transpileDependencies: ["vuetify"],
  pluginOptions: {
    electronBuilder: {
      preload: "src/preload.js",
      builderOptions: {
        extraResources: ["./syncthing*", "!*service*"],
      },
    },
  },
};
