import { Actions, createActions } from "../flux.mjs";
import { request } from "../api";

// RELOAD DOCUMENTS: loads the changed documents again, the list shows the changes without a new page load
const reloadDocuments = (actions, ids) =>
	request({
		method: "get",
		url: "/api/documents/",
		params: { id__in: ids.join(","), page_size: ids.length }
	})
		.then((result) => actions.documentsUpdated(result.data.results))
		.catch(actions.bulkEditFail);

// DOCUMENTS ACTIONS
class DocumentsActions extends Actions {
	constructor() {
		super();
		this.generateActions(
			"getDocumentsSuccess",
			"getDocumentsFail",
			"deleteDocumentsSuccess",
			"deleteDocumentsFail",
			"documentsUpdated",
			"bulkEditFail",
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

	// BULK EDIT: changes or deletes several documents at once, `method` is one of the methods of
	// paperless-ngx: "delete", "set_correspondent" or "modify_tags" (see the parameters there)
	bulkEdit(ids, method, parameters = {}) {
		request({
			method: "post",
			url: "/api/documents/bulk_edit/",
			data: { documents: ids, method: method, parameters: parameters }
		})
			.then(() =>
				method === "delete"
					? this.actions.deleteDocumentsSuccess(ids)
					: reloadDocuments(this.actions, ids)
			)
			.catch(this.actions.bulkEditFail);
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

export default createActions(DocumentsActions);
