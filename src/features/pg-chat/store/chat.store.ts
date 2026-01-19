import { create } from 'zustand';
import type { ChatMessage } from '../services/chat.dto';

type ChatStore = {
  conversationId: string | null;
  messages: ChatMessage[];
  model: string;
  setConversationId: (id: string) => void;
  addMessage: (message: ChatMessage) => void;
  setModel: (model: string) => void;
  clearMessages: () => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  conversationId: null,
  messages: [],
  model: 'gpt-4o-mini',

  setConversationId: (id) => set({ conversationId: id }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setModel: (model) => set({ model }),

  clearMessages: () => set({ messages: [], conversationId: null }),
}));
