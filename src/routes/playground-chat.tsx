import { useTranslation } from 'react-i18next';
import ChatContent from '@/features/pg-chat/components/ChatContent';
import ChatInput from '@/features/pg-chat/components/ChatInput';
import { useSendChatMessage } from '@/features/pg-chat/hooks/use-send-chat-message';
import { useChatStore } from '@/features/pg-chat/store/chat.store';
import DashboardLayout from '@/layouts/dashboard-layout';

export default function PlaygroundChatPage() {
  const { t } = useTranslation('common');

  const { conversationId, model, messages, setConversationId, addMessage } =
    useChatStore();
  const chatMutation = useSendChatMessage();

  const handleSendMessage = async (message: string) => {
    // Add user message to store
    addMessage({ role: 'user', content: message });

    try {
      const response = await chatMutation.mutateAsync({
        conversation_id: conversationId,
        model,
        input: message,
        stream: false,
      });

      // Update conversation ID
      setConversationId(response.conversation_id);

      // Extract text content from response
      const textContent = response.output
        .filter((item) => item.type === 'text')
        .map((item) => item.content)
        .join('\n\n');

      // Add assistant message to store
      addMessage({ role: 'assistant', content: textContent });
    } catch (error) {
      console.error('Failed to send message:', error);
      // Add error message
      addMessage({
        role: 'assistant',
        content: t('aiResponse.error'),
      });
    }
  };

  return (
    <DashboardLayout pageTitle="Chat" className="pb-0">
      <div className="w-full h-full flex flex-col items-stretch justify-between px-4 sm:px-6 md:px-12 lg:px-24 xl:px-64 relative">
        <ChatContent messages={messages} isLoading={chatMutation.isPending} />
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={chatMutation.isPending}
        />
      </div>
    </DashboardLayout>
  );
}
