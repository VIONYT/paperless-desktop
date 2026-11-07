// Bridge to the Electron APIs. The renderer runs with node integration enabled
// (see main.js), `remote` is provided by the @electron/remote package.
const electron = window.require("electron");
const remote = window.require("@electron/remote");

export const ipcRenderer = electron.ipcRenderer;
export { remote };
export const dialog = remote.dialog;
