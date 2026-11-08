import React from "react";
import TabsItem from "./TabsItem";
import bus from "../bus";
import native from "../native";
import { setContext } from "../context";

// the tabs, with only the tab of the given route marked as active
const withActive = (tabs, route) => tabs.map((tab) => ({ ...tab, active: tab.route === route }));

// the tabs, with the tab that was clicked last at the end
const withTab = (tabs, tab) =>
	tabs.some((existing) => existing.route === tab.route) ? tabs : tabs.concat(tab);

class Tabs extends React.Component {
	// CONSTRUCTOR
	constructor(props) {
		super(props);
		this.state = { tabs: [] };
		this.unsubscribe = [];
		this.onHashChange = () => this.setActive(location.hash.replace("#", "").split("?")[0]);
	}

	// COMPONENT DID MOUNT
	componentDidMount() {
		this.unsubscribe = [
			bus.on("tabs.push", (tab) => this.pushTab(tab)),
			bus.on("tabs.replace", (data) => this.replaceTab(data)),
			bus.on("tabs.closeCurrent", () => this.closeCurrent()),
			bus.on("tabs.setActiveTitle", (data) => this.setActiveTitle(data.title))
		];

		window.addEventListener("hashchange", this.onHashChange);
		native.on("closeCurrentTab", () => this.closeCurrent());
	}

	// COMPONENT DID UPDATE: "Close Tab" of the menu is only possible with more than one tab
	componentDidUpdate(prevProps, prevState) {
		const more = (state) => state.tabs.length > 1;
		if (more(prevState) !== more(this.state)) setContext({ tabs: more(this.state) });
	}

	// COMPONENT WILL UNMOUNT
	componentWillUnmount() {
		this.unsubscribe.forEach((unsubscribe) => unsubscribe());
		window.removeEventListener("hashchange", this.onHashChange);
	}

	// PUSH TAB: opens a new tab and makes it the active one
	pushTab(tab) {
		this.setState((state) => ({ tabs: withActive(withTab(state.tabs, tab), tab.route) }));
	}

	// REPLACE TAB: replaces the tab at the index, or adds it if there is none yet
	replaceTab({ idx, tab }) {
		this.setState((state) => {
			const tabs = state.tabs.slice();
			tabs[Math.min(idx, tabs.length)] = tab;

			return { tabs: tabs };
		});
	}

	// SET ACTIVE
	setActive(route) {
		this.setState((state) => ({ tabs: withActive(state.tabs, route) }));
	}

	// SET ACTIVE TITLE: the title of the active tab changed, e.g. a document was renamed
	setActiveTitle(title) {
		this.setState((state) => ({
			tabs: state.tabs.map((tab) => (tab.active ? { ...tab, title: title } : tab))
		}));
	}

	// CLOSE CURRENT: the first tab can not be closed
	closeCurrent() {
		const current = this.state.tabs.find((tab) => tab.active);
		if (this.state.tabs.length > 1 && current) this.removeTab(current.route);
	}

	// REMOVE TAB: the tab before the removed one becomes active
	removeTab(route) {
		const tabs = this.state.tabs;
		const index = tabs.findIndex((tab) => tab.route === route);
		const remaining = tabs.filter((tab) => tab.route !== route);

		this.setState({ tabs: remaining });
		if (index >= 0) this.context.router.replace(remaining[Math.max(0, index - 1)].route);
	}

	// RENDER
	render() {
		if (this.state.tabs.length <= 1) return null;

		return (
			<div className="tab-group">
				{this.state.tabs.map((tab, index) => (
					<TabsItem
						tab={tab}
						first={index === 0}
						key={"tabs_" + index}
						removeTab={this.removeTab.bind(this)}
					/>
				))}
			</div>
		);
	}
}

// CONTEXT TYPES
Tabs.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default Tabs;
