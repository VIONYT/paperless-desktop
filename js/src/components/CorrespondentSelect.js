import React from "react";
import Select from "react-select";
import CorrespondentsActions from "../actions/CorrespondentsActions";
import CorrespondentsStore from "../stores/CorrespondentsStore";
import { t } from "../i18n";

// the options of the select: the correspondents that are available on the server
const toOptions = (correspondents) =>
	((correspondents && correspondents.results) || []).map((c) => ({ value: c.id, label: c.name }));

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

	// SELECT CHANGED: the correspondent of a document is referenced by its id (or none)
	selectChanged(option) {
		this.props.onChange({
			target: { name: "correspondent", value: option ? option.value : null }
		});
	}

	// RENDER
	render() {
		return (
			<Select
				value={this.props.value}
				onChange={this.selectChanged.bind(this)}
				options={toOptions(this.state.correspondents)}
				placeholder={t("document.select")}
			/>
		);
	}
}

export default CorrespondentSelect;
