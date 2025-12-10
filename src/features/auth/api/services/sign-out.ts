import apiClient from '@/query/api-client';
import { API_ROUTES } from '@/query/api-routes';

export const signOut = async () => {
  await apiClient.post(API_ROUTES.AUTH.SIGN_OUT);
};
