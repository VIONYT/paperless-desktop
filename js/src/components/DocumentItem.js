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
	// HANDLE CLICK: with shift or command, or while documents are selected, a click selects.
	// Otherwise it opens the document.
	handleClick(event, doc) {
		const additive = event.metaKey || event.ctrlKey || event.shiftKey || this.props.selecting;
		if (!additive) return;

		event.preventDefault();
		this.props.onSelect(doc, event.shiftKey);
	}

	// HANDLE CHECK: the check mark at the thumbnail adds or removes the document
	handleCheck(event, doc) {
		event.preventDefault();
		event.stopPropagation();
		this.props.onSelect(doc, false);
	}

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
				className={"document-item" + (this.props.selected ? " selected" : "")}
				to={"/document/" + doc.id}
				aria-selected={this.props.selected}
				onClick={(e) => this.handleClick(e, doc)}
				onContextMenu={(e) => this.showContextMenu(e, doc)}
			>
				<span
					className="document-item-check icon icon-check"
					role="checkbox"
					aria-checked={this.props.selected}
					aria-label={t("selection.select")}
					onClick={(e) => this.handleCheck(e, doc)}
				/>
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
