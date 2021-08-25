import LibraryOperations from "../enums/LibraryOperations";

/**
 * Controller for library.
 * This is only to be used by the renderer process.
 */
export default class LibraryController {
  /**
   * Setup library watcher
   * @param {String} libConfigPath The path to the library config file to watch
   * @param {Function} callback The function to call when library config changed
   */
  static watch(libConfigPath, callback) {
    window.ipcRenderer.on("library", callback);
    window.ipcRenderer.send(
      "controlLibrary",
      LibraryOperations.WATCH,
      libConfigPath
    );
  }

  /**
   * Tear-down library watcher
   * @param {String} libConfigPath The path to the config file to unwatch
   */
  static unwatch(libConfigPath) {
    window.ipcRenderer.send(
      "controlLibrary",
      LibraryOperations.UNWATCH,
      libConfigPath
    );
    window.ipcRenderer.removeAllListeners("library");
  }
}
