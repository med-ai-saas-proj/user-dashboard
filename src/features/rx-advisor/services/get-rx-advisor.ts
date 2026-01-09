import { API_ROUTES } from '@/config/api-routes';
import apiClient from '@/query/api-client';
import type { RxAdvisorRequest, RxAdvisorResponse } from './rx-advisor.dto';

export type ChatRequest = {
  conversation_id?: string | null;
  model: string;
  stream?: boolean;
  ehr: RxAdvisorRequest['ehr'];
  prescription: RxAdvisorRequest['prescription'];
};

export type ModelResponseContent = {
  type: 'text' | 'thinking';
  content: string;
  citations?: Array<{
    reference_type: string;
    reference_url: string;
    reference_text: string;
  }>;
};

export type ChatResponse = {
  id: string;
  conversation_id: string;
  status: 'completed' | 'failed' | 'processing';
  error?: {
    code: string;
    message: string;
    reason?: string;
  };
  output: ModelResponseContent[];
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
};

export const getRxAdvisor = async (
  request: RxAdvisorRequest
): Promise<RxAdvisorResponse> => {
  const req: ChatRequest = {
    model: '',
    conversation_id: null,
    prescription: request.prescription,
    ehr: request.ehr,
    stream: request.stream,
  };
  const { data } = await apiClient.post<ChatResponse>(
    API_ROUTES.SERVICES.RX_ADVISOR,
    req
  );
  return {
    used_tools: [],
    analysis: data.output.at(-1)?.content ?? 'Error, pls try again',
    reasoning: '',
  };
};
