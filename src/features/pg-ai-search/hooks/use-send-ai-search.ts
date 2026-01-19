import { useMutation } from '@tanstack/react-query';
import type { AISearchRequest } from '../services/ai-search.dto';
import { sendAISearch } from '../services/send-ai-search';

export const useSendAISearch = () => {
  return useMutation({
    mutationFn: (request: AISearchRequest) => sendAISearch(request),
  });
};
