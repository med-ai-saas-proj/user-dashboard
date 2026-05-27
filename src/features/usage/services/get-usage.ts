import { API_ROUTES } from "@/config/api-routes";
import type { UsageSummary } from "@/features/usage/usage.type";
import apiClient from "@/query/api-client";

/**
 * Fetch the authenticated caller's own API usage summary.
 *
 * Hits the management `GET /usage` endpoint, which authenticates via the IAM
 * session cookie (sent automatically by `apiClient` through
 * `withCredentials`) — no `X-Api-Key` is involved for management routes.
 */
export const getUsage = async (): Promise<UsageSummary> => {
	const { data } = await apiClient.get<UsageSummary>(
		API_ROUTES.MANAGEMENT.USAGE
	);
	return data;
};
