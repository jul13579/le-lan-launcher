import { spawn } from "child_process";
import { shell } from "electron";
import fs from "fs";
import path from "path";
import GameOperations from "../enums/GameOperations";

/**
 * Controller for games.
 * This is only to be used by the main process, as it depends on electron and node functionalities.
 */
export default class GameController {
  /**
   * Launch a game.
   * @param {BrowserWindow} win The BrowserWindow
   * @param {Object} game The sync-service folder config
   * @param {Object} config The game object of the library config file
   * @param {Object} launch The launch config
   * @param {Boolean} debug State of debug mode
   */
  static [GameOperations.LAUNCH](win, game, config, launch, debug) {
    this._setPlayerName(game, config);
    let gameProcess = spawn(path.join(game.path, launch.exe), launch.args, {
      cwd: game.path,
      detached: true, // Spawn executable detached, so it stays open if launcher is closed.
    });

    if (!debug) {
      return;
    }

    gameProcess.stdout.on("data", (data) => {
      win.webContents.send("game", {
        type: "stdout",
        message: `${data}`,
      });
    });
    gameProcess.stderr.on("data", (data) => {
      win.webContents.send("game", {
        type: "stderr",
        message: `${data}`,
      });
    });
    gameProcess.on("exit", (code) => {
      win.webContents.send("game", {
        type: "stdout",
        message: `Process exited with exit code ${code}`,
      });
    });
  }

  /**
   * Open the install folder of a game in the file explorer.
   * @param {Object} gameFolder The sync-service folder config
   */
  static browse(gameFolder) {
    shell.openPath(gameFolder.path);
  }

  /**
   * Delete a game.
   * @param {Object} gameFolder The sync-service folder config
   */
  static delete(gameFolder) {
    fs.rmdir(gameFolder.path, { recursive: true }, (error) => {
      if (error) return error;
    });
  }

  /**
   * Set the player name according for a specific game.
   * @param {Object} game The sync-service folder config
   * @param {Object} config The game object of the library config file
   * @private
   */
  static _setPlayerName(game, config) {
    if (!config.nameConfig) {
      return;
    }
    let nameConfig = config.nameConfig;
    let filePath = path.resolve(
      game.path,
      nameConfig.env ? process.env[nameConfig.env] : "",
      nameConfig.file
    );
    let nameFileContents = fs.readFileSync(filePath, { encoding: "utf8" });
    if (nameConfig.regex) {
      nameFileContents = nameFileContents.replace(
        new RegExp(nameConfig.regex),
        store.state.playerName
      );
    } else {
      nameFileContents = store.state.playerName;
    }
    fs.writeFileSync(filePath, nameFileContents, { encoding: "utf8" });
  }
}
