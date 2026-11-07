import native from "./native";

// THEMES: "system" follows macOS, "light" and "dark" force an appearance
const THEMES = ["system", "light", "dark"];

const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

// GET THEME
export const getTheme = () => {
	const theme = localStorage.getItem("settings.theme");
	return THEMES.includes(theme) ? theme : "system";
};

// APPLY THEME: switches the appearance of the app (the "dark" class enables css/dark.css) and
// of the native elements (dialogs, scrollbars) via the main process
export const applyTheme = (theme = getTheme()) => {
	const dark = theme === "dark" || (theme === "system" && systemDark.matches);

	document.documentElement.classList.toggle("dark", dark);
	native.send("setTheme", theme);
};

// follow the system while the theme is set to "system"
systemDark.addEventListener("change", () => {
	if (getTheme() === "system") applyTheme();
});
