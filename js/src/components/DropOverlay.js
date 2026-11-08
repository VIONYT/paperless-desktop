import React from "react";
import { t } from "../i18n";

// does the drag carry files (and not e.g. selected text)?
const hasFiles = (event) =>
	!!event.dataTransfer && Array.from(event.dataTransfer.types || []).includes("Files");

// The area of the window where files can be dropped: the content below the toolbar and the tabs,
// without the sidebar (correspondents and tags).
const zone = () => document.querySelector(".window-content");
const sidebar = () => document.querySelector(".window-content .sidebar");

const isInZone = (event) => {
	const element = zone();
	return (
		!!element &&
		element.contains(event.target) &&
		!(sidebar() && sidebar().contains(event.target))
	);
};

// the upload symbol: an arrow above a tray, drawn symmetric so it is centered in its circle
const UploadSymbol = () => (
	<svg
		viewBox="0 0 24 24"
		width="56"
		height="56"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.8"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M12 16V4" />
		<path d="M7 9l5-5 5 5" />
		<path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
	</svg>
);

// DROP OVERLAY: while files are dragged over the content of the window, a gray translucent layer with
// an upload symbol shows that they can be dropped. The files are given to `onDrop`.
// It is rendered inside of the content of the window and covers the area next to the sidebar.
class DropOverlay extends React.Component {
	// CONSTRUCTOR
	constructor(props) {
		super(props);
		this.state = { dragging: false, left: 0 };
		// dragenter / dragleave are fired for every element, so the entered ones are counted
		this.depth = 0;

		this.onDragEnter = (event) => {
			if (!hasFiles(event) || !isInZone(event)) return;

			this.depth++;
			this.setState({ dragging: true, left: sidebar() ? sidebar().offsetWidth : 0 });
		};

		this.onDragLeave = (event) => {
			if (!hasFiles(event) || !isInZone(event)) return;

			this.depth = Math.max(0, this.depth - 1);
			if (this.depth === 0) this.setState({ dragging: false });
		};

		this.onDragOver = (event) => {
			// without this the browser does not allow to drop
			if (hasFiles(event) && isInZone(event)) event.preventDefault();
		};

		this.onDrop = (event) => {
			if (!hasFiles(event)) return;

			this.depth = 0;
			this.setState({ dragging: false });
			if (!isInZone(event)) return;

			event.preventDefault();
			this.props.onDrop(event.dataTransfer.files);
		};
	}

	// COMPONENT DID MOUNT
	componentDidMount() {
		this.events = {
			dragenter: this.onDragEnter,
			dragleave: this.onDragLeave,
			dragover: this.onDragOver,
			drop: this.onDrop
		};

		Object.keys(this.events).forEach((name) =>
			window.addEventListener(name, this.events[name])
		);
	}

	// COMPONENT WILL UNMOUNT
	componentWillUnmount() {
		Object.keys(this.events).forEach((name) =>
			window.removeEventListener(name, this.events[name])
		);
	}

	// RENDER
	render() {
		if (!this.state.dragging) return null;

		return (
			<div className="drop-overlay" style={{ left: this.state.left }} aria-hidden="true">
				<div className="drop-overlay-content">
					<div className="drop-overlay-circle">
						<UploadSymbol />
					</div>
					<span className="drop-overlay-text">{t("documents.dropFiles")}</span>
				</div>
			</div>
		);
	}
}

export default DropOverlay;
