import { getLanguage } from "./i18n";

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

// paperless-ngx 2.16+ delivers the creation date of a document as plain date (YYYY-MM-DD),
// older versions deliver a date time
export const isDateOnly = (value) => typeof value === "string" && DATE_ONLY.test(value);

// PARSE DATE: a plain date is local time (and not UTC midnight, which can be the day before)
export const parseDate = (value) => {
	const match = DATE_ONLY.exec(value);
	return match ? new Date(match[1], match[2] - 1, match[3]) : new Date(value);
};

// FORMAT DATE: "Monday, June 1, 2026, 12:00 AM" in the language of the app, dates without time
export const formatDate = (value, dateStyle = "full") => {
	const options = isDateOnly(value)
		? { dateStyle: dateStyle }
		: { dateStyle: dateStyle, timeStyle: "short" };

	return new Intl.DateTimeFormat(getLanguage(), options).format(parseDate(value));
};

const pad = (number) => String(number).padStart(2, "0");

// TO LOCAL INPUT: the value of a <input type="datetime-local">, e.g. "2026-06-01T12:00"
export const toLocalInput = (value) => {
	const d = parseDate(value);
	const date = [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join("-");

	return date + "T" + pad(d.getHours()) + ":" + pad(d.getMinutes());
};
