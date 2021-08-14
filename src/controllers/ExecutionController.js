import { spawn } from "child_process";
import path from "path";

let syncServiceProcess;

export default {
  SyncService: {
    start: (win, homeDir) => {
      if (homeDir) {
        let binPath = path.join(__dirname, "../syncthing");
        let args = ["-no-browser", "-home=" + homeDir];
        if (process.platform == "win32") {
          binPath += ".exe";
          args.push("-no-console");
        }

        syncServiceProcess = spawn(binPath, args, {});

        syncServiceProcess.stdout.on("data", (data) => {
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
    },
    stop: () => {
      return syncServiceProcess.kill("SIGTERM");
    },
  },
};
