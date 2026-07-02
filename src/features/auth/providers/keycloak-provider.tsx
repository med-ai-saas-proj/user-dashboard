import LoadingPage from "@/components/loading-page";
import keycloak, { initKeycloak } from "@/config/keycloak";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { syncAuthStateFromKeycloakToken } from "@/features/auth/utils/sync-auth-state";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";

interface KeycloakContextType {
	keycloak: typeof keycloak;
	initialized: boolean;
	authenticated: boolean;
}

const KeycloakContext = createContext<KeycloakContextType | undefined>(
	undefined
);

export const KeycloakProvider = ({ children }: { children: ReactNode }) => {
	const [initialized, setInitialized] = useState(false);
	const [authenticated, setAuthenticated] = useState(false);
	const { logout } = useAuthStore();

	// biome-ignore lint/correctness/useExhaustiveDependencies: This is intended to run only once on mount
	useEffect(() => {
		initKeycloak()
			.then((auth) => {
				setAuthenticated(auth);
				setInitialized(true);

				// Init auth statke on first load
				if (auth && keycloak.token && keycloak.refreshToken) {
					syncAuthStateFromKeycloakToken();
				}

				// Auto-refresh token
				keycloak.onTokenExpired = () => {
					keycloak
						.updateToken(30)
						.then((refreshed) => {
							if (refreshed && keycloak.token && keycloak.refreshToken) {
								syncAuthStateFromKeycloakToken();
							}
						})
						.catch(() => {
							logout();
							keycloak.logout();
						});
				};
			})
			.catch((error) => {
				console.error("Keycloak initialization failed", error);
				setInitialized(true);
			});
	}, []);

	return (
		<KeycloakContext.Provider value={{ keycloak, initialized, authenticated }}>
			{initialized ? children : <LoadingPage />}
		</KeycloakContext.Provider>
	);
};

export const useKeycloak = () => {
	const context = useContext(KeycloakContext);
	if (!context) {
		throw new Error("useKeycloak must be used within KeycloakProvider");
	}
	return context;
};
