import Vue from "vue";
import Vuex from "vuex";
import VuexPersistence from "vuex-persist";

Vue.use(Vuex);

const defaultBackgroundHue = 265;
const defaultLocale = "en";
const defaultTheme = "./funky-lines.png";

const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
});

export default new Vuex.Store({
  state: {
    backgroundHue: defaultBackgroundHue,
    theme: {
      cover: false,
      path: defaultTheme,
    },
    playerName: "",
    homeDir: "",
    apikey: "",
    nas: "",
    locale: defaultLocale,
    debug: false,
  },
  mutations: {
    backgroundHue(state, color) {
      state.backgroundHue = color;
    },
    theme(state, theme) {
      state.theme = theme;
    },
    playerName(state, name) {
      state.playerName = name;
    },
    homeDir(state, dir) {
      if (dir != false) {
        let setDir = dir;
        if (setDir.endsWith("/")) {
          setDir = setDir.substr(0, setDir.length - 1);
        }
        state.homeDir = setDir;
      }
    },
    apikey(state, key) {
      state.apikey = key;
    },
    nas(state, id) {
      state.nas = id;
    },
    locale(state, locale) {
      state.locale = locale;
    },
    debug(state, bool) {
      state.debug = bool;
    },
  },
  plugins: [vuexLocal.plugin],
  strict: process.env.NODE_ENV !== "production",
});
