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
   * @param {BrowserWindow} win The BrowserWindow.
   * @param {Object} game The sync-service folder config.
   * @param {Object} config The game object of the library config file.
   * @param {String} executable The executable to run
   * @param {String} playerName The name of the player
   * @param {Boolean} debug State of debug mode.
   */
  static [GameOperations.LAUNCH](win, game, config, executable, playerName, debug) {
    this._setPlayerName(game, config, playerName);
    let gameProcess = spawn(path.normalize(executable), [
      path.normalize(game.path),
      game.id,
      playerName,
    ], {
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
   * @param {Object} gameFolder The sync-service folder config.
   */
  static [GameOperations.BROWSE](gameFolder) {
    shell.openPath(path.normalize(gameFolder.path));
  }

  /**
   * Delete a game.
   * @param {Object} gameFolder The sync-service folder config.
   * @returns {String} Error if error was encountered.
   */
  static [GameOperations.DELETE](gameFolder) {
    fs.rm(gameFolder.path, { recursive: true }, (error) => {
      if (error) return error;
    });
  }

  /**
   * Set the player name according for a specific game.
   * @param {Object} game The sync-service folder config.
   * @param {Object} config The game object of the library config file.
   * @param {String} playerName The user's playername.
   * @private
   */
  static _setPlayerName(game, config, playerName) {
    if (!config || !config.nameConfig) {
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
        playerName
      );
    } else {
      nameFileContents = playerName;
    }
    fs.writeFileSync(filePath, nameFileContents, { encoding: "utf8" });
  }
}
