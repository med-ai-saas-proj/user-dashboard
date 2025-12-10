import type { RegisterRequest } from '@/features/auth/api/auth.dtos';
import apiClient from '@/query/api-client';
import { API_ROUTES } from '@/query/api-routes';

export const register = async (credentials: RegisterRequest) => {
  const { data } = await apiClient.post<{
    token: string;
  }>(API_ROUTES.AUTH.REGISTER, credentials);
  return data;
};
