import type {
  SignInRequest,
  SignInResponse,
} from '@/features/auth/api/auth.dtos';
import apiClient from '@/query/api-client';
import { API_ROUTES } from '@/query/api-routes';

export const signIn = async (credentials: SignInRequest) => {
  const { data } = await apiClient.post<SignInResponse>(
    API_ROUTES.AUTH.SIGN_IN,
    {
      ...credentials,
      grant_type: 'password',
    }
  );
  return data;
};
