"use strict";

import { app, protocol, BrowserWindow, Menu, dialog, ipcMain } from "electron";
import { execFile } from "child_process";
import fs from "fs";
import XMLParser from "xml-parser";
import AJAX from "./ajax";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import path from "path";
import store from "./store";

const isDevelopment = process.env.NODE_ENV !== "production";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1200,
    height: 720,
    minWidth: 1200,
    minHeight: 720,
    frame: false,
    title: "[|LE|] LAN-Launcher",
    icon: path.join(__static, "./icon.png"),
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      webSecurity: false, // Disabled to be able to load local images
    },
  });

  win.removeMenu();

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) {
      win.maximize();
      win.webContents.openDevTools();
    }
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    shutdown();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }

  // Register custom file protocol (gamethumb://) to load game thumbnails
  protocol.registerFileProtocol("gamethumb", (request, callback) => {
    const url = request.url.replace("gamethumb://", "");
    callback({ path: path.normalize(`${url}`) });
  });

  createWindow();
  startService();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        stopService();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      stopService();
    });
  }
}

function startService() {
  if (store.state.homeDir != false) {
    let binPath = path.join(__dirname, "../syncthing");
    let args = ["-no-browser", "-home=" + store.state.homeDir];
    if (process.platform == "win32") {
      binPath += ".exe";
      args.push("-no-console");
    }

    execFile(binPath, args, (error, stdout, stderr) => {
      if (error) {
        throw error;
      }
    });

    store.dispatch("setStarted", { started: true });

    const pollingInterval = setInterval(() => {
      let xml = XMLParser(
        fs.readFileSync(path.join(store.state.homeDir, "config.xml"), "utf8")
      );
      let gui = xml.root.children.find((item) => item.name == "gui");
      let apikey = gui.children.find((item) => item.name == "apikey").content;
      if (apikey) {
        store.dispatch("setApikey", { key: apikey });
        clearInterval(pollingInterval);
      }
    }, 5000);
  }
}

async function shutdown() {
  if (store.state.started) {
    await AJAX.Syncthing.System.shutdown()
      .then(() => {
        store.dispatch("setStarted", { started: false });
        app.quit();
      })
      .catch();
  } else {
    app.quit();
  }
}

function setPlayerName(event, game, config) {
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

function minimizeWindow(event) {
  win.minimize();
}

function maximizeWindow(event) {
  if (win.isMaximized()) {
    win.unmaximize();
  } else {
    win.maximize();
  }
}

function closeWindow(event) {
  win.close();
}

ipcMain.on("startService", startService);
ipcMain.on("setPlayerName", setPlayerName);
ipcMain.on("minimizeWindow", minimizeWindow);
ipcMain.on("maximizeWindow", maximizeWindow);
ipcMain.on("closeWindow", closeWindow);
