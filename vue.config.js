module.exports = {
  pluginOptions: {
    electronBuilder: {
      preload: "src/preload.js",
      builderOptions: {
        extraResources: ["./syncthing*", "!*service*"],
      },
    },
  },
  configureWebpack: {
    devtool: "source-map",
  },
};
