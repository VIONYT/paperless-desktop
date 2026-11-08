import createResourceList from "./createResourceList";
import TagsActions from "../actions/TagsActions";
import TagsStore from "../stores/TagsStore";

export default createResourceList({
	store: TagsStore,
	itemsKey: "tags",
	load: () => TagsActions.getTags(),
	update: (tag) => TagsActions.editTag(tag),
	remove: (ids) => TagsActions.deleteTags(ids),
	route: "/tags",
	navKey: "nav.tags",
	navId: "tags",
	addEvent: "tagAdded",
	addToolbarId: "add-tag",
	addKey: "tags.add",
	addRoute: "/modal/tags/add",
	addHeight: 560,
	deleteToolbarId: "remove-tags",
	deleteOneKey: "tags.deleteOne",
	deleteManyKey: "tags.deleteMany",
	withColor: true
});
