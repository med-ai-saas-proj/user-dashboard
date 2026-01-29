// export const StreamEventType = {
//   ConversationStart: "conversation_start",
//   PartStart: "part_start",
//   PartDelta: "part_delta",
//   FinalResult: "final_result",
// };
export const StreamEventType = {
	ConversationStart: 'StreamEventType.conversation_start',
	PartStart: 'StreamEventType.part_start',
	PartDelta: 'StreamEventType.part_delta',
	FinalResult: 'StreamEventType.final_result',
} as const;

export type StreamEventType =
	(typeof StreamEventType)[keyof typeof StreamEventType];

export const StreamPartType = {
	Output: 'output',
	Thinking: 'thinking',
	BuiltinToolCall: 'builtin_tool_call',
	BuiltinToolResult: 'builtin_tool_result',
} as const;

export type StreamPartType =
	(typeof StreamPartType)[keyof typeof StreamPartType];
