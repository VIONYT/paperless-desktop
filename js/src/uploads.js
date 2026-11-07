import { request } from "./api";

// Keeps track of the running uploads, so the progress can be shown while the user is
// using other parts of the app.
//
// An upload has two phases: first the file is transferred to paperless-ngx ("uploading"), then
// paperless-ngx consumes it (OCR, "processing"). The server answers the upload with the id of
// a task that is polled at /api/tasks/?task_id=<id> until it succeeded or failed.

const SPEED_WINDOW = 2000;
const COMPLETE_VISIBLE = 2500;
const POLL_INTERVAL = 2000;
const POLL_TIMEOUT = 15 * 60 * 1000;
const POLL_MAX_ERRORS = 5;

let uploads = [];
let samples = [];
let listeners = [];
let hideTimeout = null;
let visible = false;
let pollTimeout = null;

// SNAPSHOT: the current state of all uploads of this batch
const snapshot = () => {
	const loaded = uploads.reduce((sum, u) => sum + u.loaded, 0);
	const total = uploads.reduce((sum, u) => sum + u.total, 0);

	// the speed is measured over the last seconds
	const now = Date.now();
	samples = samples.filter((s) => now - s.time <= SPEED_WINDOW);
	const first = samples[0];
	const speed =
		first && now > first.time && loaded >= first.loaded
			? ((loaded - first.loaded) * 1000) / (now - first.time)
			: 0;

	const processing = uploads.filter((u) => u.phase === "processing");

	return {
		visible: visible,
		// phase "uploading" (data is sent) or "processing" (paperless-ngx is recognizing the text)
		uploading: uploads.some((u) => u.phase === "uploading"),
		processing: processing.length > 0,
		active: uploads.some((u) => u.phase === "uploading" || u.phase === "processing"),
		// the state of the first task that is still running: PENDING (queue) or STARTED
		taskStatus: processing.length > 0 ? processing[0].taskStatus : null,
		files: uploads.length,
		finished: uploads.filter((u) => u.phase === "done").length,
		failed: uploads.filter((u) => u.phase === "failed").length,
		loaded: loaded,
		total: total,
		speed: speed
	};
};

// NOTIFY: tells the listeners about the new state
const notify = () => {
	const state = snapshot();
	listeners.forEach((listener) => listener(state));
};

// SUBSCRIBE: returns the function to unsubscribe
export const subscribe = (listener) => {
	listeners.push(listener);
	listener(snapshot());

	return () => {
		listeners = listeners.filter((l) => l !== listener);
	};
};

// CHECK FINISHED: hides the widget a moment after the last upload was finished
const checkFinished = () => {
	if (uploads.some((u) => u.phase === "uploading" || u.phase === "processing")) return;

	window.clearTimeout(hideTimeout);
	hideTimeout = window.setTimeout(
		() => {
			visible = false;
			uploads = [];
			samples = [];
			notify();
		},
		// errors stay a bit longer
		uploads.some((u) => u.phase === "failed") ? COMPLETE_VISIBLE * 2 : COMPLETE_VISIBLE
	);
};

// POLL TASKS: asks paperless-ngx for the state of the tasks of all uploads that are processed
const pollTasks = () => {
	pollTimeout = null;

	const processing = uploads.filter((u) => u.phase === "processing");
	if (processing.length === 0) return;

	Promise.all(
		processing.map((upload) =>
			request({ method: "get", url: "/api/tasks/", params: { task_id: upload.taskId } })
				.then((result) => {
					const task = Array.isArray(result.data) ? result.data[0] : result.data;
					upload.errors = 0;

					if (!task) return;

					upload.taskStatus = task.status;

					if (task.status === "SUCCESS") upload.phase = "done";
					if (task.status === "FAILURE" || task.status === "REVOKED") {
						upload.phase = "failed";
						upload.message = task.result;
					}

					if (upload.phase !== "processing" && upload.onProcessed)
						upload.onProcessed(task);
				})
				.catch(() => {
					// no answer of the server: stop waiting after a few tries, the document might
					// be fine and show up in the list anyway
					upload.errors = (upload.errors || 0) + 1;
					if (upload.errors >= POLL_MAX_ERRORS) upload.phase = "done";
				})
				.then(() => {
					if (
						upload.phase === "processing" &&
						Date.now() - upload.processingSince > POLL_TIMEOUT
					) {
						upload.phase = "done";
					}
				})
		)
	).then(() => {
		notify();
		checkFinished();

		if (uploads.some((u) => u.phase === "processing")) {
			pollTimeout = window.setTimeout(pollTasks, POLL_INTERVAL);
		}
	});
};

// START PROCESSING: the file is on the server, wait for the recognition
const startProcessing = (upload, taskId) => {
	// older servers do not tell us a task, nothing to wait for
	if (typeof taskId !== "string" || taskId.length === 0) {
		upload.phase = "done";
		return;
	}

	upload.phase = "processing";
	upload.taskId = taskId;
	upload.taskStatus = "PENDING";
	upload.processingSince = Date.now();

	if (pollTimeout === null) pollTimeout = window.setTimeout(pollTasks, POLL_INTERVAL);
};

// UPLOAD FILE: sends a document to paperless-ngx, returns a promise that is resolved as soon
// as the file was transferred. The optional callback onProcessed(task) is called once paperless-ngx
// finished (or failed) to process the document.
export const uploadFile = (file, onProcessed) => {
	// a new batch starts when nothing is running anymore
	if (!uploads.some((u) => u.phase === "uploading" || u.phase === "processing")) {
		uploads = [];
		samples = [];
	}

	window.clearTimeout(hideTimeout);
	visible = true;

	const upload = {
		loaded: 0,
		total: file.size || 1,
		phase: "uploading",
		onProcessed: onProcessed
	};
	uploads.push(upload);
	samples.push({ time: Date.now(), loaded: uploads.reduce((sum, u) => sum + u.loaded, 0) });
	notify();

	const data = new FormData();
	data.append("document", file);
	data.append("title", file.name);

	// paperless-ngx consumes uploaded documents via this endpoint
	return request({
		method: "post",
		url: "/api/documents/post_document/",
		data: data,
		headers: { "Content-Type": "multipart/form-data" },
		onUploadProgress: (event) => {
			upload.loaded = Math.min(event.loaded, upload.total);
			if (event.total) upload.total = event.total;

			samples.push({
				time: Date.now(),
				loaded: uploads.reduce((sum, u) => sum + u.loaded, 0)
			});
			notify();
		}
	})
		.then((result) => {
			upload.loaded = upload.total;
			startProcessing(upload, result.data);
			notify();
			checkFinished();

			return result;
		})
		.catch((err) => {
			upload.phase = "failed";
			notify();
			checkFinished();

			throw err;
		});
};
