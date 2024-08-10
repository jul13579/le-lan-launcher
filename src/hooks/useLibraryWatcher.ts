import { IpcRenderer } from "electron";
import LibraryOperations from "../enums/LibraryOperations";

export const useLibraryWatcher = () => ({
  /**
   * Setup library watcher.
   * @param {string} libConfigPath The path to the library config file to watch.
   * @param {Function} callback The function to call when library config changed.
   */
  watch: (
    libConfigPath: string,
    callback: Parameters<IpcRenderer["on"]>[1],
  ) => {
    window.ipcRenderer.on("library", callback);
    window.ipcRenderer.send(
      "controlLibrary",
      LibraryOperations.WATCH,
      libConfigPath,
    );
  },

  /**
   * Tear-down library watcher.
   * @param {string} libConfigPath The path to the config file to unwatch.
   */
  unwatch: (
    libConfigPath: string,
    callback: Parameters<IpcRenderer["on"]>[1],
  ) => {
    window.ipcRenderer.send(
      "controlLibrary",
      LibraryOperations.UNWATCH,
      libConfigPath,
    );
    window.ipcRenderer.off("library", callback);
  },
});
