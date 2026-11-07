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

module.exports = { isModalRoute, isDocumentId, clampSize, isServerUrl, parseAuth };
