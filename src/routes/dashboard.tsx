import { useState, useMemo } from "react";
import DashboardChart from "@/features/dashboard/components/dashboard-chart";
import DashboardDatePicker from "@/features/dashboard/components/dashboard-date-picker";
import DashboardMonthPicker from "@/features/dashboard/components/dashboard-month-picker";
import DashboardTimeRangePicker from "@/features/dashboard/components/dashboard-time-range-picker";
import DashboardYearPicker from "@/features/dashboard/components/dashboard-year-picker";
import KPICard from "@/features/dashboard/components/kpi-card";
import DashboardLayout from "@/layouts/dashboard-layout";
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

import {
	chartConfigurationVolumeAndCost,
	chartConfigurationTokenUsage,
} from "@/features/dashboard/services/charts.config";

type TimePickerType = "date" | "month" | "date-range" | "year";

const DashboardPage = () => {
	const { t } = useTranslation("dashboard");
	const [selectedPicker, setSelectedPicker] = useState<TimePickerType>("date");

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
		<DashboardLayout pageTitle="Dashboard">
			<div className="px-6 flex flex-col gap-6 w-full">
				{/* Time Select Bar */}
				<div className="flex md:flex-row flex-col gap-2 items-center justify-between">
					<h2 className="text-lg font-semibold">Analytics</h2>
					<div className="flex items-center gap-4">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" className="gap-2">
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
				<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
					{/* Hero/Description Text */}
					<div className="flex flex-col justify-center">
						<h3 className="text-2xl font-bold mb-2">
							Key Performance Indicators
						</h3>
						<p className="text-muted-foreground">
							Track your system's performance with real-time metrics. Monitor
							total requests and costs to optimize your usage and budget
							allocation.
						</p>
					</div>
					{/* KPI Cards */}
					<div className="xl:col-span-2 w-full">
						<KPICard />
					</div>
				</div>

				{/* Charts Section */}
				<div className="flex flex-col gap-4 w-full">
					<DashboardChart
						title={t("chart.requestVolumeAndCost")}
						chartConfig={chartConfigurationVolumeAndCost}
					/>
					<DashboardChart
						title={t("chart.tokenUsageOverTime")}
						chartConfig={chartConfigurationTokenUsage}
						isTotalOnly={true}
					/>
				</div>
			</div>
		</DashboardLayout>
	);
};

export default DashboardPage;
