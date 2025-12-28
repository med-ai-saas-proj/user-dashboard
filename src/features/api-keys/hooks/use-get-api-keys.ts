import { useQuery } from '@tanstack/react-query';
import { getApiKeys } from '@/features/api-keys/services/get-api-keys';

export const useGetApiKeys = () => {
  return useQuery({
    queryKey: ['api-keys'],
    queryFn: getApiKeys,
  });
};
