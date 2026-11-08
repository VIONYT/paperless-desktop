import { createHashRouter } from "react-router";
import App from "./containers/App";
import Modal from "./components/Modal";
import Documents from "./containers/Documents";
import Login from "./containers/Login";
import DocumentDetail from "./containers/DocumentDetail";
import Logs from "./containers/Logs";
import Tags from "./containers/Tags";
import Correspondents from "./containers/Correspondents";
import CorrespondentsAdd from "./containers/CorrespondentsAdd";
import TagsAdd from "./containers/TagsAdd";
import Settings from "./containers/Settings";
import Master from "./containers/Master";
import Reminders from "./containers/Reminders";
import RemindersAdd from "./containers/RemindersAdd";

// The pages of the app. The address is in the hash of the URL (index.html#/documents).
export default createHashRouter([
	{
		path: "/",
		Component: Master,
		children: [
			{ index: true, Component: Login },
			{ path: "login", Component: Login },
			{
				// the window with the toolbar and the tabs
				Component: App,
				children: [
					{ path: "documents", Component: Documents },
					{ path: "document/:id", Component: DocumentDetail },
					{ path: "logs", Component: Logs },
					{ path: "tags", Component: Tags },
					{ path: "correspondents", Component: Correspondents },
					{ path: "settings", Component: Settings },
					{ path: "reminders", Component: Reminders }
				]
			},
			{
				// the content of the modal windows
				path: "modal",
				Component: Modal,
				children: [
					{ path: "correspondents/add", Component: CorrespondentsAdd },
					{ path: "tags/add", Component: TagsAdd },
					{ path: "reminders/add/:doc", Component: RemindersAdd }
				]
			}
		]
	}
]);
