import React from "react";
import moment from "moment";
import TagsInput from "./TagsInput";
import PaperlessComponent from "./PaperlessComponent";
import CorrespondentSelect from "./CorrespondentSelect";
import DocumentDetailReminders from "./DocumentDetailReminders";

// paperless-ngx 2.16+ delivers the creation date of a document as a plain date
// (YYYY-MM-DD), older versions deliver a date time
const isDateOnly = (created) => {
	return typeof created === "string" && created.indexOf("T") < 0;
};

class DocumentDetailForm extends PaperlessComponent {
	// CONSTRUCTOR
	constructor(props) {
		super(props);
		this.state = {
			doc: this.props.doc
		};
	}

	// HANDLE DETAIL CHANGE
	handleDetailChange(e) {
		var doc = this.state.doc;
		var value = e.target.value;

		// a date time input delivers local time, paperless expects an ISO string
		if (e.target.name === "created" && !isDateOnly(doc.created) && value) {
			value = moment(value).toISOString();
		}

		doc[e.target.name] = value;

		this.setState({
			doc: doc
		});

		this.props.changeDoc(doc);
	}

	// RENDER
	render() {
		var dateOnly = isDateOnly(this.state.doc.created);

		// convert the date to local time
		var created = dateOnly
			? this.state.doc.created
			: moment
					.utc(this.state.doc.created)
					.local()
					.format("YYYY-MM-DD[T]HH:mm");

		return (
			<form className="form-detail-info">
				<div className="form-group">
					<label>Title</label>
					<input
						type="text"
						className="form-control"
						name="title"
						placeholder="Title"
						value={this.state.doc.title}
						onChange={this.handleDetailChange.bind(this)}
					/>
				</div>

				<div className="form-group">
					<label>Correspondent</label>
					<CorrespondentSelect
						value={this.state.doc.correspondent}
						onChange={this.handleDetailChange.bind(this)}
					/>
				</div>

				<div className="form-group">
					<label>Content</label>
					<textarea
						className="form-control"
						rows="6"
						name="content"
						placeholder="Content"
						value={this.state.doc.content || ""}
						onChange={this.handleDetailChange.bind(this)}
					/>
				</div>

				<div className="form-group">
					<label>Tags</label>
					<div className="select-wrapper">
						<TagsInput
							tags={this.state.doc.tags}
							onChange={this.handleDetailChange.bind(this)}
						/>
					</div>
				</div>

				<div className="form-group">
					<label>Date</label>
					<input
						type={dateOnly ? "date" : "datetime-local"}
						className="form-control"
						name="created"
						placeholder="Date"
						value={created}
						onChange={this.handleDetailChange.bind(this)}
					/>
				</div>

				<div className="form-group">
					<label>Reminders</label>
					<DocumentDetailReminders doc={this.state.doc} />
				</div>
			</form>
		);
	}
}

export default DocumentDetailForm;
