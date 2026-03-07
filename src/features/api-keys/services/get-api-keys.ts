import { API_ROUTES } from "@/config/api-routes";
import type { APIKey } from "@/features/api-keys/api-key.type";
import type { GetApiKeyResponse } from "@/features/api-keys/services/api-key.dto";
import apiClient from "@/query/api-client";

export const getApiKeys = async (): Promise<APIKey[]> => {
	const { data } = await apiClient.get<GetApiKeyResponse>(
		API_ROUTES.MANAGEMENT.API_KEYS
	);
	return data.map((apiKey) => ({
		id: apiKey.id,
		name: apiKey.name,
		description: apiKey.description,
		hint: apiKey.hint,
		createdAt: new Date(apiKey.created_at),
		permissions: apiKey.permissions,
	}));
};
