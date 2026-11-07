import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Tabs from "../components/Tabs";
import RemindersNotification from "../components/RemindersNotification";
import FileDrop from "react-file-drop";
import PaperlessComponent from "../components/PaperlessComponent";
import { getToken } from "../api";
import { uploadFile } from "../uploads";
import UploadWidget from "../components/UploadWidget";
import { ipcRenderer, dialog } from "../electronBridge";
import { t } from "../i18n";

// the file types paperless-ngx can consume
const UPLOAD_TYPES =
	".pdf,.png,.jpg,.jpeg,.gif,.tif,.tiff,.webp,.txt,.csv,.doc,.docx,.odt,.xls,.xlsx,.ods,.ppt,.pptx,.odp";

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

	// UPLOAD FILES: used by drag & drop and by the upload button
	uploadFiles(files) {
		if (!files || files.length === 0) return;

		for (var ii = 0, len = files.length; ii < len; ii++) {
			const file = files[ii];

			uploadFile(file, (task) => {
				// paperless-ngx could not process the document
				if (task.status === "FAILURE" || task.status === "REVOKED") {
					dialog.showErrorBox(
						t("documents.processingFailed", { name: file.name }),
						task.result || t("common.tryAgain")
					);
				}
			}).catch(() => {
				dialog.showErrorBox(
					t("documents.uploadFailed", { name: file.name }),
					t("documents.uploadFailedMessage")
				);
			});
		}

		const notification = new window.Notification(t("documents.uploading"), {
			body: t("documents.uploadingBody")
		});
	}

	// HANDLE DROP
	handleDrop(files) {
		this.uploadFiles(files);
	}

	// OPEN FILE DIALOG: the button opens the file selection of the system
	openFileDialog() {
		if (this.fileInput) this.fileInput.click();
	}

	// HANDLE FILES SELECTED
	handleFilesSelected(event) {
		const input = event.target;
		this.uploadFiles(Array.prototype.slice.call(input.files));

		// allows to select the same file again
		input.value = "";
	}

	// RENDER
	render() {
		return (
			<div className="window">
				<RemindersNotification />
				<Header history={this.props.history} />
				<Tabs history={this.props.history} />
				<FileDrop onDrop={this.handleDrop.bind(this)}>{t("documents.dropFiles")}</FileDrop>
				<div className="window-content">{this.props.children}</div>
				<Footer />
				<UploadWidget />
				{this.props.location && this.props.location.pathname === "/documents" ? (
					<div>
						<input
							type="file"
							multiple
							accept={UPLOAD_TYPES}
							style={{ display: "none" }}
							ref={(el) => {
								this.fileInput = el;
							}}
							onChange={this.handleFilesSelected.bind(this)}
						/>
						<button
							type="button"
							className="upload-button"
							title={t("documents.upload")}
							onClick={this.openFileDialog.bind(this)}
						>
							<span className="icon icon-plus" />
						</button>
					</div>
				) : null}
			</div>
		);
	}
}

// CONTEXT TYPES
App.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default App;
