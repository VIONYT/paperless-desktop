/* The windows of the app. */
const { app, BrowserWindow } = require("electron");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const Store = require("../store");

// Debug builds open the DevTools. They are enabled by the environment variable PAPERLESS_DEBUG=1,
// the command line flag --debug or a "debug.flag" file in the app (see `npm run package:debug`).
const DEBUG =
	process.env.PAPERLESS_DEBUG === "1" ||
	process.argv.includes("--debug") ||
	fs.existsSync(path.join(__dirname, "..", "debug.flag"));

const APP_URL = pathToFileURL(path.join(__dirname, "..", "index.html")).href;

let mainWindow = null;
let modalWindow = null;

// The renderer is isolated: no access to Node.js or Electron, only the functions of preload.js.
const webPreferences = () => ({
	preload: path.join(__dirname, "..", "preload.js"),
	sandbox: true,
	contextIsolation: true,
	nodeIntegration: false,
	webSecurity: true
});

// the app never opens other windows and never leaves its own page
const lockNavigation = (webContents) => {
	webContents.setWindowOpenHandler(() => ({ action: "deny" }));
	webContents.on("will-navigate", (event, url) => {
		if (!url.startsWith(APP_URL)) event.preventDefault();
	});
};

const getMainWindow = () => mainWindow;

const sendToMainWindow = (channel, data) => {
	if (mainWindow) mainWindow.webContents.send(channel, data);
};

const store = () =>
	new Store({
		configName: "user-preferences",
		defaults: { windowBounds: { width: 500, height: 520 } }
	});

const createMainWindow = () => {
	const preferences = store();
	const { width, height } = preferences.get("windowBounds");

	mainWindow = new BrowserWindow({
		width: width,
		height: height,
		minWidth: 400,
		minHeight: 200,
		center: true,
		titleBarStyle: "hidden",
		// vertically centers the window buttons in the toolbar of the title bar
		trafficLightPosition: { x: 16, y: 20 },
		webPreferences: webPreferences()
	});

	mainWindow.loadURL(APP_URL);
	if (DEBUG) mainWindow.webContents.openDevTools();

	mainWindow.on("close", () => preferences.set("windowBounds", mainWindow.getBounds()));
	mainWindow.on("closed", () => {
		mainWindow = null;
	});

	return mainWindow;
};

const openModal = (route, width, height) => {
	modalWindow = new BrowserWindow({
		parent: mainWindow,
		modal: true,
		width: width,
		height: height,
		webPreferences: webPreferences()
	});

	modalWindow.loadURL(APP_URL + "#" + route);
	if (DEBUG) modalWindow.webContents.openDevTools();
};

const closeModal = () => {
	if (modalWindow) modalWindow.destroy();
	modalWindow = null;
};

const resizeMainWindow = (width, height) => {
	if (!mainWindow) return;

	mainWindow.setSize(width, height, false);
	mainWindow.center();
};

const showMainWindow = () => {
	if (mainWindow) mainWindow.show();
};

// every window that is created is locked, e.g. also the ones of the DevTools
app.on("web-contents-created", (event, webContents) => lockNavigation(webContents));

module.exports = {
	createMainWindow,
	getMainWindow,
	sendToMainWindow,
	openModal,
	closeModal,
	resizeMainWindow,
	showMainWindow
};
