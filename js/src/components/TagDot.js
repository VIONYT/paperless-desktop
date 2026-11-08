import React from "react";
import { tagColor } from "../utils";

const TagDot = ({ tag }) => (
	<span className="icon icon-record" title={tag.name} style={{ color: tagColor(tag) }} />
);

export default TagDot;
