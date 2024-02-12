import { spawn } from "child_process";
import { BrowserWindow, shell } from "electron";
import fs from "fs";
import path from "path";
import parse from "xml-parser";
import SyncServiceOperations from "../enums/SyncServiceOperations";

/**
 * Controller for the sync-service.
 * This is only to be used by the main process, as it depends on electron and node functionalities.
 */
export default class SyncServiceMainController {
  private static homeDir: string;
  private static apiKey: any;

  /**
   * Starts a new process of the sync-service using the specified directory as home directory.
   * @param {BrowserWindow} win The BrowserWindow.
   * @param {string} homeDir The sync-service home directory.
   */
  static [SyncServiceOperations.START](win: BrowserWindow, homeDir: string) {
    if (homeDir) {
      this.homeDir = homeDir;

      let binPath = path.join(__dirname, "../syncthing");
      const args = [
        "-no-browser",
        `-home=${homeDir}`,
        `-logfile=${path.join(homeDir, "syncthing.log")}`,
        "-no-default-folder",
      ];
      if (process.platform == "win32") {
        binPath += ".exe";
        args.push("-no-console");
      }

      const syncServiceProcess = spawn(binPath, args, {});

      syncServiceProcess.stdout.on("data", (data) => {
        // Get API key if we notice that the sync service has booted
        if (!this.apiKey && `${data}`.match(/GUI and API listening on/)) {
          this.apiKey = this._readApiKey(homeDir);
          win.webContents.send("setApiKey", this.apiKey);
        }

        try {
          win.webContents.send("syncService", {
            type: "stdout",
            message: `${data}`,
          });
        } catch (e) {
          // when closing the app `win.webContents` might already be destroyed
        }
      });

      syncServiceProcess.stderr.on("data", (data) => {
        try {
          win.webContents.send("syncService", {
            type: "stderr",
            message: `${data}`,
          });
        } catch (e) {
          // when closing the app `win.webContents` might already be destroyed
        }
      });

      syncServiceProcess.on("exit", (code) => {
        try {
          win.webContents.send("syncService", {
            type: "stdout",
            message: `Process exited with exit code ${code}`,
          });
        } catch (e) {
          // when closing the app `win.webContents` might already be destroyed
        }
      });
    }
  }

  private static _readApiKey(homeDir: string) {
    const xml = parse(
      fs.readFileSync(path.join(homeDir, "config.xml"), {
        encoding: "utf8",
      })
    );
    const gui = xml.root.children.find((item) => item.name == "gui");
    return gui.children.find((item) => item.name == "apikey").content;
  }

  /**
   * Get the API key of the sync-service from its configuration file.
   * @returns {String} The key of the REST API of the sync-service.
   */
  static [SyncServiceOperations.GET_API_KEY](homeDir: string) {
    this.apiKey = this._readApiKey(homeDir);
    return this.apiKey;
  }

  /**
   * Open the Syncthing UI in the system's default browser.
   */
  static [SyncServiceOperations.OPEN_SYNCTHING_UI]() {
    shell.openExternal("https://localhost:8384/");
  }
}
