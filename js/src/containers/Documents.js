import React from "react";
import DocumentsActions from "../actions/DocumentsActions";
import DocumentsStore from "../stores/DocumentsStore";
import Sidebar from "../components/Sidebar";
import DocumentItem from "../components/DocumentItem";
import shouldPureComponentUpdate from "react-pure-render/function";
import $ from "jquery";
import ToolbarActions from "../actions/ToolbarActions";
import Waypoint from "react-waypoint";
import { request, isAuthError } from "../api";
import { t } from "../i18n";

class Documents extends React.Component {
	constructor(props) {
		super(props);
		this.state = DocumentsStore.getState();
		this.onChange = this.onChange.bind(this);
		this.updateInterval = null;
	}

	// COMPONENT DID MOUNT
	componentDidMount() {
		$(window).trigger("tabs.replace", {
			idx: 0,
			tab: {
				title: t("nav.documents"),
				route: "/documents"
			}
		});
		$(window).trigger("header.activeItem", { item: "documents" });

		// load all documents event
		$(window).on("loadAllDocuments", function() {
			DocumentsActions.getDocuments();
		});

		// search documents
		$(window).on("searchDocuments", this.onSearchDocuments.bind(this));

		DocumentsStore.listen(this.onChange);
		DocumentsActions.getDocuments(this.state.correspondent, this.state.tag);

		// populate the selected correspondent
		if (this.state.correspondent !== null) {
			$(window).trigger("changeExternCorrespendent", {
				correspondent: this.state.correspondent
			});
		}

		// populate the selected tag
		if (this.state.tag !== null) {
			$(window).trigger("changeExternTag", { tag: this.state.tag });
		}

		// start document-update interval
		this.updateInterval = window.setInterval(
			this.checkForNewDocuments.bind(this),
			parseInt(localStorage.getItem("settings.documentsUpdateInterval") || 3) * 1000
		);

		// set the current time to max modified
		localStorage.setItem("documents.maxModified", new Date().getTime());
	}

	// COMPONENT WILL UNMOUNT
	componentWillUnmount() {
		// clear toolbar to add new items
		ToolbarActions.clearItems();

		$(window).off("loadAllDocuments");
		$(window).off("searchDocuments");

		window.clearInterval(this.updateInterval);

		DocumentsStore.unlisten(this.onChange);
	}

	// ON CHANGE
	onChange(state) {
		this.setState(state);
	}

	// ON SEARCH DOCUMENTS
	onSearchDocuments(e, data) {
		DocumentsActions.searchDocuments(data.query);

		$(window).trigger("changeExternCorrespendent", "");
		$(window).trigger("changeExternTag", "");
	}

	// SET TAG FILTER
	setTagFilter(tag) {
		this.setState({
			tag: tag
		});

		DocumentsActions.getDocuments(this.state.correspondent, tag);
	}

	// SET CORRESPONDENT FILTER
	setCorrespondentFilter(correspondent) {
		this.setState({
			correspondent: correspondent
		});

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

	// CHECK FOR NEW DOCUMENTS
	checkForNewDocuments() {
		var params = { ordering: "-modified", page: 1 };
		if (this.state.correspondent) params.correspondent__id = this.state.correspondent;
		if (this.state.tag) params.tags__id__all = this.state.tag;

		// fetch documents
		request({
			method: "get",
			url: "/api/documents/",
			params: params
		})
			.then((result) => {
				var fresh = result.data.results.filter((d) => {
					return (
						new Date(d.modified) >
						new Date(parseInt(localStorage.getItem("documents.maxModified")))
					);
				});

				if (fresh.length > 0) {
					// set the current time to max modified
					localStorage.setItem("documents.maxModified", new Date().getTime());

					var docs = this.state.documents;

					fresh.map((f) => {
						f.fresh = true;
						docs.unshift(f);
					});

					// append new documents to list
					this.setState({
						documents: docs
					});
				}
			})
			.catch((err) => {
				if (isAuthError(err)) {
					$(window).trigger("goBackToLogin");
				}
			});
	}

	// RENDER
	render() {
		if (!this.state.documents) return null;

		// eliminate duplicates from array
		// https://stackoverflow.com/a/36744732/874508
		var docs = this.state.documents.filter(
			(doc, index, self) =>
				self.findIndex((d) => {
					return d.id === doc.id;
				}) === index
		);

		return (
			<div className="pane-group">
				<Sidebar
					setTagFilter={this.setTagFilter.bind(this)}
					setCorrespondentFilter={this.setCorrespondentFilter.bind(this)}
				/>
				<div className="pane">
					{docs.map((d) => {
						return <DocumentItem document={d} key={"document_list_" + d.id} />;
					})}

					{this.state.isLoading === false && this.state.next ? (
						<Waypoint onEnter={this.loadMoreDocuments.bind(this)} threshold={2.0}>
							<div className="load-more">Loading...</div>
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
