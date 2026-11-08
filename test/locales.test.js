const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const locales = require("../locales");

test("every language has the same keys as English", () => {
	const english = Object.keys(locales.languages.en).sort();

	Object.keys(locales.languages).forEach((code) => {
		assert.deepStrictEqual(Object.keys(locales.languages[code]).sort(), english, code);
	});
});

test("the language follows the system unless it is chosen", () => {
	assert.strictEqual(locales.resolve("system", "de-DE"), "de");
	assert.strictEqual(locales.resolve("system", "fr-FR"), "en");
	assert.strictEqual(locales.resolve("en", "de-DE"), "en");
});

test("placeholders are replaced", () => {
	assert.strictEqual(
		locales.translate("en", "documents.uploadFailed", { name: "a.pdf" }),
		"Could not upload a.pdf!"
	);
	assert.strictEqual(locales.translate("en", "does.not.exist"), "does.not.exist");
});

test("every key that is used in the source exists", () => {
	const files = fs.readdirSync(path.join(__dirname, "..", "js", "src"), { recursive: true });
	const used = new Set();

	files
		.filter((f) => f.endsWith(".js"))
		.forEach((file) => {
			const source = fs.readFileSync(path.join(__dirname, "..", "js", "src", file), "utf8");
			(source.match(/\bt\(\s*"([a-z]+\.[A-Za-z]+)"/g) || []).forEach((m) =>
				used.add(m.replace(/.*"(.*)"/, "$1"))
			);
		});

	used.forEach((key) => assert.ok(key in locales.languages.en, "missing: " + key));
});
