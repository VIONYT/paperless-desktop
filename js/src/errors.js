import bus from "./bus";
import native from "./native";
import { isAuthError } from "./api";
import { t } from "./i18n";

// HANDLE ERROR: a rejected login leads back to the login, everything else is shown to the user
// in a dialog (for something the user did, e.g. saving)
export const handleError = (err, titleKey, messageKey = "common.tryAgain") => {
	if (isAuthError(err)) {
		bus.trigger("goBackToLogin");
		return;
	}

	native.showError(t(titleKey), t(messageKey));
};

// HANDLE LOAD ERROR: a failed load is shown in the banner of the window, with a button to try it
// again. The page that loads the data listens to "retry" (see `onRetry`).
export const handleLoadError = (err, titleKey) => {
	if (isAuthError(err)) {
		bus.trigger("goBackToLogin");
		return;
	}

	bus.trigger("banner", { message: t(titleKey) });
};

// ON RETRY: calls the function when the user wants to try again, returns the function to unsubscribe
export const onRetry = (callback) => bus.on("retry", callback);
