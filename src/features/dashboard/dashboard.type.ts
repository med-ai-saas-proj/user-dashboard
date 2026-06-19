import type { ChartConfig } from "@/components/shadcn/chart";

export type KPIKey =
	| "totalRequest"
	| "totalCost"
	| "totalSpent"
	| "totalTransactions";

export type CompareLabelKey = "vsLastWeek" | "vsLastMonth" | "vsLastYear";

export type StatCardData = {
	id: string; // unique key
	title: KPIKey; // "Total Requests"
	value: number; // 403
	format?: "compact" | "currency"; // optional formatting for value

	change?: {
		value: number; // 12.5
		type: "increase" | "decrease";
		compareLabel: CompareLabelKey; // "vs last week"
	};
};

export type ChartDataset = {
	[key: string]: number | string;
};

export type Series = {
	dataKey: string;
	name?: string;
	yAxisId: "left" | "right";
	stroke?: string;
	dot?: boolean;
	strokeWidth?: number;
};

// export type ChartConfigurationTitleKey =
//     | "tokenUsageOverTime"
//     | "requestVolumeAndCost";

export type ChartType = "line" | "area" | "bar";

export type ChartConfiguration = {
	title: string;
	config: ChartConfig;
	datasets: ChartDataset[];
	// Which key to use for X axis and the series to render
	xKey: string;
	series: Series[];
	chartType: ChartType;
};

export type AggregatePeriod = "daily" | "weekly" | "monthly" | "yearly";

export type AggregateParams = {
	periodStart: string; // ISO date string
	periodEnd: string; // ISO date string
	period: AggregatePeriod;
	periodScale: number;
};

export type Aggregate = {
	success: boolean;
	data: {
		period_bucket: string;
		transaction_count: number;
		total_amount: string;
	}[];
};
