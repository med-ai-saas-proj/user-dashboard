import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/shadcn/chart";
import type { ChartDataset } from "../dashboard.type";

type AreaChartProps = {
	configuration: ChartConfig;
	datasets: ChartDataset[];
};

const AreaChartDashboard = ({ configuration, datasets }: AreaChartProps) => {
	return (
		<ChartContainer
			config={configuration}
			className="aspect-auto h-[250px] w-full"
		>
			<AreaChart
				accessibilityLayer={true}
				data={datasets}
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
							indicator="dot"
						/>
					}
				/>

				<Area
					dataKey={"requests"}
					type="monotone"
					dot={false}
					stroke={`var(--chart-1)`}
					fill={`var(--chart-1)`}
				/>
				<Area
					dataKey={"cost"}
					type="monotone"
					dot={false}
					stroke={`var(--chart-2)`}
					fill={`var(--chart-2)`}
				/>
				<ChartLegend content={<ChartLegendContent />} />
			</AreaChart>
		</ChartContainer>
	);
};

export default AreaChartDashboard;
