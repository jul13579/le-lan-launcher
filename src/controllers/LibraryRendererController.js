import LibraryOperations from "../enums/LibraryOperations";

export default class LibraryController {
  static watch(libConfigPath, callback) {
    window.ipcRenderer.on("library", callback);
    window.ipcRenderer.send(
      "controlLibrary",
      LibraryOperations.WATCH,
      libConfigPath
    );
  }

  static unwatch(libConfigPath) {
    window.ipcRenderer.send(
      "controlLibrary",
      LibraryOperations.UNWATCH,
      libConfigPath
    );
  }
}
