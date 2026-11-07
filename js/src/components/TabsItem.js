import React from "react";
import { Link } from "react-router";

class TabsItem extends React.Component {
	// REMOVE TAB
	removeTab(e) {
		e.preventDefault();
		e.stopPropagation();

		this.props.removeTab(this.props.tab.route);
	}

	// RENDER
	render() {
		const { tab, first } = this.props;

		return (
			<Link className={"tab-item" + (tab.active ? " active" : "")} to={tab.route}>
				{first ? null : (
					<span
						className="icon icon-cancel icon-close-tab"
						onClick={this.removeTab.bind(this)}
					/>
				)}
				{tab.title}
			</Link>
		);
	}
}

export default TabsItem;
