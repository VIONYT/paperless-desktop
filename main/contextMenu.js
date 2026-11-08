/* The context menu of one or more documents in the list: edit, assign a correspondent, tags,
 * delete. The buttons of the selection bar show a part of it. */
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

const popupContextMenu = (event, data, language) => {
	const t = (key) => locales.translate(language, key);
	// the choice is sent back as { action, documentIds, id }
	const answer = (action, id) =>
		event.sender.send("contextCommand", { action, documentIds: data.documentIds, id });

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
	const tags = choices(
		data.allTags,
		(id) => data.tags.includes(id),
		(id) => answer("tag", id)
	);

	const parts = {
		correspondent: correspondents,
		tags: tags,
		document: [
			// a single document can be opened
			...(data.documentIds.length === 1
				? [{ label: t("context.edit"), click: () => answer("edit") }, { type: "separator" }]
				: []),
			{
				label: t("context.correspondent"),
				submenu: correspondents,
				enabled: data.correspondents.length > 0
			},
			{ label: t("context.tags"), submenu: tags, enabled: data.allTags.length > 0 },
			{ type: "separator" },
			{ label: t("context.delete"), click: () => answer("delete") }
		]
	};

	Menu.buildFromTemplate(parts[data.kind]).popup({
		window: BrowserWindow.fromWebContents(event.sender)
	});
};

module.exports = { popupContextMenu };
