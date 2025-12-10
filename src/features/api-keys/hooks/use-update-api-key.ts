import { useMutation } from '@tanstack/react-query';
import { updateApiKey } from '@/features/api-keys/api/services/update-api-key';

export const useUpdateApiKey = () => {
  return useMutation({
    mutationFn: async (credentials: {
      apikeyId: string;
      name?: string;
      permissions?: string[];
    }) => {
      const data = await updateApiKey({
        apikeyId: credentials.apikeyId,
        name: credentials.name,
        permissions: credentials.permissions,
      });
      return data;
    },
  });
};
