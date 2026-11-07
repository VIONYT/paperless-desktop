import React from "react";
import PaperlessComponent from "../components/PaperlessComponent";
import CorrespondentsActions from "../actions/CorrespondentsActions";
import { ipcRenderer } from "../electronBridge";

class CorrespondentsAdd extends PaperlessComponent {
	// CONSTRUCTOR
	constructor(props) {
		super(props);

		this.nameInput = null;
		this.state = {
			name: "",
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

	// SAVE CORRESPONDENT
	saveCorrespondent(e) {
		e.preventDefault();
		CorrespondentsActions.addCorrespondent(this.state);
	}

	// RENDER
	render() {
		return (
			<form className="form-detail-info">
				<h3>Add Correspondent</h3>
				<div className="form-group">
					<label>Name</label>
					<input
						type="text"
						className="form-control"
						name="name"
						placeholder="Name"
						value={this.state.name}
						onChange={this.handleChange.bind(this)}
						ref={(input) => {
							this.nameInput = input;
						}}
					/>
				</div>

				<div className="form-group">
					<label>Match</label>
					<input
						type="text"
						className="form-control"
						name="match"
						placeholder="Match"
						value={this.state.match}
						onChange={this.handleChange.bind(this)}
					/>
				</div>

				<div className="form-group">
					<label>Matching-Algorithm</label>
					<select
						className="form-control"
						name="matching_algorithm"
						value={this.state.matching_algorithm}
						onChange={this.handleChange.bind(this)}
					>
						<option value="0">None</option>
						<option value="1">Any</option>
						<option value="2">All</option>
						<option value="3">Literal</option>
						<option value="4">Regular Expression</option>
						<option value="5">Fuzzy Match</option>
						<option value="6">Auto</option>
					</select>
				</div>

				<div className="btn-group">
					<button
						className="btn btn-large btn-default"
						onClick={this.closeModal.bind(this)}
					>
						Close
					</button>
					<button
						className="btn btn-large btn-primary"
						onClick={this.saveCorrespondent.bind(this)}
					>
						<span className="icon icon-floppy" /> Save
					</button>
				</div>
			</form>
		);
	}
}

export default CorrespondentsAdd;
