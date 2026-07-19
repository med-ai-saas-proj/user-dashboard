export type LoggingParams = {
	start: string;
	end: string;
	limit?: number;
	direction?: "forward" | "backward";
	level?: "debug" | "info" | "warn" | "error";
	keyword?: string | null;
	filters?: string | null;
	custom_query?: string | null;
};

export type LoggingSpan = {
	span_id: string;
	trace_id: string;
	parent_span_id: string | null;
};

export type LoggingResponseItem = {
	event: string;
	level: string;
	timestamp: number;
	requestId: string | null;
	orgId: string;
	projectId?: string;
	apiKeyId?: string;
	pathname?: string;
	lineno?: number;
	func_name?: string;
	method?: string;
	url?: string;
	status?: number;
	latencyMs?: number;
	span?: LoggingSpan | null;
	[key: string]: unknown;
};

export type LoggingResponse = LoggingResponseItem[];
