import native from "./native";

const locales = require("../../locales");

// the language of the app: "system" (default) or the code of a language in /locales
export const getLanguageSetting = () => localStorage.getItem("settings.language") || "system";

// the resolved language code, e.g. "de"
export const getLanguage = () => locales.resolve(getLanguageSetting(), navigator.language);

// the languages to choose from
export const availableLanguages = () => locales.available();

// TRANSLATE: t("login.submit") or t("documents.uploadFailed", { name: "file.pdf" })
export const t = (key, values) => locales.translate(getLanguage(), key, values);

// tells the main process the language, so the menu is localized as well
export const applyLanguage = () => {
	native.send("setLanguage", getLanguage());
};
