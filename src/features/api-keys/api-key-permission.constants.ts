export const API_KEY_HIDDEN_PERMISSIONS = [
	"chat.read",
	"chat.run",
	"conversation.read",
	"conversation.write",
	"conversation.delete",
	"file.read",
	"file.write",
	"file.delete",
	"rag.read",
	"rag.write",
] as const;

export type HiddenPermissionId = (typeof API_KEY_HIDDEN_PERMISSIONS)[number];
