import { useMutation } from '@tanstack/react-query';
import type { EHRSummaryRequest } from '@/features/pg-ehr-summary/api/ehr-summary.dto';
import { summarizeEHR } from '@/features/pg-ehr-summary/api/services/summarize-ehr';

export const useSummarizeEHR = () => {
  return useMutation({
    mutationFn: (request: EHRSummaryRequest) => summarizeEHR(request),
  });
};
