import alt from "../alt";
import RemindersActions from "../actions/RemindersActions";
import { ipcRenderer, dialog } from "../electronBridge";
import { t } from "../i18n";

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
		dialog.showErrorBox(t("reminders.loadFailed"), t("common.tryAgain"));
	}

	// ADD REMINDER SUCCESS
	addReminderSuccess(reminder) {
		// the reminder is stored locally, the main window just has to reload them
		ipcRenderer.send("reminderAdd", { data: reminder });
		ipcRenderer.send("closeModal");
	}

	// ADD REMINDER FAIL
	addReminderFail() {
		dialog.showErrorBox(t("reminders.addFailed"), t("common.tryAgain"));
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
		dialog.showErrorBox(t("reminders.removeFailed"), t("common.tryAgain"));
	}
}

export default alt.createStore(RemindersStore);
