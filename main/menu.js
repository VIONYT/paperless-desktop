/* The menu bar. The "tabs" of the app can be reached from here as well. */
const { app, Menu } = require("electron");
const locales = require("../locales");

let language = locales.resolve("system", app.getLocale());
let send = () => {};

// what the app currently shows, items that make no sense for it are disabled:
// { signedIn: a user is signed in, document: a document is open, tabs: more than one tab is open }
let context = { signedIn: false, document: false, tabs: false };

const buildMenu = () => {
	const t = (key) => locales.translate(language, key);
	const go = (key, route, accelerator) => ({
		label: t(key),
		accelerator: accelerator,
		enabled: context.signedIn,
		click: () => send("navigate", route)
	});
	// a command is executed by the page that is open, e.g. "save" by a document
	const command = (key, name, accelerator, enabled) => ({
		label: t(key),
		accelerator: accelerator,
		enabled: enabled,
		click: () => send("command", name)
	});
	const theme = (key, name) => ({ label: t(key), click: () => send("command", "theme:" + name) });

	return Menu.buildFromTemplate([
		{
			label: app.name,
			submenu: [
				{ label: t("menu.about"), role: "about" },
				{ type: "separator" },
				go("nav.settings", "/settings", "CmdOrCtrl+,"),
				{ type: "separator" },
				{ label: t("menu.quit"), role: "quit" }
			]
		},
		{
			label: t("menu.file"),
			submenu: [
				command("menu.upload", "upload", "CmdOrCtrl+O", context.signedIn),
				{ type: "separator" },
				command("menu.save", "save", "CmdOrCtrl+S", context.document),
				command("menu.download", "download", "CmdOrCtrl+Shift+S", context.document),
				command("menu.addReminder", "addReminder", "CmdOrCtrl+Shift+R", context.document),
				command(
					"menu.deleteDocument",
					"deleteDocument",
					"CmdOrCtrl+Backspace",
					context.document
				),
				{ type: "separator" },
				{
					label: t("menu.closeTab"),
					accelerator: "CmdOrCtrl+W",
					enabled: context.tabs,
					click: () => send("closeCurrentTab")
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
				{ role: "selectAll" },
				{ type: "separator" },
				command("menu.find", "find", "CmdOrCtrl+F", context.signedIn)
			]
		},
		{
			label: t("menu.view"),
			submenu: [
				{
					label: t("menu.appearance"),
					submenu: [
						theme("settings.themeSystem", "system"),
						theme("settings.themeLight", "light"),
						theme("settings.themeDark", "dark")
					]
				},
				{ type: "separator" },
				{ role: "togglefullscreen" }
			]
		},
		{
			label: t("menu.go"),
			submenu: [
				go("nav.documents", "/documents", "CmdOrCtrl+1"),
				go("nav.correspondents", "/correspondents", "CmdOrCtrl+2"),
				go("nav.tags", "/tags", "CmdOrCtrl+3"),
				go("nav.reminders", "/reminders", "CmdOrCtrl+4"),
				{ type: "separator" },
				go("nav.logs", "/logs", "CmdOrCtrl+5")
			]
		},
		{ role: "windowMenu" }
	]);
};

const refresh = () => Menu.setApplicationMenu(buildMenu());

// INIT MENU: `sendToWindow(channel, data)` delivers the messages of the menu to the app
const initMenu = (sendToWindow) => {
	send = sendToWindow;
	refresh();
};

// the renderer tells the language that was chosen in the settings
const setLanguage = (lang) => {
	language = locales.resolve(lang, app.getLocale());
	refresh();
};

// the renderer tells what it shows, see `context`
const setContext = (newContext) => {
	context = { ...context, ...newContext };
	refresh();
};

module.exports = { initMenu, setLanguage, setContext };
