import alt from "../alt";
import { isAuthError } from "../api";
import TagsActions from "../actions/TagsActions";
import ToolbarActions from "../actions/ToolbarActions";
import $ from "jquery";
import { ipcRenderer, dialog } from "../electronBridge";
import { t } from "../i18n";

// TAGS STORE
class TagsStore {
	constructor() {
		this.bindActions(TagsActions);
		this.tags = [];
	}

	// GET TAGS SUCCESS
	getTagsSuccess(result) {
		this.tags = result.data;
	}

	// GET TAGS FAIL
	getTagsFail(err) {
		if (isAuthError(err)) {
			$(window).trigger("goBackToLogin");
			return;
		}

		dialog.showErrorBox(t("tags.loadFailed"), t("common.tryAgain"));
	}

	// DELETE TAGS SUCCESS
	deleteTagsSuccess(ids) {
		if (this.tags.results) {
			this.tags.results = this.tags.results.filter((t) => {
				return !ids.find((i) => i === t.id);
			});
		}

		// remove the delete button
		window.setTimeout(() => {
			ToolbarActions.removeItem("remove-tags");
		}, 0);
	}

	// DELETE TAGS FAIL
	deleteTagsFail(err) {
		if (isAuthError(err)) {
			$(window).trigger("goBackToLogin");
			return;
		}

		dialog.showErrorBox(t("tags.deleteFailed"), t("common.tryAgain"));
	}

	// ADD TAG SUCCESS
	addTagSuccess(result) {
		ipcRenderer.send("tagAdd", result);
		ipcRenderer.send("closeModal");
	}

	// ADD TAG FAIL
	addTagFail(err) {
		if (isAuthError(err)) {
			$(window).trigger("goBackToLogin");
			return;
		}

		dialog.showErrorBox(t("tags.addFailed"), t("tags.addFailedMessage"));
	}

	// EDIT TAG SUCCESS
	editTagSuccess(result) {
		if (!result.data) return;

		// replace the tag with new edited one
		this.tags.results = this.tags.results.map((t) => {
			if (t.id === result.data.id) return result.data;
			else return t;
		});
	}

	// EDIT TAG FAIL
	editTagFail(err) {
		if (isAuthError(err)) {
			$(window).trigger("goBackToLogin");
			return;
		}

		dialog.showErrorBox(t("tags.editFailed"), t("tags.editFailedMessage"));
	}
}

export default alt.createStore(TagsStore);
