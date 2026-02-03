import { useStreamAISearch } from "@/features/pg-ai-search/hooks/use-stream-ai-search";
import { useAISearchStore } from "@/features/pg-ai-search/store/ai-search.store";
import ChatContent from "@/features/pg-chat/components/ChatContent";
import ChatInput from "@/features/pg-chat/components/ChatInput";
import DashboardLayout from "@/layouts/dashboard-layout";

export default function PlaygroundAISearchPage() {
	const {
		conversationId,
		model,
		messages,
		setConversationId,
		addMessage,
		updateLastAssistantMessage,
	} = useAISearchStore();
	const { startSearchStream, isStreaming } = useStreamAISearch();

	const handleSendMessage = (query: string) => {
		// Add user message to store
		addMessage({ role: "user", content: query });

		// Initialize empty assistant message
		addMessage({ role: "assistant", content: "" });

		startSearchStream(query, model, conversationId, {
			onConversationIdUpdate: (convId) => {
				setConversationId(convId);
			},
			onContentUpdate: (content) => {
				updateLastAssistantMessage(content);
			},
			onError: (error) => {
				console.error("AI search streaming error:", error);
			},
			onComplete: () => {
				// Stream completed
			},
		});
	};

	return (
		<DashboardLayout pageTitle="AI Search" className="pb-0">
			<div className="w-full h-full flex flex-col items-stretch justify-between px-4 sm:px-6 md:px-12 lg:px-24 xl:px-64 relative">
				<ChatContent messages={messages} isLoading={isStreaming} />
				<ChatInput onSendMessage={handleSendMessage} isLoading={isStreaming} />
			</div>
		</DashboardLayout>
	);
}
