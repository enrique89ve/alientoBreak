/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */

import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
// import { autoUpdater } from 'electron-updater'; //THIS WAS CONSTITUTING TO THE BUILD ERROR, CHANGED TO REQUIRE
const autoUpdater = require("electron-updater").autoUpdater    
import MenuBuilder from "./menu";
import { HandlerDetails } from "electron/main";

const osPlatform = require("os").platform();
let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === "production") {
  const sourceMapSupport = require("source-map-support");
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === "development" ||
  process.env.DEBUG_PROD === "true"
) {
  require("electron-debug")();
}

let deepUrl: any;

app.setAsDefaultProtocolClient("hive");
app.setAsDefaultProtocolClient("ecency");
app.setAsDefaultProtocolClient("esteem");

const sendProtocolUrl2Window = (u: any): void => {
  if (typeof u !== "string") {
    return;
  }

  const m = u.match(/(hive|ecency|esteem):\/\/[-a-zA-Z0-9@:%._+~#=/]{2,500}/gi);
  if (!m) {
    return;
  }

  if (m[0]) {
    mainWindow!.webContents.executeJavaScript(`protocolHandler('${m[0]}')`);
  }
};

const sLock = app.requestSingleInstanceLock();

if (!sLock) {
  app.quit();
}

app.on("open-url", (event: any, url: any) => {
  event.preventDefault();

  if (!mainWindow) {
    deepUrl = url;
    return;
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.focus();

  sendProtocolUrl2Window(url);
});

const installExtensions = async () => {
  const installer = require("electron-devtools-installer");
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ["REACT_DEVELOPER_TOOLS", "REDUX_DEVTOOLS"];

  return Promise.all(
    extensions.map((name: string) => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === "development" ||
    process.env.DEBUG_PROD === "true"
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, "resources")
    : path.join(__dirname, "../resources");

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1200,
    height: 800,
    minWidth: 992,
    minHeight: 600,
    icon: getAssetPath("icon.png"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // worldSafeExecuteJavaScript: false,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  mainWindow.webContents.on("did-finish-load", () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }

    mainWindow.webContents.setVisualZoomLevelLimits(1, 3);

    if (process.env.NODE_ENV === "production") {
      autoUpdater.autoDownload = false;

      autoUpdater.checkForUpdates();

      setInterval(() => {
        autoUpdater.checkForUpdates();
      }, 1000 * 60 * 240);
    }

    if (process.platform === "win32" || process.platform === "linux") {
      deepUrl = process.argv.slice(1);
    }

    if (deepUrl) {
      setTimeout(() => {
        sendProtocolUrl2Window(deepUrl);
      }, 3000);
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }: HandlerDetails) => {
    shell.openExternal(url);
    return { action: "allow" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
};

app.on("window-all-closed", () => {
  app.quit();
});

if (process.env.E2E_BUILD === "true") {
  app.whenReady().then(createWindow);
} else {
  app.on("ready", createWindow);
}

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});

autoUpdater.on("update-available", (info: any) => {
  mainWindow!.webContents.send("update-available", info.releaseName);
});

autoUpdater.on("download-progress", (progressObj: any) => {
  mainWindow!.webContents.send("download-progress", progressObj.percent);
});

autoUpdater.on("update-downloaded", () => {
  mainWindow!.webContents.send("update-downloaded");
});

ipcMain.on("download-update", (event: any, version: any) => {
  if (osPlatform === "win32") {
    const u = `https://github.com/ecency/ecency-vision/releases/download/${version}/Ecency-Setup-${version}.exe`;
    shell.openExternal(u);
    return;
  }

  autoUpdater.downloadUpdate();
  mainWindow!.webContents.send("download-started");
});

ipcMain.on("update-restart", () => {
  autoUpdater.quitAndInstall();
  console.log("Restart");
});
