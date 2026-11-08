import React from "react";
import DocumentActions from "../actions/DocumentActions";
import DocumentsActions from "../actions/DocumentsActions";
import DocumentStore from "../stores/DocumentStore";
import ToolbarActions from "../actions/ToolbarActions";
import DocumentDetailForm from "../components/DocumentDetailForm";
import DocumentRender from "../components/DocumentRender";
import bus from "../bus";
import { setContext } from "../context";
import native from "../native";
import { downloadUrl } from "../api";
import { confirmDelete } from "../dialogs";
import { onRetry } from "../errors";
import { t } from "../i18n";

class DocumentDetail extends React.Component {
	// CONSTRUCTOR
	constructor(props) {
		super(props);
		this.state = {};
		this.onChange = this.onChange.bind(this);
		this.unsubscribe = [];
	}

	// COMPONENT DID MOUNT
	componentDidMount() {
		bus.trigger("header.activeItem", { item: "documents" });
		setContext({ document: true });

		DocumentStore.listen(this.onChange);
		DocumentActions.getDocument(this.props.params.id);
		this.addToolbarItems();
		this.subscribeToMenu();
	}

	// COMPONENT WILL UNMOUNT
	componentWillUnmount() {
		setContext({ document: false });
		this.unsubscribe.forEach((unsubscribe) => unsubscribe());
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

	// SAVE
	save() {
		DocumentActions.updateDocument(this.state.doc);
	}

	// DOWNLOAD
	download() {
		native.send("download", downloadUrl(this.props.params.id));
	}

	// ADD REMINDER
	addReminder() {
		native.send("modal", {
			route: "/modal/reminders/add/" + this.props.params.id,
			width: 450,
			height: 350
		});
	}

	// DELETE DOCUMENT: after the confirmation the tab is closed, the list removes the document
	deleteDocument() {
		confirmDelete("document.deleteConfirmTitle").then((confirmed) => {
			if (!confirmed) return;

			DocumentsActions.deleteDocuments([this.props.params.id]);
			bus.trigger("tabs.closeCurrent");
		});
	}

	// SUBSCRIBE TO MENU: the commands of the page are in the toolbar and in the menu bar
	subscribeToMenu() {
		this.unsubscribe = [
			bus.on("command:save", () => this.save()),
			bus.on("command:download", () => this.download()),
			bus.on("command:addReminder", () => this.addReminder()),
			bus.on("command:deleteDocument", () => this.deleteDocument()),
			onRetry(() => DocumentActions.getDocument(this.props.params.id))
		];
	}

	// ADD TOOLBAR ITEMS: shown in the toolbar of the window, the main action last
	addToolbarItems() {
		ToolbarActions.clearItems();
		ToolbarActions.addItem(
			"add-reminder",
			"bell",
			t("document.addReminder"),
			"default",
			"right",
			() => this.addReminder()
		);
		ToolbarActions.addItem(
			"download-file",
			"download",
			t("document.download"),
			"default",
			"right",
			() => this.download()
		);
		ToolbarActions.addItem(
			"delete-document",
			"trash",
			t("document.delete"),
			"default",
			"right",
			() => this.deleteDocument()
		);
		ToolbarActions.addItem(
			"save-detail",
			"floppy",
			t("common.save"),
			"primary",
			"right",
			(e) => {
				e.preventDefault();
				this.save();
			}
		);
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
