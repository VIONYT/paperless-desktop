import React from "react";
import bus from "../bus";

class SidebarCorrespondentItem extends React.Component {
	// CONSTRUCTOR
	constructor(props) {
		super(props);
		this.state = { active: false };
	}

	// COMPONENT DID MOUNT: another place (e.g. the search) can change the selected correspondent
	componentDidMount() {
		this.unsubscribe = bus.on("changeExternCorrespondent", (data) =>
			this.setState({ active: this.props.correspondent.id === data.correspondent })
		);
	}

	// COMPONENT WILL UNMOUNT
	componentWillUnmount() {
		this.unsubscribe();
	}

	// SET CORRESPONDENT FILTER: a second click removes the filter
	setCorrespondentFilter() {
		const { correspondent, setCorrespondentFilter } = this.props;

		bus.trigger("changeExternCorrespondent", { correspondent: correspondent.id });
		setCorrespondentFilter(this.state.active ? null : correspondent.id);
		this.setState({ active: !this.state.active });
	}

	// RENDER
	render() {
		return (
			<span
				className={"nav-group-item" + (this.state.active ? " active" : "")}
				onClick={this.setCorrespondentFilter.bind(this)}
			>
				<span className="icon icon-user" />
				{this.props.correspondent.name}
			</span>
		);
	}
}

export default SidebarCorrespondentItem;
