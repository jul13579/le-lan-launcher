"use strict";

import { app, BrowserWindow, dialog, ipcMain, protocol } from "electron";
import path from "path";

import WindowConfig from "./config/window";
import GameController from "./controllers/GameMainController";
import { LibraryMainController as LibraryController } from "./controllers/LibraryMainController";
import { SyncServiceMainController as SyncServiceController } from "./controllers/SyncServiceMainController";
import GameOperations from "./enums/GameOperations";
import LibraryOperations from "./enums/LibraryOperations";
import SyncServiceOperations from "./enums/SyncServiceOperations";
import WindowOperations from "./enums/WindowOperations";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const isDevelopment = process.env.NODE_ENV !== "production";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: WindowConfig.MIN_WIDTH,
    height: WindowConfig.MIN_HEIGHT,
    minWidth: WindowConfig.MIN_WIDTH,
    minHeight: WindowConfig.MIN_HEIGHT,
    frame: false,
    title: "[|LE|] LAN-Launcher",
    icon: "./images/icons/icon.png",
    webPreferences: {
      webSecurity: true,
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: !!process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
    },
  });

  win.removeMenu();

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    if (!process.env.IS_TEST) {
      win.maximize();
      win.webContents.openDevTools();
    }
  } else {
    win.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
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
    // Install React.js Devtools
    try {
      const electron_devtools_installer_module = await import(
        "electron-devtools-installer"
      );
      const { default: installExtension, REACT_DEVELOPER_TOOLS } =
        electron_devtools_installer_module;
      await installExtension(REACT_DEVELOPER_TOOLS);
    } catch (e) {
      console.error("React.js Devtools failed to install:", e.toString());
    }
  }

  // Register file protocols to load external game thumbnails and theme background images
  registerFileProtocol("game");
  registerFileProtocol("theme");

  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        shutdown();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      shutdown();
    });
  }
}

/**
 * Shorthand function to register an arbitrary protocol to use in the app.
 * @param {string} protocolName The name of the protocol.
 */
function registerFileProtocol(protocolName: string) {
  protocol.registerFileProtocol(protocolName, (request, callback) => {
    const url = request.url.replace(new RegExp(`^${protocolName}://`), "");
    // Decode URL to prevent errors when loading filenames with UTF-8 chars or chars like "#"
    const decodedUrl = decodeURI(url); // Needed in case URL contains spaces
    try {
      return callback(decodedUrl);
    } catch (error) {
      console.error(
        "ERROR: registerLocalResourceProtocol: Could not get file path:",
        error
      );
    }
  });
}

function shutdown() {
  app.quit();
}

/* -------------------------------------------------------------------------- */
/*                              IPC Configuration                             */
/* -------------------------------------------------------------------------- */
const syncServiceController = SyncServiceController(win);
ipcMain.handle(
  "controlSyncService",
  (event, action: SyncServiceOperations, ...args) => {
    return syncServiceController[action].apply(null, args);
  }
);

const libraryController = LibraryController(win);
ipcMain.on("controlLibrary", (event, action: LibraryOperations, ...args) => {
  libraryController[action].apply(null, args);
});

ipcMain.handle("controlGame", (event, action: GameOperations, ...args) => {
  // Add the `win` argument if the action is `LAUNCH`
  if (action == GameOperations.LAUNCH) {
    args = [win, ...args];
  }
  return GameController[action].apply(null, args);
});

ipcMain.on("controlWindow", async (event, action: WindowOperations) => {
  // Unmaximize on `MAXIMIZE` if window is maximized
  if (action == WindowOperations.MAXIMIZE && win.isMaximized()) {
    action = WindowOperations.UNMAXIMIZE;
  }
  win[action]();
});

ipcMain.handle("showOpenDialog", (event, options) =>
  dialog.showOpenDialog(options)
);

ipcMain.on("setProgress", (event, progress) => win.setProgressBar(progress));
