interface Env {
	gantryUrl: string;
	keycloakUrl: string;
	keycloakRealm: string;
	keycloakClientId: string;
	stripePublishableKey: string;
}

interface Window {
	env: Env;
}
