import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("ipcRenderer", {
  send: (channel, ...data) => {
    // whitelist channels
    const validChannels = ["controlWindow", "controlLibrary", "setProgress"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, ...data);
    }
  },
  invoke: (channel, ...data) => {
    // whitelist channels
    const validChannels = [
      "showOpenDialog",
      "controlSyncService",
      "controlGame",
    ];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...data);
    }
  },
  on: (channel, func) => {
    const validChannels = ["syncService", "setApiKey", "library", "game"];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, func);
    }
  },
  off: (channel, func) => {
    return ipcRenderer.off(channel, func);
  },
} as {
  send: typeof ipcRenderer.send;
  invoke: typeof ipcRenderer.invoke;
  on: typeof ipcRenderer.on;
  off: typeof ipcRenderer.off;
});
