import React from "react";
import PaperlessComponent from "./PaperlessComponent";
import TagsActions from "../actions/TagsActions";
import TagsStore from "../stores/TagsStore";
import Select from "react-select";
import { t } from "../i18n";

class TagsInput extends PaperlessComponent {
	// CONSTRUCTOR
	constructor(props) {
		super(props);

		this.state = TagsStore.getState();
		this.onChange = this.onChange.bind(this);

		// the tags of a document are the ids of the tags
		this.state.selection = props.tags ? props.tags.slice() : [];
	}

	// COMPONENT DID MOUNT
	componentDidMount() {
		TagsStore.listen(this.onChange);

		// make sure the tags are available, even if the sidebar did not load them yet
		if (!this.state.tags || !this.state.tags.results) {
			TagsActions.getTags();
		}
	}

	// COMPONENT WILL UNMOUNT
	componentWillUnmount() {
		TagsStore.unlisten(this.onChange);
	}

	// ON CHANGE
	onChange(state) {
		this.setState(state);
	}

	// CHANGE SELECTION
	changeSelection(val) {
		// prepare the paperless API value for the tags: a list of tag ids
		var updateTags = val.map((v) => v.value);

		this.setState({
			selection: updateTags
		});

		this.props.onChange({
			target: {
				name: "tags",
				value: updateTags
			}
		});
	}

	// RENDER
	render() {
		var possibles = [];

		// prepare the selection tag ids
		if (this.state.tags && this.state.tags.results) {
			// possible tags
			possibles = this.state.tags.results.map((t) => {
				return {
					label: t.name,
					value: t.id,
					style: { color: this.getTagColor(t) }
				};
			});
		}

		return (
			<Select
				name="tags"
				value={this.state.selection}
				options={possibles}
				onChange={this.changeSelection.bind(this)}
				multi={true}
				placeholder={t("document.select")}
			/>
		);
	}
}

export default TagsInput;
