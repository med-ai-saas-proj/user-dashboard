import { BookOpenIcon, SearchIcon, Trash2Icon } from "lucide-react";
import { ApiTopology, TOPOLOGIES } from "@/components/api-topology";
import { Button } from "@/components/shadcn/button";
import { ViewCodeDialog } from "@/components/view-code-dialog";
import { API_ROUTES } from "@/config/api-routes";
import type { AISearchRequest } from "@/features/pg-ai-search/services/ai-search.dto";
import { useAISearchStore } from "@/features/pg-ai-search/store/ai-search.store";
import ChatContent from "@/features/pg-chat/components/ChatContent";
import ChatInput from "@/features/pg-chat/components/ChatInput";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useStream } from "@/lib/streaming/use-stream";

export default function PlaygroundAISearchPage() {
	const {
		conversationId,
		model,
		mode,
		messages,
		setConversationId,
		setMode,
		addMessage,
		updateLastAssistantMessage,
		clearMessages,
	} = useAISearchStore();
	const { startStream, isStreaming } = useStream<AISearchRequest>();

	const handleSendMessage = (query: string) => {
		addMessage({ role: "user", content: query });
		addMessage({ role: "assistant", content: "" });

		startStream(
			{
				url: API_ROUTES.SERVICES.AI_SEARCH,
				request: {
					conversation_id: conversationId,
					model,
					query,
					mode,
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
				onComplete: () => {},
			}
		);
	};

	return (
		<DashboardLayout
			pageTitle="AI Search"
			className="pb-0"
			headerRight={
				<div className="flex items-center gap-2">
					{/* Mode Toggle */}
					<div className="flex items-center rounded-lg border bg-muted/30 p-0.5">
						<button
							type="button"
							onClick={() => setMode("search")}
							className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${mode === "search" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
						>
							<SearchIcon className="size-3" />
							Quick Search
						</button>
						<button
							type="button"
							onClick={() => setMode("deep_research")}
							className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${mode === "deep_research" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
						>
							<BookOpenIcon className="size-3" />
							Deep Research
						</button>
					</div>
					{messages.length > 0 && (
						<Button
							variant="ghost"
							size="sm"
							className="h-7 text-xs"
							onClick={clearMessages}
						>
							<Trash2Icon className="size-3 mr-1" />
							Clear
						</Button>
					)}
				</div>
			}
		>
			<div className="w-full h-full flex flex-col items-stretch justify-between px-4 sm:px-6 md:px-12 lg:px-24 xl:px-64 relative">
				<div className="absolute top-2 right-4 z-10 sm:right-6 md:right-12 lg:right-24 xl:right-64">
					<ViewCodeDialog
						endpoint={API_ROUTES.SERVICES.AI_SEARCH}
						method="POST"
						body={{
							// Omit `conversation_id` on the first call — the server
							// returns one; reuse it on follow-up calls for memory.
							...(conversationId ? { conversation_id: conversationId } : {}),
							query: "search query",
							mode,
						}}
						description={
							mode === "deep_research"
								? "Deep research — multi-source comprehensive investigation. Reuse the returned conversation_id on follow-up calls."
								: "AI-powered medical knowledge search. Reuse the returned conversation_id on follow-up calls."
						}
					/>
				</div>
				{mode === "deep_research" && messages.length === 0 && (
					<div className="mx-auto mt-4 mb-2 px-4 py-2 rounded-lg border border-primary/20 bg-primary/5 text-xs text-primary max-w-lg text-center">
						<BookOpenIcon className="size-4 inline mr-1.5 -mt-0.5" />
						<strong>Deep Research</strong> performs multi-round web searches,
						visits key pages, checks the clinic/doctor directory, and produces a
						comprehensive research report. Takes longer but is thorough.
					</div>
				)}
				<ChatContent messages={messages} isLoading={isStreaming} />
				<ChatInput
					onSendMessage={handleSendMessage}
					isLoading={isStreaming}
					placeholder={
						mode === "deep_research"
							? "Enter a topic for deep research (e.g. 'Latest diabetes management guidelines 2025')..."
							: "Search medical knowledge (e.g. 'Tìm bác sĩ Đông y ở Hà Nội', 'Treatment for hypertension')..."
					}
				/>
				{messages.length === 0 && (
					<div className="pb-2">
						<ApiTopology {...TOPOLOGIES.ai_search} />
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}
