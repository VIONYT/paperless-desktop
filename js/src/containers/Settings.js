import React from "react";
import $ from "jquery";
import { getToken, normalizeHost, fetchToken } from "../api";
import { ipcRenderer, dialog } from "../electronBridge";
import { applyTheme, getTheme } from "../theme";
import { t, getLanguageSetting, availableLanguages } from "../i18n";

class Settings extends React.Component {
	// CONSTRUCTOR
	constructor(props) {
		super(props);

		this.old = {
			username: localStorage.getItem("settings.auth.username"),
			token: getToken(),
			host: localStorage.getItem("settings.host"),
			documentsUpdateInterval: localStorage.getItem("settings.documentsUpdateInterval")
		};

		this.state = {
			username: localStorage.getItem("settings.auth.username") || "",
			password: "",
			host: localStorage.getItem("settings.host") || "",
			documentsUpdateInterval: localStorage.getItem("settings.documentsUpdateInterval")
		};
	}

	// COMPONENT DID MOUNT
	componentDidMount() {
		$(window).trigger("header.activeItem", { item: "settings" });
	}

	// HANDLE CHANGE
	handleChange(e) {
		var s = this.state;
		s[e.target.name] = e.target.value;

		this.setState(s);

		// store new settings
		var blacklist = ["username", "password", "host"];
		if (blacklist.indexOf(e.target.name) < 0) {
			localStorage.setItem("settings." + e.target.name, e.target.value);
		}

		// switch the appearance right away
		if (e.target.name === "theme") {
			applyTheme(e.target.value);
		}

		// the texts are rendered once, so the language is applied by reloading the window
		if (e.target.name === "language") {
			window.location.reload();
		}
	}

	// OPEN DEV TOOLS
	openDevTools() {
		ipcRenderer.send("openDevTools");
	}

	// SAVE SIGN IN
	saveSignIn(e) {
		e.preventDefault();

		var host = normalizeHost(this.state.host);

		// check if the user information works by requesting a new API token
		fetchToken(host, this.state.username, this.state.password)
			// the request worked out, we can save the settings
			.then((token) => {
				localStorage.setItem("settings.auth.username", this.state.username);
				localStorage.setItem("settings.auth.token", token);
				localStorage.setItem("settings.host", host);

				ipcRenderer.send("login", {
					host: host,
					token: token
				});

				this.old = {
					username: this.state.username,
					token: token,
					host: host
				};

				// the password is not stored, only the token
				this.setState({ host: host, password: "" });
			})
			// the request did not work out, show an error
			.catch(() => {
				this.setState({
					username: this.old.username || "",
					password: "",
					host: this.old.host || ""
				});

				dialog.showErrorBox(t("login.failedTitle"), t("login.failedMessage"));
			});
	}

	// TEST NOTIFICATION
	testNotification() {
		window.setTimeout(() => {
			// create notification
			var notif = new window.Notification(t("settings.testNotification"), {
				body: t("settings.testNotificationBody")
			});

			// If the user clicks in the Notifications Center, show the app
			notif.onclick = function() {
				ipcRenderer.send("focusWindow");
				ipcRenderer.send("openDocument", {
					id: 1
				});
			};
		}, 2000);
	}

	// RENDER
	render() {
		return (
			<div className="pane-group">
				<div className="pane settings-pane">
					<h3>{t("settings.signIn")}</h3>
					<hr />

					<form className="settings-form">
						<div className="form-group">
							<label>{t("login.url")}</label>
							<input
								type="text"
								name="host"
								value={this.state.host}
								onChange={this.handleChange.bind(this)}
								className="form-control"
								placeholder={t("login.urlPlaceholder")}
							/>
						</div>
						<div className="form-group">
							<label>{t("login.username")}</label>
							<input
								type="username"
								value={this.state.username}
								onChange={this.handleChange.bind(this)}
								name="username"
								className="form-control"
								placeholder={t("login.username")}
							/>
						</div>
						<div className="form-group">
							<label>{t("login.password")}</label>
							<input
								type="password"
								value={this.state.password}
								onChange={this.handleChange.bind(this)}
								name="password"
								className="form-control"
								placeholder={t("settings.passwordPlaceholder")}
							/>
						</div>
						<button
							className="btn btn-large btn-primary"
							onClick={this.saveSignIn.bind(this)}
						>
							{t("settings.update")}
						</button>
					</form>

					<h3>{t("settings.appearance")}</h3>
					<hr />
					<form className="settings-form">
						<div className="form-group">
							<label>{t("settings.theme")}</label>
							<select
								name="theme"
								value={getTheme()}
								onChange={this.handleChange.bind(this)}
								className="form-control"
								style={{ width: "200px", display: "block" }}
							>
								<option value="system">{t("settings.themeSystem")}</option>
								<option value="light">{t("settings.themeLight")}</option>
								<option value="dark">{t("settings.themeDark")}</option>
							</select>
						</div>
					</form>

					<form className="settings-form">
						<div className="form-group">
							<label>{t("settings.language")}</label>
							<select
								name="language"
								value={getLanguageSetting()}
								onChange={this.handleChange.bind(this)}
								className="form-control"
								style={{ width: "200px", display: "block" }}
							>
								<option value="system">{t("settings.languageSystem")}</option>
								{availableLanguages().map((l) => (
									<option key={l.code} value={l.code}>
										{l.name}
									</option>
								))}
							</select>
						</div>
					</form>

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
								value={this.state.documentsUpdateInterval || 3}
								onChange={this.handleChange.bind(this)}
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
							onClick={this.openDevTools.bind(this)}
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
