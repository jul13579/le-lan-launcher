import { IpcRenderer } from "electron";
import hslToHex from "hsl-to-hex";
import {
  FunctionComponent,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  defaultBackgroundHue,
  defaultLocale,
  defaultTheme,
} from "src/config/app";
import { Settings, SettingsServiceContext } from "./SettingsServiceContext";
import { toast } from "react-toastify";
import { useSwallowFirstEffect } from "src/hooks/useSwallowFirstEffect";

const initialConfig = JSON.parse(
  localStorage.getItem("settings") ?? JSON.stringify({}),
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
  const { t, i18n } = useTranslation();

  /* -------------------------------------------------------------------------- */
  /*                                    State                                   */
  /* -------------------------------------------------------------------------- */
  const [backgroundHue, setBackgroundHue] = useState<Settings["backgroundHue"]>(
    initialConfig.background ?? defaultBackgroundHue,
  );
  const primaryColorHex = useMemo(
    () => hslToHex(backgroundHue, 100, 60),
    [backgroundHue],
  );
  const [theme, setTheme] = useState<Settings["theme"]>({
    cover: initialConfig.theme?.cover ?? false,
    path: initialConfig.theme?.path ?? defaultTheme,
  });
  const [playerName, setPlayerName] = useState<Settings["playerName"]>(
    initialConfig.playerName ?? "",
  );
  const [homeDir, setHomeDir] = useState<Settings["homeDir"]>(
    initialConfig.homeDir ?? "",
  );
  const homeDirWithForwardSlash = useMemo(
    () => homeDir.replace(/\\/g, "/"),
    [homeDir],
  );
  const [nas, setNas] = useState<Settings["nas"]>(initialConfig.nas ?? "");
  const [locale, setLocale] = useState<Settings["locale"]>(
    initialConfig.locale ?? defaultLocale,
  );
  const [debug, setDebug] = useState<Settings["debug"]>(
    initialConfig.debug ?? false,
  );

  const [apiKey, setApiKey] = useState<string>(
    sessionStorage.getItem("apiKey") ?? "",
  );

  const setupCompleted = useMemo(
    () => !!playerName && !!homeDir && !!nas,
    [playerName, homeDir, nas],
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
      }),
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
    const listener: Parameters<IpcRenderer["on"]>[1] = (
      event,
      apiKey: string,
    ) => {
      setApiKey(apiKey);
    };
    window.ipcRenderer.on("setApiKey", listener);
    () => {
      window.ipcRenderer.removeAllListeners("setApiKey");
    };
  }, []);

  useSwallowFirstEffect(() => {
    toast(t("toast.theme"), { type: "success" });
  }, [theme]);

  useSwallowFirstEffect(() => {
    const timeout = setTimeout(() => {
      toast(t("toast.backgroundHue"), { type: "success" });
    }, 1000);
    return () => clearTimeout(timeout);
  }, [backgroundHue]);

  useSwallowFirstEffect(() => {
    const timeout = setTimeout(() => {
      toast(t("toast.playerName"), { type: "success" });
    }, 1000);
    return () => clearTimeout(timeout);
  }, [playerName]);

  useSwallowFirstEffect(() => {
    toast(t("toast.homeDir"), { type: "success" });
  }, [homeDir]);

  useSwallowFirstEffect(() => {
    toast(t("toast.nas"), { type: "success" });
  }, [nas]);

  useSwallowFirstEffect(() => {
    toast(t("toast.locale"), { type: "success" });
  }, [locale]);

  useSwallowFirstEffect(() => {
    toast(t("toast.debug"), { type: "success" });
  }, [debug]);

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
    homeDirWithForwardSlash,
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
