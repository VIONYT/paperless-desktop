/* Bundles the renderer code (JSX/ES2015+) into js/build/bundle.js using esbuild. */
const esbuild = require("esbuild");
const babel = require("@babel/core");
const fs = require("fs");
const path = require("path");

const watch = process.argv.includes("--watch");

// The Flux library "alt" instantiates the action / store classes without `new`, which
// does not work with native ES classes. So the classes of our own code are compiled to
// functions (everything else is left to esbuild).
const classesPlugin = {
	name: "transform-classes",
	setup(build) {
		const srcDir = path.join(__dirname, "js", "src") + path.sep;

		build.onLoad({ filter: /\.js$/ }, async (args) => {
			if (args.path.indexOf(srcDir) !== 0) return null;

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
	sourcemap: "inline",
	logLevel: "info"
};

// the worker of pdf.js (PDF preview) is loaded at runtime next to the bundle
const copyPdfWorker = () => {
	fs.copyFileSync(
		path.join(__dirname, "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs"),
		path.join(__dirname, "js", "build", "pdf.worker.min.mjs")
	);
};

async function main() {
	copyPdfWorker();

	if (watch) {
		const ctx = await esbuild.context(options);
		await ctx.watch();
	} else {
		await esbuild.build(options);
	}
}

main().catch(() => process.exit(1));
