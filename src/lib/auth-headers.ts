import { isServiceEndpoint } from "@/config/api-routes";
import { useServiceApiKeyStore } from "@/features/api-keys/store/service-api-key.store";

/**
 * Build headers for API requests.
 *
 * Auth itself rides on HTTP-only cookies issued by the IAM service — callers
 * must pass `credentials: 'include'` (fetch) or `withCredentials: true`
 * (axios). This helper only adds content-type + the per-service API key.
 */
export async function getAuthHeaders(
	url: string
): Promise<Record<string, string>> {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	if (isServiceEndpoint(url)) {
		const selectedApiKey = useServiceApiKeyStore.getState().selectedApiKey;
		if (selectedApiKey) {
			headers["X-Api-Key"] = selectedApiKey;
		}
	}

	return headers;
}

/**
 * Handle 401 unauthorized errors after the IAM refresh-token flow has already
 * been tried. Clears local auth state and redirects to /login.
 */
export function handleUnauthorized(): void {
	// Lazy import to avoid a circular module-load between this file, the IAM
	// provider, and the api-client.
	import("@/features/auth/store/auth-store").then(({ useAuthStore }) => {
		useAuthStore.getState().logout();
	});

	if (typeof window !== "undefined" && window.location.pathname !== "/login") {
		window.location.assign("/login");
	}
}
