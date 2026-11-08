import alt from "../alt";
import DocumentsActions from "../actions/DocumentsActions";
import { handleError, handleLoadError } from "../errors";

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
		handleLoadError(err, "documents.loadFailed");
	}

	// PATCH DOCUMENT SUCCESS: the document in the list shows the changes
	patchDocumentSuccess(result) {
		this.documents = this.documents.map((doc) =>
			doc.id === result.data.id ? { ...doc, ...result.data } : doc
		);
	}

	// PATCH DOCUMENT FAIL
	patchDocumentFail(err) {
		handleError(err, "documents.saveFailed");
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
