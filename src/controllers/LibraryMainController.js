import fs from "fs";
import LibraryOperations from "../enums/LibraryOperations";

/**
 * Controller for game library.
 * This is only to be used by the main process, as it depends on node functionalities.
 */
export default class LibraryController {
  /**
   * Setup watcher on the library config file.
   * This will send updates to the renderer, if the library config file changes.
   * @param {BrowserWindow} win The BrowserWindow.
   * @param {String} libConfigPath The path to the library config file.
   */
  static [LibraryOperations.WATCH](win, libConfigPath) {
    // Setup library watcher
    // ! Use fs.watchFile as it handles ENOENT (file not existing) and also calls listener when file is created
    this.libraryWatcher = fs.watchFile(libConfigPath, (curr) => {
      if (curr.size > 0) {
        win.webContents.send("library", this._read(libConfigPath));
      }
    });
    // If library was already existing before app start, we have to fetch the library config now
    if (fs.existsSync(libConfigPath)) {
      win.webContents.send("library", this._read(libConfigPath));
    }
  }

  /**
   * Unwatch the library config file.
   * @param {String} libConfigPath The path to the library config file.
   */
  static [LibraryOperations.UNWATCH](libConfigPath) {
    fs.unwatchFile(libConfigPath, this.libraryWatcher);
  }

  /**
   * Read the library config file.
   * The game entries will be sorted by game title.
   * @param {String} libConfigPath The path to the library config file.
   * @returns The contents of the library config file.
   * @private
   */
  static _read(libConfigPath) {
    const lib = JSON.parse(fs.readFileSync(libConfigPath));
    lib.games.sort((game1, game2) => {
      if (game1.title < game2.title) {
        return -1;
      }
      if (game1.title > game2.title) {
        return 1;
      }
      return 0;
    });
    return lib;
  }
}
