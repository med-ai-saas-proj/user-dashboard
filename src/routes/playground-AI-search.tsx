import { useTranslation } from 'react-i18next';
import { useSendAISearch } from '@/features/playground-ai-search/hooks/use-send-ai-search';
import { useAISearchStore } from '@/features/playground-ai-search/store/ai-search.store';
import ChatContent from '@/features/playground-chat/components/ChatContent';
import ChatInput from '@/features/playground-chat/components/ChatInput';
import DashboardLayout from '@/layouts/dashboard-layout';

export default function PlaygroundAISearchPage() {
  const { t } = useTranslation('common');

  const { conversationId, model, messages, setConversationId, addMessage } =
    useAISearchStore();
  const aiSearchMutation = useSendAISearch();

  const handleSendMessage = async (query: string) => {
    // Add user message to store
    addMessage({ role: 'user', content: query });

    try {
      const response = await aiSearchMutation.mutateAsync({
        conversation_id: conversationId,
        model,
        query,
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
      console.error('Failed to search:', error);
      // Add error message
      addMessage({
        role: 'assistant',
        content: t('aiResponse.error'),
      });
    }
  };

  return (
    <DashboardLayout pageTitle="AI Search" className="pb-0">
      <div className="w-full h-full flex flex-col items-stretch justify-between px-4 sm:px-6 md:px-12 lg:px-24 xl:px-64 relative">
        <ChatContent
          messages={messages}
          isLoading={aiSearchMutation.isPending}
        />
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={aiSearchMutation.isPending}
        />
      </div>
    </DashboardLayout>
  );
}
