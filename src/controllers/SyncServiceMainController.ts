import { spawn } from "child_process";
import { BrowserWindow, shell } from "electron";
import { readFile } from "fs";
import { join } from "path";
import parse from "xml-parser";
import SyncServiceOperations from "../enums/SyncServiceOperations";
import { baseUrl } from "../config/service";

/**
 * Controller for the sync-service.
 * This is only to be used by the main process, as it depends on electron and node functionalities.
 */
export function SyncServiceMainController(win: BrowserWindow) {
  let homeDir: string;
  let apiKey: string;
  let syncServiceProcess: ReturnType<typeof spawn>;

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

  function _sendApiKey(apiKey: string) {
    win.webContents.send("setApiKey", apiKey);
  }

  function start(_homeDir: string) {
    if (!_homeDir) {
      return; // Don't try to start service if `_homeDir` is falsy
    }
    if (homeDir) {
      return; // Don't try to start service if the `homeDir` is already set
    }

    homeDir = _homeDir;

    let binPath = join(__dirname, "./syncthing");
    const args = [
      "-no-browser",
      `-home=${_homeDir}`,
      `-logfile=${join(_homeDir, "syncthing.log")}`,
      "-no-default-folder",
    ];
    if (process.platform == "win32") {
      binPath += ".exe";
      args.push("-no-console");
    }

    syncServiceProcess = spawn(binPath, args, {});

    syncServiceProcess.stdout.on("data", async (data) => {
      // Get API key if we notice that the sync service has booted
      if (!apiKey && `${data}`.match(/GUI and API listening on/)) {
        apiKey = await _readApiKey();
        _sendApiKey(apiKey);
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

      // Unset API key in renderer when service stopped
      _sendApiKey(undefined);

      _sendSyncServiceOutput("stdout", `Process exited with exit code ${code}`);
    });
  }

  function stop() {
    if (!syncServiceProcess) {
      console.warn(
        "There was no sync service running when attempting to stop it"
      );
      return;
    }
    syncServiceProcess.kill();
  }

  function _readApiKey() {
    return new Promise<string>((resolve, reject) => {
      readFile(
        join(homeDir, "config.xml"),
        {
          encoding: "utf8",
        },
        (err, data) => {
          if (err) {
            reject(err);
            return;
          }
          const xml = parse(data);
          const gui = xml.root.children.find((item) => item.name == "gui");
          resolve(gui.children.find((item) => item.name == "apikey").content);
          return;
        }
      );
    });
  }

  function openSyncthingUI() {
    shell.openExternal(baseUrl);
  }

  return {
    [SyncServiceOperations.START]: start,
    [SyncServiceOperations.STOP]: stop,
    [SyncServiceOperations.OPEN_SYNCTHING_UI]: openSyncthingUI,
  };
}
