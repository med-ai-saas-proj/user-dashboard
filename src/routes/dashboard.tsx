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
				<div className="grid grid-cols-1 gap-x-4 mb-6 xl:grid-cols-2 2xl:grid-cols-3">
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
