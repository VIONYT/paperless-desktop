import React from "react";

// LOAD MORE: an empty place at the end of the list. When it comes near the visible area (or is visible
// right away), `onVisible` loads the next page.
class LoadMore extends React.Component {
	// COMPONENT DID MOUNT
	componentDidMount() {
		this.observer = new window.IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) this.props.onVisible();
			},
			// starts loading a bit before the end is reached
			{ rootMargin: "400px" }
		);
		this.observer.observe(this.element);
	}

	// COMPONENT WILL UNMOUNT
	componentWillUnmount() {
		this.observer.disconnect();
	}

	// RENDER
	render() {
		return (
			<div
				className="load-more"
				ref={(el) => {
					this.element = el;
				}}
			>
				{this.props.children}
			</div>
		);
	}
}

export default LoadMore;
