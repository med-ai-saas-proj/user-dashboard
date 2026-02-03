import { fetchEventSource } from "@microsoft/fetch-event-source";
import type { StreamEventType } from "@/enums/stream-chat.enum";
import { getAuthHeaders, handleUnauthorized } from "@/lib/auth-headers";
import type { CreateSSEParams } from "@/features/pg-chat/services/stream-chat.dto";

export async function createSSE<T>({
	url,
	signal,
	payload,
	onOpen,
	onMessage,
	onError,
	onClose,
}: Omit<CreateSSEParams<T>, "token">) {
	const headers = await getAuthHeaders(url);

	return fetchEventSource(url, {
		method: "POST",
		headers,
		body: JSON.stringify(payload),
		signal,

		onopen(response) {
			// Handle 401 errors using shared logic
			if (response.status === 401) {
				handleUnauthorized();
				throw new Error("Unauthorized");
			}
			return Promise.resolve(onOpen?.(response));
		},

		onmessage(event) {
			if (!event.data) return;

			// Ignore connection event
			if (event.event === "connected") {
				return;
			}

			// Parse only JSON payloads
			try {
				const parsedData = JSON.parse(event.data) as T;

				const fullEvent = {
					event: event.event as StreamEventType,
					data: parsedData,
				} as T;

				onMessage(fullEvent, event);
			} catch (err) {
				console.warn("Non-JSON SSE message:", event.data);
				console.error(err);
			}
		},

		onerror(err) {
			onError?.(err);
			throw err; // stop auto-reconnect unless caller wants it
		},

		onclose() {
			onClose?.();
		},
	});
}
