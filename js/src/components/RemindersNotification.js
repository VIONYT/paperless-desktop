import React from "react";
import RemindersActions from "../actions/RemindersActions";
import RemindersStore from "../stores/RemindersStore";
import DocumentsStore from "../stores/DocumentsStore";
import native from "../native";
import { t } from "../i18n";

const CHECK_INTERVAL = 60 * 1000;

// the title of the notification: the title of the document, if it is in the list
const notificationTitle = (reminder) => {
	const doc = DocumentsStore.getState().documents.find((d) => d.id === reminder.document);
	return doc ? doc.title : t("reminders.defaultTitle");
};

// SHOW NOTIFICATION: a click on it shows the document
const showNotification = (reminder) => {
	const notification = new window.Notification(notificationTitle(reminder), {
		body: reminder.note
	});

	notification.onclick = () => {
		native.send("focusWindow");
		native.send("openDocument", { id: reminder.document });
	};
};

class RemindersNotification extends React.Component {
	// CONSTRUCTOR
	constructor(props) {
		super(props);
		this.state = RemindersStore.getState();
		this.onChange = this.onChange.bind(this);
		this.interval = null;
	}

	// COMPONENT DID MOUNT
	componentDidMount() {
		this.interval = window.setInterval(() => this.checkReminders(), CHECK_INTERVAL);

		RemindersStore.listen(this.onChange);
		RemindersActions.getReminders();
	}

	// COMPONENT WILL UNMOUNT
	componentWillUnmount() {
		window.clearInterval(this.interval);
		RemindersStore.unlisten(this.onChange);
	}

	// ON CHANGE
	onChange(state) {
		this.setState(state);
	}

	// CHECK REMINDERS: overdue reminders are shown once and removed
	checkReminders() {
		const now = new Date();

		this.state.reminders
			.filter((reminder) => new Date(reminder.date) < now)
			.forEach((reminder) => {
				showNotification(reminder);
				RemindersActions.removeReminder(reminder.id);
			});
	}

	// RENDER
	render() {
		return null;
	}
}

export default RemindersNotification;
