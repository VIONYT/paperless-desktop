import { request } from "./api";

// Keeps track of the running uploads, so the progress can be shown while the user is
// using other parts of the app. A snapshot looks like this:
// { active: true, files: 3, finished: 1, failed: 0, loaded: 123, total: 456, speed: 1024 }

const SPEED_WINDOW = 2000;
const COMPLETE_VISIBLE = 2500;

let uploads = [];
let samples = [];
let listeners = [];
let hideTimeout = null;
let visible = false;

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

	return {
		visible: visible,
		active: uploads.some((u) => !u.done),
		files: uploads.length,
		finished: uploads.filter((u) => u.done && !u.failed).length,
		failed: uploads.filter((u) => u.failed).length,
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
	if (uploads.some((u) => !u.done)) return;

	window.clearTimeout(hideTimeout);
	hideTimeout = window.setTimeout(
		() => {
			visible = false;
			uploads = [];
			samples = [];
			notify();
		},
		// errors stay a bit longer
		uploads.some((u) => u.failed) ? COMPLETE_VISIBLE * 2 : COMPLETE_VISIBLE
	);
};

// UPLOAD FILE: sends a document to paperless-ngx, returns a promise
export const uploadFile = (file) => {
	// a new batch starts when nothing is running anymore
	if (!uploads.some((u) => !u.done)) {
		uploads = [];
		samples = [];
	}

	window.clearTimeout(hideTimeout);
	visible = true;

	const upload = { loaded: 0, total: file.size || 1, done: false, failed: false };
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
			upload.done = true;
			notify();
			checkFinished();

			return result;
		})
		.catch((err) => {
			upload.done = true;
			upload.failed = true;
			notify();
			checkFinished();

			throw err;
		});
};
