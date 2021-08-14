import { spawn } from "child_process";
import path from "path";
import parse from "xml-parser";
import fs from "fs";

export default class SyncServiceMainController {
  static start(win, homeDir) {
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
  static stop() {
    return this.syncServiceProcess.kill("SIGTERM");
  }
  static async getApiKey(homeDir) {
    const xml = parse(
      fs.readFileSync(path.join(homeDir, "config.xml"), { encoding: "utf8" })
    );
    const gui = xml.root.children.find((item) => item.name == "gui");
    return gui.children.find((item) => item.name == "apikey").content;
  }
}
