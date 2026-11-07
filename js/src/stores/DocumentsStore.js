import alt from "../alt";
import DocumentsActions from "../actions/DocumentsActions";
import { handleError } from "../errors";

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
		// another filter than before starts with an empty list
		if (this.correspondent !== result.correspondent || this.tag !== result.tag) {
			this.resetDocuments();
		}

		this.documents = this.documents.concat(result.data.results);
		this.page = this.page + 1;
		this.correspondent = result.correspondent;
		this.tag = result.tag;
		this.isLoading = false;
		this.next = result.data.next;
	}

	// GET DOCUMENTS FAIL
	getDocumentsFail(err) {
		this.isLoading = false;
		handleError(err, "documents.loadFailed");
	}

	// DELETE DOCUMENTS SUCCESS
	deleteDocumentsSuccess(ids) {
		const removed = ids.map(String);
		this.documents = this.documents.filter((d) => !removed.includes(String(d.id)));
	}

	// DELETE DOCUMENTS FAIL
	deleteDocumentsFail(err) {
		handleError(err, "documents.deleteFailed");
	}
}

export default alt.createStore(DocumentsStore);
