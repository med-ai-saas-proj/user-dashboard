import type {
  EHRSummaryRequest,
  EHRSummaryResponse,
} from '@/features/pg-ehr-summary/services/ehr-summary.dto';
import apiClient from '@/query/api-client';

export const summarizeEHR = async (
  request: EHRSummaryRequest
): Promise<EHRSummaryResponse> => {
  const { data } = await apiClient.post<EHRSummaryResponse>(
    '/api/v1/ehr_summarize',
    request
  );
  return data;
};
