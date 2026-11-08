import { Store, createStore } from "../flux.mjs";
import TagsActions from "../actions/TagsActions";
import ToolbarActions from "../actions/ToolbarActions";
import native from "../native";
import { handleError, handleLoadError } from "../errors";

// TAGS STORE
class TagsStore extends Store {
	constructor() {
		super();
		this.bindActions(TagsActions);
		this.tags = [];
	}

	// GET TAGS SUCCESS
	getTagsSuccess(result) {
		this.tags = result.data;
	}

	// GET TAGS FAIL
	getTagsFail(err) {
		handleLoadError(err, "tags.loadFailed");
	}

	// DELETE TAGS SUCCESS
	deleteTagsSuccess(ids) {
		if (this.tags.results) {
			this.tags.results = this.tags.results.filter((tag) => !ids.includes(tag.id));
		}

		// remove the delete button
		window.setTimeout(() => ToolbarActions.removeItem("remove-tags"), 0);
	}

	// DELETE TAGS FAIL
	deleteTagsFail(err) {
		handleError(err, "tags.deleteFailed");
	}

	// ADD TAG SUCCESS: the modal window hands the new tag over to the list
	addTagSuccess(result) {
		native.send("tagAdd", { data: result.data });
		native.send("closeModal");
	}

	// ADD TAG FAIL
	addTagFail(err) {
		handleError(err, "tags.addFailed", "tags.addFailedMessage");
	}

	// EDIT TAG SUCCESS: replaces the tag with the edited one
	editTagSuccess(result) {
		if (!result.data) return;

		this.tags.results = this.tags.results.map((tag) =>
			tag.id === result.data.id ? result.data : tag
		);
	}

	// EDIT TAG FAIL
	editTagFail(err) {
		handleError(err, "tags.editFailed", "tags.editFailedMessage");
	}
}

export default createStore(TagsStore);
