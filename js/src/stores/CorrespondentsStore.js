import alt from "../alt";
import CorrespondentsActions from "../actions/CorrespondentsActions";
import ToolbarActions from "../actions/ToolbarActions";
import native from "../native";
import { handleError, handleLoadError } from "../errors";

// CORRESPONDENTS STORE
class CorrespondentsStore {
	constructor() {
		this.bindActions(CorrespondentsActions);
		this.correspondents = [];
	}

	// GET CORRESPONDENTS SUCCESS
	getCorrespondentsSuccess(result) {
		this.correspondents = result.data;
	}

	// GET CORRESPONDENTS FAIL
	getCorrespondentsFail(err) {
		handleLoadError(err, "correspondents.loadFailed");
	}

	// DELETE CORRESPONDENTS SUCCESS
	deleteCorrespondentsSuccess(ids) {
		if (this.correspondents.results) {
			this.correspondents.results = this.correspondents.results.filter(
				(c) => !ids.includes(c.id)
			);
		}

		// remove the delete button
		window.setTimeout(() => ToolbarActions.removeItem("remove-correspondents"), 0);
	}

	// DELETE CORRESPONDENTS FAIL
	deleteCorrespondentsFail(err) {
		handleError(err, "correspondents.deleteFailed");
	}

	// ADD CORRESPONDENT SUCCESS: the modal window hands the new correspondent over to the list
	addCorrespondentSuccess(result) {
		native.send("correspondentAdd", { data: result.data });
		native.send("closeModal");
	}

	// ADD CORRESPONDENT FAIL
	addCorrespondentFail(err) {
		handleError(err, "correspondents.addFailed", "correspondents.addFailedMessage");
	}

	// EDIT CORRESPONDENT SUCCESS: replaces the correspondent with the edited one
	editCorrespondentSuccess(result) {
		if (!result.data) return;

		this.correspondents.results = this.correspondents.results.map((c) =>
			c.id === result.data.id ? result.data : c
		);
	}

	// EDIT CORRESPONDENT FAIL
	editCorrespondentFail(err) {
		handleError(err, "correspondents.editFailed", "correspondents.editFailedMessage");
	}
}

export default alt.createStore(CorrespondentsStore);
