import { API_ROUTES } from '@/config/api-routes';
import type {
  EHRSummaryRequest,
  EHRSummaryResponse,
} from '@/features/pg-ehr-summary/services/ehr-summary.dto';
import type {
  ChatRequest,
  ChatResponse,
} from '@/features/playground-chat/services/chat.dto';
import apiClient from '@/query/api-client';

export const summarizeEHR = async (
  request: EHRSummaryRequest
): Promise<EHRSummaryResponse> => {
  const req: ChatRequest = {
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
