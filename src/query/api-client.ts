import axios from "axios";
import { BASE_API_URL, isServiceEndpoint } from "@/config/api-routes";
import keycloak from "@/config/keycloak";
import { useServiceApiKeyStore } from "@/features/api-keys/store/service-api-key.store";
import { useAuthStore } from "@/features/auth/store/auth-store";

const apiClient = axios.create({
	baseURL: BASE_API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
	async (config) => {
		// Handle authentication token
		if (keycloak.authenticated && keycloak.token) {
			try {
				await keycloak.updateToken(30);
			} catch (error) {
				console.error("Failed to refresh token", error);
			}
			config.headers.Authorization = `Bearer ${keycloak.token}`;
		} else {
			const token = useAuthStore.getState().token;
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
		}

		// Add API key for service endpoints
		if (isServiceEndpoint(config.url)) {
			const selectedApiKey = useServiceApiKeyStore.getState().selectedApiKey;
			if (selectedApiKey) {
				config.headers["X-Api-Key"] = selectedApiKey;
			}
		}

		return config;
	},
	(error) => Promise.reject(error)
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			useAuthStore.getState().logout();
			if (keycloak.authenticated) {
				keycloak.logout();
			}
		}
		return Promise.reject(error);
	}
);

export default apiClient;
