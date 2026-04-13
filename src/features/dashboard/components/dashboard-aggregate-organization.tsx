import { useState, useMemo } from "react";
import DashboardChart from "@/features/dashboard/components/dashboard-chart";
import DashboardDatePicker from "@/features/dashboard/components/dashboard-date-picker";
import DashboardMonthPicker from "@/features/dashboard/components/dashboard-month-picker";
import DashboardTimeRangePicker from "@/features/dashboard/components/dashboard-time-range-picker";
import DashboardYearPicker from "@/features/dashboard/components/dashboard-year-picker";
import KPICard from "@/features/dashboard/components/kpi-card";
import { useTranslation } from "react-i18next";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import { Button } from "@/components/shadcn/button";
import { ChevronDown } from "lucide-react";

import { useGetAggregateByOrganization } from "../hooks/use-get-aggregate-by-organization";
import type { ChartConfig } from "@/components/shadcn/chart";
import type { ChartConfiguration } from "../dashboard.type";
import { useChartTimePickerStore } from "../store/chart-time-picker";

type TimePickerType = "date" | "month" | "date-range" | "year";

const DashboardAggregateOrganization = () => {
	const { t } = useTranslation("dashboard");
	const [selectedPicker, setSelectedPicker] = useState<TimePickerType>("date");
	const startDate = useChartTimePickerStore((state) => state.startDate);
	const endDate = useChartTimePickerStore((state) => state.endDate);

	// Generate default values for each picker
	const defaultValues = useMemo(() => {
		const today = new Date();
		const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
		const startOfYear = new Date(today.getFullYear(), 0, 1);

		return {
			date: today,
			month: startOfMonth,
			dateRange: { from: startOfMonth, to: endOfMonth },
			year: startOfYear,
		};
	}, []);

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
			period: "daily" as const,
			periodScale: 1,
		};
	}, [startDate, endDate]);

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
		chartType: "line",
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
		chartType: "area",
	};

	// Time Filter
	const pickerLabels: Record<TimePickerType, string> = {
		date: t("datePicker.label"),
		month: t("monthPicker.label"),
		"date-range": t("rangePicker.label"),
		year: t("yearPicker.label"),
	};

	const renderTimePicker = () => {
		switch (selectedPicker) {
			case "date":
				return <DashboardDatePicker defaultDate={defaultValues.date} />;
			case "month":
				return <DashboardMonthPicker defaultDate={defaultValues.month} />;
			case "date-range":
				return (
					<DashboardTimeRangePicker defaultDate={defaultValues.dateRange} />
				);
			case "year":
				return <DashboardYearPicker defaultDate={defaultValues.year} />;
			default:
				return <DashboardDatePicker defaultDate={defaultValues.date} />;
		}
	};

	return (
		<div className="px-6 flex flex-col gap-6 w-full">
			{/* Time Select Bar */}
			<div className="flex md:flex-row flex-col gap-2 items-center justify-end">
				{/* <h2 className="text-lg font-semibold">{t("title")}</h2> */}
				<div className="flex items-center gap-4">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="gap-2 min-w-36">
								{pickerLabels[selectedPicker]}
								<ChevronDown size={16} />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-48">
							<DropdownMenuRadioGroup
								value={selectedPicker}
								onValueChange={(value) =>
									setSelectedPicker(value as TimePickerType)
								}
							>
								<DropdownMenuRadioItem value="date">
									{t("datePicker.label")}
								</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="month">
									{t("monthPicker.label")}
								</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="date-range">
									{t("rangePicker.label")}
								</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="year">
									{t("yearPicker.label")}
								</DropdownMenuRadioItem>
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenu>
					{renderTimePicker()}
				</div>
			</div>

			{/* KPI Cards Section with Hero Text */}
			<div className="flex md:flex-row flex-col items-start justify-between gap-6">
				{/* Hero/Description Text */}
				<div className="flex flex-col justify-center max-w-xl">
					<h3 className="text-2xl font-bold mb-2">{t("kpiSection.title")}</h3>
					<p className="text-muted-foreground">{t("kpiSection.description")}</p>
				</div>
				{/* KPI Cards */}
				<KPICard />
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
