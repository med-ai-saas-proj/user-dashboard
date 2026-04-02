import { API_ROUTES } from "@/config/api-routes";
import type { GetApiKeyResponse } from "@/features/api-keys/services/api-key.dto";
import apiClient from "@/query/api-client";
import type { APIKey } from "../api-key.type";

export const getApiKeys = async (projectId: string): Promise<APIKey[]> => {
	const { data } = await apiClient.get<GetApiKeyResponse>(
		API_ROUTES.MANAGEMENT.API_KEYS,
		{
			params: {
				project_id: projectId,
			},
		}
	);

	return data.results.map((apiKey) => ({
		id: apiKey.id,
		projectId: apiKey.project_id,
		name: apiKey.name,
		description: apiKey.description,
		hint: apiKey.hint,
		createdAt: new Date(apiKey.created_at),
		permissions: apiKey.permissions,
		disabled: apiKey.disabled,
	}));
};
