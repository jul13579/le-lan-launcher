import Vue from "vue";
import Vuex from "vuex";
import { createPersistedState, createSharedMutations } from "vuex-electron";

Vue.use(Vuex);

const defaultBackgroundHue = 265;
const defaultLocale = "en";
const defaultTheme = "./funky-lines.png";

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
  actions: {
    setBackgroundHue(store, payload) {
      store.commit("backgroundHue", payload.color);
    },
    setTheme(store, payload) {
      store.commit("theme", payload.theme);
    },
    setPlayerName(store, payload) {
      store.commit("playerName", payload.name);
    },
    setHomeDir(store, payload) {
      store.commit("homeDir", payload.dir);
    },
    setApikey(store, payload) {
      store.commit("apikey", payload.key);
    },
    setNas(store, payload) {
      store.commit("nas", payload.id);
    },
    setLocale(store, payload) {
      store.commit("locale", payload.locale);
    },
    setDebug(store, payload) {
      store.commit("debug", payload.debug);
    },
  },
  plugins: [createPersistedState(), createSharedMutations()],
  strict: process.env.NODE_ENV !== "production",
});
