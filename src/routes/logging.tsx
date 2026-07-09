import Logging from "@/features/logging/components/logging";
import DashboardLayout from "@/layouts/dashboard-layout";

export default function LoggingPage() {
	return (
		<DashboardLayout pageTitle="Logging">
			<Logging />
		</DashboardLayout>
	);
}
