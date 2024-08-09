import { BrowserWindow } from "electron";
import { existsSync, readFile, unwatchFile, watchFile } from "fs";
import LibraryOperations from "../enums/LibraryOperations";

/**
 * Controller for game library.
 * This is only to be used by the main process, as it depends on node functionalities.
 */
export function LibraryMainController(win: BrowserWindow) {
  /**
   * Setup watcher on the library config file.
   * This will send updates to the renderer, if the library config file changes.
   * @param {string} libConfigPath The path to the library config file.
   */
  function watch(libConfigPath: string) {
    // Setup library watcher
    // ! Use fs.watchFile as it handles ENOENT (file not existing) and also calls listener when file is created
    watchFile(libConfigPath, (curr) => {
      if (curr.size > 0) {
        _sendLibrary(libConfigPath);
      }
    });
    // If library was already existing before app start, we have to fetch the library config now
    if (existsSync(libConfigPath)) {
      _sendLibrary(libConfigPath);
    }
  }

  /**
   * Unwatch the library config file.
   * @param {string} libConfigPath The path to the library config file.
   */
  function unwatch(libConfigPath: string) {
    unwatchFile(libConfigPath);
  }

  /**
   * Read the library config file.
   * The game entries will be sorted by game title.
   * @param {string} libConfigPath The path to the library config file.
   * @returns The contents of the library config file.
   * @private
   */
  function _read(libConfigPath: string) {
    return new Promise<Library>((resolve, reject) => {
      readFile(libConfigPath, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        const lib = JSON.parse(data.toString()) as Library;
        lib.games.sort((game1, game2) => {
          if (game1.title < game2.title) {
            return -1;
          }
          if (game1.title > game2.title) {
            return 1;
          }
          return 0;
        });
        resolve(lib);
      });
    });
  }

  /**
   * Send the library config to the renderer
   * @param libConfigPath The path of the library config
   * @private
   */
  async function _sendLibrary(libConfigPath: string) {
    try {
      const lib = await _read(libConfigPath);
      win.webContents.send("library", lib);
    } catch (e) {
      console.error(
        `Unable to send the library configuration to the renderer: ${e}`,
      );
    }
  }

  return {
    [LibraryOperations.WATCH]: watch,
    [LibraryOperations.UNWATCH]: unwatch,
  };
}
