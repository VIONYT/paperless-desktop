/* Checks of everything the renderer sends to the main process. The renderer only shows data
 * of the paperless server, but it is still treated as untrusted. */

// the routes of the modal windows, e.g. "/modal/tags/add" or "/modal/reminders/add/12"
const isModalRoute = (route) => /^\/modal\/[a-z]+\/add(\/\d+)?$/.test(String(route));

// the id of a document
const isDocumentId = (id) => /^\d{1,12}$/.test(String(id));

// the size of a window, in pixels
const clampSize = (value, fallback) => {
	const number = Number(value);
	return Number.isFinite(number) ? Math.min(Math.max(Math.round(number), 200), 4000) : fallback;
};

// a URL below the given server, with "/api/documents/" as path of a document
const isServerUrl = (url, host) => {
	if (typeof url !== "string" || typeof host !== "string" || host.length === 0) return false;

	return url.startsWith(host + "/") && !url.includes("..");
};

// the credentials of the paperless server: { host: "https://paperless.local", token: "..." }
const parseAuth = (arg) => {
	if (!arg || typeof arg.host !== "string" || typeof arg.token !== "string") return null;

	try {
		const url = new URL(arg.host);
		const isWeb = url.protocol === "http:" || url.protocol === "https:";

		return isWeb && arg.token.length > 0
			? { host: arg.host.replace(/\/+$/, ""), token: arg.token }
			: null;
	} catch (e) {
		return null;
	}
};

// what the app shows: three flags, everything else is ignored
const parseContext = (arg) => {
	const source = arg || {};
	const flags = {};

	["signedIn", "document", "tabs"].forEach((key) => {
		if (typeof source[key] === "boolean") flags[key] = source[key];
	});

	return flags;
};

const MAX_ENTRIES = 500;

// a list of { id: 1, name: "..." }
const parseEntries = (list) =>
	(Array.isArray(list) ? list : [])
		.filter((entry) => entry && Number.isInteger(entry.id) && typeof entry.name === "string")
		.slice(0, MAX_ENTRIES)
		.map((entry) => ({ id: entry.id, name: entry.name.slice(0, 100) }));

// the data of the context menu of a document: the document and what can be assigned to it
const parseContextMenu = (arg) => {
	if (!arg || !Number.isInteger(arg.documentId)) return null;

	return {
		documentId: arg.documentId,
		correspondent: Number.isInteger(arg.correspondent) ? arg.correspondent : null,
		tags: (Array.isArray(arg.tags) ? arg.tags : [])
			.filter(Number.isInteger)
			.slice(0, MAX_ENTRIES),
		correspondents: parseEntries(arg.correspondents),
		allTags: parseEntries(arg.allTags)
	};
};

module.exports = {
	parseContext,
	parseContextMenu,
	isModalRoute,
	isDocumentId,
	clampSize,
	isServerUrl,
	parseAuth
};
