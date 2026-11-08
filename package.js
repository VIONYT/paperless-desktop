/* Packages the app for macOS.
 *
 *   node package.js                       Apple Silicon and Intel
 *   node package.js --arch=arm64          only Apple Silicon (arm64, x64 or universal)
 *   node package.js --debug               "Paperless Debug", opens the DevTools at the start
 *
 * The app is signed and notarized if APPLE_IDENTITY, APPLE_ID, APPLE_APP_PASSWORD and
 * APPLE_TEAM_ID are set (only possible on a Mac).
 */
const { packager } = require("@electron/packager");
const { flipFuses, FuseVersion, FuseV1Options } = require("@electron/fuses");
const fs = require("fs");
const path = require("path");

const argument = (name, fallback) => {
	const found = process.argv.find((arg) => arg.startsWith("--" + name + "="));
	return found ? found.split("=")[1] : fallback;
};

const debug = process.argv.includes("--debug");
const env = process.env;
const signing = env.APPLE_IDENTITY && env.APPLE_ID && env.APPLE_APP_PASSWORD && env.APPLE_TEAM_ID;

// Switches off the features of Electron the app does not need, they could be misused to run
// other code with the app: running it as Node.js, NODE_OPTIONS, the inspector of the command line.
// Electron brings the system texts in about 50 languages, only the languages of the app are kept.
const removeUnusedLanguages = (appPath) => {
	const kept = Object.keys(require("./locales").languages);
	const folders = [
		path.join(appPath, "Contents", "Resources"),
		path.join(appPath, "Contents", "Frameworks", "Electron Framework.framework", "Resources")
	];

	folders.forEach((folder) =>
		fs
			.readdirSync(folder)
			.filter(
				(name) => name.endsWith(".lproj") && !kept.some((code) => name.startsWith(code))
			)
			.forEach((name) => fs.rmSync(path.join(folder, name), { recursive: true }))
	);
};

const hardenFuses = async (buildPath, appName) => {
	await flipFuses(path.join(buildPath, appName + ".app"), {
		version: FuseVersion.V1,
		[FuseV1Options.RunAsNode]: false,
		[FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
		[FuseV1Options.EnableNodeCliInspectArguments]: false,
		[FuseV1Options.OnlyLoadAppFromAsar]: true
	});
};

const options = (name) => ({
	dir: ".",
	name: name,
	platform: "darwin",
	arch: argument("arch", "arm64,x64").split(","),
	out: "build",
	overwrite: true,
	asar: true,
	icon: "./icon",
	// everything is bundled into js/build, the sources and the dependencies are not needed
	ignore: [
		/^\/(build$|node_modules|test|js\/src|\.github|\.eslintrc|\.gitignore|icon\.icns$|(build|package)\.js$|LICENSE$|icon\.psd$|package-lock\.json$)/,
		/\.(md|map)$/
	],
	afterComplete: [
		async ({ buildPath }) => {
			removeUnusedLanguages(path.join(buildPath, name + ".app"));
			await hardenFuses(buildPath, name);
		}
	],
	...(signing
		? {
				osxSign: { identity: env.APPLE_IDENTITY },
				osxNotarize: {
					appleId: env.APPLE_ID,
					appleIdPassword: env.APPLE_APP_PASSWORD,
					teamId: env.APPLE_TEAM_ID
				}
			}
		: {})
});

const main = async () => {
	// the flag file makes the app open the DevTools, it is not part of a normal build
	const flag = path.join(__dirname, "debug.flag");
	if (debug) fs.writeFileSync(flag, "");

	try {
		const paths = await packager(options(debug ? "Paperless Debug" : "Paperless"));
		console.log("Built:", paths.join(", "));
	} finally {
		fs.rmSync(flag, { force: true });
	}
};

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
