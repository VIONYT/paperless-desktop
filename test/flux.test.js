const test = require("node:test");
const assert = require("node:assert");

const load = () => import("../js/src/flux.mjs");

test("a store handles the actions it is bound to and tells its listeners", async () => {
	const { Actions, Store, createActions, createStore } = await load();

	class CounterActions extends Actions {
		constructor() {
			super();
			this.generateActions("added", "reset");
		}

		// a method is an action too, it can use the generated ones
		addTwo() {
			this.actions.added(1);
			this.actions.added(1);
		}
	}
	const counterActions = createActions(CounterActions);

	class CounterStore extends Store {
		constructor() {
			super();
			this.bindActions(counterActions);
			this.count = 0;
			this.items = [];
		}

		added(amount) {
			this.count += amount;
			this.items.push(amount);
		}

		reset() {
			this.count = 0;
			this.items = [];
		}
	}
	const store = createStore(CounterStore);

	const seen = [];
	const listener = (state) => seen.push(state.count);
	store.listen(listener);

	counterActions.addTwo();
	assert.deepStrictEqual(seen, [1, 2]);
	assert.deepStrictEqual(store.getState(), { count: 2, items: [1, 1] });

	// the state is a copy
	store.getState().items.push(99);
	assert.deepStrictEqual(store.getState().items, [1, 1]);

	// the actions can be handed over as callbacks
	[5].forEach((amount) => counterActions.added(amount));
	assert.strictEqual(store.getState().count, 7);

	store.unlisten(listener);
	counterActions.reset();
	assert.strictEqual(seen.length, 3);
	assert.strictEqual(store.getState().count, 0);
});

test("a handler can say that nothing changed", async () => {
	const { Actions, Store, createActions, createStore } = await load();

	class Ping extends Actions {
		constructor() {
			super();
			this.generateActions("ping");
		}
	}
	const ping = createActions(Ping);

	class Quiet extends Store {
		constructor() {
			super();
			this.bindActions(ping);
			this.value = 1;
		}

		ping() {
			return false;
		}
	}
	const store = createStore(Quiet);
	let calls = 0;
	store.listen(() => calls++);

	ping.ping();
	assert.strictEqual(calls, 0);
});
