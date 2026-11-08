import { Store, createStore } from "../flux.mjs";
import LogsActions from "../actions/LogsActions";
import { handleLoadError } from "../errors";

// LOGS STORE
class LogsStore extends Store {
	constructor() {
		super();
		this.bindActions(LogsActions);
		this.logs = [];
	}

	// GET LOGS SUCCESS: newest lines first, the log can get really long
	getLogsSuccess(lines) {
		this.logs = Array.isArray(lines) ? lines.slice(-1000).reverse() : [];
	}

	// GET LOGS FAIL
	getLogsFail(err) {
		handleLoadError(err, "logs.loadFailed");
	}
}

export default createStore(LogsStore);
