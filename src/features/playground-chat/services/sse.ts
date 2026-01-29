import { fetchEventSource } from '@microsoft/fetch-event-source';
import type { StreamEventType } from '@/enums/stream-chat.enum';
import type { CreateSSEParams } from '@/features/playground-chat/services/stream-chat.dto';

export function createSSE<T>({
  url,
  token,
  signal,
  payload,
  onOpen,
  onMessage,
  onError,
  onClose,
}: CreateSSEParams<T>) {
  return fetchEventSource(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
    signal,

    onopen(response) {
      return Promise.resolve(onOpen?.(response));
    },

    onmessage(event) {
      if (!event.data) return;

      // Ignore connection event
      if (event.event === 'connected') {
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
        console.warn('Non-JSON SSE message:', event.data);
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
