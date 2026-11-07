import { request } from "./api";

// Keeps track of the running uploads, so the progress can be shown while the user is using other
// parts of the app.
//
// An upload has two phases: first the file is transferred to paperless-ngx ("uploading"), then
// paperless-ngx consumes it (OCR, "processing"). The server answers the upload with the id of a task
// that is polled at /api/tasks/?task_id=<id> until it succeeded or failed.

const SPEED_WINDOW = 2000;
const HIDE_DELAY = 2500;
const POLL_INTERVAL = 2000;
const POLL_TIMEOUT = 15 * 60 * 1000;
const POLL_MAX_ERRORS = 5;

const UPLOADING = "uploading";
const PROCESSING = "processing";
const DONE = "done";
const FAILED = "failed";

let uploads = [];
let samples = [];
let listeners = [];
let visible = false;
let hideTimeout = null;
let pollTimeout = null;

const isRunning = (upload) => upload.phase === UPLOADING || upload.phase === PROCESSING;
const countIn = (phase) => uploads.filter((upload) => upload.phase === phase).length;
const sum = (key) => uploads.reduce((total, upload) => total + upload[key], 0);

// SPEED: bytes per second, measured over the last seconds
const currentSpeed = (loaded) => {
	const now = Date.now();
	samples = samples.filter((sample) => now - sample.time <= SPEED_WINDOW);

	const first = samples[0];
	if (!first || now <= first.time || loaded < first.loaded) return 0;

	return ((loaded - first.loaded) * 1000) / (now - first.time);
};

// SNAPSHOT: the state of all uploads of this batch, as the widget shows it
const snapshot = () => {
	const processing = uploads.filter((upload) => upload.phase === PROCESSING);

	return {
		visible: visible,
		uploading: countIn(UPLOADING) > 0,
		processing: processing.length > 0,
		active: uploads.some(isRunning),
		// the state of the first task that is still running: PENDING (queue) or STARTED
		taskStatus: processing.length > 0 ? processing[0].taskStatus : null,
		files: uploads.length,
		finished: countIn(DONE),
		failed: countIn(FAILED),
		loaded: sum("loaded"),
		total: sum("total"),
		speed: currentSpeed(sum("loaded"))
	};
};

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

// HIDE LATER: hides the widget a moment after the last upload is finished, errors stay longer
const hideLater = () => {
	if (uploads.some(isRunning)) return;

	window.clearTimeout(hideTimeout);
	hideTimeout = window.setTimeout(
		() => {
			visible = false;
			uploads = [];
			samples = [];
			notify();
		},
		countIn(FAILED) > 0 ? HIDE_DELAY * 2 : HIDE_DELAY
	);
};

// the progress of the uploads is remembered to calculate the speed
const recordSample = () => samples.push({ time: Date.now(), loaded: sum("loaded") });

// UPDATE: the task of an upload changed
const applyTask = (upload, task) => {
	upload.taskStatus = task.status;
	upload.errors = 0;

	if (task.status === "SUCCESS") upload.phase = DONE;
	if (task.status === "FAILURE" || task.status === "REVOKED") {
		upload.phase = FAILED;
		upload.message = task.result;
	}

	if (!isRunning(upload) && upload.onProcessed) upload.onProcessed(task);
};

// the server does not answer: stop waiting after a few tries, the document might be fine and show
// up in the list anyway
const applyPollError = (upload) => {
	upload.errors = (upload.errors || 0) + 1;
	if (upload.errors >= POLL_MAX_ERRORS) upload.phase = DONE;
};

// POLL TASK: asks paperless-ngx for the state of the task of an upload
const pollTask = (upload) =>
	request({ method: "get", url: "/api/tasks/", params: { task_id: upload.taskId } })
		.then((result) => (Array.isArray(result.data) ? result.data[0] : result.data))
		.then((task) => task && applyTask(upload, task))
		.catch(() => applyPollError(upload))
		.then(() => {
			const waitedTooLong = Date.now() - upload.processingSince > POLL_TIMEOUT;
			if (upload.phase === PROCESSING && waitedTooLong) upload.phase = DONE;
		});

// POLL ALL: asks for all tasks, again and again until all of them are finished
const pollAll = () => {
	pollTimeout = null;

	Promise.all(uploads.filter((upload) => upload.phase === PROCESSING).map(pollTask)).then(() => {
		notify();
		hideLater();

		if (countIn(PROCESSING) > 0) pollTimeout = window.setTimeout(pollAll, POLL_INTERVAL);
	});
};

// START PROCESSING: the file is on the server, wait for the recognition
const startProcessing = (upload, taskId) => {
	// older servers do not tell us a task, nothing to wait for
	if (typeof taskId !== "string" || taskId.length === 0) {
		upload.phase = DONE;
		return;
	}

	Object.assign(upload, {
		phase: PROCESSING,
		taskId: taskId,
		taskStatus: "PENDING",
		processingSince: Date.now()
	});

	if (pollTimeout === null) pollTimeout = window.setTimeout(pollAll, POLL_INTERVAL);
};

// ADD UPLOAD: a new batch starts when nothing is running anymore
const addUpload = (file, onProcessed) => {
	if (!uploads.some(isRunning)) {
		uploads = [];
		samples = [];
	}

	window.clearTimeout(hideTimeout);
	visible = true;

	const upload = { loaded: 0, total: file.size || 1, phase: UPLOADING, onProcessed: onProcessed };
	uploads.push(upload);
	recordSample();
	notify();

	return upload;
};

// SEND FILE: the request to paperless-ngx, it consumes uploaded documents at this endpoint
const sendFile = (file, upload) => {
	const data = new FormData();
	data.append("document", file);
	data.append("title", file.name);

	return request({
		method: "post",
		url: "/api/documents/post_document/",
		data: data,
		headers: { "Content-Type": "multipart/form-data" },
		onUploadProgress: (event) => {
			upload.loaded = Math.min(event.loaded, upload.total);
			if (event.total) upload.total = event.total;

			recordSample();
			notify();
		}
	});
};

// UPLOAD FILE: sends a document to paperless-ngx, returns a promise that is resolved as soon as the
// file was transferred. The optional callback onProcessed(task) is called once paperless-ngx
// finished (or failed) to process the document.
export const uploadFile = (file, onProcessed) => {
	const upload = addUpload(file, onProcessed);

	return sendFile(file, upload)
		.then((result) => {
			upload.loaded = upload.total;
			startProcessing(upload, result.data);

			return result;
		})
		.catch((err) => {
			upload.phase = FAILED;
			throw err;
		})
		.finally(() => {
			notify();
			hideLater();
		});
};
