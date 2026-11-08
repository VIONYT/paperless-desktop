import React from "react";

// A choice that can be edited in place: `value` and the entries of `options` are { id, text }.
// `onSave(option)` is called with the chosen option.
class InlineSelect extends React.Component {
	// CONSTRUCTOR
	constructor(props) {
		super(props);
		this.state = { editing: false };
	}

	// CHOOSE
	choose(event) {
		const option = this.props.options.find((o) => o.id === event.target.value);

		this.setState({ editing: false });
		if (option && (!this.props.value || option.id !== this.props.value.id))
			this.props.onSave(option);
	}

	// RENDER
	render() {
		const { value, options } = this.props;

		if (this.state.editing) {
			return (
				<select
					autoFocus
					className="inplace-edit"
					value={value ? value.id : ""}
					onChange={this.choose.bind(this)}
					onBlur={() => this.setState({ editing: false })}
				>
					{options.map((option) => (
						<option key={option.id} value={option.id}>
							{option.text}
						</option>
					))}
				</select>
			);
		}

		return (
			<span
				className="inline-edit-value"
				role="button"
				tabIndex={0}
				onClick={() => this.setState({ editing: true })}
				onKeyDown={(e) => e.key === "Enter" && this.setState({ editing: true })}
			>
				{value ? value.text : ""}
			</span>
		);
	}
}

export default InlineSelect;
