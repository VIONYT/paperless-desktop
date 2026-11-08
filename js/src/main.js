import React from "react";
import { Router, Route, hashHistory } from "react-router";
import ReactDOM from "react-dom";
import routes from "./routes";
import { applyTheme } from "./theme";
import { applyLanguage } from "./i18n";
import { restoreSignIn } from "./auth";

// a file that is dropped somewhere else must not be opened by the window
["dragover", "drop"].forEach((name) =>
	window.addEventListener(name, (event) => event.preventDefault())
);

// on a Mac the sidebar is translucent (see "vibrancy" in css/main.css)
if (window.native.platform === "darwin") document.documentElement.classList.add("vibrancy");

applyTheme();
applyLanguage();
restoreSignIn();

ReactDOM.render(<Router history={hashHistory}>{routes}</Router>, document.getElementById("app"));
