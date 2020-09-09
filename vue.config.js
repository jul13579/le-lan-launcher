module.exports = {
  configureWebpack: {
    //   module: {
    //     rules: [
    //       {
    //         test: /\.sass$/,
    //         use: [
    //           "vue-style-loader",
    //           "css-loader",
    //           {
    //             loader: "sass-loader",
    //             // Requires sass-loader@^9.0.0
    //             options: {
    //               // This is the path to your variables
    //               additionalData: "@import '@/sass/variables'",
    //             },
    //           },
    //         ],
    //       },
    //     ],
    //   },
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        extraResources: ["./syncthing*", "!*service*"],
      },
    },
  },
};
