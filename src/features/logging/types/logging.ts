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
