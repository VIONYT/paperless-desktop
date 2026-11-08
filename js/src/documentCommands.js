import DocumentsActions from "./actions/DocumentsActions";
import DocumentsStore from "./stores/DocumentsStore";
import { tagChange } from "./selection.mjs";
import { confirmDelete } from "./dialogs";

// the documents of the list with these ids
const documentsOf = (ids) =>
	DocumentsStore.getState().documents.filter((doc) => ids.includes(doc.id));

// DELETE: after the confirmation of the user
const remove = (ids) => {
	const [titleKey, values] =
		ids.length === 1
			? ["document.deleteConfirmTitle"]
			: ["documents.deleteMany", { count: ids.length }];

	confirmDelete(titleKey, values).then((confirmed) => {
		if (confirmed) DocumentsActions.bulkEdit(ids, "delete");
	});
};

// RUN DOCUMENT COMMAND: the choice in the context menu or in the selection bar,
// `action` is "edit", "delete", "correspondent" or "tag", `id` the chosen correspondent or tag
export const runDocumentCommand = ({ action, documentIds, id }, router) => {
	if (action === "edit") router.push("/document/" + documentIds[0]);
	else if (action === "delete") remove(documentIds);
	else if (action === "correspondent")
		DocumentsActions.bulkEdit(documentIds, "set_correspondent", { correspondent: id });
	else if (action === "tag")
		DocumentsActions.bulkEdit(documentIds, "modify_tags", {
			add_tags: [],
			remove_tags: [],
			...tagChange(documentsOf(documentIds), id)
		});
};
