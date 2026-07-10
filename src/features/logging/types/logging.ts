export type LoggingParams = {
	start: string;
	end: string;
	limit?: number;
	direction?: "forward" | "backward";
	level?: "info" | "warn" | "error" | "debug";
	keyword?: string;
	filters?: string;
	customQuery?: string;
};

export type LoggingResponse = {
	projectId: string;
	orgId: string;
	event: string;
	pathname: string;
	lineno: number;
	func_name: string;
	level: string;
	timestamp: number;
	requestId: string | null;
	span: {
		span_id: string;
		trace_id: string;
		parent_span_id: string;
	};
};
