import DashboardChart from "@/features/dashboard/components/dashboard-chart";
import DashboardTimePicker from "@/features/dashboard/components/dashboard-time-picker";
import KPICard from "@/features/dashboard/components/kpi-card";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useTranslation } from "react-i18next";

import {
	chartConfigurationVolumeAndCost,
	chartConfigurationTokenUsage,
} from "@/features/dashboard/services/charts.config";

const DashboardPage = () => {
	const { t } = useTranslation("dashboard");

	return (
		<DashboardLayout pageTitle="Dashboard">
			<div className="px-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 mb-6">
					<KPICard />
					<DashboardTimePicker />
				</div>
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
