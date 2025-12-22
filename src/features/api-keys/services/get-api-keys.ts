import { API_ROUTES } from '@/config/api-routes';
import type { GetApiKeyResponse } from '@/features/api-keys/services/api-key.dto';
import apiClient from '@/query/api-client';

export const getApiKeys = async () => {
  const { data } = await apiClient.get<GetApiKeyResponse>(
    API_ROUTES.MANAGEMENT.API_KEYS
  );
  return data;
};
