import React from "react";
import SignInForm from "../components/SignInForm";
import native from "../native";
import { signIn, isSignedIn } from "../auth";
import { t } from "../i18n";

class Login extends React.Component {
	// CONSTRUCTOR
	constructor(props) {
		super(props);
		this.state = { host: "", username: "", password: "" };
	}

	// COMPONENT DID MOUNT: whoever is signed in already goes on
	componentDidMount() {
		if (isSignedIn()) this.goHome();
	}

	// HANDLE CHANGE
	handleChange(event) {
		this.setState({ [event.target.name]: event.target.value });
	}

	// HANDLE LOGIN
	handleLogin(event) {
		event.preventDefault();
		const { host, username, password } = this.state;
		if (!host || !username || !password) return;

		signIn(host, username, password)
			.then((signedInHost) => signedInHost && this.goHome())
			.catch(() => native.showError(t("login.failedTitle"), t("login.failedMessage")));
	}

	// GO HOME
	goHome() {
		native.send("setSize", { width: 1200, height: 750 });
		this.context.router.push("/documents");
	}

	// RENDER
	render() {
		return (
			<div className="center-form">
				<center>
					<img src="icon.png" width="180" />
				</center>
				<SignInForm
					className="login-form"
					values={this.state}
					onChange={this.handleChange.bind(this)}
					onSubmit={this.handleLogin.bind(this)}
					submitLabel={t("login.submit")}
					buttonClass="btn btn-form btn-primary"
				/>
			</div>
		);
	}
}

// CONTEXT TYPES
Login.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default Login;
