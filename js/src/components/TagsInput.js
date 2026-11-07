import React from "react";
import Select from "react-select";
import TagsActions from "../actions/TagsActions";
import TagsStore from "../stores/TagsStore";
import { tagColor } from "../utils";
import { t } from "../i18n";

// the options of the select: the tags that are available on the server
const toOptions = (tags) =>
	((tags && tags.results) || []).map((tag) => ({
		label: tag.name,
		value: tag.id,
		style: { color: tagColor(tag) }
	}));

class TagsInput extends React.Component {
	// CONSTRUCTOR
	constructor(props) {
		super(props);
		this.state = TagsStore.getState();
		this.onChange = this.onChange.bind(this);
	}

	// COMPONENT DID MOUNT
	componentDidMount() {
		TagsStore.listen(this.onChange);

		// make sure the tags are available, even if the sidebar did not load them yet
		if (!this.state.tags || !this.state.tags.results) TagsActions.getTags();
	}

	// COMPONENT WILL UNMOUNT
	componentWillUnmount() {
		TagsStore.unlisten(this.onChange);
	}

	// ON CHANGE
	onChange(state) {
		this.setState(state);
	}

	// CHANGE SELECTION: the tags of a document are the ids of the tags
	changeSelection(selected) {
		this.props.onChange({
			target: { name: "tags", value: selected.map((option) => option.value) }
		});
	}

	// RENDER
	render() {
		return (
			<Select
				name="tags"
				value={this.props.tags}
				options={toOptions(this.state.tags)}
				onChange={this.changeSelection.bind(this)}
				multi={true}
				placeholder={t("document.select")}
			/>
		);
	}
}

export default TagsInput;
