import { API_ROUTES } from "@/config/api-routes";
import type {
	CreateApiKeyRequest,
	CreateApiKeyResponse,
} from "@/features/api-keys/services/api-key.dto";
import apiClient from "@/query/api-client";

export const createApiKey = async (credentials: CreateApiKeyRequest) => {
	const { data } = await apiClient.post<CreateApiKeyResponse>(
		API_ROUTES.MANAGEMENT.API_KEYS,
		{
			name: credentials.name,
			description: credentials.description,
			permissions: credentials.permissions,
		},
		{
			params: {
				project_id: credentials.project_id,
			},
		}
	);
	return data;
};
