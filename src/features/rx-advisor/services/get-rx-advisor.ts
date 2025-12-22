import apiClient from '@/query/api-client';
import type { RxAdvisorRequest, RxAdvisorResponse } from './rx-advisor.dto';

export const getRxAdvisor = async (
  request: RxAdvisorRequest
): Promise<RxAdvisorResponse> => {
  const { data } = await apiClient.post<RxAdvisorResponse>(
    '/api/v1/rx_advisor',
    request
  );
  return data;
};
