import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";

export const getApiKeyDetails = async (apiKeyId: string) => {
	const response = await apiClient.get(
		`${API_ROUTES.MANAGEMENT.API_KEYS}/${apiKeyId}`
	);
	return response.data;
};
