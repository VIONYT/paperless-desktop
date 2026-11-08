/* Bundles the renderer code (JSX/ES2015+) into js/build/bundle.js using esbuild.
 *
 *   node build.js           production build (minified)
 *   node build.js --dev     with source maps, for debugging
 *   node build.js --watch   rebuilds when a file changes (development build)
 */
const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const dev = process.argv.includes("--dev") || process.argv.includes("--watch");

const options = {
	entryPoints: ["js/src/main.js"],
	outfile: "js/build/bundle.js",
	bundle: true,
	platform: "browser",
	target: "chrome140",
	format: "iife",
	// the source files contain JSX inside of plain .js files
	loader: { ".js": "jsx" },
	define: { "process.env.NODE_ENV": '"production"' },
	minify: !dev,
	sourcemap: dev ? "inline" : false,
	logLevel: "info"
};

// files of the dependencies that are loaded at runtime, next to the bundle
const ASSETS = [["pdfjs-dist/build/pdf.worker.min.mjs", "pdf.worker.min.mjs"]];

const copyAssets = () => {
	ASSETS.forEach(([from, to]) =>
		fs.copyFileSync(
			path.join(__dirname, "node_modules", from),
			path.join(__dirname, "js", "build", to)
		)
	);
};

const main = async () => {
	copyAssets();

	if (process.argv.includes("--watch")) {
		const ctx = await esbuild.context(options);
		await ctx.watch();
	} else {
		await esbuild.build(options);
	}
};

main().catch(() => process.exit(1));
