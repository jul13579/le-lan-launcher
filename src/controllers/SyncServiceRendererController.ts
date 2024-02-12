import axios from "axios";
import { host } from "../config/service";
import SyncServiceOperations from "../enums/SyncServiceOperations";
import store from "../store";

axios.defaults.headers.common["X-API-Key"] = store.state.apiKey;

store.subscribe((mutation) => {
  if (mutation.type == "apiKey" && mutation.payload) {
    axios.defaults.headers.common["X-API-Key"] = mutation.payload;
  }
});

/**
 * Sync-service controller module.
 * This is only to be used by the renderer process.
 */
export default {
  System: {
    openSyncthingUI: () => {
      return window.ipcRenderer.invoke(
        "controlSyncService",
        SyncServiceOperations.OPEN_SYNCTHING_UI
      );
    },
    start: (homeDir: string) => {
      return window.ipcRenderer.invoke(
        "controlSyncService",
        SyncServiceOperations.START,
        homeDir
      );
    },
    restart: () => {
      return axios.post(host + "/system/restart");
    },
    stop: () => {
      return axios.post(host + "/system/shutdown");
    },
    getApiKey: (homeDir: string) => {
      return window.ipcRenderer.invoke(
        "controlSyncService",
        SyncServiceOperations.GET_API_KEY,
        homeDir
      );
    },
    ping: () => {
      return axios.get(host + "/system/ping");
    },
    status: () => {
      return axios.get(host + "/system/status");
    },
    getConfig: () => {
      return axios.get(host + "/system/config");
    },
    setConfig: (config: Config) => {
      return axios.post(host + "/system/config", config);
    },
    connections: () => {
      return axios.get(host + "/system/connections");
    },
    getDiscovery: () => {
      return axios.get(host + "/system/discovery");
    },
  },
  DB: {
    folderStatus: (folder: string) => {
      return axios.get(host + "/db/status?folder=" + folder);
    },
    revertFolder: (folder: string) => {
      return axios.post(host + "/db/revert?folder=" + folder);
    },
  },
  Cluster: {
    pendingFolders: () => {
      return axios.get(host + "/cluster/pending/folders");
    },
  },
  Events: {
    since: (lastSeenID: string) => {
      return axios.get(host + "/events?timeout=1&since=" + lastSeenID);
    },
    latest: () => {
      return axios.get(host + "/events?limit=1");
    },
  },
};

export { host };
