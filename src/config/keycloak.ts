import Keycloak from "keycloak-js";

const isDesktopMode = import.meta.env.VITE_DESKTOP_MODE === "true";

let keycloak: Keycloak;
let initPromise: Promise<boolean> | null = null;

if (!isDesktopMode) {
	if (
		!(
			import.meta.env.VITE_KEYCLOAK_URL &&
			import.meta.env.VITE_KEYCLOAK_REALM &&
			import.meta.env.VITE_KEYCLOAK_CLIENT_ID
		)
	) {
		throw new Error("Keycloak environment variables are not properly defined");
	}

	keycloak = new Keycloak({
		url: import.meta.env.VITE_KEYCLOAK_URL,
		realm: import.meta.env.VITE_KEYCLOAK_REALM,
		clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
	});
} else {
	keycloak = new Keycloak({
		url: "http://localhost",
		realm: "desktop",
		clientId: "desktop",
	});
}

export const initKeycloak = () => {
	if (isDesktopMode) {
		return Promise.resolve(true);
	}
	if (!initPromise) {
		initPromise = keycloak.init({
			onLoad: "check-sso",
			silentCheckSsoRedirectUri:
				window.location.origin + "/silent-check-sso.html",
			pkceMethod: "S256",
		});
	}
	return initPromise;
};

export const isDesktop = isDesktopMode;
export default keycloak;
