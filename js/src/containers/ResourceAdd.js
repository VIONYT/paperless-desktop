import React from "react";
import native from "../native";
import { matchingAlgorithms } from "../components/matching";
import { t } from "../i18n";

// The form of the modal window that adds a tag or a correspondent. Tags also have a color and
// explain the matching algorithms.
//
// props: { titleKey, withColor, save(data) }
class ResourceAdd extends React.Component {
	// CONSTRUCTOR
	constructor(props) {
		super(props);
		this.state = { name: "", match: "", matching_algorithm: 6, color: "#a6cee3" };
		this.nameInput = null;
	}

	// COMPONENT DID MOUNT
	componentDidMount() {
		this.nameInput.focus();
	}

	// CLOSE MODAL
	closeModal() {
		native.send("closeModal");
	}

	// HANDLE CHANGE: the API expects the matching algorithm as number
	handleChange(e) {
		const { name, value } = e.target;
		this.setState({ [name]: name === "matching_algorithm" ? parseInt(value) : value });
	}

	// SAVE
	save(e) {
		e.preventDefault();

		const { name, match, matching_algorithm, color } = this.state;
		this.props.save({
			name,
			match,
			matching_algorithm,
			...(this.props.withColor ? { color } : {})
		});
	}

	// RENDER FIELD
	renderField(label, input) {
		return (
			<div className="form-group">
				<label>{label}</label>
				{input}
			</div>
		);
	}

	// RENDER
	render() {
		const change = this.handleChange.bind(this);
		const text = (name) => (
			<input
				type="text"
				className="form-control"
				name={name}
				placeholder={t("common." + name)}
				value={this.state[name]}
				onChange={change}
				ref={(input) => {
					if (name === "name") this.nameInput = input;
				}}
			/>
		);

		return (
			<form className="form-detail-info">
				<h3>{t(this.props.titleKey)}</h3>
				{this.renderField(t("common.name"), text("name"))}

				{this.props.withColor
					? this.renderField(
							"color",
							t("common.color"),
							<input
								type="color"
								className="form-control"
								name="color"
								value={this.state.color}
								onChange={change}
							/>
					  )
					: null}

				{this.renderField(t("common.match"), text("match"))}

				<div className="form-group">
					<label>{t("matching.labelForm")}</label>
					<select
						className="form-control"
						name="matching_algorithm"
						value={this.state.matching_algorithm}
						onChange={change}
					>
						{matchingAlgorithms().map((a) => (
							<option key={a.id} value={a.id}>
								{a.text}
							</option>
						))}
					</select>
					{this.props.withColor ? <small>{t("matching.help")}</small> : null}
				</div>

				<div className="btn-group">
					<button
						className="btn btn-large btn-default"
						onClick={this.closeModal.bind(this)}
					>
						{t("common.close")}
					</button>
					<button className="btn btn-large btn-primary" onClick={this.save.bind(this)}>
						<span className="icon icon-floppy" /> {t("common.save")}
					</button>
				</div>
			</form>
		);
	}
}

export default ResourceAdd;
