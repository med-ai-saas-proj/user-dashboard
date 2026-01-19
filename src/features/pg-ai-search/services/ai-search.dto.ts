export type AISearchRequest = {
  conversation_id?: string | null;
  model: string;
  stream?: boolean;
  query: string;
};

export type AISearchResponse = {
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

export type ModelResponseContent = {
  type: 'text' | 'thinking';
  content: string;
  citations?: Array<{
    reference_type: string;
    reference_url: string;
    reference_text: string;
  }>;
};
