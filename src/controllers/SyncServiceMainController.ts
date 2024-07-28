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
export function SyncServiceMainController(win: BrowserWindow) {
  let homeDir: string;
  let apiKey: string;

  function startSyncService(_homeDir: string) {
    if (_homeDir) {
      homeDir = _homeDir;

      let binPath = path.join(__dirname, "../syncthing");
      const args = [
        "-no-browser",
        `-home=${_homeDir}`,
        `-logfile=${path.join(_homeDir, "syncthing.log")}`,
        "-no-default-folder",
      ];
      if (process.platform == "win32") {
        binPath += ".exe";
        args.push("-no-console");
      }

      const syncServiceProcess = spawn(binPath, args, {});

      syncServiceProcess.stdout.on("data", (data) => {
        // Get API key if we notice that the sync service has booted
        if (!apiKey && `${data}`.match(/GUI and API listening on/)) {
          apiKey = _readApiKey(_homeDir);
          win.webContents.send("setApiKey", apiKey);
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

  function _readApiKey(homeDir: string) {
    const xml = parse(
      fs.readFileSync(path.join(homeDir, "config.xml"), {
        encoding: "utf8",
      })
    );
    const gui = xml.root.children.find((item) => item.name == "gui");
    return gui.children.find((item) => item.name == "apikey").content;
  }

  function getApiKey(homeDir: string) {
    apiKey = _readApiKey(homeDir);
    return apiKey;
  }

  function openSyncthingUI() {
    shell.openExternal("https://localhost:8384/");
  }

  return {
    [SyncServiceOperations.START]: startSyncService,
    [SyncServiceOperations.GET_API_KEY]: getApiKey,
    [SyncServiceOperations.OPEN_SYNCTHING_UI]: openSyncthingUI,
  };
}
