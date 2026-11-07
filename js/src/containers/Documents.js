import React from "react";
import Waypoint from "react-waypoint";
import DocumentsActions from "../actions/DocumentsActions";
import DocumentsStore from "../stores/DocumentsStore";
import TagsStore from "../stores/TagsStore";
import ToolbarActions from "../actions/ToolbarActions";
import Sidebar from "../components/Sidebar";
import DocumentItem from "../components/DocumentItem";
import bus from "../bus";
import { request, isAuthError } from "../api";
import { tagsById } from "../utils";
import { t } from "../i18n";

// the documents without duplicates (a document can be in the list twice after an update)
const unique = (documents) =>
	documents.filter((doc, index) => documents.findIndex((d) => d.id === doc.id) === index);

// the filters of the list as parameters of the API
const filterParams = (correspondent, tag) => {
	const params = {};
	if (correspondent) params.correspondent__id = correspondent;
	if (tag) params.tags__id__all = tag;

	return params;
};

class Documents extends React.Component {
	// CONSTRUCTOR
	constructor(props) {
		super(props);
		this.state = { ...DocumentsStore.getState(), tags: TagsStore.getState().tags };
		this.onChange = this.onChange.bind(this);
		this.onTagsChange = (state) => this.setState({ tags: state.tags });
		this.updateInterval = null;
		this.unsubscribe = [];
	}

	// COMPONENT DID MOUNT
	componentDidMount() {
		bus.trigger("tabs.replace", {
			idx: 0,
			tab: { title: t("nav.documents"), route: "/documents" }
		});
		bus.trigger("header.activeItem", { item: "documents" });

		this.unsubscribe = [
			bus.on("loadAllDocuments", () => DocumentsActions.getDocuments()),
			bus.on("searchDocuments", (data) => this.search(data.query))
		];

		DocumentsStore.listen(this.onChange);
		TagsStore.listen(this.onTagsChange);
		DocumentsActions.getDocuments(this.state.correspondent, this.state.tag);
		this.restoreSelectedFilters();

		const seconds = parseInt(localStorage.getItem("settings.documentsUpdateInterval") || 3);
		this.updateInterval = window.setInterval(() => this.checkForNewDocuments(), seconds * 1000);

		// documents that were modified after this moment are new
		localStorage.setItem("documents.maxModified", new Date().getTime());
	}

	// COMPONENT WILL UNMOUNT
	componentWillUnmount() {
		ToolbarActions.clearItems();
		this.unsubscribe.forEach((unsubscribe) => unsubscribe());
		window.clearInterval(this.updateInterval);
		DocumentsStore.unlisten(this.onChange);
		TagsStore.unlisten(this.onTagsChange);
	}

	// ON CHANGE
	onChange(state) {
		this.setState(state);
	}

	// RESTORE SELECTED FILTERS: the sidebar shows the filters that are still active
	restoreSelectedFilters() {
		if (this.state.correspondent !== null) {
			bus.trigger("changeExternCorrespondent", { correspondent: this.state.correspondent });
		}

		if (this.state.tag !== null) bus.trigger("changeExternTag", { tag: this.state.tag });
	}

	// SEARCH
	search(query) {
		DocumentsActions.searchDocuments(query);

		bus.trigger("changeExternCorrespondent", {});
		bus.trigger("changeExternTag", {});
	}

	// SET TAG FILTER
	setTagFilter(tag) {
		this.setState({ tag: tag });
		DocumentsActions.getDocuments(this.state.correspondent, tag);
	}

	// SET CORRESPONDENT FILTER
	setCorrespondentFilter(correspondent) {
		this.setState({ correspondent: correspondent });
		DocumentsActions.getDocuments(correspondent, this.state.tag);
	}

	// LOAD MORE DOCUMENTS
	loadMoreDocuments() {
		DocumentsActions.getDocuments(
			this.state.correspondent,
			this.state.tag,
			this.state.page + 1
		);
	}

	// CHECK FOR NEW DOCUMENTS: documents that were modified since the last check are put on top
	checkForNewDocuments() {
		const params = {
			...filterParams(this.state.correspondent, this.state.tag),
			ordering: "-modified",
			page: 1
		};

		request({ method: "get", url: "/api/documents/", params: params })
			.then((result) => this.addFreshDocuments(result.data.results))
			.catch((err) => {
				if (isAuthError(err)) bus.trigger("goBackToLogin");
			});
	}

	// ADD FRESH DOCUMENTS
	addFreshDocuments(documents) {
		const since = new Date(parseInt(localStorage.getItem("documents.maxModified")));
		const fresh = documents.filter((doc) => new Date(doc.modified) > since);
		if (fresh.length === 0) return;

		localStorage.setItem("documents.maxModified", new Date().getTime());
		this.setState({
			documents: fresh.map((doc) => ({ ...doc, fresh: true })).concat(this.state.documents)
		});
	}

	// RENDER
	render() {
		const { documents, isLoading, next } = this.state;
		const tags = tagsById(this.state.tags);
		if (!documents) return null;

		return (
			<div className="pane-group">
				<Sidebar
					setTagFilter={this.setTagFilter.bind(this)}
					setCorrespondentFilter={this.setCorrespondentFilter.bind(this)}
				/>
				<div className="pane">
					{unique(documents).map((doc) => (
						<DocumentItem document={doc} tags={tags} key={"document_list_" + doc.id} />
					))}

					{isLoading === false && next ? (
						<Waypoint onEnter={this.loadMoreDocuments.bind(this)} threshold={2.0}>
							<div className="load-more">{t("documents.loading")}</div>
						</Waypoint>
					) : null}
				</div>
			</div>
		);
	}
}

export default Documents;
