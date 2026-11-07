import React from "react";
import { Link } from "react-router";
import PaperlessComponent from "./PaperlessComponent";
import moment from "moment";
import TagsStore from "../stores/TagsStore";
import TagDot from "./TagDot";
import { thumbnailUrl } from "../api";
import { t } from "../i18n";

String.prototype.trunc =
	String.prototype.trunc ||
	function(n) {
		return this.length > n ? this.substr(0, n - 1) + "\u2026" : this;
	};

class DocumentItem extends PaperlessComponent {
	// CONSTRUCTOR
	constructor(props) {
		super(props);
		this.state = TagsStore.getState();
	}

	// COMPONENT DID MOUNT
	componentDidMount() {
		// load the image base64 data
		super.getDataUri(thumbnailUrl(this.props.document.id), (result) => {
			this.setState({
				data: result
			});
		});
	}

	// RENDER
	render() {
		var divStyle = {};
		if ("data" in this.state) {
			divStyle["backgroundImage"] = "url(" + this.state.data + ")";
		}
		var tags = [];
		if (this.state.tags && this.state.tags.results) {
			this.state.tags.results.forEach((tag) => {
				tags[tag.id] = tag;
			});
		}
		return (
			<Link className="document-item" to={"/document/" + this.props.document.id}>
				<div className="document-item-thumbnail" style={divStyle} />
				<div className="document-item-title">
					{this.props.document.fresh ? (
						<span
							title={t("documents.new")}
							className="icon icon-plus-circled text-positive"
						/>
					) : null}
					{this.props.document.fresh ? " " : null}
					{this.props.document.title.trunc(100)}
					&nbsp;
					{this.props.document.tags.map((tagId) => {
						var tag = tags[tagId];
						if (!tag) return null;
						return (
							<TagDot
								tag={tag}
								key={"sidebar_tags_" + tag.id}
								setTagFilter={this.props.setTagFilter}
							/>
						);
					})}
				</div>
				<small>{moment(this.props.document.created).format("LLLL")}</small>
			</Link>
		);
	}
}

export default DocumentItem;
