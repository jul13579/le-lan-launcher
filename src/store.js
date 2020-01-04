import Vue from "vue";
import Vuex from "vuex";
import { createPersistedState, createSharedMutations } from "vuex-electron";
import "./toaster";

Vue.use(Vuex);

const defaultBackgroundColor = "hsl(260, 75%, 8%)";
let colorSaveTimeout;

export default new Vuex.Store({
  state: {
    backgroundColor: defaultBackgroundColor,
    theme: "",
    setupCompleted: false
  },
  mutations: {
    backgroundColor(state, color) {
      state.backgroundColor = color;
      clearTimeout(colorSaveTimeout);
      colorSaveTimeout = setTimeout(function() {
        Vue.toasted.global.success("Farbton gespeichert");
      }, 1000);
    },
    theme(state, theme) {
      state.theme = theme;
      Vue.toasted.global.success("Design gespeichert");
    },
    setupCompleted(state, bool) {
      state.setupCompleted = bool;
    }
  },
  actions: {
    setBackgroundColor(store, payload) {
      store.commit("backgroundColor", payload.color);
    },
    setTheme(store, payload) {
      store.commit("theme", payload.theme);
    },
    setSetupCompleted(store, payload) {
      store.commit("setCompleted", payload.setupCompleted);
    }
  },
  plugins: [createPersistedState(), createSharedMutations()],
  strict: process.env.NODE_ENV !== "production"
});
