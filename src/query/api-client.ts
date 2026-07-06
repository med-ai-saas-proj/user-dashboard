import axios from "axios";
import { BASE_API_URL } from "@/config/api-routes";
import { getAuthHeaders, handleUnauthorized } from "@/lib/auth-headers";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useProjectStore } from "@/features/project/store/project";

const apiClient = axios.create({
	baseURL: BASE_API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
	async (config) => {
		const headers = await getAuthHeaders(config.url || "");
		Object.entries(headers).forEach(([key, value]) => {
			config.headers.set(key, value);
		});
		if (config.data instanceof FormData) {
			config.headers.delete("Content-Type");
			config.headers.delete("content-type");
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
			const errorCode = error.response?.data?.code;

			if (errorCode === "missing_organization_claim") {
				useAuthStore.getState().setOrganization(null);
				useProjectStore.getState().resetProject();
				window.location.replace("/create-organization");
				return Promise.reject(error);
			}

			console.log("Unauthorized access - logging out");
			handleUnauthorized();
		}
		return Promise.reject(error);
	}
);

export default apiClient;
