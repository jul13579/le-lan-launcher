import { createStore } from "vuex";
import { default as VuexPersistence } from "vuex-persist";
import langs from "../localization/langs";

const defaultBackgroundHue = 265;
const defaultLocale = "en";
const defaultTheme = "./funky-lines.png";

const vuexLocal = new VuexPersistence({
  storage: localStorage,
});

export enum StoreAttributes {
  BACKGROUND_HUE = "backgroundHue",
  THEME = "theme",
  PLAYER_NAME = "playerName",
  HOME_DIR = "homeDir",
  API_KEY = "apiKey",
  NAS = "nas",
  LOCALE = "locale",
  DEBUG = "debug",
}

export type Store = {
  [StoreAttributes.BACKGROUND_HUE]: number;
  [StoreAttributes.THEME]: {
    cover: boolean;
    path: string;
  };
  [StoreAttributes.PLAYER_NAME]: string;
  [StoreAttributes.HOME_DIR]: string;
  [StoreAttributes.API_KEY]: string;
  [StoreAttributes.NAS]: string;
  [StoreAttributes.LOCALE]: keyof typeof langs;
  [StoreAttributes.DEBUG]: boolean;
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
    [StoreAttributes.BACKGROUND_HUE](state, color) {
      state.backgroundHue = color;
    },
    [StoreAttributes.THEME](state, theme) {
      state.theme = theme;
    },
    [StoreAttributes.PLAYER_NAME](state, name) {
      state.playerName = name;
    },
    [StoreAttributes.HOME_DIR](state, dir) {
      if (dir != false) {
        let setDir = dir;
        if (setDir.endsWith("/")) {
          setDir = setDir.substr(0, setDir.length - 1);
        }
        state.homeDir = setDir;
      }
    },
    [StoreAttributes.API_KEY](state, key) {
      state.apiKey = key;
    },
    [StoreAttributes.NAS](state, id) {
      state.nas = id;
    },
    [StoreAttributes.LOCALE](state, locale) {
      state.locale = locale;
    },
    [StoreAttributes.DEBUG](state, bool) {
      state.debug = bool;
    },
  },
  plugins: [vuexLocal.plugin],
  strict: process.env.NODE_ENV !== "production",
});
