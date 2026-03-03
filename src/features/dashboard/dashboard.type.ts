import type { ChartConfig } from "@/components/shadcn/chart";

export type KPIKey = "totalRequest" | "totalCost";

export type CompareLabelKey = "vsLastWeek" | "vsLastMonth" | "vsLastYear";

export type StatCardData = {
	id: string; // unique key
	title: KPIKey; // "Total Requests"
	value: number; // 403
	format?: "compact" | "currency"; // optional formatting for value

	change: {
		value: number; // 12.5
		type: "increase" | "decrease";
		compareLabel: CompareLabelKey; // "vs last week"
	};
};

export type ChartDataset = {
	[key: string]: number | string;
};

export type SeriesNameKey = "requests" | "cost" | "total";

export type Series = {
	dataKey: string;
	name: SeriesNameKey;
	yAxisId: "left" | "right";
	stroke?: string;
	dot?: boolean;
	strokeWidth?: number;
};

export type ChartConfigurationTitleKey =
	| "tokenUsageOverTime"
	| "requestVolumeAndCost";

export type ChartConfiguration = {
	title: ChartConfigurationTitleKey;
	config: ChartConfig;
	datasets: ChartDataset[];
	// Which key to use for X axis and the series to render
	xKey: string;
	series: Series[];
};
