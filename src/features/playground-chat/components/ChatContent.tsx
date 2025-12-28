import { useEffect, useRef } from 'react';
import { Spinner } from '@/components/shadcn/spinner';
import type { ChatMessage } from '../services/chat.dto';
import ChatReceiver from './ChatReceiver';
import ChatSender from './ChatSender';

type ChatContentProps = {
  messages: ChatMessage[];
  isLoading?: boolean;
};

const ChatContent = ({ messages, isLoading = false }: ChatContentProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  // biome-ignore lint/correctness/useExhaustiveDependencies: Messages as dependency is intentional to trigger scroll on new message
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center pb-24">
        <div className="text-center text-muted-foreground">
          <p className="text-lg">Start a conversation</p>
          <p className="text-sm mt-2">Type a message below to begin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full pb-24 overflow-y-hidden">
      <div className="h-full space-y-6">
        {messages.map((message, index) =>
          message.role === 'user' ? (
            <ChatSender key={index} message={message.content} />
          ) : (
            <ChatReceiver key={index} message={message.content} />
          )
        )}
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 p-4">
          <Spinner className="size-4" />
          <span className="text-sm text-muted-foreground">Thinking...</span>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatContent;
