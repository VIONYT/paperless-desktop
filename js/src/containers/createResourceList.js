import React from "react";
import ResourceListItem from "../components/ResourceListItem";
import ToolbarActions from "../actions/ToolbarActions";
import bus from "../bus";
import native from "../native";
import { confirmDelete } from "../dialogs";
import { t } from "../i18n";

// Creates the page with a list of tags or correspondents, both work the same way:
// the items can be edited in place, selected and deleted, and new ones are added in a modal window.
//
// config: { store, itemsKey, load, update, remove, route, navKey, navId, addEvent, addKey, addRoute,
//           addHeight, deleteToolbarId, deleteOneKey, deleteManyKey, withColor }
const createResourceList = (config) => {
	class ResourceList extends React.Component {
		// CONSTRUCTOR
		constructor(props) {
			super(props);
			this.state = { ...config.store.getState(), selection: [] };
			this.onChange = this.onChange.bind(this);
			this.unsubscribe = null;
		}

		// COMPONENT DID MOUNT
		componentDidMount() {
			bus.trigger("tabs.replace", {
				idx: 0,
				tab: { title: t(config.navKey), route: config.route }
			});
			bus.trigger("header.activeItem", { item: config.navId });

			// the modal window added an item, the list is loaded again
			this.unsubscribe = native.on(config.addEvent, () => config.load());

			config.store.listen(this.onChange);
			config.load();

			ToolbarActions.clearItems();
			ToolbarActions.addItem(
				config.addToolbarId,
				"plus",
				t(config.addKey),
				"primary",
				"right",
				() =>
					native.send("modal", {
						route: config.addRoute,
						width: 450,
						height: config.addHeight
					})
			);
		}

		// COMPONENT WILL UNMOUNT
		componentWillUnmount() {
			ToolbarActions.clearItems();
			config.store.unlisten(this.onChange);
			this.unsubscribe();
		}

		// ON CHANGE
		onChange(state) {
			this.setState(state);
		}

		// CHANGE SELECTION: the delete button is only there while something is selected
		changeSelection(id, checked) {
			const selection = checked
				? this.state.selection.concat(id)
				: this.state.selection.filter((selected) => selected !== id);

			this.setState({ selection: selection });

			if (selection.length === 0) {
				ToolbarActions.removeItem(config.deleteToolbarId);
				return;
			}

			ToolbarActions.addItem(
				config.deleteToolbarId,
				"trash",
				t("common.delete"),
				"default",
				"left",
				() => this.deleteSelection()
			);
		}

		// DELETE SELECTION: after the confirmation of the user
		deleteSelection() {
			const messageKey =
				this.state.selection.length === 1 ? config.deleteOneKey : config.deleteManyKey;

			confirmDelete(messageKey).then((confirmed) => {
				if (!confirmed) return;

				config.remove(this.state.selection);
				this.setState({ selection: [] });
			});
		}

		// RENDER
		render() {
			const list = this.state[config.itemsKey];
			if (!list || !list.results) return null;

			return (
				<div className="pane">
					<table className="table-striped">
						<thead>
							<tr>
								<th />
								{config.withColor ? <th>{t("common.color")}</th> : null}
								<th>{t("common.name")}</th>
								<th>{t("common.match")}</th>
								<th>{t("matching.label")}</th>
							</tr>
						</thead>
						<tbody>
							{list.results.map((item) => (
								<ResourceListItem
									key={config.navId + "_" + item.id}
									item={item}
									withColor={config.withColor}
									changeSelection={this.changeSelection.bind(this)}
									update={config.update}
								/>
							))}
						</tbody>
					</table>
				</div>
			);
		}
	}

	return ResourceList;
};

export default createResourceList;
