import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/shadcn/chart";
import type { ChartDataset, Series } from "../dashboard.type";
import { useTranslation } from "react-i18next";

const toNumber = (value: unknown) => {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
};

type LineChartProps = {
	configuration: ChartConfig;
	datasets: ChartDataset[];
	xKey?: string; // default 'date'
	series: Series[]; // dynamic series configuration
	height?: number;
	isTotalOnly?: boolean; // indicate total only mode in one y-axis
};

const LineChartDashboard = ({
	configuration,
	datasets,
	xKey = "date",
	series,
	height = 250,
	isTotalOnly = false,
}: LineChartProps) => {
	const { t } = useTranslation("dashboard");
	const { i18n } = useTranslation();
	const currentLocale = i18n.language || "en-US";

	const formatXAxisValue = (value: unknown) => {
		const date = new Date(String(value));

		if (!Number.isNaN(date.getTime())) {
			return date.toLocaleDateString(currentLocale, {
				month: "short",
				day: "numeric",
			});
		}

		return String(value);
	};

	const getSeriesLabel = (item: Series) => {
		console.log(item);

		const fallback = item.name ?? item.dataKey;
		const configLabel = configuration[item.dataKey]?.label;

		if (typeof configLabel === "string") {
			return configLabel;
		}

		return t(`chart.series.${fallback}`, { defaultValue: fallback });
	};

	const formattedDatasets = useMemo(
		() =>
			datasets.map((data) => ({
				...data,
				total: series.reduce(
					(sum, item) => sum + toNumber(data[item.dataKey]),
					0
				),
			})),
		[datasets, series]
	);

	const axisSeries = useMemo(
		() =>
			Array.from(new Set(series.map((s) => s.yAxisId))).map((axisId) => ({
				axisId,
				series: series.find((s) => s.yAxisId === axisId),
			})),
		[series]
	);

	return (
		<ChartContainer
			config={configuration}
			className={`aspect-auto w-full`}
			style={{ height: `${height}px` }}
		>
			<LineChart
				accessibilityLayer={true}
				data={formattedDatasets}
				margin={{ left: 12, right: 12 }}
			>
				<CartesianGrid vertical={false} />
				<XAxis
					dataKey={xKey}
					tickLine={false}
					axisLine={false}
					tickMargin={8}
					minTickGap={32}
					tickFormatter={formatXAxisValue}
				/>
				{isTotalOnly && (
					<YAxis
						dataKey={"total"}
						name={t("chart.series.total")}
						yAxisId={"left"}
						tickLine={false}
						axisLine={false}
						tickMargin={8}
						minTickGap={32}
						orientation={"left"}
					/>
				)}
				{!isTotalOnly &&
					axisSeries.map((axisItem) => (
						<YAxis
							key={axisItem.axisId}
							dataKey={axisItem.series?.dataKey}
							name={axisItem.series ? getSeriesLabel(axisItem.series) : ""}
							yAxisId={axisItem.axisId}
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							minTickGap={32}
							orientation={axisItem.axisId}
						/>
					))}

				<ChartTooltip
					content={
						<ChartTooltipContent
							className="w-[150px]"
							labelFormatter={formatXAxisValue}
						/>
					}
				/>

				{series.map((s, idx) => (
					<Line
						key={s.dataKey + idx}
						dataKey={s.dataKey}
						stroke={s.stroke ?? `var(--chart-${(idx % 6) + 1})`}
						strokeWidth={s.strokeWidth ?? 2}
						dot={s.dot ?? false}
						yAxisId={isTotalOnly ? "left" : (s.yAxisId ?? "left")}
						name={getSeriesLabel(s)}
					/>
				))}

				<ChartLegend content={<ChartLegendContent />} />
			</LineChart>
		</ChartContainer>
	);
};

export default LineChartDashboard;
