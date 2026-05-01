/**
 * IAM service configuration.
 *
 * The IAM service (api-hub-iam-service) is exposed at a public origin and uses
 * HTTP-only cookies for auth (no Bearer tokens). The base URL is configurable
 * via VITE_IAM_BASE_URL; in production it is "https://hub.venerian.space/iam".
 */

const isDesktopMode = import.meta.env.VITE_DESKTOP_MODE === "true";

const rawBase =
	(import.meta.env.VITE_IAM_BASE_URL as string | undefined)?.trim() ||
	"https://hub.venerian.space/iam";

const IAM_BASE_URL = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;

export const IAM_ROUTES = {
	REGISTER: `${IAM_BASE_URL}/auth/register`,
	LOGIN: `${IAM_BASE_URL}/auth/login`,
	LOGOUT: `${IAM_BASE_URL}/auth/logout`,
	REFRESH: `${IAM_BASE_URL}/auth/refresh-token`,
	GOOGLE_LOGIN: `${IAM_BASE_URL}/auth/login/google`,
	HEALTHCHECK: `${IAM_BASE_URL}/healthcheck`,
} as const;

export const isDesktop = isDesktopMode;
export { IAM_BASE_URL };
