import React from "react";
import { Link } from "react-router";
import bus from "../bus";
import { t } from "../i18n";

// the buttons of the toolbar, in groups: [id, route, icon]
const NAVIGATION = [
	[
		["documents", "/documents", "newspaper"],
		["correspondents", "/correspondents", "users"],
		["tags", "/tags", "tag"],
		["reminders", "/reminders", "bell"]
	],
	[
		["settings", "/settings", "cog"],
		["logs", "/logs", "menu"]
	]
];

const currentRoute = () => location.hash.replace("#", "").split("?")[0];

class Header extends React.Component {
	// CONSTRUCTOR
	constructor(props) {
		super(props);
		this.state = { active: "documents", route: "/documents" };
		this.onHashChange = () => this.setState({ route: currentRoute() });
	}

	// COMPONENT DID MOUNT
	componentDidMount() {
		this.unsubscribe = bus.on("header.activeItem", (data) =>
			this.setState({ active: data.item })
		);
		window.addEventListener("hashchange", this.onHashChange);
	}

	// COMPONENT WILL UNMOUNT
	componentWillUnmount() {
		this.unsubscribe();
		window.removeEventListener("hashchange", this.onHashChange);
	}

	// HANDLE SEARCH INPUT CHANGED: an empty search shows all documents, Enter starts the search
	handleSearchInputChanged(event) {
		const query = event.target.value;

		if (query.length === 0) bus.trigger("loadAllDocuments");
		else if (query.length > 2 && event.keyCode === 13)
			bus.trigger("searchDocuments", { query: query });
	}

	// RENDER BUTTON
	renderButton([id, route, icon]) {
		const className = "btn btn-default" + (this.state.active === id ? " active" : "");

		return (
			<Link key={id} className={className} title={t("nav." + id)} to={route}>
				<span className={"icon icon-" + icon} />
			</Link>
		);
	}

	// RENDER
	render() {
		return (
			<header className="toolbar toolbar-header">
				<div className="toolbar-actions">
					{NAVIGATION.map((group, index) => (
						<div className="btn-group" key={index}>
							{group.map((button) => this.renderButton(button))}
						</div>
					))}

					{this.state.route === "/documents" ? (
						<div className="search-bar pull-right">
							<input
								type="search"
								onKeyUp={this.handleSearchInputChanged.bind(this)}
								className="form-control"
								placeholder={t("nav.search")}
							/>
						</div>
					) : null}
				</div>
			</header>
		);
	}
}

export default Header;
