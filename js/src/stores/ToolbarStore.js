import { Store, createStore } from "../flux.mjs";
import ToolbarActions from "../actions/ToolbarActions";

// TOOLBAR STORE
class ToolbarStore extends Store {
	// CONSTRUCTOR
	constructor() {
		super();
		this.bindActions(ToolbarActions);
		this.items = [];
	}

	// ADD ITEM SUCCESS
	addItemSuccess(newItem) {
		var alreadyAttached = this.items.find((i) => {
			return i.id === newItem.id;
		});

		if (!alreadyAttached) {
			this.items.push(newItem);
		}
	}

	// CLEAR ITEMS SUCCESS
	clearItemsSuccess() {
		this.items = [];
	}

	// REMOVE ITEM SUCCESS
	removeItemSuccess(oldItem) {
		this.items = this.items.filter((i) => {
			return i.id !== oldItem.id;
		});
	}
}

export default createStore(ToolbarStore);
