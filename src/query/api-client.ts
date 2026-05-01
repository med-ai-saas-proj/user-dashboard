import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { BASE_API_URL } from "@/config/api-routes";
import { IAM_ROUTES } from "@/config/iam";
import { getAuthHeaders, handleUnauthorized } from "@/lib/auth-headers";

const apiClient = axios.create({
	baseURL: BASE_API_URL,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor — content-type + per-service X-Api-Key. The auth cookie
// is sent automatically because of withCredentials.
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

// Track in-flight refresh so concurrent 401s share one refresh attempt.
let refreshPromise: Promise<boolean> | null = null;

const tryRefresh = (): Promise<boolean> => {
	if (!refreshPromise) {
		refreshPromise = axios
			.post(IAM_ROUTES.REFRESH, null, { withCredentials: true })
			.then(() => true)
			.catch(() => false)
			.finally(() => {
				refreshPromise = null;
			});
	}
	return refreshPromise;
};

// Response interceptor — on 401, try /iam/auth/refresh-token once. If that
// succeeds, replay the original request. If it fails, clear local state and
// redirect to /login.
apiClient.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const original = error.config as
			| (AxiosRequestConfig & { _iamRetry?: boolean })
			| undefined;

		if (error.response?.status === 401 && original && !original._iamRetry) {
			// Don't try to refresh on the refresh endpoint itself.
			if (original.url && original.url.includes("/auth/refresh-token")) {
				handleUnauthorized();
				return Promise.reject(error);
			}

			original._iamRetry = true;
			const refreshed = await tryRefresh();
			if (refreshed) {
				return apiClient.request(original);
			}
			handleUnauthorized();
		}

		return Promise.reject(error);
	}
);

export default apiClient;
