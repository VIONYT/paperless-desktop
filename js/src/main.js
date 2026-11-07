import React from "react";
import { Router, Route, hashHistory } from "react-router";
import ReactDOM from "react-dom";
import routes from "./routes";
import { applyTheme } from "./theme";

applyTheme();

ReactDOM.render(<Router history={hashHistory}>{routes}</Router>, document.getElementById("app"));
