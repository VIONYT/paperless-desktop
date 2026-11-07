/* Network settings of the app: authentication, cross origin requests and permissions. */
const { session } = require("electron");
const { getAuth } = require("./auth");
const { isServerUrl } = require("./validate");

const CORS_HEADERS = {
	"access-control-allow-origin": ["*"],
	"access-control-allow-headers": ["content-type, accept, authorization"],
	"access-control-allow-methods": ["GET, POST, PUT, PATCH, DELETE, OPTIONS"]
};

// is the request meant for the paperless server?
const isServerRequest = (url) => {
	const auth = getAuth();
	return auth !== null && isServerUrl(url, auth.host);
};

// removes headers of the server that would collide with ours (names are case insensitive)
const withoutHeaders = (headers, names) =>
	Object.keys(headers)
		.filter((name) => !names.includes(name.toLowerCase()))
		.reduce((result, name) => ({ ...result, [name]: headers[name] }), {});

// Images and PDFs are loaded by the browser itself, so the API token is attached here. It is
// only sent to the configured paperless server, never to any other host.
const addToken = (details, callback) => {
	const headers = { ...details.requestHeaders };
	if (isServerRequest(details.url)) headers.Authorization = "Token " + getAuth().token;

	callback({ requestHeaders: headers });
};

// The app is loaded from a file, so the paperless server is a foreign origin. The server does not
// know our app, so the answers are allowed here instead of switching off the web security.
const allowServerAnswers = (details, callback) => {
	if (!isServerRequest(details.url)) return callback({});

	const headers = withoutHeaders(details.responseHeaders, Object.keys(CORS_HEADERS));
	callback({ responseHeaders: { ...headers, ...CORS_HEADERS } });
};

// the app only needs notifications (reminders), nothing else is granted
const allowNotificationsOnly = (webContents, permission, callback) => {
	callback(permission === "notifications");
};

const setupSession = () => {
	const { webRequest } = session.defaultSession;

	webRequest.onBeforeSendHeaders(addToken);
	webRequest.onHeadersReceived(allowServerAnswers);
	session.defaultSession.setPermissionRequestHandler(allowNotificationsOnly);
};

module.exports = { setupSession };
