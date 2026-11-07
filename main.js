/* eslint-disable */

const { app, Menu, BrowserWindow, session, ipcMain, nativeTheme } = require("electron");
const remoteMain = require("@electron/remote/main");
const { download } = require("electron-dl");
const locales = require("./locales");
const path = require("path");
const url = require("url");

// the renderer uses the remote module (dialogs, current window)
remoteMain.initialize();

// Debug builds open the DevTools. They are enabled by the environment variable PAPERLESS_DEBUG=1,
// the command line flag --debug or a "debug.flag" file in the app (see `npm run package:debug`).
const DEBUG =
	process.env.PAPERLESS_DEBUG === "1" ||
	process.argv.includes("--debug") ||
	require("fs").existsSync(path.join(__dirname, "debug.flag"));

// https://medium.com/@ccnokes/how-to-store-user-data-in-electron-3ba6bf66bc1e#.b6j3oex0s
const Store = require("./store.js");

// keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow;
var modalWindow;

// authentication of the paperless-ngx API: { host: "https://paperless.local", token: "..." }
var auth = null;

/*
 ___ _
/ __| |_ ___ _ _ ___
\__ \  _/ _ \ '_/ -_)
|___/\__\___/_| \___|

*/

// First instantiate the class
const store = new Store({
	// We'll call our data file 'user-preferences'
	configName: "user-preferences",
	defaults: {
		// 800x600 is the default size of our window
		windowBounds: { width: 500, height: 520 }
	}
});

/*
 __  __
|  \/  |___ _ _ _  _
| |\/| / -_) ' \ || |
|_|  |_\___|_||_\_,_|

*/

// the language of the menu, the renderer reports the language chosen in the settings (setLanguage)
var language = locales.resolve("system", app.getLocale());

// send a message to the main window, if there is one
function sendToMainWindow(channel, arg) {
	if (mainWindow) mainWindow.webContents.send(channel, arg);
}

// create the menu in the current language
function buildMenu() {
	const t = (key) => locales.translate(language, key);

	// the "tabs" of the app can be reached from the menu bar as well
	const go = (label, route, accelerator) => ({
		label: label,
		accelerator: accelerator,
		click: () => sendToMainWindow("navigate", route)
	});

	return Menu.buildFromTemplate([
		{
			label: app.name,
			submenu: [
				{
					label: t("menu.about"),
					role: "about"
				},
				{ type: "separator" },
				go(t("nav.settings"), "/settings", "CmdOrCtrl+,"),
				{ type: "separator" },
				{
					label: t("menu.quit"),
					accelerator: "CmdOrCtrl+Q",
					click: function() {
						app.quit();
					}
				}
			]
		},
		{
			label: t("menu.file"),
			submenu: [
				{
					label: t("menu.closeTab"),
					accelerator: "CmdOrCtrl+W",
					click: function() {
						sendToMainWindow("closeCurrentTab", true);
					}
				}
			]
		},
		{
			label: t("menu.edit"),
			submenu: [
				{ role: "undo" },
				{ role: "redo" },
				{ type: "separator" },
				{ role: "cut" },
				{ role: "copy" },
				{ role: "paste" },
				{ role: "selectAll" }
			]
		},
		{
			label: t("menu.go"),
			submenu: [
				go(t("nav.documents"), "/documents", "CmdOrCtrl+1"),
				go(t("nav.correspondents"), "/correspondents", "CmdOrCtrl+2"),
				go(t("nav.tags"), "/tags", "CmdOrCtrl+3"),
				go(t("nav.reminders"), "/reminders", "CmdOrCtrl+4"),
				{ type: "separator" },
				go(t("nav.logs"), "/logs", "CmdOrCtrl+5")
			]
		}
	]);
}

/*
 _          __  __      _
(_)_ __  __|  \/  |__ _(_)_ _
| | '_ \/ _| |\/| / _` | | ' \
|_| .__/\__|_|  |_\__,_|_|_||_|
|_|

*/

// listen for login message from the renderer
ipcMain.on("login", (event, arg) => {
	if (typeof arg === "string") arg = JSON.parse(arg);
	auth = arg && arg.host && arg.token ? arg : null;
});

// listen to the language setting, the menu is translated
ipcMain.on("setLanguage", (event, lang) => {
	language = locales.resolve(lang, app.getLocale());
	Menu.setApplicationMenu(buildMenu());
});

// listen to the appearance setting ("system", "light" or "dark")
ipcMain.on("setTheme", (event, theme) => {
	nativeTheme.themeSource = theme === "light" || theme === "dark" ? theme : "system";
});

// listen or URL download requests
ipcMain.on("download", (e, args) => {
	const win = BrowserWindow.fromWebContents(e.sender) || mainWindow;
	download(win, args.url).catch((err) => console.error("Download failed", err));
});

