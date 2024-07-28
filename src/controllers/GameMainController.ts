import { spawn } from "child_process";
import { BrowserWindow, shell } from "electron";
import fs from "fs";
import path from "path";
import GameOperations from "../enums/GameOperations";

/**
 * Controller for games.
 * This is only to be used by the main process, as it depends on electron and node functionalities.
 */
export function GameMainController(win: BrowserWindow) {
  /**
   * Launch a game.
   * @param {GameFolder} gameFolder The sync-service folder config.
   * @param {Config} config The game object of the library config file.
   * @param {string} executable The executable to run
   * @param {string} playerName The name of the player
   * @param {boolean} debug State of debug mode.
   */
  function launch(
    gameFolder: GameFolder,
    config: Config,
    executable: string,
    playerName: string,
    debug: boolean
  ) {
    // Try setting the player name with the given configuration
    try {
      _setPlayerName(gameFolder, config, playerName);
    } catch (e) {
      // There will be cases where this errors, e.g. if the configuration is not correct or the file in which the player
      // name should be changed is not yet existing (because the game did not yet run). The game should however launch
      // regardless of these errors, without having the player name set. Setting the player name should however work on
      // the second launch of the game for this scenario.
      win.webContents.send("game", {
        type: "stderr",
        message: `Could not set player name because of below exception:\n${e}`,
      });
    }

    const gameProcess = spawn(
      path.normalize(executable),
      [path.normalize(gameFolder.path), gameFolder.id, playerName],
      {
        cwd: gameFolder.path,
        detached: true, // Spawn executable detached, so it stays open if launcher is closed.
      }
    );

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
   * @param {GameFolder} gameFolder The sync-service folder config.
   */
  function browse(gameFolder: GameFolder) {
    shell.openPath(path.normalize(gameFolder.path));
  }

  /**
   * Remove a game.
   * @param {GameFolder} gameFolder The sync-service folder config.
   * @returns {String} Error if error was encountered.
   */
  function remove(gameFolder: GameFolder) {
    fs.rm(gameFolder.path, { recursive: true }, (error) => {
      if (error) return error;
    });
  }

  /**
   * Set the player name according for a specific game.
   * @param {GameFolder} gameFolder The sync-service folder config.
   * @param {Config} config The game object of the library config file.
   * @param {string} playerName The user's playername.
   * @private
   */
  function _setPlayerName(
    gameFolder: GameFolder,
    config: Config,
    playerName: string
  ) {
    if (!config || !config.nameConfig) {
      return;
    }
    const nameConfig = config.nameConfig;
    const filePath = path.resolve(
      gameFolder.path,
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

  return {
    [GameOperations.LAUNCH]: launch,
    [GameOperations.BROWSE]: browse,
    [GameOperations.DELETE]: remove,
  };
}
