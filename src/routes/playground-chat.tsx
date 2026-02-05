import { API_ROUTES } from "@/config/api-routes";
import ChatContent from "@/features/pg-chat/components/ChatContent";
import ChatInput from "@/features/pg-chat/components/ChatInput";
import type { ChatRequest } from "@/features/pg-chat/services/chat.dto";
import { useChatStore } from "@/features/pg-chat/store/chat.store";
import { useStream } from "@/lib/streaming/use-stream";
import DashboardLayout from "@/layouts/dashboard-layout";

export default function PlaygroundChatPage() {
	const {
		conversationId,
		model,
		messages,
		setConversationId,
		addMessage,
		updateLastAssistantMessage,
	} = useChatStore();
	const { startStream, isStreaming } = useStream<ChatRequest>();

	const handleSendMessage = (message: string) => {
		// Add user message to store
		addMessage({ role: "user", content: message });

		// Initialize empty assistant message
		addMessage({ role: "assistant", content: "" });

		startStream(
			{
				url: API_ROUTES.SERVICES.CHAT,
				request: {
					conversation_id: conversationId,
					model,
					input: message,
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
					console.error("Chat streaming error:", error);
				},
				onComplete: () => {
					// Stream completed
				},
			}
		);
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
