import type { UpdateApiKeyRequest } from '@/features/api-keys/api/api-key.dto';
import apiClient from '@/query/api-client';
import { API_ROUTES } from '@/query/api-routes';

export const updateApiKey = async (params: UpdateApiKeyRequest) => {
  const { data } = await apiClient.put(
    `${API_ROUTES.APP.API_KEYS}/${params.apikeyId}`,
    {
      name: params.name,
      permissions: params.permissions,
    }
  );
  return data;
};
