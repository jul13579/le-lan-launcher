import { FunctionComponent, ReactNode, useEffect, useState } from "react";
import { Settings, SettingsServiceContext } from "./SettingsServiceContext";
import { defaultBackgroundHue, defaultTheme } from "../../../config/app";
import { IpcRendererEvent } from "electron";

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
  /*                                    State                                   */
  /* -------------------------------------------------------------------------- */
  const [backgroundHue, setBackgroundHue] = useState<Settings["backgroundHue"]>(
    initialConfig.background ?? defaultBackgroundHue
  );
  const [theme, setTheme] = useState<Settings["theme"]>({
    cover: initialConfig.theme?.cover ?? false,
    path: initialConfig.theme?.path ?? defaultTheme,
  });
  const [playerName, setPlayerName] = useState<Settings["playerName"]>(
    initialConfig.playerName ?? ""
  );
  const [homeDir, setHomeDir] = useState<Settings["homeDir"]>(
    initialConfig.homeDir ?? ""
  );
  const [nas, setNas] = useState<Settings["nas"]>(initialConfig.nas ?? "");
  const [locale, setLocale] = useState<Settings["locale"]>(
    initialConfig.locale ?? ""
  );
  const [debug, setDebug] = useState<Settings["debug"]>(
    initialConfig.debug ?? false
  );

  const [apiKey, setApiKey] = useState<string>(undefined);

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
  };
  return (
    <SettingsServiceContext.Provider value={state}>
      {children}
    </SettingsServiceContext.Provider>
  );
};
