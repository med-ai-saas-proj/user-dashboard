import { API_ROUTES } from "@/config/api-routes";
import type { UpdateApiKeyRequest } from "@/features/api-keys/services/api-key.dto";
import apiClient from "@/query/api-client";

export const updateApiKey = async (params: UpdateApiKeyRequest) => {
	const { data } = await apiClient.put(
		`${API_ROUTES.MANAGEMENT.API_KEYS}/${params.apikeyId}`,
		{
			name: params.name,
			permissions: params.permissions,
		}
	);
	return data;
};
