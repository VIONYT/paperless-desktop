import { Actions, createActions } from "../flux.mjs";
import { getHost } from "../api";

// REMINDERS ACTIONS
//
// paperless-ngx does not know the concept of reminders, so they are kept locally in
// the app (per paperless instance). A reminder looks like this:
// { id: 1, document: <id of the document>, date: "<ISO date>", note: "..." }

// the key under which the reminders of the current paperless instance are stored
const storageKey = () => {
	return "reminders." + getHost();
};

// READ ALL REMINDERS
const readReminders = () => {
	try {
		const reminders = JSON.parse(localStorage.getItem(storageKey()));
		return Array.isArray(reminders) ? reminders : [];
	} catch (e) {
		return [];
	}
};

// WRITE ALL REMINDERS
const writeReminders = (reminders) => {
	localStorage.setItem(storageKey(), JSON.stringify(reminders));
};

// Reminders are read synchronously from the local storage. Actions may be triggered while the
// store is still dispatching (e.g. when a component mounts as a result of another action),
// so the result is dispatched asynchronously, just like the results of the API requests.
const defer = (fn) => {
	window.setTimeout(fn, 0);
};

class RemindersActions extends Actions {
	constructor() {
		super();
		this.generateActions(
			"getRemindersSuccess",
			"getRemindersFail",
			"addReminderSuccess",
			"addReminderFail",
			"removeReminderSuccess",
			"removeReminderFail"
		);
	}

	// ADD REMINDER
	addReminder(id, date, note) {
		defer(() => {
			try {
				const reminders = readReminders();
				const nextId = reminders.reduce((max, r) => Math.max(max, r.id), 0) + 1;

				const reminder = {
					id: nextId,
					document: Number(id),
					date: date,
					note: note
				};

				reminders.push(reminder);
				writeReminders(reminders);

				this.actions.addReminderSuccess(reminder);
			} catch (e) {
				this.actions.addReminderFail(e);
			}
		});
	}

	// REMOVE REMINDER
	removeReminder(id) {
		defer(() => {
			try {
				writeReminders(readReminders().filter((r) => r.id !== id));
				this.actions.removeReminderSuccess(id);
			} catch (e) {
				this.actions.removeReminderFail(e);
			}
		});
	}

	// GET REMINDERS
	getReminders() {
		defer(() => {
			try {
				this.actions.getRemindersSuccess(readReminders());
			} catch (e) {
				this.actions.getRemindersFail(e);
			}
		});
	}
}

export default createActions(RemindersActions);
