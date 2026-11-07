import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Tabs from "../components/Tabs";
import RemindersNotification from "../components/RemindersNotification";
import FileDrop from "react-file-drop";
import PaperlessComponent from "../components/PaperlessComponent";
import { request, getToken } from "../api";
import { ipcRenderer, dialog } from "../electronBridge";
import { t } from "../i18n";

class App extends PaperlessComponent {
	// CONSTRUCTOR
	constructor(props, context) {
		super(props, context);
	}

	// COMPONENT DID MOUNT
	componentDidMount() {
		// EVENT: open document
		ipcRenderer.on("openDocument", (e, data) => {
			this.context.router.push("/document/" + data);
		});

		// EVENT: navigate (menu bar), only when signed in
		ipcRenderer.on("navigate", (e, route) => {
			if (getToken()) this.context.router.push(route);
		});
	}

	handleDrop(files) {
		for (var ii = 0, len = files.length; ii < len; ii++) {
			const file = files[ii];
			const data = new FormData();
			data.append("document", file);
			data.append("title", file.name);

			// paperless-ngx consumes uploaded documents via this endpoint
			request({
				method: "post",
				url: "/api/documents/post_document/",
				data: data,
				headers: {
					"Content-Type": "multipart/form-data"
				}
			}).catch(() => {
				dialog.showErrorBox(
					t("documents.uploadFailed", { name: file.name }),
					t("documents.uploadFailedMessage")
				);
			});
		}

		var notif = new window.Notification(t("documents.uploading"), {
			body: t("documents.uploadingBody")
		});
	}

	// RENDER
	render() {
		return (
			<div className="window">
				<RemindersNotification />
				<Header history={this.props.history} />
				<Tabs history={this.props.history} />
				<FileDrop onDrop={this.handleDrop}>{t("documents.dropFiles")}</FileDrop>
				<div className="window-content">{this.props.children}</div>
				<Footer />
			</div>
		);
	}
}

// CONTEXT TYPES
App.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default App;
