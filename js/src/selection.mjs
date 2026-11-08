// The selection of documents in the list. Pure functions, so they are easy to test.

// TOGGLE: adds the id to the selection, or removes it if it is selected already
export const toggle = (selection, id) =>
	selection.includes(id) ? selection.filter((selected) => selected !== id) : selection.concat(id);

// RANGE: the ids from the anchor to the target in the list, both included
export const range = (ids, anchor, target) => {
	const from = ids.indexOf(anchor);
	const to = ids.indexOf(target);
	if (from < 0 || to < 0) return [target];

	return ids.slice(Math.min(from, to), Math.max(from, to) + 1);
};

// NEXT SELECTION: what a click on a document changes.
// - shift: everything between the anchor (the last clicked document) and the clicked one
// - otherwise: the clicked document is added or removed
// `ids` are all documents of the list, in the order they are shown.
export const nextSelection = ({ selection, anchor, ids, id, shift }) => {
	if (shift && anchor !== null) {
		const merged = selection.concat(
			range(ids, anchor, id).filter((rangeId) => !selection.includes(rangeId))
		);
		return { selection: merged, anchor: anchor };
	}

	return { selection: toggle(selection, id), anchor: id };
};

// COMMON CORRESPONDENT: the correspondent all documents have (null: none), `undefined` if they differ
export const commonCorrespondent = (docs) => {
	const first = docs.length > 0 ? docs[0].correspondent : null;

	// eslint-disable-next-line no-undefined
	return docs.every((doc) => doc.correspondent === first) ? first : undefined;
};

// COMMON TAGS: the tags all documents have
export const commonTags = (docs) =>
	docs.length === 0
		? []
		: docs[0].tags.filter((tag) => docs.every((doc) => doc.tags.includes(tag)));

// TAG CHANGE: the tag is removed from all documents if all of them have it, otherwise it is added
export const tagChange = (docs, tagId) =>
	commonTags(docs).includes(tagId) ? { remove_tags: [tagId] } : { add_tags: [tagId] };
