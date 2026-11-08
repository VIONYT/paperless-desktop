import React from "react";
import TagsInput from "./TagsInput";
import CorrespondentSelect from "./CorrespondentSelect";
import DocumentDetailReminders from "./DocumentDetailReminders";
import { isDateOnly, toLocalInput } from "../dates";
import { t } from "../i18n";

// The value of the date input as the API expects it: a plain date for paperless-ngx 2.16+,
// otherwise an ISO date time (the input delivers local time).
const toApiDate = (value, created) =>
	isDateOnly(created) || !value ? value : new Date(value).toISOString();

class DocumentDetailForm extends React.Component {
	// HANDLE DETAIL CHANGE
	handleDetailChange(e) {
		const { name, value } = e.target;
		const doc = {
			...this.props.doc,
			[name]: name === "created" ? toApiDate(value, this.props.doc.created) : value
		};

		this.props.changeDoc(doc);
	}

	// RENDER
	render() {
		const doc = this.props.doc;
		const dateOnly = isDateOnly(doc.created);
		const change = this.handleDetailChange.bind(this);

		return (
			<form className="form-detail-info">
				<div className="form-group">
					<label>{t("document.title")}</label>
					<input
						type="text"
						className="form-control"
						name="title"
						placeholder={t("document.title")}
						value={doc.title}
						onChange={change}
					/>
				</div>

				<div className="form-group">
					<label>{t("document.correspondent")}</label>
					<CorrespondentSelect value={doc.correspondent} onChange={change} />
				</div>

				<div className="form-group">
					<label>{t("document.content")}</label>
					<textarea
						className="form-control"
						rows="6"
						name="content"
						placeholder={t("document.content")}
						value={doc.content || ""}
						onChange={change}
					/>
				</div>

				<div className="form-group">
					<label>{t("document.tags")}</label>
					<div className="select-wrapper">
						<TagsInput tags={doc.tags} onChange={change} />
					</div>
				</div>

				<div className="form-group">
					<label>{t("document.date")}</label>
					<input
						type={dateOnly ? "date" : "datetime-local"}
						className="form-control"
						name="created"
						placeholder={t("document.date")}
						value={dateOnly ? doc.created : toLocalInput(doc.created)}
						onChange={change}
					/>
				</div>

				<div className="form-group">
					<label>{t("document.reminders")}</label>
					<DocumentDetailReminders doc={doc} />
				</div>
			</form>
		);
	}
}

export default DocumentDetailForm;
