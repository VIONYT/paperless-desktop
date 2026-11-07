/* Bundles the renderer code (JSX/ES2015+) into js/build/bundle.js using esbuild.
 *
 *   node build.js           production build (minified)
 *   node build.js --dev     with source maps, for debugging
 *   node build.js --watch   rebuilds when a file changes (development build)
 */
const esbuild = require("esbuild");
const babel = require("@babel/core");
const fs = require("fs");
const path = require("path");

const dev = process.argv.includes("--dev") || process.argv.includes("--watch");
const srcDir = path.join(__dirname, "js", "src") + path.sep;

// The Flux library "alt" instantiates the action / store classes without `new`, which does not
// work with native ES classes. So the classes of our own code are compiled to functions
// (everything else is left to esbuild).
const classesPlugin = {
	name: "transform-classes",
	setup(build) {
		build.onLoad({ filter: /\.js$/ }, async (args) => {
			if (!args.path.startsWith(srcDir)) return null;

			const source = await fs.promises.readFile(args.path, "utf8");
			const result = babel.transformSync(source, {
				filename: args.path,
				babelrc: false,
				configFile: false,
				sourceType: "module",
				parserOpts: { plugins: ["jsx"] },
				plugins: ["@babel/plugin-transform-classes"]
			});

			return { contents: result.code, loader: "jsx" };
		});
	}
};

const options = {
	entryPoints: ["js/src/main.js"],
	outfile: "js/build/bundle.js",
	bundle: true,
	platform: "browser",
	target: "chrome140",
	format: "iife",
	// the source files contain JSX inside of plain .js files
	loader: { ".js": "jsx" },
	plugins: [classesPlugin],
	define: { "process.env.NODE_ENV": '"production"' },
	minify: !dev,
	// alt names its stores and actions after the classes
	keepNames: true,
	sourcemap: dev ? "inline" : false,
	logLevel: "info"
};

// files of the dependencies that are loaded at runtime, next to the bundle
const ASSETS = [
	["pdfjs-dist/build/pdf.worker.min.mjs", "pdf.worker.min.mjs"],
	["react-select/dist/react-select.css", "react-select.css"]
];

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
