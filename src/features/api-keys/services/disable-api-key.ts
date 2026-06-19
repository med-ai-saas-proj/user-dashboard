import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { ApiKeyOutput } from "./api-key.dto";

export const disableApiKey = async (apiKeyId: string) => {
	await apiClient.post<ApiKeyOutput>(
		`${API_ROUTES.MANAGEMENT.API_KEYS}/${apiKeyId}/disable`
	);
};
