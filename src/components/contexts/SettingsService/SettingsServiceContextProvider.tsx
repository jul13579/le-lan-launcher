import {
  FunctionComponent,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Settings, SettingsServiceContext } from "./SettingsServiceContext";
import {
  defaultBackgroundHue,
  defaultLocale,
  defaultTheme,
} from "../../../config/app";
import { IpcRendererEvent } from "electron";
import { useTranslation } from "react-i18next";
import hslToHex from "hsl-to-hex";

const initialConfig = JSON.parse(
  localStorage.getItem("settings") ?? JSON.stringify({})
);

interface SettingsServiceContextProviderProps {
  children: ReactNode;
}

export const SettingsServiceContextProvider: FunctionComponent<
  SettingsServiceContextProviderProps
> = ({ children }) => {
  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */
  const { i18n } = useTranslation();

  /* -------------------------------------------------------------------------- */
  /*                                    State                                   */
  /* -------------------------------------------------------------------------- */
  const [backgroundHue, setBackgroundHue] = useState<Settings["backgroundHue"]>(
    initialConfig.background ?? defaultBackgroundHue
  );
  const primaryColorHex = useMemo(
    () => hslToHex(backgroundHue, 100, 60),
    [backgroundHue]
  );
  const [theme, setTheme] = useState<Settings["theme"]>({
    cover: initialConfig.theme?.cover ?? false,
    path: initialConfig.theme?.path ?? defaultTheme,
  });
  const [playerName, setPlayerName] = useState<Settings["playerName"]>(
    initialConfig.playerName ?? undefined
  );
  const [homeDir, setHomeDir] = useState<Settings["homeDir"]>(
    initialConfig.homeDir ?? undefined
  );
  const [nas, setNas] = useState<Settings["nas"]>(initialConfig.nas ?? "");
  const [locale, setLocale] = useState<Settings["locale"]>(
    initialConfig.locale ?? defaultLocale
  );
  const [debug, setDebug] = useState<Settings["debug"]>(
    initialConfig.debug ?? false
  );

  const [apiKey, setApiKey] = useState<string>(
    sessionStorage.getItem("apiKey") ?? undefined
  );

  const setupCompleted = useMemo(
    () => !!playerName && !!homeDir && !!nas,
    [playerName, homeDir, nas]
  );

  /* -------------------------------------------------------------------------- */
  /*                             Component Lifecycle                            */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    localStorage.setItem(
      "settings",
      JSON.stringify({
        backgroundHue,
        theme,
        playerName,
        homeDir,
        nas,
        locale,
        debug,
      })
    );
  }, [backgroundHue, theme, playerName, homeDir, nas, locale, debug]);

  useEffect(() => {
    if (apiKey) {
      sessionStorage.setItem("apiKey", apiKey);
    }
  }, [apiKey]);

  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);

  useEffect(() => {
    const listener = (event: IpcRendererEvent, apiKey: string) => {
      setApiKey(apiKey);
    };
    window.ipcRenderer.on("setApiKey", listener);
    () => window.ipcRenderer.removeListener("setApiKey", listener);
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
  const state = {
    backgroundHue,
    setBackgroundHue,
    primaryColorHex,
    theme,
    setTheme,
    playerName,
    setPlayerName,
    homeDir,
    setHomeDir,
    nas,
    setNas,
    locale,
    setLocale,
    debug,
    setDebug,
    apiKey,
    setupCompleted,
  };
  return (
    <SettingsServiceContext.Provider value={state}>
      {children}
    </SettingsServiceContext.Provider>
  );
};
