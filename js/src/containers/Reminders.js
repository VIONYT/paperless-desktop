import React from "react";
import { Link } from "react-router";
import RemindersActions from "../actions/RemindersActions";
import RemindersStore from "../stores/RemindersStore";
import ToolbarActions from "../actions/ToolbarActions";
import bus from "../bus";
import { formatDate } from "../dates";
import { t } from "../i18n";

// the reminders, the next one first
const byDate = (reminders) => reminders.slice().sort((a, b) => new Date(a.date) - new Date(b.date));

class Reminders extends React.Component {
	// CONSTRUCTOR
	constructor(props) {
		super(props);
		this.state = RemindersStore.getState();
		this.onChange = this.onChange.bind(this);
	}

	// COMPONENT DID MOUNT
	componentDidMount() {
		bus.trigger("tabs.replace", {
			idx: 0,
			tab: { title: t("nav.reminders"), route: "/reminders" }
		});
		bus.trigger("header.activeItem", { item: "reminders" });

		RemindersStore.listen(this.onChange);
		RemindersActions.getReminders();
	}

	// COMPONENT WILL UNMOUNT
	componentWillUnmount() {
		ToolbarActions.clearItems();
		RemindersStore.unlisten(this.onChange);
	}

	// ON CHANGE
	onChange(state) {
		this.setState(state);
	}

	// RENDER
	render() {
		if (!this.state.reminders) return null;

		return (
			<div className="pane">
				<table className="table-striped">
					<thead>
						<tr>
							<th>{t("common.date")}</th>
							<th>{t("common.note")}</th>
							<th>{t("nav.documents")}</th>
						</tr>
					</thead>
					<tbody>
						{byDate(this.state.reminders).map((reminder) => (
							<tr key={"reminder_" + reminder.id}>
								<td>{formatDate(reminder.date, "medium")}</td>
								<td>{reminder.note}</td>
								<td>
									<Link to={"/document/" + reminder.document}>
										#{reminder.document}
									</Link>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	}
}

export default Reminders;
