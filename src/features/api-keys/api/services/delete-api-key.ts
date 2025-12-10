import apiClient from '@/query/api-client';
import { API_ROUTES } from '@/query/api-routes';

export const deleteApiKey = async (apikeyId: string) => {
  const { data } = await apiClient.delete(
    `${API_ROUTES.APP.API_KEYS}/${apikeyId}`
  );
  return data;
};
