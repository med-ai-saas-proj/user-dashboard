import { useMutation } from '@tanstack/react-query';
import type { ChatRequest } from '../services/chat.dto';
import { sendChatMessage } from '../services/send-chat-message';

export const useSendChatMessage = () => {
  return useMutation({
    mutationFn: (request: ChatRequest) => sendChatMessage(request),
  });
};
