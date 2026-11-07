import React from "react";
import FileDrop from "react-file-drop";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Tabs from "../components/Tabs";
import RemindersNotification from "../components/RemindersNotification";
import UploadWidget from "../components/UploadWidget";
import native from "../native";
import { isSignedIn } from "../auth";
import { uploadFile } from "../uploads";
import { t } from "../i18n";

// the file types paperless-ngx can consume
const UPLOAD_TYPES =
	".pdf,.png,.jpg,.jpeg,.gif,.tif,.tiff,.webp,.txt,.csv,.doc,.docx,.odt,.xls,.xlsx,.ods,.ppt,.pptx,.odp";

const showNotification = (title, body) => new window.Notification(title, { body: body });

// UPLOAD FILE: errors are shown to the user, also the ones of the processing on the server
const uploadOne = (file) => {
	const name = file.name;

	uploadFile(file, (task) => {
		if (task.status === "FAILURE" || task.status === "REVOKED") {
			native.showError(
				t("documents.processingFailed", { name: name }),
				task.result || t("common.tryAgain")
			);
		}
	}).catch(() =>
		native.showError(
			t("documents.uploadFailed", { name: name }),
			t("documents.uploadFailedMessage")
		)
	);
};

// UPLOAD FILES: sends the files (a list of files or a FileList) to paperless
const uploadFiles = (files) => {
	const list = Array.from(files);
	if (list.length === 0) return;

	list.forEach(uploadOne);
	showNotification(t("documents.uploading"), t("documents.uploadingBody"));
};

class App extends React.Component {
	// COMPONENT DID MOUNT
	componentDidMount() {
		this.unsubscribe = [
			native.on("openDocument", (id) => this.context.router.push("/document/" + id)),
			// the menu bar, only when signed in
			native.on("navigate", (route) => isSignedIn() && this.context.router.push(route))
		];
	}

	// COMPONENT WILL UNMOUNT
	componentWillUnmount() {
		this.unsubscribe.forEach((unsubscribe) => unsubscribe());
	}

	// HANDLE FILES SELECTED
	handleFilesSelected(event) {
		const input = event.target;
		uploadFiles(input.files);

		// allows to select the same file again
		input.value = "";
	}

	// RENDER UPLOAD BUTTON: the button of the document list opens the file dialog
	renderUploadButton() {
		return (
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
					onClick={() => this.fileInput.click()}
				>
					<span className="icon icon-plus" />
				</button>
			</div>
		);
	}

	// RENDER
	render() {
		const onDocuments = this.props.location && this.props.location.pathname === "/documents";

		return (
			<div className="window">
				<RemindersNotification />
				<Header history={this.props.history} />
				<Tabs history={this.props.history} />
				<FileDrop onDrop={uploadFiles}>{t("documents.dropFiles")}</FileDrop>
				<div className="window-content">{this.props.children}</div>
				<Footer />
				<UploadWidget />
				{onDocuments ? this.renderUploadButton() : null}
			</div>
		);
	}
}

// CONTEXT TYPES
App.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default App;
