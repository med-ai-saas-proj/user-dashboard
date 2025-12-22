import { useMutation } from '@tanstack/react-query';
import { deleteApiKey } from '@/features/api-keys/services/delete-api-key';

export const useDeleteApiKey = () => {
  return useMutation({
    mutationFn: async (apikeyId: string) => {
      const data = await deleteApiKey(apikeyId);
      return data;
    },
  });
};
