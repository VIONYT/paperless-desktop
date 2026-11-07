/* Localization of the app, used by the main process (menu) and by the renderer (js/src/i18n.js).
 *
 * To add a new language:
 *   1. copy locales/en.json to locales/<code>.json (e.g. fr.json) and translate the values
 *   2. register the file in the `languages` object below
 * Missing keys fall back to English.
 */

const languages = {
	en: require("./en.json"),
	de: require("./de.json")
};

const FALLBACK = "en";

// the languages that can be chosen in the settings: [{ code: "en", name: "English" }, ...]
const available = () =>
	Object.keys(languages).map((code) => ({ code: code, name: languages[code]["language.name"] }));

// RESOLVE: "system" or an unknown language is resolved by the locale of the system ("de-DE" -> "de")
const resolve = (language, systemLocale) => {
	if (language && language !== "system" && languages[language]) return language;

	const code = String(systemLocale || "")
		.toLowerCase()
		.split(/[-_]/)[0];

	return languages[code] ? code : FALLBACK;
};

// TRANSLATE: replaces {placeholders} with the given values
const translate = (language, key, values) => {
	const messages = languages[language] || languages[FALLBACK];
	let text = key in messages ? messages[key] : languages[FALLBACK][key];

	if (text === undefined) text = key;

	Object.keys(values || {}).forEach((name) => {
		text = text.split("{" + name + "}").join(values[name]);
	});

	return text;
};

module.exports = { languages, available, resolve, translate, FALLBACK };
