import { Card, CardContent, CardHeader } from "@/components/shadcn/card";
import type { ChartConfiguration } from "../dashboard.type";
import LineChartDashboard from "./line-chart";

type DashboardChartProps = {
	title: string;
	chartConfiguration?: ChartConfiguration;
	children?: React.ReactNode;
};

const DashboardChart = ({
	title,
	chartConfiguration,
	children,
}: DashboardChartProps) => {
	return (
		<Card>
			<CardHeader>
				<h3 className="text-xl font-bold">{title}</h3>
			</CardHeader>
			<CardContent>
				{children ? (
					children
				) : chartConfiguration ? (
					<LineChartDashboard
						configuration={chartConfiguration.config}
						datasets={chartConfiguration.datasets}
						xKey={chartConfiguration.xKey}
						series={chartConfiguration.series}
					/>
				) : null}
			</CardContent>
		</Card>
	);
};

export default DashboardChart;
