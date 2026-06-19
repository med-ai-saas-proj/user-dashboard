interface Env {
	gantryUrl: string;
	keycloakUrl: string;
	keycloakRealm: string;
	keycloakClientId: string;
}

interface Window {
	env: Env;
}
