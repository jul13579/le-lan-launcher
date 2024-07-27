import { FunctionComponent, ReactNode, useEffect, useState } from "react";
import { SettingsServiceContext } from "./SettingsServiceContext";
import { defaultBackgroundHue, defaultTheme } from "src/config/app";

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
  const [backgroundHue, setBackgroundHue] = useState(
    initialConfig.background ?? defaultBackgroundHue
  );
  const [theme, setTheme] = useState({
    cover: initialConfig.theme?.cover ?? false,
    path: initialConfig.theme?.path ?? defaultTheme,
  });
  const [playerName, setPlayerName] = useState(initialConfig.playerName ?? "");
  const [homeDir, setHomeDir] = useState(initialConfig.homeDir ?? "");
  const [apiKey, setApiKey] = useState(initialConfig.apiKey ?? "");
  const [nas, setNas] = useState(initialConfig.nas ?? "");
  const [locale, setLocale] = useState(initialConfig.locale ?? "");
  const [debug, setDebug] = useState(initialConfig.debug ?? false);

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
        apiKey,
        nas,
        locale,
        debug,
      })
    );
  }, [backgroundHue, theme, playerName, homeDir, apiKey, nas, locale, debug]);

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
    apiKey,
    setApiKey,
    nas,
    setNas,
    locale,
    setLocale,
    debug,
    setDebug,
  };
  return (
    <SettingsServiceContext.Provider value={state}>
      {children}
    </SettingsServiceContext.Provider>
  );
};
