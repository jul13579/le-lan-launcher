import Vue from "vue";
import Vuex from "vuex";
import { createPersistedState, createSharedMutations } from "vuex-electron";
import "./toaster";

Vue.use(Vuex);

const defaultBackgroundColor = "hsl(260, 75%, 8%)";
let backgroundColorTimeout;
let playerNameTimeout;

export default new Vuex.Store({
  state: {
    backgroundColor: defaultBackgroundColor,
    theme: "",
    playerName: "",
    homeDir: ""
  },
  mutations: {
    backgroundColor(state, color) {
      state.backgroundColor = color;
      clearTimeout(backgroundColorTimeout);
      backgroundColorTimeout = setTimeout(function() {
        Vue.toasted.global.success("Farbton gespeichert");
      }, 1000);
    },
    theme(state, theme) {
      state.theme = theme;
      Vue.toasted.global.success("Design gespeichert");
    },
    playerName(state, name) {
      state.playerName = name;
      clearTimeout(playerNameTimeout);
      playerNameTimeout = setTimeout(function() {
        Vue.toasted.global.success("Spielername gespeichert");
      }, 1000);
    },
    homeDir(state, dir) {
      state.homeDir = dir;
      Vue.toasted.global.success("Spieleverzeichnis-Pfad gespeichert");
    }
  },
  actions: {
    setBackgroundColor(store, payload) {
      store.commit("backgroundColor", payload.color);
    },
    setTheme(store, payload) {
      store.commit("theme", payload.theme);
    },
    setPlayerName(store, payload) {
      store.commit("playerName", payload.name);
    },
    setHomeDir(store, payload) {
      store.commit("homeDir", payload.dir);
    }
  },
  plugins: [createPersistedState(), createSharedMutations()],
  strict: process.env.NODE_ENV !== "production"
});
