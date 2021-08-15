import { spawn } from "child_process";
import path from "path";
import parse from "xml-parser";
import fs from "fs";
import { BrowserWindow } from "electron";
import SyncServiceOperations from "../enums/SyncServiceOperations";

/**
 * Controller for the sync-service.
 * This is only to be used by the main process, as it depends on electron and node functionalities.
 */
export default class SyncServiceMainController {
  /**
   * Starts a new process of the sync-service using the specified directory as home directory.
   * @param {BrowserWindow} win The BrowserWindow
   * @param {String} homeDir The sync-service home directory
   */
  static [SyncServiceOperations.START](win, homeDir) {
    if (homeDir) {
      let binPath = path.join(__dirname, "../syncthing");
      let args = ["-no-browser", "-home=" + homeDir];
      if (process.platform == "win32") {
        binPath += ".exe";
        args.push("-no-console");
      }

      this.syncServiceProcess = spawn(binPath, args, {});

      this.syncServiceProcess.stdout.on("data", (data) => {
        win.webContents.send("syncService", {
          type: "stdout",
          message: `${data}`,
        });
      });
      this.syncServiceProcess.stderr.on("data", (data) => {
        win.webContents.send("syncService", {
          type: "stderr",
          message: `${data}`,
        });
      });
      this.syncServiceProcess.on("exit", (code) => {
        win.webContents.send("syncService", {
          type: "stdout",
          message: `Process exited with exit code ${code}`,
        });
      });
    }
  }

  /**
   * Get the API key of the sync-service from its configuration file.
   * @param {String} homeDir The sync-service home directory
   * @returns The key in order to access the REST API of the sync-service
   */
  static async [SyncServiceOperations.GET_API_KEY](homeDir) {
    const xml = parse(
      fs.readFileSync(path.join(homeDir, "config.xml"), { encoding: "utf8" })
    );
    const gui = xml.root.children.find((item) => item.name == "gui");
    return gui.children.find((item) => item.name == "apikey").content;
  }

  /**
   * Stops the sync-service using `SIGTERM`.
   * @returns `true` if stop succeeded, else `false`
   */
  static stop() {
    // If we have no process handle of the sync-service, always return `true`
    if (!this.syncServiceProcess) {
      return true;
    }
    return this.syncServiceProcess.kill("SIGTERM");
  }
}
