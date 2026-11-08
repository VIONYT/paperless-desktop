import React from "react";
import bus from "../bus";
import native from "../native";
import { signOut } from "../auth";

class Master extends React.Component {
	// COMPONENT DID MOUNT
	componentDidMount() {
		this.unsubscribe = bus.on("goBackToLogin", () => this.goBackToLogin());
	}

	// COMPONENT WILL UNMOUNT
	componentWillUnmount() {
		this.unsubscribe();
	}

	// GO BACK TO LOGIN: the server rejected the credentials
	goBackToLogin() {
		signOut();
		native.send("setSize", { width: 500, height: 520 });

		if (this.context.router) this.context.router.push("/login");
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
