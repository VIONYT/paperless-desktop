import React from "react";
import $ from "jquery";
import { ipcRenderer } from "../electronBridge";

class Master extends React.Component {
	// COMPONENT DID MOUNT
	componentDidMount() {
		$(window).on("goBackToLogin", this.goBackToLogin.bind(this));
	}

	// COMPONENT WILL UNMOUNT
	componentWillUnmount() {
		$(window).off("goBackToLogin");
	}

	// GO BACK TO LOGIN
	goBackToLogin() {
		localStorage.removeItem("settings.auth.username");
		localStorage.removeItem("settings.auth.password");
		localStorage.removeItem("settings.auth.token");
		localStorage.removeItem("settings.host");

		ipcRenderer.send("login", null);

		ipcRenderer.send("setSize", {
			width: 500,
			height: 520
		});

		if (this.context.router) {
			this.context.router.push("/login");
		}
	}

	// RENDER
	render() {
		return this.props.children;
	}
}

// CONTEXT TYPES
Master.contextTypes = {
	router: React.PropTypes.object.isRequired
};

export default Master;
