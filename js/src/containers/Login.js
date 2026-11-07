import React from "react";
import Header from "../components/Header";
import { getToken, getHost, normalizeHost, fetchToken } from "../api";
import { ipcRenderer, dialog } from "../electronBridge";
import { t } from "../i18n";

class Login extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	// COMPONENT DID MOUNT
	componentDidMount() {
		// already logged in?
		if (getToken() && getHost().length > 0) {
			// send login information down the wire to the main process
			ipcRenderer.send("login", {
				host: getHost(),
				token: getToken()
			});

			this.goHome();
		}
	}

	// HANDLE CHANGE
	handleChange(event) {
		var s = {};
		s[event.target.name] = event.target.value;
		this.setState(s);
	}

	// HANDLE LOGIN
	handleLogin(event) {
		if (event) event.preventDefault();

		// a bit of validation
		if (!("host" in this.state) || this.state.host.length <= 0) {
			return;
		}

		if (!("username" in this.state) || this.state.username.length <= 0) {
			return;
		}

		if (!("password" in this.state) || this.state.password.length <= 0) {
			return;
		}

		// adds http:// if no scheme is given
		var host = normalizeHost(this.state.host);

		// exchange the credentials for an API token of paperless-ngx
		fetchToken(host, this.state.username, this.state.password)
			.then((token) => {
				// the request worked out, we can save the settings
				localStorage.setItem("settings.auth.username", this.state.username);
				localStorage.setItem("settings.auth.token", token);
				localStorage.setItem("settings.host", host);

				ipcRenderer.send("login", {
					host: host,
					token: token
				});

				// move the router to the homepage
				this.goHome();
			})
			// the request did not work out, show an error
			.catch(() => {
				dialog.showErrorBox(t("login.failedTitle"), t("login.failedMessage"));
			});
	}

	// GO HOME
	goHome() {
		ipcRenderer.send("setSize", {
			width: 1200,
			height: 750
		});
		this.context.router.push("/documents");
	}

	// RENDER
	render() {
		return (
			<div className="center-form">
				<center>
					<img src="icon.png" width="180" />
				</center>
				<form className="login-form" onSubmit={this.handleLogin.bind(this)}>
					<div className="form-group">
						<label>{t("login.url")}</label>
						<input
							type="text"
							name="host"
							onChange={this.handleChange.bind(this)}
							className="form-control"
							placeholder={t("login.urlPlaceholder")}
						/>
					</div>
					<div className="form-group">
						<label>{t("login.username")}</label>
						<input
							type="username"
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
							onChange={this.handleChange.bind(this)}
							name="password"
							className="form-control"
							placeholder={t("login.password")}
						/>
					</div>
					<div className="form-actions">
						<button type="submit" className="btn btn-form btn-primary">
							{t("login.submit")}
						</button>
					</div>
				</form>
			</div>
		);
	}
}

// CONTEXT TYPES
Login.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default Login;
