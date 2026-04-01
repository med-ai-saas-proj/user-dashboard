import { useState } from "react";
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

	const pickerLabels: Record<TimePickerType, string> = {
		date: t("datePicker.label"),
		month: t("monthPicker.label"),
		"date-range": t("rangePicker.label"),
		year: t("yearPicker.label"),
	};

	const renderTimePicker = () => {
		switch (selectedPicker) {
			case "date":
				return <DashboardDatePicker />;
			case "month":
				return <DashboardMonthPicker />;
			case "date-range":
				return <DashboardTimeRangePicker />;
			case "year":
				return <DashboardYearPicker />;
			default:
				return <DashboardDatePicker />;
		}
	};

	return (
		<DashboardLayout pageTitle="Dashboard">
			<div className="px-6 flex flex-col gap-6">
				{/* Time Select Bar */}
				<div className="flex items-center justify-between">
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
					<div className="xl:col-span-2">
						<KPICard />
					</div>
				</div>

				{/* Charts Section */}
				<div className="flex flex-col gap-4">
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
