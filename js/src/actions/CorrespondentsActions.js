import { Actions, createActions } from "../flux.mjs";
import { request, MAX_PAGE_SIZE } from "../api";

// CORRESPONDENTS ACTIONS
class CorrespondentsActions extends Actions {
	constructor() {
		super();
		this.generateActions(
			"getCorrespondentsSuccess",
			"getCorrespondentsFail",
			"deleteCorrespondentsSuccess",
			"deleteCorrespondentsFail",
			"addCorrespondentSuccess",
			"addCorrespondentFail",
			"editCorrespondentSuccess",
			"editCorrespondentFail"
		);
	}

	// GET CORRESPONDENTS
	getCorrespondents() {
		request({
			method: "get",
			url: "/api/correspondents/",
			params: { ordering: "name", page_size: MAX_PAGE_SIZE }
		})
			.then(this.actions.getCorrespondentsSuccess)
			.catch(this.actions.getCorrespondentsFail);
	}

	// DELETE CORRESPONDENTS
	deleteCorrespondents(ids) {
		Promise.all(
			ids.map((id) => request({ method: "delete", url: "/api/correspondents/" + id + "/" }))
		)
			.then(() => this.actions.deleteCorrespondentsSuccess(ids))
			.catch(this.actions.deleteCorrespondentsFail);
	}

	// ADD CORRESPONDENT
	addCorrespondent(data) {
		request({ method: "post", url: "/api/correspondents/", data: data })
			.then(this.actions.addCorrespondentSuccess)
			.catch(this.actions.addCorrespondentFail);
	}

	// EDIT CORRESPONDENT
	editCorrespondent(data) {
		request({ method: "put", url: "/api/correspondents/" + data.id + "/", data: data })
			.then(this.actions.editCorrespondentSuccess)
			.catch(this.actions.editCorrespondentFail);
	}
}

export default createActions(CorrespondentsActions);
