import { useMutation } from '@tanstack/react-query';
import { getRxAdvisor } from '@/features/rx-advisor/services/get-rx-advisor';
import type { RxAdvisorRequest } from '../services/rx-advisor.dto';

export const useRxAdvisor = () => {
  return useMutation({
    mutationFn: (request: RxAdvisorRequest) => getRxAdvisor(request),
  });
};
