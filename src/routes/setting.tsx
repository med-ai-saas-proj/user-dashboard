import SettingLayout from "@/layouts/setting-layout";

const SettingPage = () => {
	return (
		<SettingLayout pageTitle="Settings">
			<div className="p-4">
				<h2 className="text-2xl font-bold mb-4">Settings</h2>
				<p className="text-muted-foreground">
					Manage your account settings and preferences.
				</p>
			</div>
		</SettingLayout>
	);
};

export default SettingPage;
