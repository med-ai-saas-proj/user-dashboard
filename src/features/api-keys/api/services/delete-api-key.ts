import { API_ROUTES } from '@/config/api-routes';
import apiClient from '@/query/api-client';

export const deleteApiKey = async (apikeyId: string) => {
  const { data } = await apiClient.delete(
    `${API_ROUTES.MANAGEMENT.API_KEYS}/${apikeyId}`
  );
  return data;
};
