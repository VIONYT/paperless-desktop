import React from "react";
import LogsActions from "../actions/LogsActions";
import LogsStore from "../stores/LogsStore";
import bus from "../bus";
import { onRetry } from "../errors";
import { t } from "../i18n";
import PropTypes from "prop-types";

class Logs extends React.Component {
	// CONSTRUCTOR
	constructor(props) {
		super(props);
		this.state = LogsStore.getState();
		this.onChange = this.onChange.bind(this);
	}

	// COMPONENT DID MOUNT
	componentDidMount() {
		bus.trigger("tabs.replace", { idx: 0, tab: { title: t("nav.logs"), route: "/logs" } });
		bus.trigger("header.activeItem", { item: "logs" });

		LogsStore.listen(this.onChange);
		LogsActions.getLogs();
		this.unsubscribeRetry = onRetry(() => LogsActions.getLogs());
	}

	// COMPONENT WILL UNMOUNT
	componentWillUnmount() {
		LogsStore.unlisten(this.onChange);
		this.unsubscribeRetry();
	}

	// ON CHANGE
	onChange(state) {
		this.setState(state);
	}

	// RENDER
	render() {
		if (!Array.isArray(this.state.logs)) return null;

		return (
			<div className="pane">
				<table className="table-striped">
					<thead>
						<tr>
							<th>{t("logs.title")}</th>
						</tr>
					</thead>
					<tbody>
						{this.state.logs.map((line, idx) => {
							return (
								<tr key={"log_" + idx}>
									<td
										style={{
											fontFamily: "Menlo, monospace",
											whiteSpace: "pre-wrap"
										}}
									>
										{line}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		);
	}
}

// CONTEXT TYPES
Logs.contextTypes = {
	router: PropTypes.object.isRequired
};

export default Logs;
