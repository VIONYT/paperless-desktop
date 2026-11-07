import React from "react";
import CorrespondentsActions from "../actions/CorrespondentsActions";
import CorrespondentsStore from "../stores/CorrespondentsStore";
import Select from "react-select";

class CorrespondentSelect extends React.Component {
	// CONSTRUCTOR
	constructor(props) {
		super(props);

		this.state = CorrespondentsStore.getState();
		this.onChange = this.onChange.bind(this);
	}

	// COMPONENT DID MOUNT
	componentDidMount() {
		CorrespondentsStore.listen(this.onChange);
		CorrespondentsActions.getCorrespondents();
	}

	// COMPONENT WILL UNMOUNT
	componentWillUnmount() {
		CorrespondentsStore.unlisten(this.onChange);
	}

	// ON CHANGE
	onChange(state) {
		this.setState(state);
	}

	// ON CHANGE
	selectChanged(value) {
		this.props.onChange({
			target: {
				name: "correspondent",
				value: value ? value.value : null
			}
		});
	}

	// RENDER
	render() {
		var results = (this.state.correspondents && this.state.correspondents.results) || [];

		// the correspondent of a document is referenced by its id
		var options = results.map((c) => {
			return {
				value: c.id,
				label: c.name
			};
		});

		return (
			<Select
				value={this.props.value}
				onChange={this.selectChanged.bind(this)}
				options={options}
			/>
		);
	}
}

export default CorrespondentSelect;
