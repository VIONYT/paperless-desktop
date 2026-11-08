import React from "react";
import RemindersActions from "../actions/RemindersActions";
import native from "../native";
import { t } from "../i18n";
import PropTypes from "prop-types";

class RemindersAdd extends React.Component {
	// CONSTRUCTOR
	constructor(props, context) {
		super(props, context);
		this.state = { doc: context.router.params.doc, date: "", note: "" };
	}

	// CLOSE MODAL
	closeModal() {
		native.send("closeModal");
	}

	// SAVE REMINDER: the date has to be in the future and the reminder needs a note
	saveReminder(e) {
		e.preventDefault();
		const date = new Date(this.state.date);

		if (!(date > new Date())) {
			native.showError(t("reminders.pastTitle"), t("reminders.pastMessage"));
		} else if (this.state.note.trim().length === 0) {
			native.showError(t("reminders.noteMissingTitle"), t("reminders.noteMissing"));
		} else {
			RemindersActions.addReminder(this.state.doc, date.toISOString(), this.state.note);
		}
	}

	// HANDLE CHANGE
	handleChange(e) {
		this.setState({ [e.target.name]: e.target.value });
	}

	// RENDER
	render() {
		const change = this.handleChange.bind(this);

		return (
			<form className="form-detail-info">
				<h3>{t("reminders.add")}</h3>
				<div className="form-group">
					<label>{t("common.date")}</label>
					<input
						type="datetime-local"
						className="form-control"
						name="date"
						onChange={change}
					/>
				</div>
				<div className="form-group">
					<label>{t("common.note")}</label>
					<textarea
						className="form-control"
						rows="2"
						name="note"
						onChange={change}
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
	router: PropTypes.object.isRequired
};

export default RemindersAdd;
