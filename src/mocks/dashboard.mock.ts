import Mock from "mockjs";
import { API_ROUTES } from "@/config/api-routes";
import type { Aggregate } from "@/features/dashboard/dashboard.type";

type AggregatePeriod = "daily" | "weekly" | "monthly" | "yearly";

type UsageEntry = {
	date: Date;
	apiKey: string;
	projectUid: string;
	transactionCount: number;
	totalAmount: number;
};

const escapeRegExp = (value: string) =>
	value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toUtcDateOnly = (value: Date) =>
	new Date(
		Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate())
	);

const parseDateParam = (value: string | null, fallback: Date) => {
	if (!value) {
		return fallback;
	}

	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) {
		return fallback;
	}

	return toUtcDateOnly(parsed);
};

const parsePeriod = (value: string | null): AggregatePeriod => {
	if (
		value === "daily" ||
		value === "weekly" ||
		value === "monthly" ||
		value === "yearly"
	) {
		return value;
	}

	return "daily";
};

const parsePeriodScale = (value: string | null) => {
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed < 1) {
		return 1;
	}

	return Math.floor(parsed);
};

const parseListParam = (searchParams: URLSearchParams, key: string) => {
	const rawValues = [
		...searchParams.getAll(key),
		...searchParams.getAll(`${key}[]`),
	];

	return rawValues
		.flatMap((item) => item.split(","))
		.map((item) => item.trim())
		.filter(Boolean);
};

