import { useMutation } from '@tanstack/react-query';
import { API_ROUTES } from '@/config/api-routes';
import apiClient from '@/query/api-client';

interface CreateApiKeyRequest {
  name: string | null;
  project_id: string;
  permissions: string[];
}

interface CreateApiKeyResponse {
  key: string;
}

export const useCreateUserApiKey = () => {
  return useMutation({
    mutationFn: async (credentials: CreateApiKeyRequest) => {
      const { data } = await apiClient.post<CreateApiKeyResponse>(
        API_ROUTES.APP.API_KEYS,
        credentials
      );
      return data;
    },
  });
};

export const useUpdateUserApiKey = () => {
  return useMutation({
    mutationFn: async (credentials: {
      apikeyId: string;
      name?: string;
      permissions?: string[];
    }) => {
      const { data } = await apiClient.put(
        `${API_ROUTES.APP.API_KEYS}/${credentials.apikeyId}`,
        {
          name: credentials.name,
          permissions: credentials.permissions,
        }
      );
      return data;
    },
  });
};

export const useDeleteUserApiKey = () => {
  return useMutation({
    mutationFn: async (apikeyId: string) => {
      const { data } = await apiClient.delete(
        `${API_ROUTES.APP.API_KEYS}/${apikeyId}`
      );
      return data;
    },
  });
};
