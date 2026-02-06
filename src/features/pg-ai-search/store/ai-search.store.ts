import { create } from "zustand";
import type { ChatMessage } from "@/features/pg-chat/services/chat.dto";

type AISearchStore = {
	conversationId: string | null;
	messages: ChatMessage[];
	model: string;
	setConversationId: (id: string) => void;
	addMessage: (message: ChatMessage) => void;
	setModel: (model: string) => void;
	clearMessages: () => void;
};

export const useAISearchStore = create<AISearchStore>((set) => ({
	conversationId: null,
	messages: [],
	model: "gpt-4o-mini",

	setConversationId: (id) => set({ conversationId: id }),

	addMessage: (message) =>
		set((state) => ({
			messages: [...state.messages, message],
		})),

	setModel: (model) => set({ model }),

	clearMessages: () => set({ messages: [], conversationId: null }),
}));
