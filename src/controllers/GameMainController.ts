import { spawn } from "child_process";
import { BrowserWindow, shell } from "electron";
import { rm, readFile, writeFile } from "fs";
import { resolve as pathResolve, normalize } from "path";
import GameOperations from "../enums/GameOperations";

const enquote = (string: string) =>
  string.includes(" ") ? `"${string}"` : string;

/**
 * Controller for games.
 * This is only to be used by the main process, as it depends on electron and node functionalities.
 */
export function GameMainController(win: BrowserWindow) {
  /**
   * Launch a game.
   * @param {Folder} gameFolder The sync-service folder config.
   * @param {Game} game The game object of the library config file.
   * @param {string} executable The executable to run
   * @param {string} playerName The name of the player
   * @param {boolean} debug State of debug mode.
   */
  async function launch(
    gameFolder: Folder,
    game: Game,
    executable: string,
    playerName: string,
    debug: boolean,
  ) {
    // Try setting the player name with the given configuration
    try {
      await _setPlayerName(gameFolder, game, playerName);
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
      normalize(executable),
      [
        enquote(normalize(gameFolder.path)),
        enquote(gameFolder.id),
        enquote(playerName),
      ],
      {
        cwd: gameFolder.path,
        detached: true, // Spawn executable detached, so it stays open if launcher is closed.
        shell:
          process.platform === "win32" &&
          (executable.endsWith(".bat") || executable.endsWith(".cmd")), // https://nodejs.org/en/blog/vulnerability/april-2024-security-releases-2
      },
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
   * @param {Folder} gameFolder The sync-service folder config.
   */
  function browse(gameFolder: Folder) {
    shell.openPath(normalize(gameFolder.path));
  }

  /**
   * Remove a game.
   * @param {Folder} gameFolder The sync-service folder config.
   * @returns {String} Error if error was encountered.
   */
  function remove(gameFolder: Folder) {
    rm(gameFolder.path, { recursive: true }, (error) => {
      if (error) return error;
    });
  }

  /**
   * Set the player name according for a specific game.
   * @param {Folder} gameFolder The sync-service folder config.
   * @param {Game} game The game object of the library config file.
   * @param {string} playerName The user's playername.
   * @private
   */
  function _setPlayerName(gameFolder: Folder, game: Game, playerName: string) {
    if (!game.nameConfig) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const nameConfig = game.nameConfig;
      const filePath = pathResolve(
        gameFolder.path,
        nameConfig.env ? process.env[nameConfig.env] : "",
        nameConfig.file,
      );
      readFile(filePath, { encoding: "utf8" }, (err, nameFileContents) => {
        if (err) {
          reject(err);
          return;
        }
        if (nameConfig.regex) {
          nameFileContents = nameFileContents.replace(
            new RegExp(nameConfig.regex),
            playerName,
          );
        } else {
          nameFileContents = playerName;
        }
        writeFile(filePath, nameFileContents, { encoding: "utf8" }, (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(undefined);
          return;
        });
      });
    });
  }

  return {
    [GameOperations.LAUNCH]: launch,
    [GameOperations.BROWSE]: browse,
    [GameOperations.DELETE]: remove,
  };
}
