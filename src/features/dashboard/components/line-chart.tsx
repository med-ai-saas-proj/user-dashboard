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

	const formattedDatasets = useMemo(
		() =>
			datasets.map((data) => ({
				...data,
				total: Number(data.requests) + Number(data.cost),
			})),
		[datasets]
	);

	// compute unique axes (left/right) used by series
	const axisIds = useMemo(
		() => Array.from(new Set(series.map((s) => s.yAxisId ?? "left"))),
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
					tickFormatter={(value) => {
						const date = new Date(value);
						return date.toLocaleDateString(currentLocale, {
							month: "short",
							day: "numeric",
						});
					}}
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
					axisIds.map((id, index) => (
						<YAxis
							key={id}
							dataKey={series[index].dataKey}
							name={t(`chart.series.${series[index].name}`)}
							yAxisId={id}
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							minTickGap={32}
							orientation={id as "left" | "right"}
						/>
					))}

				<ChartTooltip
					content={
						<ChartTooltipContent
							className="w-[150px]"
							labelFormatter={(value) => {
								const date = new Date(value);
								return date.toLocaleDateString(currentLocale, {
									month: "short",
									day: "numeric",
								});
							}}
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
						name={t(`chart.series.${s.name}`)}
					/>
				))}

				<ChartLegend content={<ChartLegendContent />} />
			</LineChart>
		</ChartContainer>
	);
};

export default LineChartDashboard;
