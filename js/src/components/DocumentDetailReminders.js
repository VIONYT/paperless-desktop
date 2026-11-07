import React from "react";
import RemindersActions from "../actions/RemindersActions";
import RemindersStore from "../stores/RemindersStore";
import DocumentDetailRemindersItem from "./DocumentDetailRemindersItem";
import { ipcRenderer } from "../electronBridge";

class DocumentDetailReminders extends React.Component {
	// CONSTRUCTOR
	constructor(props) {
		super(props);
		this.state = RemindersStore.getState();
		this.onChange = this.onChange.bind(this);
	}

	// COMPONENT DID MOUNT
	componentDidMount() {
		RemindersStore.listen(this.onChange);
		RemindersActions.getReminders();

		// EVENT: reminderAdded (reminders are stored locally, reload them)
		ipcRenderer.on("reminderAdded", () => {
			RemindersActions.getReminders();
		});
	}

	// COMPONENT WILL UNMOUNT
	componentWillUnmount() {
		RemindersStore.unlisten(this.onChange);
	}

	// ON CHANGE
	onChange(state) {
		this.setState(state);
	}

	// REMOVE REMINDER
	removeReminder(id) {
		RemindersActions.removeReminder(id);
	}

	// RENDER
	render() {
		// filter out the matching reminders
		var reminders = this.state.reminders.filter((r) => {
			return r.document.endsWith("/" + this.props.doc.id + "/");
		});

		// display that no reminders are available
		var content = <span className="no-reminders">no reminders set</span>;

		// if there are reminders available, show them
		if (reminders.length > 0) {
			var reminderTRs = reminders.map((r, idx) => {
				return (
					<DocumentDetailRemindersItem
						key={"reminders_" + idx}
						reminder={r}
						removeReminder={this.removeReminder.bind(this)}
					/>
				);
			});

			content = (
				<table className="table-striped">
					<thead>
						<tr>
							<th>Date</th>
							<th>Note</th>
							<th />
						</tr>
					</thead>
					<tbody>{reminderTRs}</tbody>
				</table>
			);
		}

		return <div>{content}</div>;
	}
}

export default DocumentDetailReminders;
