import native from "./native";
import { t } from "./i18n";

// CONFIRM DELETE: asks the user before something is deleted, resolves to true if confirmed
export const confirmDelete = (messageKey) =>
	native.confirm({
		title: t("document.deleteConfirmTitle"),
		message: t(messageKey),
		yes: t("common.yes"),
		no: t("common.no")
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
		yes: t("common.yes"),
		no: t("common.no")
	});
};
