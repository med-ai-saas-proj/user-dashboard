import { API_ROUTES } from '@/config/api-routes';
import apiClient from '@/query/api-client';
import type { AISearchRequest, AISearchResponse } from './ai-search.dto';

export const sendAISearch = async (
  request: AISearchRequest
): Promise<AISearchResponse> => {
  const { data } = await apiClient.post<AISearchResponse>(
    API_ROUTES.SERVICES.AI_SEARCH,
    request
  );
  return data;
};
