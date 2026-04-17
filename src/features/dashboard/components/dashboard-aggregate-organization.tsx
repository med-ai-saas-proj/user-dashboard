import { useMemo } from "react";
import DashboardChart from "@/features/dashboard/components/dashboard-chart";
import DashboardAggregateTimeFilter from "@/features/dashboard/components/dashboard-aggregate-time-filter";
import KPICard from "@/features/dashboard/components/kpi-card";
import { useTranslation } from "react-i18next";

import { useGetAggregateByOrganization } from "../hooks/use-get-aggregate-by-organization";
import type { ChartConfig } from "@/components/shadcn/chart";
import type { ChartConfiguration } from "../dashboard.type";
import { useChartTimePickerStore } from "../store/chart-time-picker";

const DashboardAggregateOrganization = () => {
	const { t } = useTranslation("dashboard");
	const startDate = useChartTimePickerStore((state) => state.startDate);
	const endDate = useChartTimePickerStore((state) => state.endDate);
	const selectedPeriod = useChartTimePickerStore((state) => state.period);
	const scale = useChartTimePickerStore((state) => state.scale);

	// Fetching Aggregate Organization Data
	const aggregateParams = useMemo(() => {
		const periodStart = new Date(startDate);
		periodStart.setHours(0, 0, 0, 0);

		const periodEndExclusive = new Date(endDate);
		periodEndExclusive.setHours(0, 0, 0, 0);
		periodEndExclusive.setDate(periodEndExclusive.getDate() + 1);

		return {
			periodStart: periodStart.toISOString(),
			periodEnd: periodEndExclusive.toISOString(),
			period: selectedPeriod,
			periodScale: scale,
		};
	}, [startDate, endDate, selectedPeriod, scale]);

	const { data: aggregateOrganizationData } =
		useGetAggregateByOrganization(aggregateParams);

	const normalizedAggregateData = useMemo(
		() =>
			(aggregateOrganizationData?.data ?? []).map((item) => ({
				...item,
				total_amount: Number(item.total_amount),
			})),
		[aggregateOrganizationData?.data]
	);

	const totalExpenditureTrendChartConfig = {
		total_amount: { label: "Total Amount" },
	} satisfies ChartConfig;

	const transactionVolumeTrendChartConfig = {
		transaction_count: { label: "Transaction Count" },
	} satisfies ChartConfig;

	const totalExpenditureTrendChart: ChartConfiguration = {
		title: "totalExpenditureTrend",
		config: totalExpenditureTrendChartConfig,
		xKey: "period_bucket",
		series: [
			{
				dataKey: "total_amount",
				name: "total_amount",
				yAxisId: "left",
				stroke: "var(--chart-1)",
				dot: false,
				strokeWidth: 2,
			},
		],
		datasets: normalizedAggregateData,
		chartType: "area",
	};

	const transactionVolumeChart: ChartConfiguration = {
		title: "transactionVolumeTrend",
		config: transactionVolumeTrendChartConfig,
		xKey: "period_bucket",
		series: [
			{
				dataKey: "transaction_count",
				name: "transaction_count",
				yAxisId: "left",
				stroke: "var(--chart-2)",
				dot: false,
				strokeWidth: 2,
			},
		],
		datasets: normalizedAggregateData,
		chartType: "bar",
	};

	// KPI Card
	const totalSpentKPIData = useMemo(
		() =>
			aggregateOrganizationData?.data?.reduce(
				(acc, bucket) => acc + Number(bucket.total_amount),
				0
			) ?? 0,
		[aggregateOrganizationData?.data]
	);

	const totalTransactionCountKPIData = useMemo(
		() =>
			aggregateOrganizationData?.data?.reduce(
				(acc, bucket) => acc + bucket.transaction_count,
				0
			) ?? 0,
		[aggregateOrganizationData?.data]
	);

	return (
		<div className="px-6 flex flex-col gap-6 w-full">
			{/* KPI Cards Section with Hero Text */}
			<div className="flex flex-col w-full">
				<div className="flex md:flex-row flex-col items-start justify-between gap-6">
					{/* Hero/Description Text */}
					<div className="flex flex-col justify-center max-w-xl">
						<h3 className="text-2xl font-bold mb-2">{t("kpiSection.title")}</h3>
						<p className="text-muted-foreground">
							{t("kpiSection.description")}
						</p>
					</div>
					{/* KPI Cards */}
					<div className="flex gap-4 flex-col md:flex-row w-full md:w-auto">
						<KPICard
							data={[
								{
									id: "totalSpent",
									title: "totalSpent",
									value: totalSpentKPIData,
									format: "currency",
								},
							]}
						/>
						<KPICard
							data={[
								{
									id: "totalTransactions",
									title: "totalTransactions",
									value: totalTransactionCountKPIData,
									format: "compact",
								},
							]}
						/>
					</div>
				</div>
				<div className="flex items-center justify-end gap-x-4 mt-6">
					<DashboardAggregateTimeFilter />
				</div>
			</div>

			{/* Charts Section */}
			<div className="flex flex-col gap-4 w-full">
				<DashboardChart
					title={t("chart.totalExpenditureTrend")}
					chartConfig={totalExpenditureTrendChart}
				/>
				<DashboardChart
					title={t("chart.transactionVolumeTrend")}
					chartConfig={transactionVolumeChart}
					isTotalOnly={true}
				/>
			</div>
		</div>
	);
};

export default DashboardAggregateOrganization;
