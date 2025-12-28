import { useMutation } from '@tanstack/react-query';
import type { EHRSummaryRequest } from '@/features/pg-ehr-summary/services/ehr-summary.dto';
import { summarizeEHR } from '@/features/pg-ehr-summary/services/summarize-ehr';

export const useSummarizeEHR = () => {
  return useMutation({
    mutationFn: (request: EHRSummaryRequest) => summarizeEHR(request),
  });
};
