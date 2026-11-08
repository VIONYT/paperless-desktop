import React from "react";
import bus from "../bus";
import { t } from "../i18n";

// BANNER: a failed load is shown here, below the toolbar, with a button to try it again.
// The pages that load data listen to the event "retry".
class Banner extends React.Component {
	// CONSTRUCTOR
	constructor(props) {
		super(props);
		this.state = { message: null };
	}

	// COMPONENT DID MOUNT
	componentDidMount() {
		this.unsubscribe = bus.on("banner", (data) => this.setState({ message: data.message }));
	}

	// COMPONENT WILL UNMOUNT
	componentWillUnmount() {
		this.unsubscribe();
	}

	// RETRY
	retry() {
		this.setState({ message: null });
		bus.trigger("retry");
	}

	// RENDER
	render() {
		if (!this.state.message) return null;

		return (
			<div className="banner" role="alert">
				<span className="banner-message">{this.state.message}</span>
				<button className="btn btn-default" onClick={this.retry.bind(this)}>
					{t("common.retry")}
				</button>
				<button
					className="btn btn-default"
					title={t("common.dismiss")}
					aria-label={t("common.dismiss")}
					onClick={() => this.setState({ message: null })}
				>
					<span className="icon icon-cancel" />
				</button>
			</div>
		);
	}
}

export default Banner;
