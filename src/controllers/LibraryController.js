import fs from "fs";

let libraryWatcher;

export default class LibraryController {
  static watch(win, libConfigPath) {
    // Setup library watcher
    // ! Use fs.watchFile as it handles ENOENT (file not existing) and also calls listener when file is created
    libraryWatcher = fs.watchFile(libConfigPath, (curr) => {
      if (curr.size > 0) {
        win.webContents.send("library", this.read(libConfigPath));
      }
    });
    // If library was already existing before app start, we have to fetch the library config now
    if (fs.existsSync(libConfigPath)) {
      win.webContents.send("library", this.read(libConfigPath));
    }
  }
  static unwatch(libConfigPath) {
    fs.unwatchFile(libConfigPath, libraryWatcher);
  }
  static read(libConfigPath) {
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
