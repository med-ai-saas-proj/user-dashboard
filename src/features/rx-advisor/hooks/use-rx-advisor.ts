import { useMutation } from '@tanstack/react-query';
import type { RxAdvisorRequest } from '@/features/pg-ehr-summary/api/ehr-summary.dto';
import { getRxAdvisor } from '@/features/rx-advisor/services/get-rx-advisor';

export const useRxAdvisor = () => {
  return useMutation({
    mutationFn: (request: RxAdvisorRequest) => getRxAdvisor(request),
  });
};
