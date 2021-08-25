import axios from "axios";
import SyncServiceOperations from "../enums/SyncServiceOperations";
import store from "../store";

const host = "http://localhost:8384/rest";
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
    start: (homeDir) => {
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
    getApiKey: (homeDir) => {
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
    setConfig: (config) => {
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
    folderStatus: (folder) => {
      return axios.get(host + "/db/status?folder=" + folder);
    },
    revertFolder: (folder) => {
      return axios.post(host + "/db/revert?folder=" + folder);
    },
  },
  Cluster: {
    pendingFolders: () => {
      return axios.get(host + "/cluster/pending/folders");
    },
  },
  Events: {
    since: (lastSeenID) => {
      return axios.get(host + "/events?timeout=1&since=" + lastSeenID);
    },
    latest: () => {
      return axios.get(host + "/events?limit=1");
    },
  },
};
