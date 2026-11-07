import alt from "../alt";
import LogsActions from "../actions/LogsActions";
import { handleError } from "../errors";

// LOGS STORE
class LogsStore {
	constructor() {
		this.bindActions(LogsActions);
		this.logs = [];
	}

	// GET LOGS SUCCESS: newest lines first, the log can get really long
	getLogsSuccess(lines) {
		this.logs = Array.isArray(lines) ? lines.slice(-1000).reverse() : [];
	}

	// GET LOGS FAIL
	getLogsFail(err) {
		handleError(err, "logs.loadFailed");
	}
}

export default alt.createStore(LogsStore);
