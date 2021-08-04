module.exports = {
  transpileDependencies: ["vuetify"],
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        extraResources: ["./syncthing*", "!*service*"],
      }
    },
  },
};
