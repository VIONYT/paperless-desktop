import { Actions, createActions } from "../flux.mjs";
import { request } from "../api";

// LOGS ACTIONS
class LogsActions extends Actions {
	constructor() {
		super();
		this.generateActions("getLogsSuccess", "getLogsFail");
	}

	// GET LOGS
	// paperless-ngx lists the available logs at /api/logs/ (e.g. "paperless", "mail")
	// and returns the lines of a single log at /api/logs/<name>/
	getLogs() {
		request({ method: "get", url: "/api/logs/" })
			.then((result) => {
				const names = Array.isArray(result.data) ? result.data : [];
				const name = names.indexOf("paperless") >= 0 ? "paperless" : names[0];

				if (!name) return [];

				return request({
					method: "get",
					url: "/api/logs/" + encodeURIComponent(name) + "/"
				}).then((log) => log.data);
			})
			.then((lines) => this.actions.getLogsSuccess(lines))
			.catch(this.actions.getLogsFail);
	}
}

export default createActions(LogsActions);
