import { Suspense, lazy } from "react";
import { Card, CardContent, CardHeader } from "@/components/shadcn/card";
import type { ChartConfiguration } from "../dashboard.type";
import { useGetChartMetric } from "../hooks/use-get-chart-metric";

const LazyLineChart = lazy(() => import("./line-chart"));
const LazyAreaChart = lazy(() => import("./area-chart"));

type DashboardChartProps = {
	title: string;
	chartConfig: Omit<ChartConfiguration, "datasets">;
	isTotalOnly?: boolean; // if true, only show total line and hide requests and cost lines
};

const DashboardChart = ({
	title,
	chartConfig,
	isTotalOnly,
}: DashboardChartProps) => {
	const { data: datasets } = useGetChartMetric();

	const chartConfiguration: ChartConfiguration = {
		...chartConfig,
		datasets: datasets ?? [],
	};

	return (
		<Card>
			<CardHeader>
				<h3 className="text-xl font-bold">{title}</h3>
			</CardHeader>
			<CardContent>
				<Suspense fallback={<div>Loading chart...</div>}>
					{chartConfiguration.chartType === "line" && (
						<LazyLineChart
							configuration={chartConfiguration.config}
							datasets={chartConfiguration.datasets}
							xKey={chartConfiguration.xKey}
							series={chartConfiguration.series}
							isTotalOnly={isTotalOnly}
						/>
					)}
					{chartConfiguration.chartType === "area" && (
						<LazyAreaChart
							configuration={chartConfiguration.config}
							datasets={chartConfiguration.datasets}
							xKey={chartConfiguration.xKey}
							series={chartConfiguration.series}
							isTotalOnly={isTotalOnly}
						/>
					)}
				</Suspense>
			</CardContent>
		</Card>
	);
};

export default DashboardChart;
