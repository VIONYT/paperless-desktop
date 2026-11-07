import React, { Component } from "react";
import RemindersActions from "../actions/RemindersActions";
import RemindersStore from "../stores/RemindersStore";
import DocumentsStore from "../stores/DocumentsStore";
import moment from "moment";
import { ipcRenderer } from "../electronBridge";
import { t } from "../i18n";

class RemindersNotification extends Component {
	// CONSTRUCTOR
	constructor(props) {
		super(props);
		this.state = RemindersStore.getState();
		this.onChange = this.onChange.bind(this);
		this.interval = null;
	}

	// COMPONENT DID MOUNT
	componentDidMount() {
		this.interval = window.setInterval(() => {
			this.checkReminders();
		}, 60 * 1000);

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

	// CHECK REMINDERS
	checkReminders() {
		// find reminders that are overdue
		var overdueReminders = this.state.reminders.filter((r) => {
			return moment(r.date).isBefore(moment().utc());
		});

		// load all documents
		var docs = DocumentsStore.getState();

		// loop overdue reinders
		var documents = overdueReminders.map((o) => {
			// find matching document to notification
			var doc = docs.documents.find((d) => o.document.endsWith("/" + d.id + "/"));

			var notifTitle = t("reminders.defaultTitle");
			if (doc) {
				notifTitle = doc.title;
			}

			// create notification
			var notif = new window.Notification(notifTitle, {
				body: o.note
			});

			// If the user clicks in the Notifications Center, show the app
			notif.onclick = function() {
				ipcRenderer.send("focusWindow");

				var doc = o.document.split("/");
				ipcRenderer.send("openDocument", {
					id: doc[doc.length - 2]
				});
			};

			RemindersActions.removeReminder(o.id);
		});
	}

	// RENDER
	render() {
		return null;
	}
}

export default RemindersNotification;