const formatDateLabel = (date: Date) => {
	const year = date.getUTCFullYear();
	const month = String(date.getUTCMonth() + 1).padStart(2, "0");
	const day = String(date.getUTCDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

const startOfWeekUtc = (date: Date) => {
	const current = toUtcDateOnly(date);
	const day = current.getUTCDay();
	const diff = day === 0 ? -6 : 1 - day;
	current.setUTCDate(current.getUTCDate() + diff);
	return current;
};

const normalizeToPeriodStart = (date: Date, period: AggregatePeriod) => {
	const normalized = toUtcDateOnly(date);

	if (period === "daily") {
		return normalized;
	}

	if (period === "weekly") {
		return startOfWeekUtc(normalized);
	}

	if (period === "monthly") {
		return new Date(
			Date.UTC(normalized.getUTCFullYear(), normalized.getUTCMonth(), 1)
		);
	}

	return new Date(Date.UTC(normalized.getUTCFullYear(), 0, 1));
};

const diffDays = (from: Date, to: Date) => {
	const msPerDay = 24 * 60 * 60 * 1000;
	return Math.floor((to.getTime() - from.getTime()) / msPerDay);
};

const diffWeeks = (from: Date, to: Date) => Math.floor(diffDays(from, to) / 7);

const diffMonths = (from: Date, to: Date) =>
	(to.getUTCFullYear() - from.getUTCFullYear()) * 12 +
	(to.getUTCMonth() - from.getUTCMonth());

const diffYears = (from: Date, to: Date) =>
	to.getUTCFullYear() - from.getUTCFullYear();

const addPeriods = (date: Date, period: AggregatePeriod, amount: number) => {
	const base = new Date(date.getTime());

	if (period === "daily") {
		base.setUTCDate(base.getUTCDate() + amount);
		return base;
	}

	if (period === "weekly") {
		base.setUTCDate(base.getUTCDate() + amount * 7);
		return base;
	}

	if (period === "monthly") {
		return new Date(
			Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + amount, 1)
		);
	}

	return new Date(Date.UTC(base.getUTCFullYear() + amount, 0, 1));
};

const usageEntries: UsageEntry[] = (() => {
	const startDate = new Date(Date.UTC(2025, 0, 1));
	const projectUids = ["project-alpha", "project-beta", "project-gamma"];
	const apiKeys = [
		"key-live-001",
		"key-live-002",
		"key-live-003",
		"key-live-004",
	];
	const entries: UsageEntry[] = [];

	for (let index = 0; index < 180; index += 1) {
		const currentDate = new Date(startDate.getTime());
		currentDate.setUTCDate(startDate.getUTCDate() + index);

		for (
			let projectIndex = 0;
			projectIndex < projectUids.length;
			projectIndex += 1
		) {
			for (
				let apiKeyIndex = 0;
				apiKeyIndex < apiKeys.length;
				apiKeyIndex += 1
			) {
				const count = 5 + ((index + projectIndex * 3 + apiKeyIndex * 5) % 17);
				const amount = count * (0.25 + projectIndex * 0.1 + apiKeyIndex * 0.05);

				entries.push({
					date: toUtcDateOnly(currentDate),
					apiKey: apiKeys[apiKeyIndex],
					projectUid: projectUids[projectIndex],
					transactionCount: count,
					totalAmount: Number(amount.toFixed(2)),
				});
			}
		}
	}

	return entries;
})();

const aggregateUsage = (
	entries: UsageEntry[],
	params: {
		periodStart: Date;
		periodEnd: Date;
		period: AggregatePeriod;
		periodScale: number;
	}
): Aggregate => {
	const { periodStart, periodEnd, period, periodScale } = params;
	const normalizedStart = normalizeToPeriodStart(periodStart, period);
	const bucketMap = new Map<
		string,
		{
			period_bucket: string;
			transaction_count: number;
			total_amount: number;
		}
	>();

	for (const entry of entries) {
		if (entry.date < periodStart || entry.date > periodEnd) {
			continue;
		}

		let unitDiff = 0;
		if (period === "daily") {
			unitDiff = diffDays(normalizedStart, entry.date);
		} else if (period === "weekly") {
			unitDiff = diffWeeks(normalizedStart, entry.date);
		} else if (period === "monthly") {
			unitDiff = diffMonths(normalizedStart, entry.date);
		} else {
			unitDiff = diffYears(normalizedStart, entry.date);
		}

		if (unitDiff < 0) {
			continue;
		}

		const bucketIndex = Math.floor(unitDiff / periodScale) * periodScale;
		const bucketDate = addPeriods(normalizedStart, period, bucketIndex);
		const bucketLabel = formatDateLabel(bucketDate);

		const existing = bucketMap.get(bucketLabel);
		if (existing) {
			existing.transaction_count += entry.transactionCount;
			existing.total_amount += entry.totalAmount;
			continue;
		}

		bucketMap.set(bucketLabel, {
			period_bucket: bucketLabel,
			transaction_count: entry.transactionCount,
			total_amount: entry.totalAmount,
		});
	}

	const data = Array.from(bucketMap.values())
		.sort((left, right) =>
			left.period_bucket.localeCompare(right.period_bucket)
		)
		.map((item) => ({
			period_bucket: item.period_bucket,
			transaction_count: item.transaction_count,
			total_amount: item.total_amount.toFixed(2),
		}));

	return {
		success: true,
		data,
	};
};

const billingBaseRoute = `${API_ROUTES.MANAGEMENT.BILLING}/aggregates`;
const organizationsRoute = `${billingBaseRoute}/organizations`;
const projectsRoute = `${billingBaseRoute}/projects`;
const apiKeysRoute = `${billingBaseRoute}/api-keys`;

const readAggregateParams = (url: URL) => {
	const today = toUtcDateOnly(new Date());
	const prior = toUtcDateOnly(new Date(today.getTime()));
	prior.setUTCDate(prior.getUTCDate() - 30);

	return {
		periodStart: parseDateParam(url.searchParams.get("period_start"), prior),
		periodEnd: parseDateParam(url.searchParams.get("period_end"), today),
		period: parsePeriod(url.searchParams.get("period")),
		periodScale: parsePeriodScale(url.searchParams.get("period_scale")),
	};
};

Mock.mock(
	new RegExp(`^${escapeRegExp(organizationsRoute)}(?:\\?.*)?$`),
	"get",
	(options) => {
		const url = new URL(options.url, "http://dummy");
		const params = readAggregateParams(url);
		return aggregateUsage(usageEntries, params);
	}
);

Mock.mock(
	new RegExp(`^${escapeRegExp(projectsRoute)}(?:\\?.*)?$`),
	"get",
	(options) => {
		const url = new URL(options.url, "http://dummy");
		const params = readAggregateParams(url);
		const projectUids = parseListParam(url.searchParams, "project_uids");

		const filteredEntries =
			projectUids.length > 0
				? usageEntries.filter((item) => projectUids.includes(item.projectUid))
				: usageEntries;

		return aggregateUsage(filteredEntries, params);
	}
);

Mock.mock(
	new RegExp(`^${escapeRegExp(apiKeysRoute)}(?:\\?.*)?$`),
	"get",
	(options) => {
		const url = new URL(options.url, "http://dummy");
		const params = readAggregateParams(url);
		const apiKeys = parseListParam(url.searchParams, "api_keys");

		const filteredEntries =
			apiKeys.length > 0
				? usageEntries.filter((item) => apiKeys.includes(item.apiKey))
				: usageEntries;

		return aggregateUsage(filteredEntries, params);
	}
);
