/* The context menu of a document in the list: edit, assign a correspondent, tags, delete. */
const { BrowserWindow, Menu } = require("electron");
const locales = require("../locales");

// the entries to choose from, with a check mark at the selected ones
const choices = (entries, isSelected, onClick) =>
	entries.map((entry) => ({
		label: entry.name,
		type: "checkbox",
		checked: isSelected(entry.id),
		click: () => onClick(entry.id)
	}));

// POPUP: shows the menu, the choice is sent back as { action, documentId, id }
const popupContextMenu = (event, data, language) => {
	const t = (key) => locales.translate(language, key);
	const answer = (action, id) =>
		event.sender.send("contextCommand", { action, documentId: data.documentId, id });

	const correspondents = [
		{
			label: t("context.none"),
			type: "checkbox",
			checked: data.correspondent === null,
			click: () => answer("correspondent", null)
		},
		{ type: "separator" },
		...choices(
			data.correspondents,
			(id) => id === data.correspondent,
			(id) => answer("correspondent", id)
		)
	];

	const menu = Menu.buildFromTemplate([
		{ label: t("context.edit"), click: () => answer("edit") },
		{ type: "separator" },
		{
			label: t("context.correspondent"),
			submenu: correspondents,
			enabled: data.correspondents.length > 0
		},
		{
			label: t("context.tags"),
			submenu: choices(
				data.allTags,
				(id) => data.tags.includes(id),
				(id) => answer("tag", id)
			),
			enabled: data.allTags.length > 0
		},
		{ type: "separator" },
		{ label: t("context.delete"), click: () => answer("delete") }
	]);

	menu.popup({ window: BrowserWindow.fromWebContents(event.sender) });
};

module.exports = { popupContextMenu };
