import createResourceList from "./createResourceList";
import CorrespondentsActions from "../actions/CorrespondentsActions";
import CorrespondentsStore from "../stores/CorrespondentsStore";

export default createResourceList({
	store: CorrespondentsStore,
	itemsKey: "correspondents",
	load: () => CorrespondentsActions.getCorrespondents(),
	update: (correspondent) => CorrespondentsActions.editCorrespondent(correspondent),
	remove: (ids) => CorrespondentsActions.deleteCorrespondents(ids),
	route: "/correspondents",
	navKey: "nav.correspondents",
	navId: "correspondents",
	addEvent: "correspondentAdded",
	addToolbarId: "add-correspondent",
	addKey: "correspondents.add",
	addRoute: "/modal/correspondents/add",
	addHeight: 400,
	deleteToolbarId: "remove-correspondents",
	deleteOneKey: "correspondents.deleteOne",
	deleteManyKey: "correspondents.deleteMany",
	withColor: false
});
