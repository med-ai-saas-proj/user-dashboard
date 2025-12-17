import { useMutation } from '@tanstack/react-query';
import { createApiKey } from '@/features/api-keys/api/services/create-api-key';
import type { CreateApiKeyRequest } from '../api/api-key.dto';

export const useCreateApiKey = () => {
  return useMutation({
    mutationFn: async (credentials: CreateApiKeyRequest) => {
      const data = await createApiKey(credentials);
      return data;
    },
  });
};
