import { useRef } from 'react';
import ChatContent from '@/features/playground-chat/components/ChatContent';
import ChatInput from '@/features/playground-chat/components/ChatInput';
import { useStreamChatMessage } from '@/features/playground-chat/hooks/use-send-chat-message';
import type {
  ChatRequest,
  ChatResponse,
} from '@/features/playground-chat/services/chat.dto';
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

    const extractTextContent = (response: ChatResponse) =>
      response.output
        .filter((item) => item.type === 'text')
        .map((item) => item.content)
        .join('\n\n');

    const mergeChunk = (chunk: string) => {
      if (!chunk) return;

      const current = streamingBufferRef.current;

      if (chunk.startsWith(current)) {
        streamingBufferRef.current = chunk;
      } else if (current.startsWith(chunk)) {
        streamingBufferRef.current = current;
      } else {
        streamingBufferRef.current = `${current}${chunk}`;
      }
      updateLastAssistantMessage(streamingBufferRef.current);
    };

    // Stream assistant response via SSE
    addMessage({ role: 'assistant', content: '' });
    streamingBufferRef.current = '';

    startStream({
      request,
      onMessage: (response) => {
        if (response.conversation_id) {
          setConversationId(response.conversation_id);
        }

        if (response.error?.message) {
          streamingBufferRef.current = response.error.message;
          updateLastAssistantMessage(streamingBufferRef.current);
          return;
        }

        if (response.status === 'failed') {
          streamingBufferRef.current =
            'Sorry, I encountered an error. Please try again.';
          updateLastAssistantMessage(streamingBufferRef.current);
          return;
        }

        mergeChunk(extractTextContent(response));
      },
      onError: (error) => {
        console.error('Streaming chat error:', error);
        streamingBufferRef.current =
          'Sorry, the stream was interrupted. Please try again.';
        updateLastAssistantMessage(streamingBufferRef.current);
      },
      onComplete: (response) => {
        if (response?.conversation_id) {
          setConversationId(response.conversation_id);
        }
        if (!response) return;
        if (response.error?.message) {
          streamingBufferRef.current = response.error.message;
          updateLastAssistantMessage(streamingBufferRef.current);
          return;
        }
        if (response.status === 'failed') {
          streamingBufferRef.current =
            'Sorry, I encountered an error. Please try again.';
          updateLastAssistantMessage(streamingBufferRef.current);
          return;
        }
        mergeChunk(extractTextContent(response));
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
