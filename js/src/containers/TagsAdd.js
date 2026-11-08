import React from "react";
import ResourceAdd from "./ResourceAdd";
import TagsActions from "../actions/TagsActions";

const TagsAdd = () => (
	<ResourceAdd
		titleKey="tags.addTitle"
		withColor={true}
		save={(tag) => TagsActions.addTag(tag)}
	/>
);

export default TagsAdd;
