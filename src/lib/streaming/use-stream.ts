import { useCallback, useRef } from "react";
import {
	extractConversationId,
	extractDelta,
	extractFinalResult,
	extractTextFromOutput,
	useBaseStream,
	type BaseStreamRequest,
	type StreamConfig,
} from "./base-stream";

export type StreamHandlers = {
	onConversationIdUpdate?: (conversationId: string) => void;
	onContentUpdate?: (content: string) => void;
	onError?: (error: unknown) => void;
	onComplete?: () => void;
};

export type StreamRequestConfig<TRequest extends BaseStreamRequest> = {
	url: string;
	request: TRequest;
};

/**
 * Universal streaming hook that works with any endpoint returning ChatStreamEvent format
 * Handles all common streaming logic: conversation IDs, content deltas, errors, completion
 * See https://docs.ag-ui.com/concepts/events for ChatStreamEvent details
 *
 * @example
 * // For chat
 * const { startStream, isStreaming } = useStream<ChatRequest>();
 * startStream({
 *   url: API_ROUTES.SERVICES.CHAT,
 *   request: { model, input, conversation_id }
 * }, handlers);
 *
 * @example
 * // For AI search
 * const { startStream, isStreaming } = useStream<AISearchRequest>();
 * startStream({
 *   url: API_ROUTES.SERVICES.AI_SEARCH,
 *   request: { model, query, conversation_id }
 * }, handlers);
 */
export function useStream<
	TRequest extends BaseStreamRequest = BaseStreamRequest,
>() {
	const baseStream = useBaseStream();
	const contentBufferRef = useRef<string>("");

	const startStream = useCallback(
		(
			{ url, request }: StreamRequestConfig<TRequest>,
			handlers: StreamHandlers
		) => {
			contentBufferRef.current = "";

			const config: StreamConfig<TRequest> = {
				url,
				request: { ...request, stream: true } as TRequest,
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
					console.error("Streaming error:", error);
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
		startStream,
		stopStream: baseStream.stopStream,
		isStreaming: baseStream.isStreaming,
	};
}
