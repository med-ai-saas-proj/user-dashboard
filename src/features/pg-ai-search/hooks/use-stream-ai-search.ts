import { API_ROUTES } from "@/config/api-routes";
import {
	extractConversationId,
	extractDelta,
	extractFinalResult,
	extractTextFromOutput,
	useBaseStream,
	type StreamConfig,
} from "@/lib/streaming/base-stream";
import { useCallback, useRef } from "react";
import type { AISearchRequest } from "../services/ai-search.dto";

export type AISearchStreamHandlers = {
	onConversationIdUpdate?: (conversationId: string) => void;
	onContentUpdate?: (content: string) => void;
	onError?: (error: unknown) => void;
	onComplete?: () => void;
};

/**
 * AI Search-specific streaming hook
 * Handles the specifics of AI search requests (query field)
 */
export function useStreamAISearch() {
	const baseStream = useBaseStream();
	const contentBufferRef = useRef<string>("");

	const startSearchStream = useCallback(
		(
			query: string,
			model: string,
			conversationId: string | null,
			handlers: AISearchStreamHandlers
		) => {
			contentBufferRef.current = "";

			const request: AISearchRequest = {
				conversation_id: conversationId,
				model,
				query,
				stream: true,
			};

			const config: StreamConfig<AISearchRequest> = {
				url: API_ROUTES.SERVICES.AI_SEARCH,
				request,
				onMessage: (event) => {
					// Extract and update conversation ID
					const convId = extractConversationId(event);
					if (convId) {
						handlers.onConversationIdUpdate?.(convId);
					}

					// Handle content deltas
					const delta = extractDelta(event);
					if (delta) {
						contentBufferRef.current += delta;
						handlers.onContentUpdate?.(contentBufferRef.current);
					}
				},
				onError: (error) => {
					console.error("Streaming AI search error:", error);
					contentBufferRef.current =
						"Sorry, the stream was interrupted. Please try again.";
					handlers.onContentUpdate?.(contentBufferRef.current);
					handlers.onError?.(error);
				},
				onComplete: (event) => {
					if (!event) {
						handlers.onComplete?.();
						return;
					}

					// Extract conversation ID from final event
					const convId = extractConversationId(event);
					if (convId) {
						handlers.onConversationIdUpdate?.(convId);
					}

					// Handle final result
					const finalData = extractFinalResult(event);
					if (finalData) {
						if (finalData.status === "error") {
							const fallback = extractTextFromOutput(finalData.output);
							contentBufferRef.current =
								fallback || "Sorry, I encountered an error. Please try again.";
							handlers.onContentUpdate?.(contentBufferRef.current);
							handlers.onError?.(new Error(contentBufferRef.current));
							return;
						}

						// If no content was streamed, extract from final output
						if (!contentBufferRef.current && finalData.output) {
							const finalText = extractTextFromOutput(finalData.output);
							if (finalText) {
								contentBufferRef.current = finalText;
								handlers.onContentUpdate?.(contentBufferRef.current);
							}
						}
					}

					handlers.onComplete?.();
				},
			};

			baseStream.startStream(config);
		},
		[baseStream]
	);

	return {
		startSearchStream,
		stopStream: baseStream.stopStream,
		isStreaming: baseStream.isStreaming,
	};
}
