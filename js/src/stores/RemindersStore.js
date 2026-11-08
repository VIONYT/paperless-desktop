import { Store, createStore } from "../flux.mjs";
import RemindersActions from "../actions/RemindersActions";
import native from "../native";
import { handleError } from "../errors";

// REMINDERS STORE
class RemindersStore extends Store {
	constructor() {
		super();
		this.bindActions(RemindersActions);
		this.reminders = [];
	}

	// GET REMINDERS SUCCESS
	getRemindersSuccess(result) {
		this.reminders = result;
	}

	// GET REMINDERS FAIL
	getRemindersFail(err) {
		handleError(err, "reminders.loadFailed");
	}

	// ADD REMINDER SUCCESS: reminders are stored locally, the main window just has to reload them
	addReminderSuccess(reminder) {
		native.send("reminderAdd", { data: reminder });
		native.send("closeModal");
	}

	// ADD REMINDER FAIL
	addReminderFail(err) {
		handleError(err, "reminders.addFailed");
	}

	// REMOVE REMINDER SUCCESS
	removeReminderSuccess(id) {
		this.reminders = this.reminders.filter((r) => r.id !== id);
	}

	// REMOVE REMINDER FAIL
	removeReminderFail(err) {
		handleError(err, "reminders.removeFailed");
	}
}

export default createStore(RemindersStore);
