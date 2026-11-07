import React, { Component } from "react";
import { formatDate } from "../dates";
import { t } from "../i18n";

class DocumentDetailRemindersItem extends Component {
	// REMOVE REMINDER
	removeReminder(e) {
		e.preventDefault();
		this.props.removeReminder(this.props.reminder.id);
	}

	// RENDER
	render() {
		return (
			<tr>
				<td>{formatDate(this.props.reminder.date, "medium")}</td>
				<td>{this.props.reminder.note}</td>
				<td>
					<button
						className="btn btn-mini btn-default"
						title={t("reminders.remove")}
						onClick={this.removeReminder.bind(this)}
					>
						<span className="icon icon-trash" />
					</button>
				</td>
			</tr>
		);
	}
}

export default DocumentDetailRemindersItem;
