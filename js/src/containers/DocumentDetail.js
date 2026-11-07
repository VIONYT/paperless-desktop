import React from "react";
import DocumentActions from "../actions/DocumentActions";
import DocumentsActions from "../actions/DocumentsActions";
import DocumentStore from "../stores/DocumentStore";
import ToolbarActions from "../actions/ToolbarActions";
import DocumentDetailForm from "../components/DocumentDetailForm";
import DocumentRender from "../components/DocumentRender";
import bus from "../bus";
import native from "../native";
import { downloadUrl } from "../api";
import { confirmDelete } from "../dialogs";
import { t } from "../i18n";

class DocumentDetail extends React.Component {
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
		this.addToolbarItems();
	}

	// COMPONENT WILL UNMOUNT
	componentWillUnmount() {
		ToolbarActions.clearItems();
		DocumentStore.unlisten(this.onChange);
	}

	// COMPONENT WILL UPDATE: another document was opened in this view
	componentWillUpdate(nextProps) {
		if (nextProps.params.id !== this.props.params.id) {
			this.setState({ doc: null });
			DocumentActions.getDocument(nextProps.params.id);
		}
	}

	// ADD TOOLBAR ITEMS
	addToolbarItems() {
		const id = this.props.params.id;

		ToolbarActions.clearItems();
		ToolbarActions.addItem(
			"save-detail",
			"floppy",
			t("common.save"),
			"primary",
			"right",
			(e) => {
				e.preventDefault();
				DocumentActions.updateDocument(this.state.doc);
			}
		);
		ToolbarActions.addItem(
			"download-file",
			"download",
			t("document.download"),
			"default",
			"left",
			() => native.send("download", downloadUrl(id))
		);
		ToolbarActions.addItem(
			"add-reminder",
			"bell",
			t("document.addReminder"),
			"default",
			"right",
			() =>
				native.send("modal", {
					route: "/modal/reminders/add/" + id,
					width: 450,
					height: 350
				})
		);
		ToolbarActions.addItem(
			"delete-document",
			"trash",
			t("document.delete"),
			"default",
			"right",
			() => this.deleteDocument()
		);
	}

	// DELETE DOCUMENT: after the confirmation the tab is closed, the list removes the document
	deleteDocument() {
		confirmDelete("document.deleteConfirm").then((confirmed) => {
			if (!confirmed) return;

			DocumentsActions.deleteDocuments([this.props.params.id]);
			bus.trigger("tabs.closeCurrent");
		});
	}

	// ON CHANGE: the document was loaded, it gets its own tab
	onChange(state) {
		if (!state.doc) return;

		bus.trigger("tabs.push", {
			title: state.doc.title,
			route: "/document/" + this.props.params.id
		});
		this.setState(state);
	}

	// CHANGE DOC: the form changed the document
	changeDoc(doc) {
		this.setState({ doc: doc });
	}

	// RENDER
	render() {
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
