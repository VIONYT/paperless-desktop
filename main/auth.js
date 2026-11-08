/* The credentials of the paperless server. They are sent by the renderer after the login and
 * are attached to the requests to the server here, in the main process. */
const { parseAuth } = require("./validate");

let auth = null;

const setAuth = (arg) => {
	auth = parseAuth(arg);
};

const getAuth = () => auth;

module.exports = { setAuth, getAuth };
