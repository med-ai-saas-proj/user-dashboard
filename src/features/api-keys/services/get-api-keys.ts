import { API_ROUTES } from '@/config/api-routes';
import apiClient from '@/query/api-client';

export const getApiKeys = async () => {
  const { data } = await apiClient.get(API_ROUTES.MANAGEMENT.API_KEYS);
  return data;
};
