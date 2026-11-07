/* The menu bar. The "tabs" of the app can be reached from here as well. */
const { app, Menu } = require("electron");
const locales = require("../locales");

let language = locales.resolve("system", app.getLocale());

// the entry point of the renderer: sends a message to the main window
const buildMenu = (send) => {
	const t = (key) => locales.translate(language, key);
	const go = (key, route, accelerator) => ({
		label: t(key),
		accelerator: accelerator,
		click: () => send("navigate", route)
	});
	// a command is executed by the page that is open, e.g. "save" by a document
	const command = (key, name, accelerator) => ({
		label: t(key),
		accelerator: accelerator,
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
				command("menu.upload", "upload", "CmdOrCtrl+O"),
				{ type: "separator" },
				command("menu.save", "save", "CmdOrCtrl+S"),
				command("menu.download", "download", "CmdOrCtrl+Shift+S"),
				command("menu.addReminder", "addReminder", "CmdOrCtrl+Shift+R"),
				command("menu.deleteDocument", "deleteDocument", "CmdOrCtrl+Backspace"),
				{ type: "separator" },
				{
					label: t("menu.closeTab"),
					accelerator: "CmdOrCtrl+W",
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
				command("menu.find", "find", "CmdOrCtrl+F")
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

// the renderer tells the language that was chosen in the settings
const setLanguage = (lang, send) => {
	language = locales.resolve(lang, app.getLocale());
	Menu.setApplicationMenu(buildMenu(send));
};

module.exports = { buildMenu, setLanguage };
