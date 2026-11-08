import React from "react";
import SignInForm from "../components/SignInForm";
import bus from "../bus";
import native from "../native";
import { signIn } from "../auth";
import { applyTheme, getTheme } from "../theme";
import { t, getLanguageSetting, availableLanguages } from "../i18n";

const SELECT_STYLE = { width: "200px", display: "block" };

// A drop down for a setting: [{ value, label }]
const SelectSetting = ({ label, name, value, options, onChange }) => (
	<form className="settings-form">
		<div className="form-group">
			<label>{label}</label>
			<select
				name={name}
				value={value}
				onChange={onChange}
				className="form-control"
				style={SELECT_STYLE}
			>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</div>
	</form>
);

class Settings extends React.Component {
	// CONSTRUCTOR
	constructor(props) {
		super(props);

		this.state = {
			username: localStorage.getItem("settings.auth.username") || "",
			password: "",
			host: localStorage.getItem("settings.host") || "",
			documentsUpdateInterval: localStorage.getItem("settings.documentsUpdateInterval") || 3
		};
	}

	// COMPONENT DID MOUNT
	componentDidMount() {
		bus.trigger("header.activeItem", { item: "settings" });
	}

	// HANDLE CHANGE: the fields of the sign in are saved with the button
	handleChange(e) {
		this.setState({ [e.target.name]: e.target.value });
	}

	// SAVE SETTING: the setting is stored right away
	saveSetting(e) {
		const { name, value } = e.target;
		localStorage.setItem("settings." + name, value);

		if (name === "theme") applyTheme(value);

		// the texts are rendered once, so the language is applied by reloading the window
		if (name === "language") window.location.reload();
		else this.setState({ [name]: value });
	}

	// SAVE SIGN IN
	saveSignIn(e) {
		e.preventDefault();
		const { host, username, password } = this.state;

		signIn(host, username, password)
			.then(
				(signedInHost) =>
					signedInHost && this.setState({ host: signedInHost, password: "" })
			)
			.catch(() => native.showError(t("login.failedTitle"), t("login.failedMessage")));
	}

	// TEST NOTIFICATION
	testNotification() {
		window.setTimeout(() => {
			const notification = new window.Notification(t("settings.testNotification"), {
				body: t("settings.testNotificationBody")
			});

			notification.onclick = () => native.send("focusWindow");
		}, 2000);
	}

	// RENDER
	render() {
		const themes = ["system", "light", "dark"].map((theme) => ({
			value: theme,
			label: t("settings.theme" + theme[0].toUpperCase() + theme.slice(1))
		}));
		const languages = [{ value: "system", label: t("settings.languageSystem") }].concat(
			availableLanguages().map((l) => ({ value: l.code, label: l.name }))
		);

		return (
			<div className="pane-group">
				<div className="pane settings-pane">
					<h3>{t("settings.signIn")}</h3>
					<hr />
					<SignInForm
						className="settings-form"
						values={this.state}
						onChange={this.handleChange.bind(this)}
						onSubmit={this.saveSignIn.bind(this)}
						submitLabel={t("settings.update")}
						passwordPlaceholder={t("settings.passwordPlaceholder")}
						buttonClass="btn btn-large btn-primary"
					/>

					<h3>{t("settings.appearance")}</h3>
					<hr />
					<SelectSetting
						label={t("settings.theme")}
						name="theme"
						value={getTheme()}
						options={themes}
						onChange={this.saveSetting.bind(this)}
					/>
					<SelectSetting
						label={t("settings.language")}
						name="language"
						value={getLanguageSetting()}
						options={languages}
						onChange={this.saveSetting.bind(this)}
					/>

					<h3>{t("settings.documents")}</h3>
					<hr />
					<form className="settings-form">
						<div className="form-group">
							<label>{t("settings.interval")}</label>
							<input
								type="number"
								name="documentsUpdateInterval"
								min="1"
								max="300"
								step="1"
								value={this.state.documentsUpdateInterval}
								onChange={this.saveSetting.bind(this)}
								className="form-control"
								style={{ width: "75px", display: "block" }}
							/>
						</div>
					</form>

					<h3>{t("settings.developer")}</h3>
					<hr />
					<div className="btn-group">
						<button
							className="btn btn-large btn-default"
							onClick={() => native.send("openDevTools")}
						>
							<span className="icon icon-tools" /> {t("settings.devTools")}
						</button>
						<button
							className="btn btn-large btn-default"
							onClick={this.testNotification.bind(this)}
						>
							<span className="icon icon-chat" /> {t("settings.testNotification")}
						</button>
					</div>
				</div>
			</div>
		);
	}
}

export default Settings;
