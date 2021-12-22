import { spawn } from "child_process";
import path from "path";
import parse from "xml-parser";
import fs from "fs";
import SyncServiceOperations from "../enums/SyncServiceOperations";

/**
 * Controller for the sync-service.
 * This is only to be used by the main process, as it depends on electron and node functionalities.
 */
export default class SyncServiceMainController {
  /**
   * Starts a new process of the sync-service using the specified directory as home directory.
   * @param {BrowserWindow} win The BrowserWindow.
   * @param {String} homeDir The sync-service home directory.
   */
  static [SyncServiceOperations.START](win, homeDir) {
    if (homeDir) {
      this.homeDir = homeDir;

      let binPath = path.join(__dirname, "../syncthing");
      let args = [
        "-no-browser",
        `-home=${homeDir}`,
        `-logfile=${path.join(homeDir, "syncthing.log")}`,
      ];
      if (process.platform == "win32") {
        binPath += ".exe";
        args.push("-no-console");
      }

      let syncServiceProcess = spawn(binPath, args, {});

      syncServiceProcess.stdout.on("data", (data) => {
        // Get API key if we notice that the sync service has booted
        if (!this.apiKey && `${data}`.match(/GUI and API listening on/)) {
          const xml = parse(
            fs.readFileSync(path.join(homeDir, "config.xml"), {
              encoding: "utf8",
            })
          );
          const gui = xml.root.children.find((item) => item.name == "gui");
          this.apiKey = gui.children.find(
            (item) => item.name == "apikey"
          ).content;

          win.webContents.send(
            "setApiKey",
            this.apiKey
          );
        }

        win.webContents.send("syncService", {
          type: "stdout",
          message: `${data}`,
        });
      });

      syncServiceProcess.stderr.on("data", (data) => {
        win.webContents.send("syncService", {
          type: "stderr",
          message: `${data}`,
        });
      });
      
      syncServiceProcess.on("exit", (code) => {
        win.webContents.send("syncService", {
          type: "stdout",
          message: `Process exited with exit code ${code}`,
        });
      });
    }
  }
}
