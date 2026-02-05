import { StreamEventType, StreamPartType } from "@/enums/stream-chat.enum";
import { createSSE } from "@/features/pg-chat/services/sse";
import type {
	ChatStreamEvent,
	FinalResultData,
	PartDeltaData,
} from "@/features/pg-chat/services/stream-chat.dto";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Base request type that all streaming requests should extend
 */
export type BaseStreamRequest = {
	conversation_id?: string | null;
	model: string;
	stream?: boolean;
	[key: string]: any; // Allow additional properties
};

/**
 * Configuration for starting a stream
 */
export type StreamConfig<
	TRequest extends BaseStreamRequest = BaseStreamRequest,
> = {
	url: string;
	request: TRequest;
	onMessage: (event: ChatStreamEvent) => void;
	onError?: (error: unknown) => void;
	onComplete?: (event?: ChatStreamEvent) => void;
	onOpen?: (response: Response) => void;
};

/**
 * Base streaming hook that provides core streaming functionality
 * Can be used directly or extended for specific use cases
 */
export function useBaseStream() {
	const controllerRef = useRef<AbortController | null>(null);
	const finishedRef = useRef(false);
	const [isStreaming, setIsStreaming] = useState(false);

	const finalize = useCallback(
		(
			onComplete?: (event?: ChatStreamEvent) => void,
			event?: ChatStreamEvent
		) => {
			if (finishedRef.current) return;
			finishedRef.current = true;
			setIsStreaming(false);
			onComplete?.(event);
			controllerRef.current = null;
		},
		[]
	);

	const stopStream = useCallback(() => {
		if (controllerRef.current) {
			controllerRef.current.abort();
			controllerRef.current = null;
		}
		if (!finishedRef.current) {
			finishedRef.current = true;
			setIsStreaming(false);
		}
	}, []);

	const startStream = useCallback(
		<TRequest extends BaseStreamRequest = BaseStreamRequest>({
			url,
			request,
			onMessage,
			onError,
			onComplete,
			onOpen,
		}: StreamConfig<TRequest>) => {
			stopStream();
			finishedRef.current = false;

			const controller = new AbortController();
			controllerRef.current = controller;
			setIsStreaming(true);

			const handleError = (error: unknown) => {
				onError?.(error);
				finalize(onComplete);
			};

			(async () => {
				try {
					await createSSE<ChatStreamEvent>({
						url,
						signal: controller.signal,
						payload: { ...request, stream: true },
						onOpen,
						onMessage: (event) => {
							onMessage(event);
							if (event.event === StreamEventType.FinalResult) {
								finalize(onComplete, event);
							}
						},
						onError: handleError,
						onClose: () => finalize(onComplete),
					});
				} catch (error) {
					if (controller.signal.aborted) return;
					handleError(error);
				}
			})();
		},
		[finalize, stopStream]
	);

	useEffect(() => () => stopStream(), [stopStream]);

	return {
		startStream,
		stopStream,
		isStreaming,
	};
}

/**
 * Helper function to extract text content from various output formats
 */
export function extractTextFromOutput(output: unknown): string {
	if (!output) return "";
	if (typeof output === "string") return output;
	if (Array.isArray(output)) {
		return output
			.filter(
				(item): item is { type: string; content: string } =>
					typeof item === "object" &&
					item !== null &&
					"type" in item &&
					"content" in item &&
					item.type === "text" &&
					typeof item.content === "string"
			)
			.map((item) => item.content)
			.join("\n\n");
	}
	return "";
}

/**
 * Extract delta from stream event if it's an output delta
 */
export function extractDelta(event: ChatStreamEvent): string | null {
	if (event.event === StreamEventType.PartDelta) {
		const deltaData = event.data as PartDeltaData;
		if (deltaData.type === StreamPartType.Output && "delta" in deltaData) {
			return deltaData.delta || null;
		}
	}
	return null;
}

/**
 * Extract conversation ID from stream event if present
 */
export function extractConversationId(event: ChatStreamEvent): string | null {
	const data = event.data as { conversation_id?: string } | null;
	if (data && typeof data === "object" && data.conversation_id) {
		return data.conversation_id;
	}
	return null;
}

/**
 * Check if stream event is a final result
 */
export function isFinalResult(event: ChatStreamEvent): boolean {
	return event.event === StreamEventType.FinalResult;
}

/**
 * Extract final result data from stream event
 */
export function extractFinalResult(
	event: ChatStreamEvent
): FinalResultData | null {
	if (event.event === StreamEventType.FinalResult) {
		return event.data as FinalResultData;
	}
	return null;
}
