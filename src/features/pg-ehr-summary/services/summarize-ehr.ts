import { API_ROUTES } from '@/config/api-routes';
import type {
  EHRSummaryRequest,
  EHRSummaryResponse,
} from '@/features/pg-ehr-summary/services/ehr-summary.dto';
import apiClient from '@/query/api-client';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ChatRequest = {
  conversation_id?: string | null;
  model: string;
  stream?: boolean;
  input_ehr: EHRSummaryRequest['ehr'];
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
  return { summary: data.output.at(-1)?.content ?? 'Error, pls try again' };
};
