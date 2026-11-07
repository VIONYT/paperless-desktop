import React from "react";
import ResourceAdd from "./ResourceAdd";
import CorrespondentsActions from "../actions/CorrespondentsActions";

const CorrespondentsAdd = () => (
	<ResourceAdd
		titleKey="correspondents.addTitle"
		withColor={false}
		save={(correspondent) => CorrespondentsActions.addCorrespondent(correspondent)}
	/>
);

export default CorrespondentsAdd;
