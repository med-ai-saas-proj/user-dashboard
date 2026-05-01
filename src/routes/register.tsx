import axios, { isAxiosError } from "axios";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { LocaleSwitcher } from "@/components/sidebar/locale-switcher";
import { IAM_ROUTES } from "@/config/iam";
import { useIam } from "@/features/auth/providers/iam-provider";

const RegisterPage = () => {
	const { t } = useTranslation("sign-in");
	const navigate = useNavigate();
	const { markAuthenticated } = useIam();

	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);

		if (password !== confirmPassword) {
			setError(t("error.passwordMismatch"));
			return;
		}

		setSubmitting(true);
		try {
			const response = await axios.post<{
				data?: {
					tokenPayload?: { id?: string; email?: string; fullName?: string };
				};
			}>(
				IAM_ROUTES.REGISTER,
				{ email, password, fullName: fullName || undefined },
				{ withCredentials: true }
			);
			const payload = response.data?.data?.tokenPayload;
			markAuthenticated({ ...payload, email, fullName });
			navigate("/", { replace: true });
		} catch (err) {
			if (isAxiosError(err)) {
				const status = err.response?.status;
				if (status === 409) {
					setError(t("error.emailExists"));
				} else if (status === 400) {
					setError(t("error.invalidInput"));
				} else {
					setError(t("error.serverError"));
				}
			} else {
				setError(t("error.unknown"));
			}
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4">
			<LocaleSwitcher className="absolute top-4 right-4" />
			<div className="w-full max-w-md space-y-8">
				<div className="text-center space-y-2">
					<h1 className="text-4xl font-bold tracking-tight">
						{t("greetings.createAccount")}
					</h1>
					<p className="text-muted-foreground">
						{t("greetings.createAccountHero")}
					</p>
				</div>
				<form className="space-y-4" onSubmit={handleSubmit}>
					<div className="space-y-2">
						<Label htmlFor="register-fullname">{t("field.fullName")}</Label>
						<Input
							id="register-fullname"
							type="text"
							autoComplete="name"
							value={fullName}
							onChange={(e) => setFullName(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="register-email">{t("field.email")}</Label>
						<Input
							id="register-email"
							type="email"
							autoComplete="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="register-password">{t("field.password")}</Label>
						<Input
							id="register-password"
							type="password"
							autoComplete="new-password"
							required
							minLength={8}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="register-confirm">
							{t("field.confirmPassword")}
						</Label>
						<Input
							id="register-confirm"
							type="password"
							autoComplete="new-password"
							required
							minLength={8}
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
						/>
					</div>
					{error ? (
						<p className="text-sm text-destructive" role="alert">
							{error}
						</p>
					) : null}
					<Button type="submit" className="w-full" disabled={submitting}>
						{submitting ? t("action.creatingAccount") : t("action.signUp")}
					</Button>
				</form>
				<p className="text-center text-sm text-muted-foreground">
					{t("action.haveAccount")}{" "}
					<Link
						to="/login"
						className="font-medium text-primary hover:underline"
					>
						{t("action.signIn")}
					</Link>
				</p>
			</div>
		</div>
	);
};

export default RegisterPage;
