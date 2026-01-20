import { API_ROUTES } from '@/config/api-routes';
import type {
  ChatResponse,
  EHRChatRequest,
} from '@/features/pg-chat/services/chat.dto';
import type {
  EHRSummaryRequest,
  EHRSummaryResponse,
} from '@/features/pg-ehr-summary/services/ehr-summary.dto';

import apiClient from '@/query/api-client';

export const summarizeEHR = async (
  request: EHRSummaryRequest
): Promise<EHRSummaryResponse> => {
  const req: EHRChatRequest = {
    model: '',
    conversation_id: null,
    stream: request.stream,
    input_ehr: request.ehr,
  };
  const { data } = await apiClient.post<ChatResponse>(
    API_ROUTES.SERVICES.EHR_SUMMARIZE,
    req
  );
  return { summary: data.output.at(-1)?.content ?? 'Error, please try again' };
};
