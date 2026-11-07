import React from "react";
import bus from "../bus";
import { tagColor } from "../utils";

class SidebarTagItem extends React.Component {
	// CONSTRUCTOR
	constructor(props) {
		super(props);
		this.state = { active: false };
	}

	// COMPONENT DID MOUNT: another place (e.g. the search) can change the selected tag
	componentDidMount() {
		this.unsubscribe = bus.on("changeExternTag", (data) =>
			this.setState({ active: this.props.tag.id === data.tag })
		);
	}

	// COMPONENT WILL UNMOUNT
	componentWillUnmount() {
		this.unsubscribe();
	}

	// SET TAG FILTER: a second click removes the filter
	setTagFilter() {
		const { tag, setTagFilter } = this.props;

		bus.trigger("changeExternTag", { tag: tag.id });
		setTagFilter(this.state.active ? null : tag.id);
		this.setState({ active: !this.state.active });
	}

	// RENDER
	render() {
		const { tag } = this.props;

		return (
			<span
				className={"nav-group-item" + (this.state.active ? " active" : "")}
				onClick={this.setTagFilter.bind(this)}
			>
				<span className="icon icon-record" style={{ color: tagColor(tag) }} />
				{tag.name}
			</span>
		);
	}
}

export default SidebarTagItem;
