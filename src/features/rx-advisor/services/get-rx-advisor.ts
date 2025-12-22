import type {
  RxAdvisorRequest,
  RxAdvisorResponse,
} from '@/features/pg-ehr-summary/api/ehr-summary.dto';
import apiClient from '@/query/api-client';

export const getRxAdvisor = async (
  request: RxAdvisorRequest
): Promise<RxAdvisorResponse> => {
  const { data } = await apiClient.post<RxAdvisorResponse>(
    '/api/v1/rx_advisor',
    request
  );
  return data;
};
