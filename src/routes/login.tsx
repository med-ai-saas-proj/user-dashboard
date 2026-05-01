import axios, { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { LocaleSwitcher } from "@/components/sidebar/locale-switcher";
import { IAM_ROUTES } from "@/config/iam";
import { useIam } from "@/features/auth/providers/iam-provider";

interface LoginResponse {
	data?: {
		tokenPayload?: {
			id?: string;
			email?: string;
			fullName?: string;
			name?: string;
			expiredAt?: number;
		};
	};
}

const LoginPage = () => {
	const { t } = useTranslation("sign-in");
	const navigate = useNavigate();
	const { authenticated, markAuthenticated } = useIam();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (authenticated) {
			navigate("/", { replace: true });
		}
	}, [authenticated, navigate]);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);
		setSubmitting(true);
		try {
			const response = await axios.post<LoginResponse>(
				IAM_ROUTES.LOGIN,
				{ email, password },
				{ withCredentials: true }
			);
			const payload = response.data?.data?.tokenPayload;
			markAuthenticated({ ...payload, email });
			navigate("/", { replace: true });
		} catch (err) {
			if (isAxiosError(err)) {
				const status = err.response?.status;
				if (status === 401 || status === 400) {
					setError(t("error.invalidCredentials"));
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

	const handleGoogleLogin = () => {
		window.location.href = IAM_ROUTES.GOOGLE_LOGIN;
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4">
			<LocaleSwitcher className="absolute top-4 right-4" />
			<div className="w-full max-w-md space-y-8">
				<div className="text-center space-y-2">
					<h1 className="text-4xl font-bold tracking-tight">
						{t("greetings.welcome")}
					</h1>
					<p className="text-muted-foreground">{t("greetings.hero")}</p>
				</div>
				<form className="space-y-4" onSubmit={handleSubmit}>
					<div className="space-y-2">
						<Label htmlFor="login-email">{t("field.email")}</Label>
						<Input
							id="login-email"
							type="email"
							autoComplete="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="login-password">{t("field.password")}</Label>
						<Input
							id="login-password"
							type="password"
							autoComplete="current-password"
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>
					{error ? (
						<p className="text-sm text-destructive" role="alert">
							{error}
						</p>
					) : null}
					<Button type="submit" className="w-full" disabled={submitting}>
						{submitting ? t("action.signingIn") : t("action.signIn")}
					</Button>
				</form>
				<div className="flex items-center gap-2">
					<div className="h-px flex-1 bg-border" />
					<span className="text-xs uppercase tracking-wide text-muted-foreground">
						{t("action.or")}
					</span>
					<div className="h-px flex-1 bg-border" />
				</div>
				<Button
					type="button"
					variant="outline"
					className="w-full"
					onClick={handleGoogleLogin}
				>
					{t("action.continueWithGoogle")}
				</Button>
				<Button
					type="button"
					variant="ghost"
					className="w-full"
					onClick={() => {
						setEmail("admin@venerian.space");
						setPassword("Venera@3215");
					}}
				>
					Use shared admin
				</Button>
				<p className="text-center text-sm text-muted-foreground">
					{t("action.noAccount")}{" "}
					<Link
						to="/register"
						className="font-medium text-primary hover:underline"
					>
						{t("action.signUp")}
					</Link>
				</p>
			</div>
		</div>
	);
};

export default LoginPage;
