import { API_ROUTES } from '@/config/api-routes';
import { useAuthStore } from '@/features/auth/store/auth-store';
import apiClient from '@/query/api-client';
import type {
	ChatRequest,
	ChatResponse,
	StreamChatMessageParams,
} from './chat.dto';
import { createSSE } from './sse';
import type { ChatStreamEvent } from './stream-chat.dto';

export const sendChatMessage = async (
	request: ChatRequest
): Promise<ChatResponse> => {
	const { data } = await apiClient.post<ChatResponse>(
		API_ROUTES.SERVICES.CHAT,
		request
	);
	return data;
};

export const streamChatMessage = ({
	request,
	signal,
	onOpen,
	onMessage,
	onError,
	onClose,
}: StreamChatMessageParams): Promise<void> => {
	const token = useAuthStore.getState().token;

	if (!token) {
		throw new Error('Authentication token is missing');
	}

	return createSSE<ChatStreamEvent>({
		url: API_ROUTES.SERVICES.CHAT,
		token,
		signal,
		payload: { ...request, stream: true },
		onOpen,
		onMessage,
		onError,
		onClose,
	});
};
