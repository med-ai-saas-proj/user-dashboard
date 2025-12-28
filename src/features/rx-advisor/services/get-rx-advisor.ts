import { API_ROUTES } from '@/config/api-routes';
import apiClient from '@/query/api-client';
import type { RxAdvisorRequest, RxAdvisorResponse } from './rx-advisor.dto';

export const getRxAdvisor = async (
  request: RxAdvisorRequest
): Promise<RxAdvisorResponse> => {
  const { data } = await apiClient.post<RxAdvisorResponse>(
    API_ROUTES.SERVICES.RX_ADVISOR,
    request
  );
  return data;
};
