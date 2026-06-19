import Keycloak from "keycloak-js";

if (
	!(
		import.meta.env.VITE_KEYCLOAK_URL &&
		import.meta.env.VITE_KEYCLOAK_REALM &&
		import.meta.env.VITE_KEYCLOAK_CLIENT_ID
	)
) {
	throw new Error("Keycloak environment variables are not properly defined");
}

const keycloakConfig = {
	url: import.meta.env.VITE_KEYCLOAK_URL,
	realm: import.meta.env.VITE_KEYCLOAK_REALM,
	clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
};

const keycloak = new Keycloak(keycloakConfig);

// Initialize Keycloak outside React component lifecycle
// to avoid multiple initializations
let initPromise: Promise<boolean> | null = null;

export const initKeycloak = () => {
	if (!initPromise) {
		initPromise = keycloak.init({
			onLoad: "check-sso",
			scope: "openid profile email organization",
			silentCheckSsoRedirectUri:
				window.location.origin + "/silent-check-sso.html",
			pkceMethod: "S256",
		});
	}
	return initPromise;
};

export default keycloak;
