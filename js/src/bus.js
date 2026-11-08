// A tiny event bus, so components can talk to each other without knowing each other.

const handlers = {};

// ON: calls the function when the event is triggered, returns the function to unsubscribe
export const on = (name, callback) => {
	handlers[name] = (handlers[name] || []).concat(callback);

	return () => {
		handlers[name] = handlers[name].filter((handler) => handler !== callback);
	};
};

// TRIGGER: calls all functions that listen to the event
export const trigger = (name, data) => {
	(handlers[name] || []).forEach((handler) => handler(data));
};

export default { on, trigger };
