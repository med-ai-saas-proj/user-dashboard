import { useRef } from 'react';
import { StreamEventType, StreamPartType } from '@/enums/stream-chat.enum';
import ChatContent from '@/features/playground-chat/components/ChatContent';
import ChatInput from '@/features/playground-chat/components/ChatInput';
import { useStreamChatMessage } from '@/features/playground-chat/hooks/use-send-chat-message';
import type { ChatRequest } from '@/features/playground-chat/services/chat.dto';
import type {
  ChatStreamEvent,
  FinalResultData,
  PartDeltaData,
} from '@/features/playground-chat/services/stream-chat.dto';
import { useChatStore } from '@/features/playground-chat/store/chat.store';
import DashboardLayout from '@/layouts/dashboard-layout';

export default function PlaygroundChatPage() {
  const {
    conversationId,
    model,
    messages,
    setConversationId,
    addMessage,
    updateLastAssistantMessage,
  } = useChatStore();
  const { startStream, isStreaming } = useStreamChatMessage();
  const streamingBufferRef = useRef<string>('');

  const handleSendMessage = (message: string) => {
    // Add user message to store
    addMessage({ role: 'user', content: message });

    const request: ChatRequest = {
      conversation_id: conversationId,
      model,
      input: message,
      stream: true,
    };

    const appendDelta = (delta: string) => {
      if (!delta) return;
      streamingBufferRef.current = `${streamingBufferRef.current}${delta}`;
      updateLastAssistantMessage(streamingBufferRef.current);
    };

    const maybeUpdateConversationId = (event: ChatStreamEvent) => {
      const data = event.data as { conversation_id?: string } | null;
      if (data && typeof data === 'object' && data.conversation_id) {
        setConversationId(data.conversation_id);
      }
    };

    const handlePartDelta = (data: PartDeltaData) => {
      if (data.type === StreamPartType.Output) {
        appendDelta(data.delta);
      }
    };

    const extractTextFromOutput = (output: unknown) => {
      if (!output) return '';
      if (typeof output === 'string') return output;
      if (Array.isArray(output)) {
        return output
          .filter(
            (item): item is { type: string; content: string } =>
              typeof item === 'object' &&
              item !== null &&
              'type' in item &&
              'content' in item &&
              item.type === 'text' &&
              typeof item.content === 'string'
          )
          .map((item) => item.content)
          .join('\n\n');
      }
      return '';
    };

    const handleFinalResult = (data: FinalResultData) => {
      if (data.status === 'error') {
        const fallback = extractTextFromOutput(data.output);
        streamingBufferRef.current =
          fallback || 'Sorry, I encountered an error. Please try again.';
        updateLastAssistantMessage(streamingBufferRef.current);
        return;
      }

      if (!streamingBufferRef.current) {
        const finalText = extractTextFromOutput(data.output);
        if (finalText) {
          streamingBufferRef.current = finalText;
          updateLastAssistantMessage(streamingBufferRef.current);
        }
      }
    };

    // Stream assistant response via SSE
    addMessage({ role: 'assistant', content: '' });
    streamingBufferRef.current = '';

    startStream({
      request,
      onMessage: (event) => {
        maybeUpdateConversationId(event);

        if (event.event === StreamEventType.PartDelta) {
          handlePartDelta(event.data as PartDeltaData);
        }
      },
      onError: (error) => {
        console.error('Streaming chat error:', error);
        streamingBufferRef.current =
          'Sorry, the stream was interrupted. Please try again.';
        updateLastAssistantMessage(streamingBufferRef.current);
      },
      onComplete: (event) => {
        if (!event) return;

        maybeUpdateConversationId(event);

        if (event.event === StreamEventType.FinalResult) {
          handleFinalResult(event.data as FinalResultData);
        }
      },
    });
  };

  return (
    <DashboardLayout pageTitle="Chat" className="pb-0">
      <div className="w-full h-full flex flex-col items-stretch justify-between px-4 sm:px-6 md:px-12 lg:px-24 xl:px-64 relative">
        <ChatContent messages={messages} isLoading={isStreaming} />
        <ChatInput onSendMessage={handleSendMessage} isLoading={isStreaming} />
      </div>
    </DashboardLayout>
  );
}
