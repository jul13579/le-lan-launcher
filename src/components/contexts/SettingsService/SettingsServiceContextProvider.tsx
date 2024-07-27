import { FunctionComponent, ReactNode, useState } from "react";
import { SettingsServiceContext } from "./SettingsServiceContext";
import { defaultBackgroundHue, defaultTheme } from "src/config/app";

interface SettingsServiceContextProviderProps {
  children: ReactNode;
}

export const SettingsServiceContextProvider: FunctionComponent<
  SettingsServiceContextProviderProps
> = ({ children }) => {
  /* -------------------------------------------------------------------------- */
  /*                                    State                                   */
  /* -------------------------------------------------------------------------- */
  const [backgroundHue, setBackgroundHue] = useState(defaultBackgroundHue);
  const [theme, setTheme] = useState({
    cover: false,
    path: defaultTheme,
  });
  const [playerName, setPlayerName] = useState("");
  const [homeDir, setHomeDir] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [nas, setNas] = useState("");
  const [locale, setLocale] = useState("");
  const [debug, setDebug] = useState(false);

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
