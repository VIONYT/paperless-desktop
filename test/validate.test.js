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
