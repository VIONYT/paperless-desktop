import { Actions, createActions } from "../flux.mjs";
import { request } from "../api";

// the fields of a document the user can edit in the app
const EDITABLE_FIELDS = ["title", "content", "correspondent", "tags", "created"];

// DOCUMENT ACTIONS
class DocumentActions extends Actions {
	constructor() {
		super();
		this.generateActions(
			"getDocumentSuccess",
			"getDocumentFail",
			"updateDocumentSuccess",
			"updateDocumentFail"
		);
	}

	// GET DOC
	getDocument(id) {
		request({ method: "get", url: "/api/documents/" + id + "/" })
			.then(this.actions.getDocumentSuccess)
			.catch(this.actions.getDocumentFail);
	}

	// UPDATE DOCUMENT
	updateDocument(doc) {
		// only send what can be changed, the rest of the document is read-only
		const data = {};
		EDITABLE_FIELDS.forEach((field) => {
			if (field in doc) data[field] = doc[field];
		});

		request({ method: "patch", url: "/api/documents/" + doc.id + "/", data: data })
			.then(this.actions.updateDocumentSuccess)
			.catch(this.actions.updateDocumentFail);
	}
}

export default createActions(DocumentActions);
