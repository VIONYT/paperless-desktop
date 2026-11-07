import React from "react";
import { Router, Route, hashHistory } from "react-router";
import ReactDOM from "react-dom";
import routes from "./routes";
import { applyTheme } from "./theme";
import { applyLanguage } from "./i18n";
import { restoreSignIn } from "./auth";

applyTheme();
applyLanguage();
restoreSignIn();

ReactDOM.render(<Router history={hashHistory}>{routes}</Router>, document.getElementById("app"));
