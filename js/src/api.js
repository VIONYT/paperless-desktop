import axios from "axios";

// Helpers to talk to the paperless-ngx REST API.
//
// Authentication is done with the API token of paperless-ngx
// (POST /api/token/), which is sent as "Authorization: Token <token>".
// The main process attaches the same header to requests for images / PDFs
// that are loaded directly by the browser (see main.js).

// PAGE SIZE that is large enough to load all tags / correspondents at once
export const MAX_PAGE_SIZE = 100000;

// GET HOST (without a trailing slash)
export const getHost = () => {
	return (localStorage.getItem("settings.host") || "").replace(/\/+$/, "");
};

// GET TOKEN
export const getToken = () => {
	return localStorage.getItem("settings.auth.token");
};

// NORMALIZE HOST: adds a scheme if missing and removes trailing slashes
export const normalizeHost = (value) => {
	let host = (value || "").trim();

	if (host.length > 0 && !/^https?:\/\//i.test(host)) {
		host = "http://" + host;
	}

	return host.replace(/\/+$/, "");
};

// BUILD AUTH HEADERS
export const authHeaders = (token = getToken()) => {
	return token ? { Authorization: "Token " + token } : {};
};

// REQUEST: axios request relative to the configured host
// config.url is the path of the API, e.g. "/api/documents/"
export const request = (config) => {
	const headers = { Accept: "application/json", ...authHeaders(), ...config.headers };
	const url = /^https?:\/\//i.test(config.url) ? config.url : getHost() + config.url;

	return axios({ ...config, url: url, headers: headers });
};

// FETCH TOKEN: exchanges username + password for an API token
export const fetchToken = (host, username, password) => {
	return axios({
		method: "post",
		url: normalizeHost(host) + "/api/token/",
		headers: { Accept: "application/json" },
		data: { username: username, password: password }
	}).then((result) => {
		if (!result.data || !result.data.token) {
			throw new Error("No token received");
		}

		return result.data.token;
	});
};

// IS AUTH ERROR: the server rejected our credentials
export const isAuthError = (err) => {
	return !!(err && err.response && (err.response.status === 401 || err.response.status === 403));
};

// DOCUMENT URLS
export const thumbnailUrl = (id) => {
	return getHost() + "/api/documents/" + id + "/thumb/";
};

export const previewUrl = (id) => {
	return getHost() + "/api/documents/" + id + "/preview/";
};

export const downloadUrl = (id, original) => {
	return getHost() + "/api/documents/" + id + "/download/" + (original ? "?original=true" : "");
};
