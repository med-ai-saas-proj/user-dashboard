import { isServiceEndpoint } from "@/config/api-routes";
import keycloak from "@/config/keycloak";
import { useServiceApiKeyStore } from "@/features/api-keys/store/service-api-key.store";
import { useAuthStore } from "@/features/auth/store/auth-store";

/**
 * Get authentication headers for API requests
 * This is shared between axios api-client and SSE requests
 */
export async function getAuthHeaders(
	url: string
): Promise<Record<string, string>> {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	// Handle authentication token
	if (keycloak.authenticated && keycloak.token) {
		try {
			await keycloak.updateToken(30);
		} catch (error) {
			console.error("Failed to refresh token", error);
		}
		headers.Authorization = `Bearer ${keycloak.token}`;
	} else {
		const token = useAuthStore.getState().token;
		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}
	}

	// Add API key for service endpoints
	if (isServiceEndpoint(url)) {
		const selectedApiKey = useServiceApiKeyStore.getState().selectedApiKey;
		if (selectedApiKey) {
			headers["X-Api-Key"] = selectedApiKey;
		}
	}

	return headers;
}

/**
 * Handle 401 unauthorized errors
 * This is shared between axios api-client and SSE requests
 */
export function handleUnauthorized(): void {
	useAuthStore.getState().logout();
	if (keycloak.authenticated) {
		keycloak.logout();
	}
}
