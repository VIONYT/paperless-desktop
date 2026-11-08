import React, { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router";

// WITH ROUTER: gives a class component what it needs of the router:
//   this.props.router.push(path) / replace(path), this.props.params ({ id: "1" }), this.props.location
const withRouter = (Component) => {
	const WithRouter = (props) => {
		const navigate = useNavigate();
		const params = useParams();
		const location = useLocation();
		const router = useMemo(
			() => ({
				push: (path) => navigate(path),
				replace: (path) => navigate(path, { replace: true })
			}),
			[navigate]
		);

		return <Component {...props} router={router} params={params} location={location} />;
	};

	return WithRouter;
};

export default withRouter;
