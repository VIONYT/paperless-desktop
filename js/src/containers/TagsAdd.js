import React from "react";
import PaperlessComponent from "../components/PaperlessComponent";
import TagsActions from "../actions/TagsActions";
import { ipcRenderer } from "../electronBridge";
import { t } from "../i18n";

class TagsAdd extends PaperlessComponent {
	// CONSTRUCTOR
	constructor(props) {
		super(props);

		this.nameInput = null;

		this.state = {
			name: "",
			color: "#a6cee3",
			match: "",
			matching_algorithm: 6
		};
	}

	// COMPONENT DID MOUNT
	componentDidMount() {
		this.nameInput.focus();
	}

	// CLOSE MODAL
	closeModal() {
		ipcRenderer.send("closeModal");
	}

	// HANDLE CHANGE
	handleChange(e) {
		var s = this.state;
		s[e.target.name] = e.target.value;

		// the API expects the matching algorithm as number
		if (e.target.name === "matching_algorithm") {
			s[e.target.name] = parseInt(e.target.value);
		}

		this.setState(s);
	}

	// SAVE TAG
	saveTag(e) {
		e.preventDefault();
		TagsActions.addTag(this.state);
	}

	// RENDER
	render() {
		return (
			<form className="form-detail-info">
				<h3>{t("tags.addTitle")}</h3>
				<div className="form-group">
					<label>{t("common.name")}</label>
					<input
						type="text"
						className="form-control"
						name="name"
						placeholder={t("common.name")}
						value={this.state.name}
						onChange={this.handleChange.bind(this)}
						ref={(input) => {
							this.nameInput = input;
						}}
					/>
				</div>

				<div className="form-group">
					<label>{t("common.color")}</label>
					<input
						type="color"
						className="form-control"
						name="color"
						value={this.state.color}
						onChange={this.handleChange.bind(this)}
					/>
				</div>

				<div className="form-group">
					<label>{t("common.match")}</label>
					<input
						type="text"
						className="form-control"
						name="match"
						placeholder={t("common.match")}
						value={this.state.match}
						onChange={this.handleChange.bind(this)}
					/>
				</div>

				<div className="form-group">
					<label>{t("matching.labelForm")}</label>
					<select
						className="form-control"
						name="matching_algorithm"
						value={this.state.matching_algorithm}
						onChange={this.handleChange.bind(this)}
					>
						<option value="0">{t("matching.none")}</option>
						<option value="1">{t("matching.any")}</option>
						<option value="2">{t("matching.all")}</option>
						<option value="3">{t("matching.literal")}</option>
						<option value="4">{t("matching.regex")}</option>
						<option value="5">{t("matching.fuzzy")}</option>
						<option value="6">{t("matching.auto")}</option>
					</select>
					<small>{t("matching.help")}</small>
				</div>

				<div className="btn-group">
					<button
						className="btn btn-large btn-default"
						onClick={this.closeModal.bind(this)}
					>
						{t("common.close")}
					</button>
					<button className="btn btn-large btn-primary" onClick={this.saveTag.bind(this)}>
						<span className="icon icon-floppy" /> {t("common.save")}
					</button>
				</div>
			</form>
		);
	}
}

export default TagsAdd;
