import type { StreamEventType, StreamPartType } from '@_types/stream-chat.enum';

// Base structure for SSE
export interface StreamEvent<T = any> {
  event: StreamEventType;
  data: T;
}

// 1. Conversation Start
export interface ConversationStartData {
  conversation_id: string;
}

// 2. Part Delta (The most common event)
export type PartDeltaData =
  | { type: StreamPartType.Output; delta: string; citation?: Citation }
  | { type: StreamPartType.Thinking; delta: string }
  | {
      type: StreamPartType.BuiltinToolCall;
      tool_call_id: string;
      hinted_tool_name?: string;
      hinted_args?: string;
    }
  | {
      type: StreamPartType.BuiltinToolResult;
      tool_call_id: string;
      hinted_result?: string;
    };

// 3. Final Result
export interface FinalResultData {
  id: string;
  status: 'completed' | 'error';
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  // Note: output is usually null in stream mode as it was sent via deltas
  output: any | null;
}

export interface Citation {
  start_index: number;
  end_index: number;
  reference_type: 'document' | 'webpage' | 'inline_text';
  title: string;
  src: string;
  content: string;
}

// Exhaustive Union for Type Narrowing
export type ChatStreamEvent =
  | { event: StreamEventType.ConversationStart; data: ConversationStartData }
  | { event: StreamEventType.PartStart; data: StreamPartType }
  | { event: StreamEventType.PartDelta; data: PartDeltaData }
  | { event: StreamEventType.FinalResult; data: FinalResultData };
