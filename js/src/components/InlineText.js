import React from "react";

// Text that can be edited in place: a click turns it into an input, Enter or leaving the input saves,
// Escape cancels. `onSave(value)` is only called if the text changed.
class InlineText extends React.Component {
	// CONSTRUCTOR
	constructor(props) {
		super(props);
		this.state = { editing: false, draft: "" };
	}

	// START
	start() {
		this.setState({ editing: true, draft: this.props.value || "" });
	}

	// FINISH: saves the draft, or throws it away
	finish(save) {
		this.setState({ editing: false });
		if (save && this.state.draft !== (this.props.value || ""))
			this.props.onSave(this.state.draft);
	}

	// HANDLE KEY
	handleKey(event) {
		if (event.key === "Enter") this.finish(true);
		else if (event.key === "Escape") this.finish(false);
	}

	// RENDER
	render() {
		if (this.state.editing) {
			return (
				<input
					autoFocus
					type="text"
					className="inplace-edit"
					value={this.state.draft}
					onChange={(e) => this.setState({ draft: e.target.value })}
					onBlur={() => this.finish(true)}
					onKeyDown={this.handleKey.bind(this)}
				/>
			);
		}

		return (
			<span
				className={"inline-edit-value " + (this.props.className || "")}
				role="button"
				tabIndex={0}
				onClick={this.start.bind(this)}
				onKeyDown={(e) => e.key === "Enter" && this.start()}
			>
				{this.props.value}
			</span>
		);
	}
}

export default InlineText;
