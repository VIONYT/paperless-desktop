const test = require("node:test");
const assert = require("node:assert");

const load = () => import("../js/src/selection.mjs");

test("a click adds and removes a document", async () => {
	const { nextSelection } = await load();
	const ids = [1, 2, 3, 4, 5];

	let state = nextSelection({ selection: [], anchor: null, ids, id: 2, shift: false });
	assert.deepStrictEqual(state, { selection: [2], anchor: 2 });

	state = nextSelection({ ...state, ids, id: 4, shift: false });
	assert.deepStrictEqual(state.selection, [2, 4]);

	state = nextSelection({ ...state, ids, id: 2, shift: false });
	assert.deepStrictEqual(state.selection, [4]);
});

test("shift selects everything between the last click and the clicked document", async () => {
	const { nextSelection } = await load();
	const ids = [1, 2, 3, 4, 5];

	const first = nextSelection({ selection: [], anchor: null, ids, id: 4, shift: false });
	const second = nextSelection({ ...first, ids, id: 2, shift: true });

	assert.deepStrictEqual(second.selection.sort(), [2, 3, 4]);
	assert.strictEqual(second.anchor, 4);
});

test("the common correspondent and tags of documents", async () => {
	const { commonCorrespondent, commonTags, tagChange } = await load();
	const docs = [
		{ correspondent: 5, tags: [1, 2] },
		{ correspondent: 5, tags: [2, 3] }
	];

	assert.strictEqual(commonCorrespondent(docs), 5);
	assert.strictEqual(
		commonCorrespondent([...docs, { correspondent: null, tags: [] }]),
		undefined
	);
	assert.deepStrictEqual(commonTags(docs), [2]);

	assert.deepStrictEqual(tagChange(docs, 2), { remove_tags: [2] });
	assert.deepStrictEqual(tagChange(docs, 1), { add_tags: [1] });
});
