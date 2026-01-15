import { API_ROUTES } from '@/config/api-routes';
import apiClient from '@/query/api-client';
import type { ChatRequest, ChatResponse } from './chat.dto';

export const sendChatMessage = async (
  request: ChatRequest
): Promise<ChatResponse> => {
  const { data } = await apiClient.post<ChatResponse>(
    API_ROUTES.SERVICES.CHAT,
    request
  );
  return data;
};
