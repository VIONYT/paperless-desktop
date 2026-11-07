import React from "react";
import $ from "jquery";
import { getToken, normalizeHost, fetchToken } from "../api";
import { ipcRenderer, dialog } from "../electronBridge";

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

				dialog.showErrorBox(
					"Ohoh!",
					"These signin information can't be right. Just tested. Sad!"
				);
			});
	}

	// TEST NOTIFICATION
	testNotification() {
		window.setTimeout(() => {
			// create notification
			var notif = new window.Notification("test", {
				body: "test"
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
					<h3>Sign In</h3>
					<hr />

					<form className="settings-form">
						<div className="form-group">
							<label>URL to paperless</label>
							<input
								type="text"
								name="host"
								value={this.state.host}
								onChange={this.handleChange.bind(this)}
								className="form-control"
								placeholder="For example: http://localhost:8000"
							/>
						</div>
						<div className="form-group">
							<label>Username</label>
							<input
								type="username"
								value={this.state.username}
								onChange={this.handleChange.bind(this)}
								name="username"
								className="form-control"
								placeholder="Username"
							/>
						</div>
						<div className="form-group">
							<label>Password</label>
							<input
								type="password"
								value={this.state.password}
								onChange={this.handleChange.bind(this)}
								name="password"
								className="form-control"
								placeholder="Enter your password to sign in again"
							/>
						</div>
						<button
							className="btn btn-large btn-primary"
							onClick={this.saveSignIn.bind(this)}
						>
							Update
						</button>
					</form>

					<h3>Documents</h3>
					<hr />
					<form className="settings-form">
						<div className="form-group">
							<label>Interval (seconds) to check for new documents</label>
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

					<h3>Developer Settings</h3>
					<hr />

					<div className="btn-group">
						<button
							className="btn btn-large btn-default"
							onClick={this.openDevTools.bind(this)}
						>
							<span className="icon icon-tools" /> Open DevTools
						</button>

						<button
							className="btn btn-large btn-default"
							onClick={this.testNotification.bind(this)}
						>
							<span className="icon icon-chat" /> Test notification with 2s delay
						</button>
					</div>
				</div>
			</div>
		);
	}
}

export default Settings;
