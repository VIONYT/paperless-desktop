import React from "react";
import PaperlessComponent from "../components/PaperlessComponent";
import { previewUrl } from "../api";

// IS IMAGE: paperless-ngx tells us the mime type of the original file. Documents that
// have been archived (OCR'd) are always served as PDF by the preview endpoint.
const isImage = (doc) => {
	if (doc.archived_file_name) return false;

	if (doc.mime_type) return doc.mime_type.indexOf("image/") === 0;

	return /\.(png|jpe?g|gif|webp|tiff?|bmp)$/i.test(doc.original_file_name || "");
};

class DocumentRender extends PaperlessComponent {
	// RENDER
	render() {
		const doc = this.props.doc;
		const path = previewUrl(doc.id);

		if (isImage(doc)) {
			return <img src={path} style={{ maxWidth: "100%" }} />;
		}

		// the PDF viewer of Chromium takes care of rendering the document
		return (
			<iframe
				key={"document_render_" + doc.id}
				src={path}
				style={{ width: "100%", height: "100%", border: 0 }}
			/>
		);
	}
}

export default DocumentRender;
