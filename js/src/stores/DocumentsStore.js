import alt from "../alt";
import { isAuthError } from "../api";
import DocumentsActions from "../actions/DocumentsActions";
import $ from "jquery";
import { dialog } from "../electronBridge";

// DOCUMENTS STORE
class DocumentsStore {
	constructor() {
		this.bindActions(DocumentsActions);
		this.documents = [];
		this.correspondent = null;
		this.tag = null;
		this.isLoading = true;
		this.page = 0;
		this.next = null;
	}

	// SET LOADING
	setLoading(state) {
		this.isLoading = state;
	}

	// RESET DOCUMENTS
	resetDocuments() {
		this.page = 0;
		this.documents = [];
	}

	// GET DOCUMENTS SUCCESS
	getDocumentsSuccess(result) {
		// check if a reset is necessary
		if (this.correspondent !== result.correspondent || this.tag !== result.tag) {
			this.resetDocuments();
		}

		Array.prototype.push.apply(this.documents, result.data.results);
		this.page = this.page + 1;
		this.correspondent = result.correspondent;
		this.tag = result.tag;
		this.isLoading = false;
		this.next = result.data.next;
	}

	// DELETE DOCUMENTS SUCCESS
	deleteDocumentsSuccess(ids) {
		const removed = ids.map(String);
		this.documents = this.documents.filter((d) => removed.indexOf(String(d.id)) < 0);
	}

	// DELETE DOCUMENTS FAIL
	deleteDocumentsFail(err) {
		if (isAuthError(err)) {
			$(window).trigger("goBackToLogin");
			return;
		}

		dialog.showErrorBox("Could not delete document(s)!", "Please try again.");
	}

	// GET DOCUMENTS FAIL
	getDocumentsFail(err) {
		this.isLoading = false;

		if (isAuthError(err)) {
			$(window).trigger("goBackToLogin");
			return;
		}

		dialog.showErrorBox("Could not load documents!", "Please try again.");
	}
}

export default alt.createStore(DocumentsStore);
