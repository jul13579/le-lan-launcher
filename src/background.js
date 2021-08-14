"use strict";

import { app, protocol, BrowserWindow, ipcMain, dialog } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import path from "path";

import WindowOperations from "./enums/WindowOperations";
import WindowConfig from "./config/window";
import SyncServiceController from "./controllers/SyncServiceMainController";
import LibraryController from "./controllers/LibraryController";

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
    width: WindowConfig.MIN_WIDTH,
    height: WindowConfig.MIN_HEIGHT,
    minWidth: WindowConfig.MIN_WIDTH,
    minHeight: WindowConfig.MIN_HEIGHT,
    frame: false,
    title: "[|LE|] LAN-Launcher",
    icon: path.join(__static, "./icon.png"), // eslint-disable-line no-undef
    webPreferences: {
      webSecurity: true,
      preload: path.join(__dirname, "preload.js"),
      // Use pluginOptions.nodeIntegration, leave this alone
      // See https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
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
      // eslint-disable-next-line no-console
      console.error("Vue Devtools failed to install:", e.toString());
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
 * @param {String} protocolName The name of the protocol.
 */
function registerFileProtocol(protocolName) {
  protocol.registerFileProtocol(protocolName, (request, callback) => {
    const url = request.url.replace(new RegExp(`^${protocolName}:\//`), "");
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
  if (SyncServiceController.stop()) {
    app.quit();
      }
}

// eslint-disable-next-line no-unused-vars
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

/* -------------------------------------------------------------------------- */
/*                              IPC Configuration                             */
/* -------------------------------------------------------------------------- */
ipcMain.handle("startSyncService", (event, ...args) =>
  SyncServiceController.start(win, ...args)
);
ipcMain.handle("getApiKey", (event, ...args) =>
  SyncServiceController.getApiKey(...args)
);

ipcMain.on("watchLibrary", (event, ...args) =>
  LibraryController.watch(win, ...args)
);
ipcMain.on("unwatchLibrary", (event, ...args) =>
  LibraryController.unwatch(...args)
);
ipcMain.handle("readLibrary", (event, ...args) =>
  LibraryController.read(...args)
);

// eslint-disable-next-line no-unused-vars
ipcMain.on("controlWindow", async (event, action) => {
  switch (action) {
    case WindowOperations.MAXIMIZE:
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
      break;
    case WindowOperations.MINIMIZE:
      win.minimize();
      break;
    case WindowOperations.CLOSE:
      win.close();
      break;
  }
});

// eslint-disable-next-line no-unused-vars
ipcMain.handle("showOpenDialog", (event, options) => {
  return dialog.showOpenDialog(options);
});
