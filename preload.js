/* The only door between the app (renderer) and the system. It runs in a sandbox and publishes
 * a few functions as `window.native`, a list of messages that are allowed in both directions. */
const { contextBridge, ipcRenderer } = require("electron");

const SEND = [
	"login",
	"setTheme",
	"setLanguage",
	"modal",
	"closeModal",
	"setSize",
	"openDevTools",
	"focusWindow",
	"openDocument",
	"download",
	"tagAdd",
	"reminderAdd",
	"correspondentAdd"
];

const RECEIVE = [
	"navigate",
	"closeCurrentTab",
	"openDocument",
	"tagAdded",
	"reminderAdded",
	"correspondentAdded"
];

contextBridge.exposeInMainWorld("native", {
	send: (channel, data) => {
		if (SEND.includes(channel)) ipcRenderer.send(channel, data);
	},

	// the callback gets the data of the message, returns the function to unsubscribe
	on: (channel, callback) => {
		if (!RECEIVE.includes(channel)) return () => {};

		const listener = (event, data) => callback(data);
		ipcRenderer.on(channel, listener);

		return () => ipcRenderer.removeListener(channel, listener);
	},

	showError: (title, message) => ipcRenderer.invoke("showError", title, message),

	// resolves to true if the user confirmed
	confirm: (args) => ipcRenderer.invoke("confirm", args)
});
