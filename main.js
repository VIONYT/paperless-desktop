/* Entry point of the main process of Paperless Desktop. */
const { app, BrowserWindow } = require("electron");
const { registerIpc } = require("./main/ipc");
const { initMenu } = require("./main/menu");
const { setupSession } = require("./main/session");
const windows = require("./main/windows");

const start = () => {
	setupSession();
	registerIpc();
	initMenu(windows.sendToMainWindow);
	windows.createMainWindow();
};

app.on("ready", start);

// on macOS the app stays open until it is quit explicitly
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) windows.createMainWindow();
});