// listen to open a modal window
ipcMain.on("modal", (e, args) => {
	// init modal view
	modalWindow = new BrowserWindow({
		parent: mainWindow,
		modal: true,
		show: false,
		width: args.width,
		height: args.height,
		webPreferences: webPreferences()
	});
	remoteMain.enable(modalWindow.webContents);

	// build the url
	modalWindow.loadURL(
		url.format({
			pathname: path.join(__dirname, "index.html"),
			protocol: "file:",
			slashes: true
		}) +
			"#" +
			args.route
	);

	if (DEBUG) modalWindow.webContents.openDevTools();

	// once the modal is ready to show, open it
	modalWindow.once("ready-to-show", () => {});
	modalWindow.show();
});

// listen on close modal
ipcMain.on("closeModal", () => {
	if (modalWindow) modalWindow.hide();
});

// listen on tag add
ipcMain.on("tagAdd", (e, args) => {
	if (args.data) {
		mainWindow.webContents.send("tagAdded", args.data);
	}
});

// listen on reminder add
ipcMain.on("reminderAdd", (e, args) => {
	if (args.data) {
		mainWindow.webContents.send("reminderAdded", args.data);
	}
});

// listen on correspondent add
ipcMain.on("correspondentAdd", (e, args) => {
	if (args.data) {
		mainWindow.webContents.send("correspondentAdded", args.data);
	}
});

// listen on resizing the main window
ipcMain.on("setSize", (e, args) => {
	mainWindow.setSize(args.width, args.height, false);
	mainWindow.center();
});

// listen to open the dev tools
ipcMain.on("openDevTools", (e, args) => {
	mainWindow.webContents.openDevTools();
});

// show and focus the main window
ipcMain.on("focusWindow", (e, args) => {
	mainWindow.show();
});

// listen on correspondent add
ipcMain.on("openDocument", (e, args) => {
	if (args.id) {
		mainWindow.webContents.send("openDocument", args.id);
	}
});

/* 
 __  __      _       __      ___         _
|  \/  |__ _(_)_ _   \ \    / (_)_ _  __| |_____ __ __
| |\/| / _` | | ' \   \ \/\/ /| | ' \/ _` / _ \ V  V /
|_|  |_\__,_|_|_||_|   \_/\_/ |_|_||_\__,_\___/\_/\_/

*/

/**
 * The web preferences of all windows. The renderer is our own code that talks to the
 * paperless server (which usually lives on another origin), so it needs node integration
 * and has to be allowed to do cross origin requests.
 */
function webPreferences() {
	return {
		nodeIntegration: true,
		contextIsolation: false,
		webSecurity: false,
		// the PDF viewer of Chromium renders the documents
		plugins: true
	};
}

/**
 * Creates a new application window
 */
function createWindow() {
	Menu.setApplicationMenu(buildMenu());

	// First we'll get our height and width. This will be the defaults if there wasn't anything saved
	let { width, height } = store.get("windowBounds");

	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: width,
		height: height,
		minHeight: 200,
		minWidth: 400,
		titleBarStyle: "hidden",
		// vertically centers the window buttons in the toolbar of the title bar
		trafficLightPosition: { x: 16, y: 20 },
		webPreferences: webPreferences(),
		center: true
	});
	remoteMain.enable(mainWindow.webContents);

	// and load the index.html of the app.
	mainWindow.loadURL(
		url.format({
			pathname: path.join(__dirname, "index.html"),
			protocol: "file:",
			slashes: true
		})
	);

	// ON BEFORE SEND HEADERS
	// Images and PDFs are loaded by the browser itself, so the API token of paperless-ngx
	// is attached here. It is only sent to the configured paperless server.
	session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
		if (auth !== null && details.url.indexOf(auth.host) === 0) {
			details.requestHeaders["Authorization"] = "Token " + auth.token;
		}

		callback({ cancel: false, requestHeaders: details.requestHeaders });
	});

	// Open the DevTools.
	if (DEBUG) mainWindow.webContents.openDevTools();

	// Emitted when the window is closed.
	mainWindow.on("closed", () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});

	// The BrowserWindow class extends the node.js core EventEmitter class, so we use that API
	// to listen to events on the BrowserWindow. The resize event is emitted when the window size changes.
	mainWindow.on("resize", () => {
		// The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
		// the height, width, and x and y coordinates.
		let { width, height } = mainWindow.getBounds();
		// Now that we have them, save them using the `set` method.
		store.set("windowBounds", { width, height });
	});
}

/*
   _
  /_\  _ __ _ __
 / _ \| '_ \ '_ \
/_/ \_\ .__/ .__/
      |_|  |_|
*/

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
	// on OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	// on OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});
