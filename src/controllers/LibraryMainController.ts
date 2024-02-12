import fs from "fs";
import LibraryOperations from "../enums/LibraryOperations";
import { BrowserWindow } from "electron";

/**
 * Controller for game library.
 * This is only to be used by the main process, as it depends on node functionalities.
 */
export default class LibraryController {
  /**
   * Setup watcher on the library config file.
   * This will send updates to the renderer, if the library config file changes.
   * @param {BrowserWindow} win The BrowserWindow.
   * @param {string} libConfigPath The path to the library config file.
   */
  static [LibraryOperations.WATCH](win: BrowserWindow, libConfigPath: string) {
    // Setup library watcher
    // ! Use fs.watchFile as it handles ENOENT (file not existing) and also calls listener when file is created
    fs.watchFile(libConfigPath, (curr) => {
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
   * @param {string} libConfigPath The path to the library config file.
   */
  static [LibraryOperations.UNWATCH](libConfigPath: string) {
    fs.unwatchFile(libConfigPath);
  }

  /**
   * Read the library config file.
   * The game entries will be sorted by game title.
   * @param {string} libConfigPath The path to the library config file.
   * @returns The contents of the library config file.
   * @private
   */
  static _read(libConfigPath: string) {
    const lib = JSON.parse(fs.readFileSync(libConfigPath).toString());
    lib.games.sort((game1: { title: string }, game2: typeof game1) => {
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
