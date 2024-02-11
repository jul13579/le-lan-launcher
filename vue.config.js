const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  pluginOptions: {
    electronBuilder: {
      // Use this to change the entrypoint of your app's main process
      mainProcessFile: 'src/background.ts',
      // Use this to change the entry point of your app's render process. default src/[main|index].[js|ts]
      rendererProcessFile: 'src/main.ts',
      preload: "src/preload.ts",
      builderOptions: {
        extraResources: ["./syncthing*", "!*service*"],
      },
    },
  },
  configureWebpack: {
    devtool: "source-map",
  },
})
