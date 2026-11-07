import React from "react";
import PaperlessComponent from "../components/PaperlessComponent";
import RemindersActions from "../actions/RemindersActions";
import RemindersStore from "../stores/RemindersStore";
import moment from "moment";
import { ipcRenderer, dialog } from "../electronBridge";
import { t } from "../i18n";

class RemindersAdd extends PaperlessComponent {
	// CONSTRUCTOR
	constructor(props, context) {
		super(props, context);

		this.state = {
			doc: context.router.params.doc,
			date: null,
			note: null
		};
	}

	// CLOSE MODAL
	closeModal() {
		ipcRenderer.send("closeModal");
	}

	// SAVE REMINDER
	saveReminder(e) {
		e.preventDefault();

		var date = moment(this.state.date)
			.utc()
			.toISOString();

		// check if reminder is in the future
		if (
			moment(this.state.date)
				.utc()
				.isBefore(moment.utc())
		) {
			return dialog.showErrorBox(t("reminders.pastTitle"), t("reminders.pastMessage"));
		}

		// check if a note is available
		if (this.state.note === null || this.state.note.trim().length <= 0) {
			return dialog.showErrorBox(t("reminders.noteMissingTitle"), t("reminders.noteMissing"));
		}

		RemindersActions.addReminder(this.state.doc, date, this.state.note);
	}

	// HANDLE CHANGE
	handleChange(e) {
		var s = this.state;
		s[e.target.name] = e.target.value;

		this.setState(s);
	}

	// RENDER
	render() {
		return (
			<form className="form-detail-info">
				<h3>{t("reminders.add")}</h3>
				<div className="form-group">
					<label>{t("common.date")}</label>
					<input
						type="datetime-local"
						className="form-control"
						name="date"
						onChange={this.handleChange.bind(this)}
						placeholder="Reminder"
					/>
				</div>
				<div className="form-group">
					<label>{t("common.note")}</label>
					<textarea
						className="form-control"
						rows="2"
						name="note"
						onChange={this.handleChange.bind(this)}
						placeholder={t("reminders.notePlaceholder")}
					/>
				</div>

				<p style={{ color: "grey" }}>{t("reminders.hint")}</p>

				<div className="btn-group">
					<button
						className="btn btn-large btn-default"
						onClick={this.closeModal.bind(this)}
					>
						{t("common.close")}
					</button>
					<button
						className="btn btn-large btn-primary"
						onClick={this.saveReminder.bind(this)}
					>
						<span className="icon icon-floppy" /> {t("common.save")}
					</button>
				</div>
			</form>
		);
	}
}

// CONTEXT TYPES
RemindersAdd.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default RemindersAdd;
