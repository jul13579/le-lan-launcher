import axios from "axios";
import { FunctionComponent, ReactNode, useEffect, useState } from "react";
import { SyncthingServiceContext } from "./SyncthingServiceContext";
import { useSettingsService } from "../../../hooks/useSettingsService";
import SyncServiceOperations from "../../../enums/SyncServiceOperations";
import { host } from "../../../config/service";

interface SyncthingServiceContextProviderProps {
  children: ReactNode;
}

export const SyncthingServiceContextProvider: FunctionComponent<
  SyncthingServiceContextProviderProps
> = ({ children }) => {
  /* -------------------------------------------------------------------------- */
  /*                                   Context                                  */
  /* -------------------------------------------------------------------------- */
  const { apiKey } = useSettingsService();

  /* -------------------------------------------------------------------------- */
  /*                                    State                                   */
  /* -------------------------------------------------------------------------- */
  const [online, setOnline] = useState(false);
  const [started, setStarted] = useState(false);

  /* -------------------------------------------------------------------------- */
  /*                             Component Lifecycle                            */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    axios.defaults.headers.common["X-API-Key"] = apiKey;
  }, [apiKey]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await ping();

        // If service is reachable, set both `online` and `started` to true
        if (!online) {
          setOnline(true);
        }
        if (!started) {
          setStarted(true);
        }
      } catch (e) {
        // Do nothing
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                             Instance Functions                             */
  /* -------------------------------------------------------------------------- */
  function openSyncthingUI() {
    return window.ipcRenderer.invoke(
      "controlSyncService",
      SyncServiceOperations.OPEN_SYNCTHING_UI
    );
  }
  async function start(homeDir: string) {
    if (started) {
      return;
    }
    try {
      const retVal = await window.ipcRenderer.invoke(
        "controlSyncService",
        SyncServiceOperations.START,
        homeDir
      );
      setStarted(true);
      return retVal;
    } catch (e) {
      console.error(
        `Encountered error when trying to start sync service: ${e}`
      );
    }
  }
  function restart() {
    return axios.post(host + "/system/restart");
  }
  function stop() {
    return axios.post(host + "/system/shutdown");
  }
  function getApiKey(homeDir: string) {
    return window.ipcRenderer.invoke(
      "controlSyncService",
      SyncServiceOperations.GET_API_KEY,
      homeDir
    );
  }
  function ping() {
    return axios.get(host + "/system/ping");
  }
  function status() {
    return axios.get(host + "/system/status");
  }
  function getConfig() {
    return axios.get(host + "/system/config");
  }
  function setConfig(config: Config) {
    return axios.post(host + "/system/config", config);
  }
  function connections() {
    return axios.get(host + "/system/connections");
  }
  function getDiscovery() {
    return axios.get(host + "/system/discovery");
  }
  function folderStatus(folder: string) {
    return axios.get(host + "/db/status?folder=" + folder);
  }
  function revertFolder(folder: string) {
    return axios.post(host + "/db/revert?folder=" + folder);
  }
  function pendingFolders() {
    return axios.get(host + "/cluster/pending/folders");
  }
  function eventsSince(lastSeenID: string) {
    return axios.get(host + "/events?timeout=1&since=" + lastSeenID);
  }
  function latestEvents() {
    return axios.get(host + "/events?limit=1");
  }

  /* -------------------------------------------------------------------------- */
  /*                                  Rendering                                 */
  /* -------------------------------------------------------------------------- */
  const state = {
    openSyncthingUI,
    start,
    restart,
    stop,
    getApiKey,
    ping,
    status,
    getConfig,
    setConfig,
    connections,
    getDiscovery,
    folderStatus,
    revertFolder,
    pendingFolders,
    eventsSince,
    latestEvents,
  };
  return (
    <SyncthingServiceContext.Provider value={state}>
      {children}
    </SyncthingServiceContext.Provider>
  );
};
