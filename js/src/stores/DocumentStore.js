import alt from "../alt";
import DocumentActions from "../actions/DocumentActions";
import bus from "../bus";
import { handleError } from "../errors";

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
		handleError(err, "documents.loadOneFailed");
	}

	// UPDATE DOCUMENT SUCCESS
	updateDocumentSuccess(result) {
		if (result.data) bus.trigger("tabs.setActiveTitle", { title: result.data.title });
	}

	// UPDATE DOCUMENT FAIL
	updateDocumentFail(err) {
		handleError(err, "documents.saveFailed");
	}
}

export default alt.createStore(DocumentStore);
