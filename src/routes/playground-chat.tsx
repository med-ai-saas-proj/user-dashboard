import { ApiTopology, TOPOLOGIES } from "@/components/api-topology";
import {
	DemoPageDescription,
	DemoPageShell,
	DemoToolbar,
} from "@/components/demo";
import { ViewCodeDialog } from "@/components/view-code-dialog";
import { API_ROUTES } from "@/config/api-routes";
import ChatContent from "@/features/pg-chat/components/ChatContent";
import ChatInput from "@/features/pg-chat/components/ChatInput";
import type { ChatRequest } from "@/features/pg-chat/services/chat.dto";
import { useChatStore } from "@/features/pg-chat/store/chat.store";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useStream } from "@/lib/streaming/use-stream";

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
		<DashboardLayout pageTitle="Chat">
			<DemoPageShell>
				<DemoPageDescription>
					Multi-turn chat with streaming SSE, tool use, and model selection.
				</DemoPageDescription>
				<DemoToolbar
					end={
						<ViewCodeDialog
							endpoint={API_ROUTES.SERVICES.CHAT}
							method="POST"
							body={{
								// Omit `conversation_id` on the first call — the server
								// will return one in the response. Reuse it on follow-up
								// requests to keep session memory.
								...(conversationId ? { conversation_id: conversationId } : {}),
								stream: false,
								input: "Hello, how can you help?",
							}}
							description="Chat with AI assistant. Omit conversation_id on the first call; the server returns one — reuse it on follow-up calls to keep session memory."
						/>
					}
				/>
				<div className="flex-1 flex flex-col overflow-hidden px-4 sm:px-6 md:px-12 lg:px-24 xl:px-64">
					<ChatContent messages={messages} isLoading={isStreaming} />
					<ChatInput
						onSendMessage={handleSendMessage}
						isLoading={isStreaming}
					/>
				</div>
			</DemoPageShell>
			<div className="px-4 py-2 border-t">
				<ApiTopology {...TOPOLOGIES.chat} />
			</div>
		</DashboardLayout>
	);
}
