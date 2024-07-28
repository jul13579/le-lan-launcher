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

  function _sendSyncServiceOutput(type: "stdout" | "stderr", message: string) {
    try {
      win.webContents.send("syncService", {
        type,
        message,
      });
    } catch (e) {
      // when closing the app `win.webContents` might already be destroyed
    }
  }

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
          apiKey = _readApiKey();
          win.webContents.send("setApiKey", apiKey);
        }

        _sendSyncServiceOutput("stdout", `${data}`);
      });

      syncServiceProcess.stderr.on("data", (data) => {
        _sendSyncServiceOutput("stderr", `${data}`);
      });

      syncServiceProcess.on("exit", (code) => {
        // Reset `homeDir` & `apiKey` variable when service exited
        homeDir = undefined;
        apiKey = undefined;

        _sendSyncServiceOutput(
          "stdout",
          `Process exited with exit code ${code}`
        );
      });
    }
  }

  function _readApiKey() {
    const xml = parse(
      fs.readFileSync(path.join(homeDir, "config.xml"), {
        encoding: "utf8",
      })
    );
    const gui = xml.root.children.find((item) => item.name == "gui");
    return gui.children.find((item) => item.name == "apikey").content;
  }

  function getApiKey() {
    apiKey = _readApiKey();
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
