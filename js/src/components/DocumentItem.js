import React from "react";
import { Link } from "react-router";
import TagDot from "./TagDot";
import { thumbnailUrl } from "../api";
import { formatDate } from "../dates";
import { t } from "../i18n";

const MAX_TITLE_LENGTH = 100;

const shorten = (title) =>
	title.length > MAX_TITLE_LENGTH ? title.substr(0, MAX_TITLE_LENGTH - 1) + "…" : title;

class DocumentItem extends React.Component {
	// SHOW CONTEXT MENU: a right click opens the menu of the document (edit, tags, delete)
	showContextMenu(event, doc) {
		event.preventDefault();
		this.props.onContextMenu(doc);
	}

	// RENDER
	render() {
		const doc = this.props.document;
		const tags = this.props.tags;

		return (
			<Link
				className="document-item"
				to={"/document/" + doc.id}
				onContextMenu={(e) => this.showContextMenu(e, doc)}
			>
				<div
					className="document-item-thumbnail"
					style={{ backgroundImage: `url("${thumbnailUrl(doc.id)}")` }}
				/>
				<div className="document-item-title">
					{doc.fresh ? (
						<span
							title={t("documents.new")}
							className="icon icon-plus-circled text-positive"
						/>
					) : null}
					{doc.fresh ? " " : null}
					{shorten(doc.title)}
					&nbsp;
					{doc.tags
						.filter((id) => tags[id])
						.map((id) => (
							<TagDot tag={tags[id]} key={"tag_" + id} />
						))}
				</div>
				<small>{formatDate(doc.created)}</small>
			</Link>
		);
	}
}

export default DocumentItem;
