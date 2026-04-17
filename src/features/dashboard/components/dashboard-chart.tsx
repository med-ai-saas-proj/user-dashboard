import { Suspense, lazy } from "react";
import { Card, CardContent, CardHeader } from "@/components/shadcn/card";
import type { ChartConfiguration } from "../dashboard.type";
// import { useGetChartMetric } from "../hooks/use-get-chart-metric";
// import { useChartTimePickerStore } from "../store/chart-time-picker";
// import { useTranslation } from "react-i18next";

const LazyLineChart = lazy(() => import("./line-chart"));
const LazyAreaChart = lazy(() => import("./area-chart"));
const LazyBarChart = lazy(() => import("./bar-chart"));

type DashboardChartProps = {
	title: string;
	chartConfig: ChartConfiguration;
	isTotalOnly?: boolean;
};

const DashboardChart = ({
	title,
	chartConfig,
	isTotalOnly,
}: DashboardChartProps) => {
	const chartConfiguration: ChartConfiguration = {
		...chartConfig,
		datasets: chartConfig.datasets ?? [],
	};

	return (
		<Card className="w-full">
			<CardHeader>
				<h3 className="text-xl font-bold">{title}</h3>
			</CardHeader>
			<CardContent className="w-full overflow-hidden p-0 sm:p-6">
				<Suspense fallback={<div>Loading chart...</div>}>
					<div className="w-full min-w-0">
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
						{chartConfiguration.chartType === "bar" && (
							<LazyBarChart
								configuration={chartConfiguration.config}
								datasets={chartConfiguration.datasets}
								xKey={chartConfiguration.xKey}
								series={chartConfiguration.series}
								isTotalOnly={isTotalOnly}
							/>
						)}
					</div>
				</Suspense>
			</CardContent>
		</Card>
	);
};

export default DashboardChart;
