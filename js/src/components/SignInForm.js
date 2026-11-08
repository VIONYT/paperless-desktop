import React from "react";
import { t } from "../i18n";

// The fields of the login: the URL of paperless, the user name and the password.
// props: { values, onChange, onSubmit, submitLabel, passwordPlaceholder, className, buttonClass }
const SignInForm = ({
	values,
	onChange,
	onSubmit,
	submitLabel,
	passwordPlaceholder,
	className,
	buttonClass
}) => {
	const field = (name, label, type, placeholder) => (
		<div className="form-group">
			<label>{label}</label>
			<input
				type={type}
				name={name}
				value={values[name]}
				onChange={onChange}
				className="form-control"
				placeholder={placeholder}
			/>
		</div>
	);

	return (
		<form className={className} onSubmit={onSubmit}>
			{field("host", t("login.url"), "text", t("login.urlPlaceholder"))}
			{field("username", t("login.username"), "text", t("login.username"))}
			{field(
				"password",
				t("login.password"),
				"password",
				passwordPlaceholder || t("login.password")
			)}
			<button type="submit" className={buttonClass}>
				{submitLabel}
			</button>
		</form>
	);
};

export default SignInForm;
