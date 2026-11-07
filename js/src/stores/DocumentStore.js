import alt from "../alt";
import { isAuthError } from "../api";
import DocumentActions from "../actions/DocumentActions";
import $ from "jquery";
import { dialog } from "../electronBridge";

// DOCUMENT STORE
class DocumentStore {
	constructor() {
		this.bindActions(DocumentActions);
		this.doc = null;
	}

	// GET DOCUMENT SUCCESS
	getDocumentSuccess(result) {
		this.doc = result.data;
	}

	// GET DOCUMENT FAIL
	getDocumentFail(err) {
		if (isAuthError(err)) {
			$(window).trigger("goBackToLogin");
			return;
		}

		dialog.showErrorBox("Could not load document!", "Please try again.");
	}

	// UPDATE DOCUMENT SUCCESS
	updateDocumentSuccess(result) {
		if (result.data) {
			$(window).trigger("tabs.setActiveTitle", {
				title: result.data.title
			});
		}
	}

	// UPDATE DOCUMENT FAIL
	updateDocumentFail(err) {
		if (isAuthError(err)) {
			$(window).trigger("goBackToLogin");
		}
	}
}

export default alt.createStore(DocumentStore);
