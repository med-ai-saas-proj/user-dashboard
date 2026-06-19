import Keycloak from "keycloak-js";

const keycloakConfig = {
	url: window.env.keycloakUrl,
	realm: window.env.keycloakRealm,
	clientId: window.env.keycloakClientId,
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
