import type { EHRSummaryRequest } from '@/features/pg-ehr-summary/services/ehr-summary.dto';
import type { ChatStreamEvent } from './stream-chat.dto';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ChatRequest = {
  conversation_id?: string | null;
  model: string;
  stream?: boolean;
  input: string;
};

export type EHRChatRequest = {
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

export type StreamChatMessageParams = {
  request: ChatRequest;
  signal: AbortSignal;
  onOpen?: (response: Response) => void;
  onMessage: (event: ChatStreamEvent) => void;
  onError?: (error: unknown) => void;
  onClose?: () => void;
};
