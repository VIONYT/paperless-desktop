import native from "./native";

// CONTEXT: tells the menu bar what the app shows, so it can disable what makes no sense:
// { signedIn, document, tabs } (see main/menu.js)
export const setContext = (context) => native.send("setContext", context);
