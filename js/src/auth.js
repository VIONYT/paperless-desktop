import native from "./native";
import { fetchToken, getHost, getToken, normalizeHost } from "./api";
import { confirmInsecure } from "./dialogs";

const KEYS = ["settings.auth.username", "settings.auth.token", "settings.host"];

// IS SIGNED IN
export const isSignedIn = () => !!getToken() && getHost().length > 0;

// TELL MAIN: the main process attaches the token to the requests to the server
const tellMain = (host, token) => native.send("login", { host: host, token: token });

// SIGN IN: exchanges the credentials for an API token, only the token is stored (not the password).
// Resolves to the address of the server, or to null if the user does not want an unencrypted
// connection. Rejects if the credentials are wrong.
export const signIn = async (host, username, password) => {
	const normalized = normalizeHost(host);
	if (!(await confirmInsecure(normalized))) return null;

	const token = await fetchToken(normalized, username, password);

	localStorage.setItem("settings.auth.username", username);
	localStorage.setItem("settings.auth.token", token);
	localStorage.setItem("settings.host", normalized);
	tellMain(normalized, token);

	return normalized;
};

// RESTORE SIGN IN: after the start of the app the main process does not know the token yet
export const restoreSignIn = () => {
	if (isSignedIn()) tellMain(getHost(), getToken());
};

// SIGN OUT
export const signOut = () => {
	KEYS.forEach((key) => localStorage.removeItem(key));
	native.send("login", null);
};
