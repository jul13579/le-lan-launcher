import { spawn } from "child_process";
import { shell } from "electron";
import fs from "fs";
import path from "path";

export default class GameController {
  static launch(win, game, config, launch, debug) {
    this.setPlayerName(game, config);
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
  static browse(gameFolder) {
    shell.openPath(gameFolder.path);
  }
  static delete(gameFolder) {
    fs.rmdir(gameFolder.path, { recursive: true }, (error) => {
      if (error) return error;
    });
  }
  static setPlayerName(game, config) {
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
