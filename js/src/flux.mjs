/* eslint-disable max-classes-per-file, no-underscore-dangle -- the two base classes belong together, `_handlers` and `_listeners` are internal */
// A tiny flux: actions tell what happened, stores keep the data and tell their listeners when it changed.
//
//   class TagsActions extends Actions {
//     constructor() { super(); this.generateActions("getTagsSuccess"); }
//     getTags() { request(...).then(this.actions.getTagsSuccess); }
//   }
//   export default createActions(TagsActions);
//
//   class TagsStore extends Store {
//     constructor() { super(); this.bindActions(TagsActions); this.tags = []; }
//     getTagsSuccess(result) { this.tags = result.data; }
//   }
//   export default createStore(TagsStore);
//
// A component calls `TagsStore.listen(fn)` / `unlisten(fn)` and reads `TagsStore.getState()`.

const stores = [];

// DISPATCH: every store that has a handler with the name of the action handles it
const dispatch = (name, payload) => stores.forEach((store) => store.handle(name, payload));

// the base class of the actions: `generateActions("a", "b")` creates actions that only hand their payload
// to the stores. The methods of the class are actions as well, they can use `this.actions`.
export class Actions {
	constructor() {
		this.actions = {};
	}

	generateActions(...names) {
		names.forEach((name) => {
			// only the first argument is the payload, so an action can be used as a callback of `then`
			this.actions[name] = (payload) => dispatch(name, payload);
		});
	}
}

// CREATE ACTIONS: the object with all actions (generated and methods), they can be passed around as callbacks
export const createActions = (ActionsClass) => {
	const instance = new ActionsClass();
	const all = instance.actions;

	Object.getOwnPropertyNames(ActionsClass.prototype)
		.filter(
			(name) =>
				name !== "constructor" &&
				typeof instance[name] === "function" &&
				name !== "generateActions"
		)
		.forEach((name) => {
			all[name] = (...args) => instance[name](...args);
		});

	return all;
};

// the base class of the stores: the properties that are set in the constructor are the state
export class Store {
	constructor() {
		// not enumerable, so they are not part of the state
		Object.defineProperty(this, "_handlers", { value: {} });
		Object.defineProperty(this, "_listeners", { value: [] });
	}

	// BIND ACTIONS: the methods that have the name of an action are the handlers of this store
	bindActions(actions) {
		Object.keys(actions).forEach((name) => {
			if (typeof this[name] === "function") this._handlers[name] = this[name];
		});
	}
}

// CREATE STORE: returns { listen, unlisten, getState }
export const createStore = (StoreClass) => {
	const instance = new StoreClass();
	const keys = Object.keys(instance);

	// a copy of the state, lists are copied too, so a change of the store does not change what a component holds
	const getState = () =>
		keys.reduce((state, key) => {
			state[key] = Array.isArray(instance[key]) ? instance[key].slice() : instance[key];
			return state;
		}, {});

	const emit = () => instance._listeners.slice().forEach((listener) => listener(getState()));

	stores.push({
		handle: (name, payload) => {
			const handler = instance._handlers[name];
			if (!handler) return;

			// a handler that returns false tells that nothing changed
			if (handler.call(instance, payload) !== false) emit();
		}
	});

	return {
		getState: getState,
		listen: (listener) => instance._listeners.push(listener),
		unlisten: (listener) => {
			const index = instance._listeners.indexOf(listener);
			if (index >= 0) instance._listeners.splice(index, 1);
		}
	};
};
