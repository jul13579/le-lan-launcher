import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("ipcRenderer", {
  send: (channel, data) => {
    // whitelist channels
    let validChannels = ["controlWindow", "watchLibrary", "unwatchLibrary"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  invoke: (channel, data) => {
    // whitelist channels
    let validChannels = [
      "showOpenDialog",
      "startSyncService",
      "getApiKey",
      "readLibrary",
    ];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
  },
  on: (channel, func) => {
    let validChannels = ["syncService", "library"];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, func);
    }
  },
  removeAllListeners: () => {
    return ipcRenderer.removeAllListeners();
  },
});
