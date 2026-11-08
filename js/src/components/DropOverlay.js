import React from "react";
import { t } from "../i18n";

// does the drag carry files (and not e.g. selected text)?
const hasFiles = (event) =>
	!!event.dataTransfer && Array.from(event.dataTransfer.types || []).includes("Files");

// DROP OVERLAY: while files are dragged over the window, a gray translucent layer with an upload
// symbol shows that they can be dropped. The files are given to `onDrop`.
class DropOverlay extends React.Component {
	// CONSTRUCTOR
	constructor(props) {
		super(props);
		this.state = { dragging: false };
		// dragenter / dragleave are fired for every element, so the entered ones are counted
		this.depth = 0;

		this.onDragEnter = (event) => {
			if (!hasFiles(event)) return;

			this.depth++;
			this.setState({ dragging: true });
		};

		this.onDragLeave = (event) => {
			if (!hasFiles(event)) return;

			this.depth = Math.max(0, this.depth - 1);
			if (this.depth === 0) this.setState({ dragging: false });
		};

		this.onDragOver = (event) => {
			// without this the browser does not allow to drop
			if (hasFiles(event)) event.preventDefault();
		};

		this.onDrop = (event) => {
			if (!hasFiles(event)) return;

			event.preventDefault();
			this.depth = 0;
			this.setState({ dragging: false });
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
			<div className="drop-overlay" aria-hidden="true">
				<div className="drop-overlay-content">
					<span className="icon icon-upload" />
					<span className="drop-overlay-text">{t("documents.dropFiles")}</span>
				</div>
			</div>
		);
	}
}

export default DropOverlay;
