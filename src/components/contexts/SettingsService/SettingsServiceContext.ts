import { createContext, Dispatch, SetStateAction } from "react";

interface ThemeSettings {
  cover: boolean;
  path: string;
}

export interface Settings {
  backgroundHue: number;
  theme: ThemeSettings;
  playerName: string;
  homeDir: string;
  nas: string;
  locale: string;
  debug: boolean;
}

export const SettingsServiceContext = createContext<{
  backgroundHue: Settings["backgroundHue"];
  setBackgroundHue: Dispatch<SetStateAction<Settings["backgroundHue"]>>;
  primaryColorHex: string;
  theme: Settings["theme"];
  setTheme: Dispatch<SetStateAction<Settings["theme"]>>;
  playerName: Settings["playerName"];
  setPlayerName: Dispatch<SetStateAction<Settings["playerName"]>>;
  homeDir: Settings["homeDir"];
  setHomeDir: Dispatch<SetStateAction<Settings["homeDir"]>>;
  homeDirWithForwardSlash: string;
  nas: Settings["nas"];
  setNas: Dispatch<SetStateAction<Settings["nas"]>>;
  locale: Settings["locale"];
  setLocale: Dispatch<SetStateAction<Settings["locale"]>>;
  debug: Settings["debug"];
  setDebug: Dispatch<SetStateAction<Settings["debug"]>>;
  apiKey: string;
  setupCompleted: boolean;
}>(null);
