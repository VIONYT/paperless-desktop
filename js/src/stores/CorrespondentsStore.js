import alt from "../alt";
import { isAuthError } from "../api";
import CorrespondentsActions from "../actions/CorrespondentsActions";
import ToolbarActions from "../actions/ToolbarActions";
import $ from "jquery";
import { ipcRenderer, dialog } from "../electronBridge";

// CORRESPONDENTS STORE
class CorrespondentsStore {
	constructor() {
		this.bindActions(CorrespondentsActions);
		this.correspondents = [];
		this.selection = [];
	}

	// GET CORRESPONDENTS SUCCESS
	getCorrespondentsSuccess(result) {
		this.correspondents = result.data;
	}

	// GET CORRESPONDENTS FAIL
	getCorrespondentsFail(err) {
		if (isAuthError(err)) {
			$(window).trigger("goBackToLogin");
			return;
		}

		dialog.showErrorBox("Could not load correspondents!", "Please try again.");
	}

	// DELETE CORRESPONDENTS SUCCESS
	deleteCorrespondentsSuccess(ids) {
		this.selection = [];

		if (this.correspondents.results) {
			this.correspondents.results = this.correspondents.results.filter((t) => {
				return !ids.find((i) => i === t.id);
			});
		}

		// remove the delete button
		window.setTimeout(() => {
			ToolbarActions.removeItem("remove-correspondents");
		}, 0);
	}

	// DELETE CORRESPONDENTS FAIL
	deleteCorrespondentsFail(err) {
		if (isAuthError(err)) {
			$(window).trigger("goBackToLogin");
			return;
		}

		dialog.showErrorBox("Could not delete correspondent(s)!", "Please try again.");
	}

	// ADD CORRESPONDENTS SUCCESS
	addCorrespondentSuccess(result) {
		ipcRenderer.send("correspondentAdd", result);
		ipcRenderer.send("closeModal");
	}

	// ADD CORRESPONDENTS FAIL
	addCorrespondentFail(err) {
		if (isAuthError(err)) {
			$(window).trigger("goBackToLogin");
			return;
		}

		dialog.showErrorBox(
			"Could not add the correspondent!",
			"Data might be missing or the correspondent may already exist."
		);
	}

	// EDIT CORRESPONDENT SUCCESS
	editCorrespondentSuccess(result) {
		if (!result.data) return;

		// replace the correspondent with new edited one
		this.correspondents.results = this.correspondents.results.map((c) => {
			if (c.id === result.data.id) return result.data;
			else return c;
		});
	}

	// EDIT CORRESPONDENT FAIL
	editCorrespondentFail(err) {
		if (isAuthError(err)) {
			$(window).trigger("goBackToLogin");
			return;
		}

		dialog.showErrorBox(
			"Could not edit the correspondent!",
			"Data might be missing or the correspondent does not exist anymore."
		);
	}
}

export default alt.createStore(CorrespondentsStore);
