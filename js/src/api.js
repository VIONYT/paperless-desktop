import axios from "axios";

// Helpers to talk to the REST API of paperless-ngx.
//
// The credentials are exchanged for an API token (POST /api/token/). The token is not added
// here: the main process attaches it to every request to the server (see main/session.js).

// a page size that is large enough to load all tags / correspondents at once
export const MAX_PAGE_SIZE = 100000;

// GET HOST: the URL of the server, without a trailing slash
export const getHost = () => (localStorage.getItem("settings.host") || "").replace(/\/+$/, "");

// GET TOKEN
export const getToken = () => localStorage.getItem("settings.auth.token");

// NORMALIZE HOST: adds a scheme if missing and removes trailing slashes
export const normalizeHost = (value) => {
	const host = (value || "").trim();

	return (/^https?:\/\//i.test(host) || host.length === 0 ? host : "http://" + host).replace(
		/\/+$/,
		""
	);
};

// REQUEST: axios request to the server, `config.url` is the path of the API, e.g. "/api/documents/"
export const request = (config) =>
	axios({
		...config,
		url: getHost() + config.url,
		headers: { Accept: "application/json", ...config.headers }
	});

// FETCH TOKEN: exchanges user name and password for an API token
export const fetchToken = async (host, username, password) => {
	const result = await axios({
		method: "post",
		url: normalizeHost(host) + "/api/token/",
		headers: { Accept: "application/json" },
		data: { username: username, password: password }
	});

	if (!result.data || !result.data.token) throw new Error("No token received");

	return result.data.token;
};

// IS AUTH ERROR: the server rejected our credentials
export const isAuthError = (err) =>
	!!(err && err.response && (err.response.status === 401 || err.response.status === 403));

// URLS of a document: the thumbnail, the preview (PDF or image) and the original file
export const thumbnailUrl = (id) => getHost() + "/api/documents/" + id + "/thumb/";

export const previewUrl = (id) => getHost() + "/api/documents/" + id + "/preview/";

export const downloadUrl = (id, original) =>
	getHost() + "/api/documents/" + id + "/download/" + (original ? "?original=true" : "");
