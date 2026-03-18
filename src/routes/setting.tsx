import DashboardLayout from "@/layouts/dashboard-layout";
import { useTranslation } from "react-i18next";

const SettingPage = () => {
	const { t } = useTranslation("setting");

	return (
		<DashboardLayout pageTitle={t("title")}>
			<div className="p-4">
				<h2 className="text-2xl font-bold mb-4">{t("title")}</h2>
				<p className="text-muted-foreground">{t("description")}</p>
			</div>
		</DashboardLayout>
	);
};

export default SettingPage;
