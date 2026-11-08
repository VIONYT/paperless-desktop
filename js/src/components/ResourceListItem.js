import React from "react";
import { RIEInput, RIESelect } from "riek";
import { matchingAlgorithms } from "./matching";
import { tagColor } from "../utils";

// A row of the list of tags or correspondents. The name, the match and the algorithm can be
// edited in place, tags also show their color.
class ResourceListItem extends React.Component {
	// CHANGE SELECTION
	changeSelection(event) {
		this.props.changeSelection(this.props.item.id, event.target.checked);
	}

	// CHANGE PROP: saves the edited property
	changeProp(changes) {
		const edited = { ...changes };

		// the select delivers the chosen option, the API wants the number
		if ("matching_algorithm" in edited)
			edited.matching_algorithm = parseInt(edited.matching_algorithm.id);

		this.props.update({ ...this.props.item, ...edited });
	}

	// RENDER
	render() {
		const item = this.props.item;
		const change = this.changeProp.bind(this);
		const algorithms = matchingAlgorithms();

		return (
			<tr>
				<td>
					<input type="checkbox" onChange={this.changeSelection.bind(this)} />
				</td>
				{this.props.withColor ? (
					<td>
						<span className="icon icon-record" style={{ color: tagColor(item) }} />
					</td>
				) : null}
				<td>
					<RIEInput
						value={item.name}
						propName="name"
						change={change}
						classEditing="inplace-edit"
					/>
				</td>
				<td>
					<RIEInput
						value={item.match}
						propName="match"
						change={change}
						classEditing="inplace-edit"
						className="tags-match"
					/>
				</td>
				<td>
					<RIESelect
						value={algorithms.find((a) => parseInt(a.id) === item.matching_algorithm)}
						propName="matching_algorithm"
						change={change}
						options={algorithms}
					/>
				</td>
			</tr>
		);
	}
}

export default ResourceListItem;
