import alt from "../alt";
import { request } from "../api";

// DOCUMENTS ACTIONS
class DocumentsActions {
	constructor() {
		this.generateActions(
			"getDocumentsSuccess",
			"getDocumentsFail",
			"deleteDocumentsSuccess",
			"deleteDocumentsFail",
			"patchDocumentSuccess",
			"patchDocumentFail",
			"setLoading",
			"resetDocuments"
		);
	}

	// GET DOCS
	// correspondent and tag are the ids that are used as a filter
	getDocuments(correspondent, tag, page = 1) {
		this.actions.setLoading(true);

		const params = { ordering: "-created", page: page };
		if (correspondent) params.correspondent__id = correspondent;
		if (tag) params.tags__id__all = tag;

		request({ method: "get", url: "/api/documents/", params: params })
			.then((result) => {
				return this.actions.getDocumentsSuccess({
					data: result.data,
					correspondent: correspondent,
					tag: tag
				});
			})
			.catch(this.actions.getDocumentsFail);
	}

	// SEARCH DOCUMENTS
	searchDocuments(query) {
		this.actions.setLoading(true);
		this.actions.resetDocuments();

		request({ method: "get", url: "/api/documents/", params: { query: query } })
			.then((result) => {
				return this.actions.getDocumentsSuccess({
					data: result.data,
					correspondent: null,
					tag: null
				});
			})
			.catch(this.actions.getDocumentsFail);
	}

	// PATCH DOCUMENT: changes some fields of a document, e.g. its correspondent
	patchDocument(id, changes) {
		request({ method: "patch", url: "/api/documents/" + id + "/", data: changes })
			.then(this.actions.patchDocumentSuccess)
			.catch(this.actions.patchDocumentFail);
	}

	// DELETE DOCUMENT
	deleteDocuments(ids) {
		Promise.all(
			ids.map((id) => request({ method: "delete", url: "/api/documents/" + id + "/" }))
		)
			.then(() => this.actions.deleteDocumentsSuccess(ids))
			.catch(this.actions.deleteDocumentsFail);
	}
}

export default alt.createActions(DocumentsActions);
