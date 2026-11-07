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
				{ role: "selectAll" }
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
		}
	]);
};

// the renderer tells the language that was chosen in the settings
const setLanguage = (lang, send) => {
	language = locales.resolve(lang, app.getLocale());
	Menu.setApplicationMenu(buildMenu(send));
};

module.exports = { buildMenu, setLanguage };
