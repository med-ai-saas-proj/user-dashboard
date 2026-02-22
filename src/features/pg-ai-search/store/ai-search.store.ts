import { create } from "zustand";
import type { ChatMessage } from "@/features/pg-chat/services/chat.dto";

type AISearchStore = {
	conversationId: string | null;
	messages: ChatMessage[];
	model: string;
	setConversationId: (id: string) => void;
	addMessage: (message: ChatMessage) => void;
	updateLastAssistantMessage: (content: string) => void;
	setModel: (model: string) => void;
	clearMessages: () => void;
};

export const useAISearchStore = create<AISearchStore>((set) => ({
	conversationId: null,
	messages: [],
	model: "gpt-4o-2",

	setConversationId: (id) => set({ conversationId: id }),

	addMessage: (message) =>
		set((state) => ({
			messages: [...state.messages, message],
		})),

	updateLastAssistantMessage: (content) =>
		set((state) => {
			const messages = [...state.messages];
			for (let index = messages.length - 1; index >= 0; index -= 1) {
				if (messages[index]?.role === "assistant") {
					messages[index] = { ...messages[index], content };
					break;
				}
			}
			return { messages };
		}),

	setModel: (model) => set({ model }),

	clearMessages: () => set({ messages: [], conversationId: null }),
}));
