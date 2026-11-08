import native from "./native";
import { t } from "./i18n";

// CONFIRM DELETE: asks the user before something is deleted, resolves to true if confirmed.
// The title is the question, the buttons say what they do (and Cancel is the default).
export const confirmDelete = (titleKey, values) =>
	native.confirm({
		title: t(titleKey, values),
		message: t("common.cannotBeUndone"),
		accept: t("common.delete"),
		cancel: t("common.cancel")
	});

// the servers of the own computer are reached without leaving it, an unencrypted connection is fine
const LOCAL_HOSTS = ["localhost", "127.0.0.1", "[::1]"];

// CONFIRM INSECURE: the password is sent over an unencrypted connection (http://), the user has
// to confirm that. Resolves to true if the connection is fine or confirmed.
export const confirmInsecure = (host) => {
	const url = new URL(host);
	if (url.protocol === "https:" || LOCAL_HOSTS.includes(url.hostname))
		return Promise.resolve(true);

	return native.confirm({
		title: t("login.insecureTitle"),
		message: t("login.insecureMessage"),
		accept: t("login.signInAnyway"),
		cancel: t("common.cancel")
	});
};
