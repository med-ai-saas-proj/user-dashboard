import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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

type AreaChartProps = {
	configuration: ChartConfig;
	datasets: ChartDataset[];
	xKey?: string; // default 'date'
	series?: Series[]; // dynamic series configuration
	height?: number;
	isTotalOnly?: boolean; // indicate total only mode in one y-axis
};

const AreaChartDashboard = ({
	configuration,
	datasets,
	xKey = "date",
	series = [],
	height = 250,
	isTotalOnly = false,
}: AreaChartProps) => {
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
			<AreaChart
				accessibilityLayer={true}
				data={formattedDatasets}
				margin={{
					left: 12,
					right: 12,
				}}
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
								return new Date(value).toLocaleDateString(currentLocale, {
									month: "short",
									day: "numeric",
									year: "numeric",
								});
							}}
							indicator="dot"
						/>
					}
				/>

				{series.map((s, idx) => (
					<Area
						key={s.dataKey + idx}
						dataKey={s.dataKey}
						type="natural"
						dot={s.dot ?? false}
						stroke={s.stroke ?? `var(--chart-${(idx % 6) + 1})`}
						fill={s.stroke ?? `var(--chart-${(idx % 6) + 1})`}
						stackId={"a"}
						yAxisId={isTotalOnly ? "left" : (s.yAxisId ?? "left")}
						name={t(`chart.series.${s.name}`)}
					/>
				))}
				<ChartLegend content={<ChartLegendContent />} />
			</AreaChart>
		</ChartContainer>
	);
};

export default AreaChartDashboard;
