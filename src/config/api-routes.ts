/**
 * Centralized API endpoint definitions
 * This file contains all API routes used throughout the application
 */
const API_VERSION = "v1";

export let BASE_API_URL = window.env.gantryUrl;
// Ensure BASE_API_URL ends with a slash, since URL constructor requires it for relative paths
// See: https://developer.mozilla.org/en-US/docs/Web/API/URL_API/Resolving_relative_references
if (!BASE_API_URL.endsWith("/")) {
	BASE_API_URL += "/";
}
export const API_ROUTES = {
	AUTH: {
		SIGN_IN: new URL(`${API_VERSION}/auth/login`, BASE_API_URL).toString(),
		SIGN_OUT: new URL(`${API_VERSION}/auth/logout`, BASE_API_URL).toString(),
		REGISTER: new URL(`${API_VERSION}/auth/register`, BASE_API_URL).toString(),
		REFRESH_TOKEN: new URL(
			`${API_VERSION}/auth/refresh`,
			BASE_API_URL
		).toString(),
	},
	RAG: {
		USER_BASE: new URL(`api/${API_VERSION}/rag/user`, BASE_API_URL).toString(),
		USER_FILES: new URL(
			`api/${API_VERSION}/rag/user/files`,
			BASE_API_URL
		).toString(),
		USER_FILE_TASK: new URL(
			`api/${API_VERSION}/rag/user/files/`,
			BASE_API_URL
		).toString(),
		USER_QUERY_TEXT: new URL(
			`api/${API_VERSION}/rag/user/query/text`,
			BASE_API_URL
		).toString(),
	},
	FILE_STORAGE: {
		USER: new URL(
			`api/${API_VERSION}/file-storage/user/`,
			BASE_API_URL
		).toString(),
		SERVICE: new URL(
			`api/${API_VERSION}/file-storage/service/`,
			BASE_API_URL
		).toString(),
	},
	MANAGEMENT: {
		API_KEYS: new URL(
			`management/${API_VERSION}/api-keys`,
			BASE_API_URL
		).toString(),
		DOCS_MANAGEMENT_OPENAPI: new URL(
			`management/docs/openapi.json`,
			BASE_API_URL
		).toString(),
		DOCS_SERVICES_OPENAPI: new URL(
			`service/docs/openapi.json`,
			BASE_API_URL
		).toString(),
		ORGANIZATION: new URL(
			`management/${API_VERSION}/organizations`,
			BASE_API_URL
		).toString(),
		PROJECT: new URL(
			`management/${API_VERSION}/projects`,
			BASE_API_URL
		).toString(),
		BILLING: new URL(
			`management/${API_VERSION}/billing`,
			BASE_API_URL
		).toString(),
		LOGGING: new URL(
			`management/${API_VERSION}/logging`,
			BASE_API_URL
		).toString(),
	},
	SERVICES: {
		AVAILABLE: new URL(
			`service/${API_VERSION}/available`,
			BASE_API_URL
		).toString(),
		EHR_SUMMARIZE: new URL(
			`api/${API_VERSION}/ehr_summarize`,
			BASE_API_URL
		).toString(),
		RX_ADVISOR: new URL(
			`api/${API_VERSION}/rx_advisor`,
			BASE_API_URL
		).toString(),
		AI_SEARCH: new URL(`api/${API_VERSION}/ai_search`, BASE_API_URL).toString(),
		CHAT: new URL(`api/${API_VERSION}/chat`, BASE_API_URL).toString(),
		DASHBOARD: new URL(`api/${API_VERSION}/dashboard`, BASE_API_URL).toString(),
	},
} as const;

export type ApiRoute = typeof API_ROUTES;

export const buildUrl = (
	endpoint: string,
	params?: Record<string, string | number | boolean>
): string => {
	const url = new URL(endpoint);
	if (params) {
		Object.entries(params).forEach(([key, value]) => {
			url.searchParams.append(key, String(value));
		});
	}
	return url.toString();
};

/**
 * Check if a URL is a service endpoint that requires an API key
 */
export const isServiceEndpoint = (url?: string): boolean => {
	if (!url) return false;

	const serviceEndpoints = Object.values(API_ROUTES.SERVICES);
	const fileStorageService = API_ROUTES.FILE_STORAGE.SERVICE;
	// consider service endpoints defined under SERVICES as well as file-storage service
	return (
		serviceEndpoints.some((endpoint) => url.includes(endpoint)) ||
		(Boolean(fileStorageService) && url.includes(fileStorageService))
	);
};

export const getServiceOpenApiUrl = (serviceName: string): string =>
	new URL(`service/${serviceName}/openapi.json`, BASE_API_URL).toString();
