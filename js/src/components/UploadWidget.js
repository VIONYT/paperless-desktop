import React from "react";
import { subscribe } from "../uploads";
import { t, getLanguage } from "../i18n";

// FORMAT SPEED: 1536 -> "1.5 KB/s"
const formatSpeed = (bytesPerSecond) => {
	const units = ["B/s", "KB/s", "MB/s", "GB/s"];
	let value = bytesPerSecond;
	let unit = 0;

	while (value >= 1024 && unit < units.length - 1) {
		value /= 1024;
		unit++;
	}

	const digits = unit === 0 ? 0 : 1;
	return (
		value.toLocaleString(getLanguage(), {
			maximumFractionDigits: digits,
			minimumFractionDigits: digits
		}) +
		" " +
		units[unit]
	);
};

// UPLOAD WIDGET: shows the progress and the speed while documents are uploaded
class UploadWidget extends React.Component {
	// CONSTRUCTOR
	constructor(props) {
		super(props);
		this.state = { visible: false };
		this.unsubscribe = null;
		this.interval = null;
	}

	// COMPONENT DID MOUNT
	componentDidMount() {
		this.unsubscribe = subscribe((state) => this.setState(state));

		// the speed falls back to 0 when no progress events arrive anymore
		this.interval = window.setInterval(() => {
			if (this.state.visible && this.state.active) this.forceUpdate();
		}, 1000);
	}

	// COMPONENT WILL UNMOUNT
	componentWillUnmount() {
		window.clearInterval(this.interval);
		if (this.unsubscribe) this.unsubscribe();
	}

	// RENDER
	render() {
		const s = this.state;
		if (!s.visible) return null;

		const percent = s.total > 0 ? Math.min(100, Math.floor((s.loaded / s.total) * 100)) : 0;
		const done = !s.active;
		const failed = done && s.failed > 0;

		let status;
		if (failed) status = t("upload.failed");
		else if (done) status = t("upload.complete");
		else if (percent >= 100) status = t("upload.finishing");
		else status = formatSpeed(s.speed);

		let className = "upload-widget";
		if (done && !failed) className += " upload-widget-done";
		if (failed) className += " upload-widget-failed";

		return (
			<div className={className}>
				<div className="upload-widget-header">
					<span className="upload-widget-title">
						{done ? t("upload.title") : t("upload.uploading", { count: s.files })}
					</span>
					<span className="upload-widget-percent">{percent} %</span>
				</div>
				<div className="upload-widget-bar">
					<div className="upload-widget-bar-fill" style={{ width: percent + "%" }} />
				</div>
				<div className="upload-widget-footer">
					<span>{status}</span>
					<span>
						{t("upload.files", { done: s.finished + s.failed, count: s.files })}
					</span>
				</div>
			</div>
		);
	}
}

export default UploadWidget;
