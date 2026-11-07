import React from "react";
import * as pdfjs from "pdfjs-dist";
import PaperlessComponent from "../components/PaperlessComponent";
import { previewUrl, request } from "../api";

// the worker of pdf.js is copied next to the bundle by build.js
pdfjs.GlobalWorkerOptions.workerSrc = "js/build/pdf.worker.min.mjs";

// IS IMAGE: paperless-ngx tells us the mime type of the original file. Documents that
// have been archived (OCR'd) are always served as PDF by the preview endpoint.
const isImage = (doc) => {
	if (doc.archived_file_name) return false;

	if (doc.mime_type) return doc.mime_type.indexOf("image/") === 0;

	return /\.(png|jpe?g|gif|webp|tiff?|bmp)$/i.test(doc.original_file_name || "");
};

class DocumentRender extends PaperlessComponent {
	// CONSTRUCTOR
	constructor(props) {
		super(props);
		this.state = { error: null, loading: true };
		this.container = null;
		this.pdf = null;
		this.renderId = 0;
		this.onResize = this.onResize.bind(this);
		this.resizeTimeout = null;
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

		// cancels a running render
		this.renderId++;

		if (this.pdf) this.pdf.destroy();
	}

	// ON RESIZE: render the pages again with the new width
	onResize() {
		window.clearTimeout(this.resizeTimeout);
		this.resizeTimeout = window.setTimeout(() => this.renderPages(), 250);
	}

	// LOAD PDF: downloads the PDF (with the API token) and renders it
	loadPdf() {
		request({
			method: "get",
			url: "/api/documents/" + this.props.doc.id + "/preview/",
			responseType: "arraybuffer"
		})
			.then((result) => pdfjs.getDocument({ data: new Uint8Array(result.data) }).promise)
			.then((pdf) => {
				this.pdf = pdf;
				this.setState({ loading: false });

				return this.renderPages();
			})
			.catch((err) => {
				this.setState({
					loading: false,
					error: err && err.message ? err.message : "error"
				});
			});
	}

	// RENDER PAGES: draws every page of the PDF as canvas, scaled to the width of the pane
	/* eslint-disable no-await-in-loop */
	async renderPages() {
		const pdf = this.pdf;
		const container = this.container;
		if (!pdf || !container) return;

		const id = ++this.renderId;
		const width = Math.max(container.clientWidth - 32, 100);
		const ratio = window.devicePixelRatio || 1;

		container.innerHTML = "";

		for (let number = 1; number <= pdf.numPages; number++) {
			const page = await pdf.getPage(number);

			// another render started in the meantime, or the component is gone
			if (id !== this.renderId) return;

			const base = page.getViewport({ scale: 1 });
			const scale = width / base.width;
			const viewport = page.getViewport({ scale: scale * ratio });

			const canvas = document.createElement("canvas");
			canvas.width = Math.floor(viewport.width);
			canvas.height = Math.floor(viewport.height);
			canvas.style.width = Math.floor(viewport.width / ratio) + "px";
			canvas.style.height = Math.floor(viewport.height / ratio) + "px";
			canvas.className = "pdf-page";
			container.appendChild(canvas);

			await page.render({ canvasContext: canvas.getContext("2d"), viewport: viewport })
				.promise;
		}
	}

	/* eslint-enable no-await-in-loop */

	// RENDER
	render() {
		const doc = this.props.doc;

		if (isImage(doc)) {
			return <img src={previewUrl(doc.id)} style={{ maxWidth: "100%" }} />;
		}

		return (
			<div className="pdf-viewer">
				{this.state.loading ? <div className="pdf-message">Loading...</div> : null}
				{this.state.error ? (
					<div className="pdf-message">The document could not be displayed.</div>
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
