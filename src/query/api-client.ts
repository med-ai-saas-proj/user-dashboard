import axios from "axios";
import { BASE_API_URL } from "@/config/api-routes";
import { getAuthHeaders, handleUnauthorized } from "@/lib/auth-headers";

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
		return config;
	},
	(error) => Promise.reject(error)
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			handleUnauthorized();
		}
		return Promise.reject(error);
	}
);

export default apiClient;
