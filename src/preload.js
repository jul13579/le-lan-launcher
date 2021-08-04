import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("ipcRenderer", {
  send: (channel, data) => {
    // whitelist channels
    let validChannels = [
      "minimizeWindow",
      "maximizeWindow",
      "closeWindow",
      "getLibrary",
      "deleteGameDir",
      "startExecutable",
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  invoke: (channel, data) => {
    // whitelist channels
    let validChannels = ["controlService"];
    if (validChannels.includes(channel)) {
      ipcRenderer.invoke(channel, data);
    }
  },
  on: (channel, func) => {
    let validChannels = ["debugMessages", "libraryChanged"];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
});
