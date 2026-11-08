import React from "react";
import { Outlet } from "react-router";
import bus from "../bus";
import native from "../native";
import { signOut } from "../auth";
import withRouter from "../withRouter";

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

		if (this.props.router) this.props.router.push("/login");
	}

	// RENDER
	render() {
		return <Outlet />;
	}
}

export default withRouter(Master);
