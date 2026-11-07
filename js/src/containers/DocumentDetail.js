import React from "react";
import DocumentActions from "../actions/DocumentActions";
import DocumentsActions from "../actions/DocumentsActions";
import DocumentStore from "../stores/DocumentStore";
import Sidebar from "../components/Sidebar";
import PaperlessComponent from "../components/PaperlessComponent";
import DocumentDetailForm from "../components/DocumentDetailForm";
import DocumentRender from "../components/DocumentRender";
import ToolbarActions from "../actions/ToolbarActions";
import $ from "jquery";
import { downloadUrl } from "../api";
import { ipcRenderer, remote, dialog } from "../electronBridge";

class DocumentDetail extends PaperlessComponent {
	// CONSTRUCTOR
	constructor(props) {
		super(props);
		this.state = {};
		this.onChange = this.onChange.bind(this);
	}

	// COMPONENT DID MOUNT
	componentDidMount() {
		DocumentStore.listen(this.onChange);
		DocumentActions.getDocument(this.props.params.id);

		// clear toolbar to add new items
		ToolbarActions.clearItems();

		// toolbar: save button
		ToolbarActions.addItem("save-detail", "floppy", "Save", "primary", "right", (e) => {
			e.preventDefault();
			this.saveDocument();
		});

		// toolbar: download file
		ToolbarActions.addItem(
			"download-file",
			"download",
			"Download File",
			"default",
			"left",
			() => {
				// downstream the download command
				if (this.state.doc && this.state.doc.id) {
					ipcRenderer.send("download", {
						url: downloadUrl(this.state.doc.id)
					});
				}
			}
		);

		// toolbar: delete document
		ToolbarActions.addItem("add-reminder", "bell", "Add reminder", "default", "right", () => {
			// add correspondent
			ipcRenderer.send("modal", {
				route: "/modal/reminders/add/" + this.props.params.id,
				width: 450,
				height: 350
			});
		});

		// toolbar: delete document
		ToolbarActions.addItem(
			"delete-document",
			"trash",
			"Delete document",
			"default",
			"right",
			() => {
				// ask user if he really wants to delete the document
				var choice =
					dialog.showMessageBoxSync(remote.getCurrentWindow(), {
						// eslint-disable-line no-sync
						type: "question",
						buttons: ["Yes", "No"],
						title: "It'll be gone forever!",
						message: "Are you sure you want to delete this document?"
					}) === 0;

				// yes, delete this thing!
				if (choice === true) {
					DocumentsActions.deleteDocuments([this.props.params.id]);

					// emit event to close this tab, since the document is just deleted
					$(window).trigger("tabs.closeCurrent");
				}
			}
		);
	}

	// COMPONENT WILL UNMOUNT
	componentWillUnmount() {
		ToolbarActions.clearItems();
		DocumentStore.unlisten(this.onChange);
	}

	// COMPONENT WILL UPDATE
	componentWillUpdate(nextProps, nextState) {
		// something changed in the state id
		if (nextProps.params.id !== this.props.params.id) {
			this.setState({
				doc: null
			});

			// fetch new document
			DocumentActions.getDocument(nextProps.params.id);
		}
	}

	// SHOULD COMPONENT UPDATE
	shouldComponentUpdate(nextProps, nextState) {
		try {
			return (
				nextState.doc.id !== this.state.doc.id ||
				nextProps.params.id !== this.props.params.id
			);
		} catch (e) {
			return true;
		}
	}

	// ON CHANGE
	onChange(state) {
		// the document store was changed by something else than loading a document
		if (!state.doc) return;

		// add new tab
		$(window).trigger("tabs.push", {
			title: state.doc.title,
			route: "/document/" + this.props.params.id
		});

		this.setState(state);
	}

	// SAVE DOCUMENT
	saveDocument() {
		DocumentActions.updateDocument(this.state.doc);
	}

	// CHANGE DOC
	changeDoc(doc) {
		this.setState({
			doc: doc
		});
	}

	// RENDER
	render() {
		// render nothing if document is empty
		if (!this.state.doc) return null;
		return (
			<div className="pane-group">
				<div className="pane-two-third">
					<DocumentRender doc={this.state.doc} />
				</div>
				<div className="pane pane-one-third">
					<DocumentDetailForm
						doc={this.state.doc}
						changeDoc={this.changeDoc.bind(this)}
					/>
				</div>
			</div>
		);
	}
}

export default DocumentDetail;
