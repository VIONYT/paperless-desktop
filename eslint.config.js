/* Lint rules. The app (js/src) is checked with a strict set of rules (.eslintrc.rules.json), the
 * files of the main process, the build and the tests with the recommended ones. */
const js = require("@eslint/js");
const globals = require("globals");
const prettier = require("eslint-config-prettier");
const { builtinRules } = require("eslint/use-at-your-own-risk");
const strict = require("./.eslintrc.rules.json");

// the strict rules, without the ones that do not exist anymore in this version of ESLint
const rules = Object.fromEntries(Object.entries(strict).filter(([name]) => builtinRules.has(name)));

module.exports = [
	{ ignores: ["node_modules/**", "build/**", "js/build/**"] },
	{
		files: ["js/src/**/*.js", "js/src/**/*.mjs"],
		...js.configs.recommended,
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: "module",
			parserOptions: { ecmaFeatures: { jsx: true } },
			// the code is bundled, so `require` of the locales works
			globals: { ...globals.browser, ...globals.es2021, ...globals.commonjs }
		},
		rules: { ...js.configs.recommended.rules, ...rules }
	},
	{
		files: [
			"main/**/*.js",
			"main.js",
			"preload.js",
			"store.js",
			"build.js",
			"package.js",
			"eslint.config.js",
			"locales/**/*.js",
			"test/**/*.js"
		],
		...js.configs.recommended,
		languageOptions: { ecmaVersion: 2022, sourceType: "commonjs", globals: { ...globals.node } }
	},
	prettier
];
