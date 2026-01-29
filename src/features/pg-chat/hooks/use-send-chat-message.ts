import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StreamEventType } from '@/enums/stream-chat.enum';
import type { ChatRequest } from '../services/chat.dto';
import {
	sendChatMessage,
	streamChatMessage,
} from '../services/send-chat-message';
import type {
	ChatStreamEvent,
	StartStreamParams,
} from '../services/stream-chat.dto';

export const useSendChatMessage = () => {
	return useMutation({
		mutationFn: (request: ChatRequest) => sendChatMessage(request),
	});
};

export const useStreamChatMessage = () => {
	const controllerRef = useRef<AbortController | null>(null);
	const finishedRef = useRef(false);
	const [isStreaming, setIsStreaming] = useState(false);

	const finalize = useCallback(
		(onComplete?: StartStreamParams['onComplete'], event?: ChatStreamEvent) => {
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
		({
			request,
			onMessage,
			onError,
			onComplete,
			onOpen,
		}: StartStreamParams) => {
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
					await streamChatMessage({
						request,
						signal: controller.signal,
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
};
