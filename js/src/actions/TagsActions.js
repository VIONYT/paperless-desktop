import alt from "../alt";
import { request, MAX_PAGE_SIZE } from "../api";

// TAGS ACTIONS
class TagsActions {
	constructor() {
		this.generateActions(
			"getTagsSuccess",
			"getTagsFail",
			"deleteTagsSuccess",
			"deleteTagsFail",
			"addTagSuccess",
			"addTagFail",
			"editTagSuccess",
			"editTagFail"
		);
	}

	// GET TAGS
	getTags() {
		request({
			method: "get",
			url: "/api/tags/",
			params: { ordering: "name", page_size: MAX_PAGE_SIZE }
		})
			.then(this.actions.getTagsSuccess)
			.catch(this.actions.getTagsFail);
	}

	// DELETE TAGS
	deleteTags(ids) {
		Promise.all(ids.map((id) => request({ method: "delete", url: "/api/tags/" + id + "/" })))
			.then(() => this.actions.deleteTagsSuccess(ids))
			.catch(this.actions.deleteTagsFail);
	}

	// ADD TAG
	addTag(data) {
		request({ method: "post", url: "/api/tags/", data: data })
			.then(this.actions.addTagSuccess)
			.catch(this.actions.addTagFail);
	}

	// EDIT TAG
	editTag(data) {
		request({ method: "put", url: "/api/tags/" + data.id + "/", data: data })
			.then(this.actions.editTagSuccess)
			.catch(this.actions.editTagFail);
	}
}

export default alt.createActions(TagsActions);
