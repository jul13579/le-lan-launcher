import Vue from "vue";
import Vuex from "vuex";
import { createPersistedState, createSharedMutations } from "vuex-electron";

Vue.use(Vuex);

const defaultBackgroundColor = "hsl(260, 75%, 8%)";

export default new Vuex.Store({
  state: {
    backgroundColor: defaultBackgroundColor,
    theme: "",
    playerName: "",
    homeDir: "",
    apikey: "",
    started: false,
    nas: ""
  },
  mutations: {
    backgroundColor(state, color) {
      state.backgroundColor = color;
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
    started(state, bool) {
      state.started = bool;
    },
    nas(state, id) {
      state.nas = id;
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
    },
    setApikey(store, payload) {
      store.commit("apikey", payload.key);
    },
    setStarted(store, payload) {
      store.commit("started", payload.started);
    },
    setNas(store, payload) {
      store.commit("nas", payload.id);
    }
  },
  plugins: [createPersistedState(), createSharedMutations()],
  strict: process.env.NODE_ENV !== "production"
});
