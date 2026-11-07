import alt from "../alt";
import { isAuthError } from "../api";
import LogsActions from "../actions/LogsActions";
import $ from "jquery";
import { dialog } from "../electronBridge";
import { t } from "../i18n";

// LOGS STORE
class LogsStore {
	constructor() {
		this.bindActions(LogsActions);
		this.logs = [];
	}

	// GET LOGS SUCCESS
	getLogsSuccess(lines) {
		// newest lines first, the log can get really long
		this.logs = Array.isArray(lines) ? lines.slice(-1000).reverse() : [];
	}

	// GET LOGS FAIL
	getLogsFail(err) {
		if (isAuthError(err)) {
			$(window).trigger("goBackToLogin");
			return;
		}

		dialog.showErrorBox(t("logs.loadFailed"), t("common.tryAgain"));
	}
}

export default alt.createStore(LogsStore);
