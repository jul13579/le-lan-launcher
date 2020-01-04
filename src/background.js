"use strict";

import { app, protocol, BrowserWindow, Menu, dialog, ipcMain } from "electron";
import { execFile } from "child_process";
import fs from "fs";
import XMLParser from "xml-parser";
import AJAX from "./ajax";
import {
  createProtocol,
  installVueDevtools
} from "vue-cli-plugin-electron-builder/lib";
import path from "path";
import store from "./store";
const isDevelopment = process.env.NODE_ENV !== "production";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1200,
    height: 720,
    minWidth: 1200,
    minHeight: 720,
    title: "[|LE|] LAN-Launcher",
    icon: path.join(__static, "./icon.png"),
    webPreferences: {
      nodeIntegration: true
    }
  });

  // Menu.setApplicationMenu(null);
  win.removeMenu();

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }

  win.on("closed", () => {
    win = null;
  });
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    AJAX.Syncthing.System.shutdown()
      .then(() => {
        this.$store.dispatch("setStarted", { started: false });
        this.$toasted.global.success("Service gestoppt");
      })
      .catch(() => {
        this.$toasted.global.error("Fehler beim Stoppen des Services");
      });
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
    try {
      await installVueDevtools();
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  createWindow();

  store.subscribe((mutation, payload) => {
    if (mutation.type == "homeDir") {
      startService();
    }
  });
  startService();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", data => {
      if (data === "graceful-exit") {
        AJAX.Syncthing.System.shutdown()
          .then(() => {
            this.$store.dispatch("setStarted", { started: false });
            this.$toasted.global.success("Service gestoppt");
          })
          .catch(() => {
            this.$toasted.global.error("Fehler beim Stoppen des Services");
          });
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      AJAX.Syncthing.System.shutdown()
        .then(() => {
          this.$store.dispatch("setStarted", { started: false });
          this.$toasted.global.success("Service gestoppt");
        })
        .catch(() => {
          this.$toasted.global.error("Fehler beim Stoppen des Services");
        });
      app.quit();
    });
  }
}

function startService() {
  if (store.state.homeDir != false) {
    let binPath = "./resources/syncthing";
    let args = ["-no-browser", "-home=" + store.state.homeDir];
    if (process.platform == "win32") {
      binPath += ".exe";
      args.push("-no-console");
    }

    execFile(binPath, args, function(err, data) {
      // do nothing
    });

    store.dispatch("setStarted", { started: true });

    const pollingInterval = setInterval(() => {
      let xml = XMLParser(
        fs.readFileSync(path.join(store.state.homeDir, "config.xml"), "utf8")
      );
      let gui = xml.root.children.find(item => item.name == "gui");
      let apikey = gui.children.find(item => item.name == "apikey").content;
      if (apikey) {
        store.dispatch("setApikey", { key: apikey });
        clearInterval(pollingInterval);
      }
    }, 5000);
  }
}

ipcMain.on("startService", () => startService());
