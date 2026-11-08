/* Stores settings of the main process (the size of the window) as JSON in the user data folder. */
const { app } = require("electron");
const fs = require("fs");
const path = require("path");

// the saved data, or the defaults if there is no (readable) file yet
const readData = (filePath, defaults) => {
	try {
		return JSON.parse(fs.readFileSync(filePath, "utf8"));
	} catch {
		return defaults;
	}
};

class Store {
	constructor({ configName, defaults }) {
		this.path = path.join(app.getPath("userData"), configName + ".json");
		this.data = readData(this.path, defaults);
	}

	get(key) {
		return this.data[key];
	}

	set(key, value) {
		this.data[key] = value;
		fs.writeFileSync(this.path, JSON.stringify(this.data));
	}
}

module.exports = Store;
