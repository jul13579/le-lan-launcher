import Vue from "vue";
import Vuex from "vuex";
import { createPersistedState, createSharedMutations } from "vuex-electron";

Vue.use(Vuex);

const defaultBackgroundColor = "rgb(15, 5, 35)";

export default new Vuex.Store({
  state: {
    backgroundColor: defaultBackgroundColor,
    theme: "",
    setupCompleted: false
  },
  mutations: {
    backgroundColor(state, color) {
      state.backgroundColor = color;
    },
    theme(state, theme) {
      state.theme = theme;
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
  plugins: [
    createPersistedState(),
    createSharedMutations()
  ],
  strict: process.env.NODE_ENV !== "production"
});
