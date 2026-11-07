// the color of a tag, paperless-ngx stores it as hex string
export const tagColor = (tag) => (tag && tag.color) || "#cccccc";

// the tags of the list (as the API delivers them) by their id
export const tagsById = (tags) => {
	const result = {};
	((tags && tags.results) || []).forEach((tag) => {
		result[tag.id] = tag;
	});

	return result;
};
