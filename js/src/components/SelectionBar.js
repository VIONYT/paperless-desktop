import React from "react";
import { t } from "../i18n";

// The bar above the list while documents are selected: how many, and what can be done with them.
// props: { count, total, onSelectAll, onClear, onMenu(kind), onDelete }
const SelectionBar = ({ count, total, onSelectAll, onClear, onMenu, onDelete }) => {
	const button = (icon, label, onClick) => (
		<button className="btn btn-default" title={label} aria-label={label} onClick={onClick}>
			<span className={"icon icon-" + icon} /> <span>{label}</span>
		</button>
	);

	return (
		<div className="selection-bar" role="toolbar">
			<span className="selection-count">{t("selection.count", { count: count })}</span>
			{count < total ? (
				<button className="btn btn-default" onClick={onSelectAll}>
					{t("selection.selectAll")}
				</button>
			) : null}
			<span className="selection-spacer" />
			{button("user", t("context.correspondent"), () => onMenu("correspondent"))}
			{button("tag", t("context.tags"), () => onMenu("tags"))}
			{button("trash", t("common.delete"), onDelete)}
			<button className="btn btn-default" onClick={onClear}>
				{t("selection.clear")}
			</button>
		</div>
	);
};

export default SelectionBar;
