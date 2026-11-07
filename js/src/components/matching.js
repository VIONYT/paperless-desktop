import { t } from "../i18n";

// The matching algorithms of paperless-ngx, the id is the number the API uses.
const ALGORITHMS = ["none", "any", "all", "literal", "regex", "fuzzy", "auto"];

// MATCHING ALGORITHMS: [{ id: "0", text: "None" }, { id: "1", text: "Any" }, ...]
export const matchingAlgorithms = () =>
	ALGORITHMS.map((key, id) => ({ id: String(id), text: t("matching." + key) }));
