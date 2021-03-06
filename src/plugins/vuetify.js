import Vue from "vue";
import Vuetify from "vuetify/lib";
import de from "vuetify/es5/locale/de"; // TODO: import other locales and switch!

Vue.use(Vuetify);

export default new Vuetify({
  lang: {
    locales: { de },
    current: "de",
  },
  theme: {
    dark: true,
  },
  icons: {
    iconfont: "mdi",
  },
});
