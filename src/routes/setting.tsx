import DashboardLayout from "@/layouts/dashboard-layout";

const SettingPage = () => {
	return (
		<DashboardLayout pageTitle="Settings">
			<div className="p-4">
				<h2 className="text-2xl font-bold mb-4">Settings</h2>
				<p className="text-muted-foreground">
					Manage your account settings and preferences.
				</p>
			</div>
		</DashboardLayout>
	);
};

export default SettingPage;
