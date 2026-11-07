import alt from "../alt";
import RemindersActions from "../actions/RemindersActions";
import { ipcRenderer, dialog } from "../electronBridge";

// REMINDERS STORE
class RemindersStore {
	constructor() {
		this.bindActions(RemindersActions);
		this.reminders = [];
	}

	// GET REMINDERS SUCCESS
	getRemindersSuccess(result) {
		this.reminders = result;
	}

	// GET REMINDERS FAIL
	getRemindersFail() {
		dialog.showErrorBox("Could not load reminders!", "Please try again.");
	}

	// ADD REMINDER SUCCESS
	addReminderSuccess(reminder) {
		// the reminder is stored locally, the main window just has to reload them
		ipcRenderer.send("reminderAdd", { data: reminder });
		ipcRenderer.send("closeModal");
	}

	// ADD REMINDER FAIL
	addReminderFail() {
		dialog.showErrorBox("Could not add the reminder!", "Please try again.");
	}

	// REMOVE REMINDER SUCCESS
	removeReminderSuccess(id) {
		// filter out the removed reminder
		this.reminders = this.reminders.filter((r) => {
			return r.id !== id;
		});
	}

	// REMOVE REMINDER FAIL
	removeReminderFail() {
		dialog.showErrorBox("Could not remove the reminder!", "Please try again.");
	}
}

export default alt.createStore(RemindersStore);
