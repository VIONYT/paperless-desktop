const test = require("node:test");
const assert = require("node:assert");
const {
	isModalRoute,
	isDocumentId,
	clampSize,
	isServerUrl,
	parseAuth
} = require("../main/validate");

test("only the modal routes of the app are opened", () => {
	assert.ok(isModalRoute("/modal/tags/add"));
	assert.ok(isModalRoute("/modal/reminders/add/12"));
	assert.ok(!isModalRoute("/modal/../../etc"));
	assert.ok(!isModalRoute("https://evil.example"));
	assert.ok(!isModalRoute(undefined));
});

test("document ids are numbers", () => {
	assert.ok(isDocumentId(12));
	assert.ok(isDocumentId("12"));
	assert.ok(!isDocumentId("12/../x"));
	assert.ok(!isDocumentId(""));
});

test("window sizes are limited", () => {
	assert.strictEqual(clampSize(450, 1), 450);
	assert.strictEqual(clampSize(99999, 1), 4000);
	assert.strictEqual(clampSize(1, 1), 200);
	assert.strictEqual(clampSize("abc", 500), 500);
});

test("only urls below the paperless server are accepted", () => {
	const host = "https://paperless.example";
	assert.ok(isServerUrl(host + "/api/documents/1/download/", host));
	assert.ok(!isServerUrl("https://paperless.example.evil.com/api/", host));
	assert.ok(!isServerUrl(host + "/api/../secret", host));
	assert.ok(!isServerUrl(host, host));
	assert.ok(!isServerUrl(host + "/api/", ""));
});

test("credentials need a web address and a token", () => {
	assert.deepStrictEqual(parseAuth({ host: "http://localhost:8000/", token: "abc" }), {
		host: "http://localhost:8000",
		token: "abc"
	});
	assert.strictEqual(parseAuth({ host: "file:///etc", token: "abc" }), null);
	assert.strictEqual(parseAuth({ host: "http://localhost", token: "" }), null);
	assert.strictEqual(parseAuth(null), null);
});

test("the context of the menu has three flags", () => {
	const { parseContext } = require("../main/validate");
	assert.deepStrictEqual(
		parseContext({ signedIn: true, document: false, evil: 1, tabs: "yes" }),
		{
			signedIn: true,
			document: false
		}
	);
	assert.deepStrictEqual(parseContext(null), {});
});

test("the data of the context menu is checked", () => {
	const { parseContextMenu } = require("../main/validate");
	assert.strictEqual(parseContextMenu({ documentId: "1" }), null);
	assert.strictEqual(parseContextMenu({ documentIds: [] }), null);

	const parsed = parseContextMenu({
		documentIds: [5, "x", 6],
		kind: "tags",
		correspondent: 2,
		tags: [1, "x", 3],
		correspondents: [{ id: 2, name: "ACME" }, { id: "x", name: "bad" }, null],
		allTags: [{ id: 1, name: "a".repeat(300) }]
	});
	assert.deepStrictEqual(parsed.documentIds, [5, 6]);
	assert.strictEqual(parsed.kind, "tags");
	assert.strictEqual(
		parseContextMenu({ documentIds: [1], kind: "evil", correspondent: "x" }).kind,
		"document"
	);
	assert.strictEqual(
		parseContextMenu({ documentIds: [1], correspondent: "x" }).correspondent,
		undefined
	);
	assert.deepStrictEqual(parsed.tags, [1, 3]);
	assert.deepStrictEqual(parsed.correspondents, [{ id: 2, name: "ACME" }]);
	assert.strictEqual(parsed.allTags[0].name.length, 100);
});
