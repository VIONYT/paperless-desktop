import React from "react";
import { Link } from "react-router";
import ToolbarStore from "../stores/ToolbarStore";
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
		this.state = {
			active: "documents",
			route: "/documents",
			items: ToolbarStore.getState().items
		};
		this.searchInput = null;
		this.onHashChange = () => this.setState({ route: currentRoute() });
		this.onToolbarChange = (state) => this.setState({ items: state.items });
	}

	// COMPONENT DID MOUNT
	componentDidMount() {
		this.unsubscribe = bus.on("header.activeItem", (data) =>
			this.setState({ active: data.item })
		);
		window.addEventListener("hashchange", this.onHashChange);
		ToolbarStore.listen(this.onToolbarChange);
		this.unsubscribeFind = bus.on("command:find", () => this.focusSearch());
	}

	// COMPONENT WILL UNMOUNT
	componentWillUnmount() {
		this.unsubscribe();
		this.unsubscribeFind();
		ToolbarStore.unlisten(this.onToolbarChange);
		window.removeEventListener("hashchange", this.onHashChange);
	}

	// HANDLE SEARCH INPUT CHANGED: an empty search shows all documents, Enter starts the search
	handleSearchInputChanged(event) {
		const query = event.target.value;

		if (query.length === 0) bus.trigger("loadAllDocuments");
		else if (query.length > 2 && event.keyCode === 13)
			bus.trigger("searchDocuments", { query: query });
	}

	// FOCUS SEARCH: the menu "Find" shows the documents and puts the cursor in the search field
	focusSearch() {
		if (this.state.route !== "/documents") location.hash = "#/documents";

		window.setTimeout(() => this.searchInput && this.searchInput.focus(), 200);
	}

	// RENDER ITEM: an action of the page, only the main action has a text, the others a tooltip
	renderItem(item) {
		const primary = item.flavor === "primary";

		return (
			<button
				key={item.id}
				className={"btn btn-" + item.flavor}
				title={item.text}
				aria-label={item.text}
				onClick={item.click}
			>
				{item.icon ? <span className={"icon icon-" + item.icon} /> : null}
				{primary ? " " + item.text : null}
			</button>
		);
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

					<div className="toolbar-items">
						{this.state.items
							.slice()
							.sort((a, b) => (a.flavor === "primary") - (b.flavor === "primary"))
							.map((item) => this.renderItem(item))}
					</div>

					{this.state.route === "/documents" ? (
						<div className="search-bar pull-right">
							<input
								type="search"
								onKeyUp={this.handleSearchInputChanged.bind(this)}
								className="form-control"
								placeholder={t("nav.search")}
								ref={(el) => {
									this.searchInput = el;
								}}
							/>
						</div>
					) : null}
				</div>
			</header>
		);
	}
}

export default Header;
