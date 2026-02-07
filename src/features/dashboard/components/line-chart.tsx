import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/shadcn/chart";
import type { ChartDataset } from "../dashboard.type";
import { useMemo } from "react";

type LineChartProps = {
	configuration: ChartConfig;
	datasets: ChartDataset[];
};

const LineChartDashboard = ({ configuration, datasets }: LineChartProps) => {
	const formattedDatasets = useMemo(
		() =>
			datasets.map((data) => ({
				...data,
				total: Number(data.requests) + Number(data.cost),
			})),
		[datasets]
	);

	return (
		<ChartContainer
			config={configuration}
			className="aspect-auto h-[250px] w-full"
		>
			<LineChart
				accessibilityLayer={true}
				data={formattedDatasets}
				margin={{
					left: 12,
					right: 12,
				}}
			>
				<CartesianGrid vertical={false} />
				<XAxis
					dataKey="date"
					tickLine={false}
					axisLine={false}
					tickMargin={8}
					minTickGap={32}
					tickFormatter={(value) => {
						const date = new Date(value);
						return date.toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
						});
					}}
				/>
				<YAxis
					yAxisId="left"
					dataKey="requests"
					tickLine={false}
					axisLine={false}
					tickMargin={8}
					minTickGap={32}
					orientation="left"
				/>
				<YAxis
					yAxisId="right"
					dataKey="cost"
					tickLine={false}
					axisLine={false}
					tickMargin={8}
					minTickGap={32}
					orientation="right"
				/>
				<ChartTooltip
					content={
						<ChartTooltipContent
							className="w-[150px]"
							labelFormatter={(value) => {
								return new Date(value).toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
									year: "numeric",
								});
							}}
						/>
					}
				/>
				<Line
					dataKey={"requests"}
					type="monotone"
					stroke={`var(--chart-1)`}
					strokeWidth={2}
					dot={false}
					yAxisId="left"
				/>
				<Line
					dataKey={"cost"}
					type="monotone"
					stroke={`var(--chart-2)`}
					strokeWidth={2}
					dot={false}
					yAxisId="right"
				/>
				<ChartLegend content={<ChartLegendContent />} />
			</LineChart>
		</ChartContainer>
	);
};

export default LineChartDashboard;
