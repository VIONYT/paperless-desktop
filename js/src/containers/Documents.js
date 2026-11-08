import React from "react";
import Waypoint from "react-waypoint";
import DocumentsActions from "../actions/DocumentsActions";
import DocumentsStore from "../stores/DocumentsStore";
import TagsStore from "../stores/TagsStore";
import CorrespondentsStore from "../stores/CorrespondentsStore";
import ToolbarActions from "../actions/ToolbarActions";
import Sidebar from "../components/Sidebar";
import DocumentItem from "../components/DocumentItem";
import bus from "../bus";
import native from "../native";
import SelectionBar from "../components/SelectionBar";
import { setContext } from "../context";
import { nextSelection, commonCorrespondent, commonTags } from "../selection.mjs";
import { runDocumentCommand } from "../documentCommands";
import { request, isAuthError } from "../api";
import { tagsById } from "../utils";
import { onRetry } from "../errors";
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
		this.state = {
			...DocumentsStore.getState(),
			tags: TagsStore.getState().tags,
			correspondents: CorrespondentsStore.getState().correspondents,
			selection: [],
			anchor: null
		};
		this.onChange = this.onChange.bind(this);
		this.onTagsChange = (state) => this.setState({ tags: state.tags });
		this.onCorrespondentsChange = (state) =>
			this.setState({ correspondents: state.correspondents });
		this.onKeyDown = (event) => event.key === "Escape" && this.clearSelection();
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
			bus.on("searchDocuments", (data) => this.search(data.query)),
			bus.on("command:selectAllDocuments", () => this.selectAll()),
			onRetry(() => DocumentsActions.getDocuments(this.state.correspondent, this.state.tag))
		];

		setContext({ list: true });
		window.addEventListener("keydown", this.onKeyDown);
		DocumentsStore.listen(this.onChange);
		TagsStore.listen(this.onTagsChange);
		CorrespondentsStore.listen(this.onCorrespondentsChange);
		DocumentsActions.getDocuments(this.state.correspondent, this.state.tag);
		this.restoreSelectedFilters();

		const seconds = parseInt(localStorage.getItem("settings.documentsUpdateInterval") || 3);
		this.updateInterval = window.setInterval(() => this.checkForNewDocuments(), seconds * 1000);

		// documents that were modified after this moment are new
		localStorage.setItem("documents.maxModified", new Date().getTime());
	}

	// COMPONENT WILL UNMOUNT
	componentWillUnmount() {
		setContext({ list: false });
		window.removeEventListener("keydown", this.onKeyDown);
		ToolbarActions.clearItems();
		this.unsubscribe.forEach((unsubscribe) => unsubscribe());
		window.clearInterval(this.updateInterval);
		DocumentsStore.unlisten(this.onChange);
		TagsStore.unlisten(this.onTagsChange);
		CorrespondentsStore.unlisten(this.onCorrespondentsChange);
	}

	// ON CHANGE
	onChange(state) {
		// documents that are gone (e.g. deleted) are not selected anymore
		const ids = state.documents.map((doc) => doc.id);
		this.setState({
			...state,
			selection: this.state.selection.filter((id) => ids.includes(id))
		});
	}

	// SELECT: a click on a document (with shift: everything up to it)
	selectDocument(doc, shift) {
		this.setState((state) =>
			nextSelection({
				selection: state.selection,
				anchor: state.anchor,
				ids: unique(state.documents).map((d) => d.id),
				id: doc.id,
				shift: shift
			})
		);
	}

	// SELECT ALL
	selectAll() {
		this.setState({ selection: unique(this.state.documents).map((doc) => doc.id) });
	}

	// CLEAR SELECTION
	clearSelection() {
		if (this.state.selection.length > 0) this.setState({ selection: [], anchor: null });
	}

	// SHOW MENU: the native menu for documents, with the correspondents and tags to choose from.
	// `kind` is the whole menu ("document") or only the "correspondent" or "tags".
	showMenu(ids, kind) {
		const entries = (list) =>
			((list && list.results) || []).map(({ id, name }) => ({ id, name }));
		const docs = this.state.documents.filter((doc) => ids.includes(doc.id));

		native.send("contextMenu", {
			kind: kind,
			documentIds: ids,
			correspondent: commonCorrespondent(docs),
			tags: commonTags(docs),
			correspondents: entries(this.state.correspondents),
			allTags: entries(this.state.tags)
		});
	}

	// SHOW CONTEXT MENU: for the selected documents if the document is one of them, otherwise for it
	showContextMenu(doc) {
		const selected = this.state.selection;
		this.showMenu(selected.includes(doc.id) ? selected : [doc.id], "document");
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
		this.clearSelection();
		DocumentsActions.searchDocuments(query);

		bus.trigger("changeExternCorrespondent", {});
		bus.trigger("changeExternTag", {});
	}

	// SET TAG FILTER
	setTagFilter(tag) {
		this.clearSelection();
		this.setState({ tag: tag });
		DocumentsActions.getDocuments(this.state.correspondent, tag);
	}

	// SET CORRESPONDENT FILTER
	setCorrespondentFilter(correspondent) {
		this.clearSelection();
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
		const { documents, isLoading, next, selection } = this.state;
		const tags = tagsById(this.state.tags);
		if (!documents) return null;

		return (
			<div className="pane-group">
				<Sidebar
					setTagFilter={this.setTagFilter.bind(this)}
					setCorrespondentFilter={this.setCorrespondentFilter.bind(this)}
				/>
				<div className="pane">
					{selection.length > 0 ? (
						<SelectionBar
							count={selection.length}
							total={unique(documents).length}
							onSelectAll={this.selectAll.bind(this)}
							onClear={this.clearSelection.bind(this)}
							onMenu={(kind) => this.showMenu(selection, kind)}
							onDelete={() =>
								runDocumentCommand(
									{ action: "delete", documentIds: selection },
									this.context.router
								)
							}
						/>
					) : null}
					{unique(documents).map((doc) => (
						<DocumentItem
							document={doc}
							tags={tags}
							selected={selection.includes(doc.id)}
							selecting={selection.length > 0}
							onSelect={this.selectDocument.bind(this)}
							onContextMenu={this.showContextMenu.bind(this)}
							key={"document_list_" + doc.id}
						/>
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

// CONTEXT TYPES
Documents.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default Documents;
