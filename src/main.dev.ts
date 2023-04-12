/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';


// @ts-ignore
import express from 'express';
import api from './app/controllers'

const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const app_express = express();
const port = 3000;
const httpServer = http.createServer(app_express);

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets');

  const PRELOAD_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets/preload.js')
    : path.join(__dirname, '../assets/preload.js');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  app_express.use(cors());
  app_express.use(bodyParser.json());
  app_express.use(bodyParser.urlencoded({extended:true}));
  app_express.use('/loadBalances', api.verifyAccount);
  app_express.use('/verify', api.verifyAccount);
  app_express.use('/marketBuyOrder', api.marketBuyOrder);
  app_express.use('/limitSellOrder', api.limitSellOrder);
  app_express.use('/stopLossLimitSellOrder', api.stopLossLimitSellOrder);

  app_express.use('/', express.static(path.join(app.getAppPath(), 'assets')));

  httpServer.listen(port, () => {
    console.log(`http://localhost:${port}`);
    mainWindow = new BrowserWindow({
      show: false,
      width: 705,
      height: 820,
      icon: getAssetPath('icon.png'),
      webPreferences: {
        nodeIntegration: true,
        preload: PRELOAD_PATH
      },
      resizable: false
    });
    mainWindow.removeMenu();
    mainWindow.loadURL(`file://${__dirname}/index.html`).catch((error) => {
      console.log('error', error);
    });

    // @TODO: Use 'ready-to-show' event
    //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event

    mainWindow.webContents.on('did-finish-load', () => {
      if (!mainWindow) {
        throw new Error('"mainWindow" is not defined');
      }
      if (process.env.START_MINIMIZED) {
        mainWindow.minimize();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    const menuBuilder = new MenuBuilder(mainWindow);
    menuBuilder.buildMenu();

    mainWindow.webContents.openDevTools();

    // Open urls in the user's browser
    mainWindow.webContents.on('new-window', (event, url) => {
      event.preventDefault();
      shell.openExternal(url);
    });

  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(createWindow).catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});
