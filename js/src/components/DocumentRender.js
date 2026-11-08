import React from "react";
import * as pdfjs from "pdfjs-dist";
import { previewUrl, request } from "../api";
import { t } from "../i18n";

// the worker of pdf.js is copied next to the bundle by build.js
pdfjs.GlobalWorkerOptions.workerSrc = "js/build/pdf.worker.min.mjs";

const IMAGE_FILE = /\.(png|jpe?g|gif|webp|tiff?|bmp)$/i;

// IS IMAGE: paperless-ngx tells us the mime type of the original file. Documents that have been
// archived (OCR'd) are always served as PDF by the preview endpoint.
const isImage = (doc) => {
	if (doc.archived_file_name) return false;
	if (doc.mime_type) return doc.mime_type.startsWith("image/");

	return IMAGE_FILE.test(doc.original_file_name || "");
};

// the PDF as canvas, scaled to the given width (in CSS pixels)
const renderPage = async (page, width) => {
	const ratio = window.devicePixelRatio || 1;
	const scale = (width / page.getViewport({ scale: 1 }).width) * ratio;
	const viewport = page.getViewport({ scale: scale });

	const canvas = document.createElement("canvas");
	canvas.className = "pdf-page";
	canvas.width = Math.floor(viewport.width);
	canvas.height = Math.floor(viewport.height);
	canvas.style.width = Math.floor(viewport.width / ratio) + "px";
	canvas.style.height = Math.floor(viewport.height / ratio) + "px";

	await page.render({ canvasContext: canvas.getContext("2d"), viewport: viewport }).promise;

	return canvas;
};

class DocumentRender extends React.Component {
	// CONSTRUCTOR
	constructor(props) {
		super(props);
		this.state = { error: false, loading: true };
		this.container = null;
		this.pdf = null;
		this.renderId = 0;
		this.unmounted = false;
		this.resizeTimeout = null;
		this.onResize = () => {
			window.clearTimeout(this.resizeTimeout);
			this.resizeTimeout = window.setTimeout(() => this.renderPages(), 250);
		};
	}

	// COMPONENT DID MOUNT
	componentDidMount() {
		if (isImage(this.props.doc)) return;

		window.addEventListener("resize", this.onResize);
		this.loadPdf();
	}

	// COMPONENT WILL UNMOUNT
	componentWillUnmount() {
		window.removeEventListener("resize", this.onResize);
		window.clearTimeout(this.resizeTimeout);

		// stops a running render
		this.renderId++;
		this.unmounted = true;
		if (this.pdf) this.pdf.loadingTask.destroy();
	}

	// LOAD PDF: downloads the PDF and renders it
	loadPdf() {
		request({
			method: "get",
			url: "/api/documents/" + this.props.doc.id + "/preview/",
			responseType: "arraybuffer"
		})
			.then((result) => pdfjs.getDocument({ data: new Uint8Array(result.data) }).promise)
			.then((pdf) => {
				// the document was closed while it was loading
				if (this.unmounted) return pdf.loadingTask.destroy();

				this.pdf = pdf;
				this.setState({ loading: false });

				return this.renderPages();
			})
			.catch(() => this.setState({ loading: false, error: true }));
	}

	// RENDER PAGES: one canvas for every page, one after the other so the first pages show up early
	/* eslint-disable no-await-in-loop */
	async renderPages() {
		if (!this.pdf || !this.container) return;

		const id = ++this.renderId;
		const width = Math.max(this.container.clientWidth - 32, 100);
		this.container.innerHTML = "";

		for (let number = 1; number <= this.pdf.numPages; number++) {
			const canvas = await renderPage(await this.pdf.getPage(number), width);

			// another render started in the meantime, or the component is gone
			if (id !== this.renderId) return;

			this.container.appendChild(canvas);
		}
	}
	/* eslint-enable no-await-in-loop */

	// RENDER
	render() {
		const doc = this.props.doc;

		if (isImage(doc)) return <img src={previewUrl(doc.id)} style={{ maxWidth: "100%" }} />;

		return (
			<div className="pdf-viewer">
				{this.state.loading ? (
					<div className="pdf-message">{t("documents.loading")}</div>
				) : null}
				{this.state.error ? (
					<div className="pdf-message">{t("documents.notDisplayed")}</div>
				) : null}
				<div
					className="pdf-pages"
					ref={(el) => {
						this.container = el;
					}}
				/>
			</div>
		);
	}
}

export default DocumentRender;
