import { API_ROUTES } from "@/config/api-routes";
import type { AISearchRequest } from "@/features/pg-ai-search/services/ai-search.dto";
import { useAISearchStore } from "@/features/pg-ai-search/store/ai-search.store";
import ChatContent from "@/features/pg-chat/components/ChatContent";
import ChatInput from "@/features/pg-chat/components/ChatInput";
import { useStream } from "@/lib/streaming/use-stream";
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
	const { startStream, isStreaming } = useStream<AISearchRequest>();

	const handleSendMessage = (query: string) => {
		// Add user message to store
		addMessage({ role: "user", content: query });

		// Initialize empty assistant message
		addMessage({ role: "assistant", content: "" });

		startStream(
			{
				url: API_ROUTES.SERVICES.AI_SEARCH,
				request: {
					conversation_id: conversationId,
					model,
					query,
				},
			},
			{
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
			}
		);
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
