import axios from "axios";
import store from "../store";

const host = "http://localhost:8384/rest";
axios.defaults.headers.common["X-API-Key"] = store.state.apikey;

store.subscribe((mutation) => {
  if (mutation.type == "apikey" && mutation.payload) {
    axios.defaults.headers.common["X-API-Key"] = mutation.payload;
  }
});

export default {
  System: {
    start: (homeDir) => {
      return window.ipcRenderer.invoke("startSyncService", homeDir);
    },
    restart: () => {
      return axios.post(host + "/system/restart");
    },
    stop: () => {
      return axios.post(host + "/system/shutdown");
    },
    getApiKey: () => {
      return window.ipcRenderer.invoke("getApiKey");
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
