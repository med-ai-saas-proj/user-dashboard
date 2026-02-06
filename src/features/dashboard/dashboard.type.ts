import type { ChartConfig } from "@/components/shadcn/chart";

export type StatCardData = {
	id: string; // unique key
	title: string; // "Total Requests"
	value: number; // 403
	format?: "compact" | "currency"; // optional formatting for value

	change?: {
		value: number; // 12.5
		type: "increase" | "decrease";
		compareLabel?: string; // "vs last week"
	};
};

export type ChartDataset = {
	[key: string]: number | string;
};

export type ChartConfiguration = {
	title: string;
	config: ChartConfig;
	datasets: ChartDataset[];
};
