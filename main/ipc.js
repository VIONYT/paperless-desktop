/* The messages of the renderer. Every message is checked before it is used. */
const { app, BrowserWindow, dialog, ipcMain, nativeTheme } = require("electron");
const locales = require("../locales");
const { setAuth, getAuth } = require("./auth");
const { setLanguage, setContext } = require("./menu");
const { popupContextMenu } = require("./contextMenu");
const {
	isModalRoute,
	isDocumentId,
	clampSize,
	isServerUrl,
	parseContext,
	parseContextMenu
} = require("./validate");
const windows = require("./windows");

// the main window forwards the data of the modal windows (a new tag, ...) to the lists
const forward = (channel, target) =>
	ipcMain.on(channel, (event, args) => {
		if (args && args.data) windows.sendToMainWindow(target, args.data);
	});

const download = (event, url) => {
	const auth = getAuth();
	if (!auth || !isServerUrl(url, auth.host) || !url.includes("/api/documents/")) return;

	event.sender.downloadURL(url);
};

const openModal = (args) => {
	if (!args || !isModalRoute(args.route)) return;

	windows.openModal(args.route, clampSize(args.width, 450), clampSize(args.height, 400));
};

const setTheme = (theme) => {
	nativeTheme.themeSource = theme === "light" || theme === "dark" ? theme : "system";
};

const openDocument = (args) => {
	if (args && isDocumentId(args.id)) windows.sendToMainWindow("openDocument", String(args.id));
};

const resize = (args) => {
	if (args) windows.resizeMainWindow(clampSize(args.width, 500), clampSize(args.height, 520));
};

// shows a dialog on the window of the sender
const showMessage = (event, options) =>
	dialog.showMessageBox(BrowserWindow.fromWebContents(event.sender), options);

const showError = (event, title, message) =>
	showMessage(event, {
		type: "error",
		message: String(title),
		detail: String(message),
		buttons: ["OK"]
	});

const confirm = async (event, args) => {
	const result = await showMessage(event, {
		type: "question",
		// macOS shows the message as the bold question and the detail below it
		message: String(args.title),
		detail: String(args.message),
		buttons: [String(args.accept), String(args.cancel)],
		// Cancel is the default and the way out (Escape)
		defaultId: 1,
		cancelId: 1
	});

	return result.response === 0;
};

// the language of the app, for the texts of the context menu
let language = "system";

const registerIpc = () => {
	ipcMain.on("login", (event, arg) => setAuth(arg));
	ipcMain.on("setLanguage", (event, lang) => {
		language = lang;
		setLanguage(lang);
	});
	ipcMain.on("setContext", (event, context) => setContext(parseContext(context)));
	ipcMain.on("contextMenu", (event, data) => {
		const parsed = parseContextMenu(data);
		if (parsed) popupContextMenu(event, parsed, locales.resolve(language, app.getLocale()));
	});
	ipcMain.on("setTheme", (event, theme) => setTheme(theme));
	ipcMain.on("download", (event, url) => download(event, url));
	ipcMain.on("modal", (event, args) => openModal(args));
	ipcMain.on("closeModal", () => windows.closeModal());
	ipcMain.on("setSize", (event, args) => resize(args));
	ipcMain.on("openDevTools", (event) => event.sender.openDevTools());
	ipcMain.on("focusWindow", () => windows.showMainWindow());
	ipcMain.on("openDocument", (event, args) => openDocument(args));

	forward("tagAdd", "tagAdded");
	forward("reminderAdd", "reminderAdded");
	forward("correspondentAdd", "correspondentAdded");

	ipcMain.handle("showError", showError);
	ipcMain.handle("confirm", confirm);
};

module.exports = { registerIpc };
