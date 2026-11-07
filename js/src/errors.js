import bus from "./bus";
import native from "./native";
import { isAuthError } from "./api";
import { t } from "./i18n";

// HANDLE ERROR: a rejected login leads back to the login, everything else is shown to the user
export const handleError = (err, titleKey, messageKey = "common.tryAgain") => {
	if (isAuthError(err)) {
		bus.trigger("goBackToLogin");
		return;
	}

	native.showError(t(titleKey), t(messageKey));
};
