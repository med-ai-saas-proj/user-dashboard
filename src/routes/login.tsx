import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/shadcn/button";
import { LocaleSwitcher } from "@/components/sidebar/locale-switcher";
import { useKeycloak } from "@/features/auth/providers/keycloak-provider";

const LoginPage = () => {
	const { t } = useTranslation("sign-in");

	const navigate = useNavigate();
	const { keycloak, authenticated } = useKeycloak();

	const handleKeycloakLogin = () => {
		keycloak.login({
			redirectUri: window.location.origin,
		});
	};

	useEffect(() => {
		if (authenticated) {
			navigate("/");
		}
	}, [authenticated, navigate]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4">
			<LocaleSwitcher className="absolute top-4 right-4" />
			<div className="w-full max-w-md space-y-8 flex flex-col items-center">
				<div className="text-center space-y-2">
					<h1 className="text-4xl font-bold tracking-tight">
						{t("greetings.welcome")}
					</h1>
					<p className="text-muted-foreground">{t("greetings.hero")}</p>
				</div>
				<Button
					onClick={handleKeycloakLogin}
					size="lg"
					className="sm:w-full rounded-full w-60 mx-auto"
				>
					{t("action.signIn")}
				</Button>
			</div>
		</div>
	);
};

export default LoginPage;
