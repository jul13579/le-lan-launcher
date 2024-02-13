import { createStore } from "vuex";
import { default as VuexPersistence } from "vuex-persist";
import Mutations from "../enums/Mutations";
import langs from "../localization/langs";

const defaultBackgroundHue = 265;
const defaultLocale = "en";
const defaultTheme = "./funky-lines.png";

const vuexLocal = new VuexPersistence({
  storage: localStorage,
});

export type Store = {
  backgroundHue: number;
  theme: {
    cover: boolean;
    path: string;
  };
  playerName: string;
  homeDir: string;
  apiKey: string;
  nas: string;
  locale: keyof typeof langs;
  debug: boolean;
};

export default createStore<Store>({
  state() {
    return {
      backgroundHue: defaultBackgroundHue,
      theme: {
        cover: false,
        path: defaultTheme,
      },
      playerName: "",
      homeDir: "",
      apiKey: "",
      nas: "",
      locale: defaultLocale,
      debug: false,
    };
  },
  mutations: {
    [Mutations.BACKGROUND_HUE](state, color) {
      state.backgroundHue = color;
    },
    [Mutations.THEME](state, theme) {
      state.theme = theme;
    },
    [Mutations.PLAYER_NAME](state, name) {
      state.playerName = name;
    },
    [Mutations.HOME_DIR](state, dir) {
      if (dir != false) {
        let setDir = dir;
        if (setDir.endsWith("/")) {
          setDir = setDir.substr(0, setDir.length - 1);
        }
        state.homeDir = setDir;
      }
    },
    [Mutations.API_KEY](state, key) {
      state.apiKey = key;
    },
    [Mutations.NAS](state, id) {
      state.nas = id;
    },
    [Mutations.LOCALE](state, locale) {
      state.locale = locale;
    },
    [Mutations.DEBUG](state, bool) {
      state.debug = bool;
    },
  },
  plugins: [vuexLocal.plugin],
  strict: process.env.NODE_ENV !== "production",
});
