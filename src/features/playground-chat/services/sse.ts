import type { EventSourceMessage } from '@microsoft/fetch-event-source';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import type { ChatRequest } from './chat.dto';

type CreateSSEParams<T> = {
  url: string;
  token?: string;
  signal: AbortSignal;
  payload?: ChatRequest;
  onOpen?: (response: Response) => void;
  onMessage: (data: T, raw: EventSourceMessage) => void;
  onError?: (error: unknown) => void;
  onClose?: () => void;
};

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
      // Ignore connection event
      if (event.event === 'connected') {
        console.log(event.data); // "Connected to product stream"
        return;
      }

      // Parse only JSON payloads
      try {
        const parsed = JSON.parse(event.data) as T;
        onMessage(parsed, event);
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
