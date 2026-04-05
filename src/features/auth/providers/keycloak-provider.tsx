import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import keycloak, { initKeycloak } from "@/config/keycloak";
import {
	type OrganizationInfo,
	type UserInfo,
	useAuthStore,
} from "@/features/auth/store/auth-store";

interface KeycloakContextType {
	keycloak: typeof keycloak;
	initialized: boolean;
	authenticated: boolean;
}

const KeycloakContext = createContext<KeycloakContextType | undefined>(
	undefined
);

const extractOrganizationFromToken = (
	tokenParsed: UserInfo | undefined
): OrganizationInfo | null => {
	if (!tokenParsed) return null;

	const organizationClaim = (tokenParsed as Record<string, unknown>)
		.organization;

	if (!organizationClaim || typeof organizationClaim !== "object") {
		return null;
	}

	const entries = Object.entries(organizationClaim as Record<string, unknown>);
	if (entries.length === 0) {
		return null;
	}

	const [name, details] = entries[0];
	if (!details || typeof details !== "object") {
		return null;
	}

	const id = (details as { id?: unknown }).id;
	if (typeof id !== "string" || id.length === 0) {
		return null;
	}

	return { id, name };
};

export const KeycloakProvider = ({ children }: { children: ReactNode }) => {
	const [initialized, setInitialized] = useState(false);
	const [authenticated, setAuthenticated] = useState(false);
	const { setAuth, setUserInfo, setOrganization, logout } = useAuthStore();

	// biome-ignore lint/correctness/useExhaustiveDependencies: This is intended to run only once on mount
	useEffect(() => {
		initKeycloak()
			.then((auth) => {
				setAuthenticated(auth);
				setInitialized(true);

				// Init auth statke on first load
				if (auth && keycloak.token && keycloak.refreshToken) {
					const expiresIn = keycloak.tokenParsed?.exp
						? keycloak.tokenParsed.exp - Math.floor(Date.now() / 1000)
						: 3600;
					setAuth(keycloak.token, keycloak.refreshToken, expiresIn);

					if (keycloak.tokenParsed) {
						const tokenParsed = keycloak.tokenParsed as UserInfo;
						setUserInfo(tokenParsed);
						setOrganization(extractOrganizationFromToken(tokenParsed));
					}
				}

				// Auto-refresh token
				keycloak.onTokenExpired = () => {
					keycloak
						.updateToken(30)
						.then((refreshed) => {
							if (refreshed && keycloak.token && keycloak.refreshToken) {
								const expiresIn = keycloak.tokenParsed?.exp
									? keycloak.tokenParsed.exp - Math.floor(Date.now() / 1000)
									: 3600;
								setAuth(keycloak.token, keycloak.refreshToken, expiresIn);

								// Update user info on token refresh
								if (keycloak.tokenParsed) {
									const tokenParsed = keycloak.tokenParsed as UserInfo;
									setUserInfo(tokenParsed);
									setOrganization(extractOrganizationFromToken(tokenParsed));
								}
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
			{initialized ? children : <div>Loading...</div>}
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
