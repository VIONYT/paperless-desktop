import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import router from "./routes";
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

createRoot(document.getElementById("app")).render(<RouterProvider router={router} />);
