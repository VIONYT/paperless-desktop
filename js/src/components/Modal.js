import React from "react";
import { Outlet } from "react-router";

class Modal extends React.Component {
	// RENDER
	render() {
		return (
			<div className="modal">
				<Outlet />
			</div>
		);
	}
}

export default Modal;
