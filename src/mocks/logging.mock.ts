import Mock from "mockjs";
import { API_ROUTES } from "@/config/api-routes";
import type { LoggingResponse } from "@/features/logging/types/logging";

const levels = ["info", "warn", "error", "debug"] as const;

const escapeRegExp = (value: string) =>
	value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const baseLogs: LoggingResponse[] = [
	{
		projectId: "00000000-0000-0000-0000-000000000000",
		orgId: "test_org1",
		event: "Fetching files in RAG for project_id: 0",
		pathname:
			"/mnt/data/School/Final Project/Test/med-ai-saas/src/gantry/service/rag/routers/api.py",
		lineno: 64,
		func_name: "get_files",
		level: "info",
		timestamp: 1783653469315,
		requestId: null,
		span: {
			span_id: "6dcee0e63f3db3fd",
			trace_id: "6a5447c69bff4cae758394cab4a80587",
			parent_span_id: "98c76889576ac252",
		},
	},
	{
		projectId: "11111111-1111-1111-1111-111111111111",
		orgId: "test_org1",
		event: "Request completed successfully",
		pathname: "/app/services/auth.ts",
		lineno: 28,
		func_name: "refreshToken",
		level: "debug",
		timestamp: 1783653471200,
		requestId: "req-2",
		span: {
			span_id: "2f82f1b1a5f2e8c1",
			trace_id: "7d3b1d3385c6476c8a26d94af48f9b01",
			parent_span_id: "a2dd1e4f0a3f4c91",
		},
	},
	{
		projectId: "22222222-2222-2222-2222-222222222222",
		orgId: "test_org1",
		event: "Unable to connect to upstream service",
		pathname: "/app/services/proxy.ts",
		lineno: 91,
		func_name: "forwardRequest",
		level: "error",
		timestamp: 1783653473888,
		requestId: "req-3",
		span: {
			span_id: "55f7f3e2e0b0f4d8",
			trace_id: "d3f19d0d8d5a4ca08fd1e3a67dd48b0f",
			parent_span_id: "c1e3d0b9ef3f4621",
		},
	},
	{
		projectId: "33333333-3333-3333-3333-333333333333",
		orgId: "test_org1",
		event: "Cache miss for project metadata",
		pathname: "/app/cache/project-cache.ts",
		lineno: 47,
		func_name: "getProjectMetadata",
		level: "warn",
		timestamp: 1783653475124,
		requestId: null,
		span: {
			span_id: "39c0f5a8a5f24a01",
			trace_id: "5f3af7d0e71c4f0e9d5be9d47df58f05",
			parent_span_id: "d0fa3b6a07ed4e4b",
		},
	},
];

const parseDateParam = (value: string | null) => {
	if (!value) return null;
	const parsed = new Date(value);
	return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
};

const parseNumberParam = (value: string | null, fallback: number) => {
	if (!value) return fallback;
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
};

const parseFilterEntries = (value: string | null) => {
	if (!value) return [] as Array<{ type: string; value: string }>;

	const decoded = decodeURIComponent(value);

	return decoded
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean)
		.map((item) => {
			const [type, ...rest] = item.split(":");
			return {
				type: type?.trim() ?? "",
				value: rest.join(":").trim(),
			};
		})
		.filter((entry) => entry.type && entry.value);
};

const includesKeyword = (log: LoggingResponse, keyword: string) => {
	const normalized = keyword.trim().toLowerCase();
	if (!normalized) return true;

	return [log.event, log.pathname, log.func_name, log.level, log.projectId]
		.filter(Boolean)
		.some((item) => item.toLowerCase().includes(normalized));
};

const buildMockResponse = (options: { url: string }) => {
	const url = new URL(options.url, "http://dummy");
	const start = parseDateParam(url.searchParams.get("start"));
	const end = parseDateParam(url.searchParams.get("end"));
	const limit = parseNumberParam(url.searchParams.get("limit"), 100);
	const direction = url.searchParams.get("direction") ?? "backward";
	const level = url.searchParams.get("level") ?? "";
	const keyword = url.searchParams.get("keyword") ?? "";
	const filters = parseFilterEntries(url.searchParams.get("filters"));
	const levelFilters = [
		level,
		...parseFilterEntries(url.searchParams.get("level"))
			.filter((entry) => entry.type === "level")
			.map((entry) => entry.value),
	].filter(Boolean);

	const filterProjectIds = filters
		.filter((entry) => entry.type === "projectId")
		.map((entry) => entry.value);
	const filterLevels = [
		...filters
			.filter((entry) => entry.type === "level")
			.map((entry) => entry.value),
		...levelFilters,
	];

	const filtered = loggingMockData.filter((log) => {
		if (start !== null && log.timestamp < start) return false;
		if (end !== null && log.timestamp > end) return false;
		if (level && log.level !== level) return false;
		if (
			filterProjectIds.length > 0 &&
			!filterProjectIds.includes(log.projectId)
		) {
			return false;
		}
		if (filterLevels.length > 0 && !filterLevels.includes(log.level)) {
			return false;
		}
		if (!includesKeyword(log, keyword)) return false;
		return true;
	});

	const sorted = [...filtered].sort((left, right) => {
		return direction === "forward"
			? left.timestamp - right.timestamp
			: right.timestamp - left.timestamp;
	});

	return sorted.slice(0, limit);
};

const buildLog = (index: number): LoggingResponse => {
	const template = baseLogs[index % baseLogs.length];
	const level = levels[index % levels.length];
	const timestamp = 1783653469000 + index * 173;

	return {
		...template,
		projectId:
			index % 3 === 0
				? "00000000-0000-0000-0000-000000000000"
				: index % 3 === 1
					? "11111111-1111-1111-1111-111111111111"
					: "22222222-2222-2222-2222-222222222222",
		event:
			index % 2 === 0
				? `Fetching files in RAG for project_id: ${index}`
				: `Logging event ${index}`,
		pathname:
			index % 2 === 0
				? "/mnt/data/School/Final Project/Test/med-ai-saas/src/gantry/service/rag/routers/api.py"
				: "/app/services/logging.ts",
		lineno: index % 2 === 0 ? 64 : 118,
		func_name: index % 2 === 0 ? "get_files" : "writeLog",
		level,
		timestamp,
		requestId: index % 4 === 0 ? null : `req-${index + 1}`,
		span: {
			span_id: Mock.mock("@guid").replace(/-/g, "").slice(0, 16),
			trace_id: Mock.mock("@guid").replace(/-/g, "").slice(0, 32),
			parent_span_id: Mock.mock("@guid").replace(/-/g, "").slice(0, 16),
		},
	};
};

export const loggingMockData: LoggingResponse[] = Array.from(
	{ length: 50 },
	(_, index) => buildLog(index)
);

Mock.mock(
	new RegExp(`^${escapeRegExp(API_ROUTES.MANAGEMENT.LOGGING)}(?:\\?.*)?$`),
	"get",
	(options) => buildMockResponse(options)
);
