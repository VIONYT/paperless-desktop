import React from "react";
import InlineText from "./InlineText";
import InlineSelect from "./InlineSelect";
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
			edited.matching_algorithm = parseInt(edited.matching_algorithm.id, 10);

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
					<InlineText value={item.name} onSave={(name) => change({ name })} />
				</td>
				<td>
					<InlineText
						value={item.match}
						className="tags-match"
						onSave={(match) => change({ match })}
					/>
				</td>
				<td>
					<InlineSelect
						value={algorithms.find(
							(a) => parseInt(a.id, 10) === item.matching_algorithm
						)}
						options={algorithms}
						onSave={(option) => change({ matching_algorithm: option })}
					/>
				</td>
			</tr>
		);
	}
}

export default ResourceListItem;
