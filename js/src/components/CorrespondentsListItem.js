import React from "react";
import PaperlessComponent from "./PaperlessComponent";
import { RIEInput, RIESelect } from "riek";
import { t } from "../i18n";

class CorrespondentsListItem extends PaperlessComponent {
	// CONSTRUCTOR
	constructor(props) {
		super(props);

		// matching algorithm options
		this.matching_algorithm = [
			{ id: "0", text: t("matching.none") },
			{ id: "1", text: t("matching.any") },
			{ id: "2", text: t("matching.all") },
			{ id: "3", text: t("matching.literal") },
			{ id: "4", text: t("matching.regex") },
			{ id: "5", text: t("matching.fuzzy") },
			{ id: "6", text: t("matching.auto") }
		];
	}

	// CHANGE SELECTION
	changeSelection(event) {
		const target = event.target;
		this.props.changeSelection(this.props.correspondent.id, target.checked);
	}

	// CHANGE PROP
	changeProp(e) {
		// special select box arrangement
		if ("matching_algorithm" in e) {
			e["matching_algorithm"] = parseInt(e["matching_algorithm"].id);
		}

		var data = Object.assign(this.props.correspondent, e);
		this.props.updateCorrespondent(data);
	}

	// RENDER
	render() {
		return (
			<tr>
				<td>
					<input type="checkbox" onChange={this.changeSelection.bind(this)} />
				</td>
				<td>
					<RIEInput
						value={this.props.correspondent.name}
						propName="name"
						change={this.changeProp.bind(this)}
						classEditing="inplace-edit"
					/>
				</td>
				<td>
					<RIEInput
						value={this.props.correspondent.match}
						propName="match"
						change={this.changeProp.bind(this)}
						classEditing="inplace-edit"
						className="correspondents-match"
					/>
				</td>
				<td>
					<RIESelect
						value={this.matching_algorithm.find((a) => {
							return parseInt(a.id) === this.props.correspondent.matching_algorithm;
						})}
						propName="matching_algorithm"
						change={this.changeProp.bind(this)}
						options={this.matching_algorithm}
					/>
				</td>
			</tr>
		);
	}
}

export default CorrespondentsListItem;
