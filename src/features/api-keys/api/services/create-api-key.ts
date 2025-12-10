import type {
  CreateApiKeyRequest,
  CreateApiKeyResponse,
} from '@/features/api-keys/api/api-key.dto';
import { apiKeyMapper } from '@/features/api-keys/api/api-key.mapper';
import apiClient from '@/query/api-client';
import { API_ROUTES } from '@/query/api-routes';

export const createApiKey = async (credentials: CreateApiKeyRequest) => {
  const { data } = await apiClient.post<CreateApiKeyResponse>(
    API_ROUTES.APP.API_KEYS,
    credentials
  );
  return apiKeyMapper(data);
};
