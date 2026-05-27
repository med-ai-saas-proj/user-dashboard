/**
 * Usage / metering types — the dashboard mirror of the backend
 * `UsageSummary` contract (management `GET /usage`). Field names match the
 * backend DTO 1:1; keep them in sync if the contract changes.
 */

export type EndpointUsage = {
	path: string;
	method: string;
	calls: number;
	errors: number;
};

export type UsageSummary = {
	user_id: string;
	period_start: string | null;
	period_end: string | null;
	total_calls: number;
	total_errors: number;
	error_rate: number;
	avg_latency_ms: number | null;
	total_request_bytes: number;
	total_response_bytes: number;
	by_endpoint: EndpointUsage[];
	// Clearly-labelled placeholder cost hook from the backend — NOT a real
	// tariff (flat synthetic per-call rate).
	estimated_cost_usd: number;
};
