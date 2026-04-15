import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn/tabs";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useTranslation } from "react-i18next";

const DashboardPage = () => {
	const { t } = useTranslation("dashboard");

	const location = useLocation();
	const navigate = useNavigate();

	const currentTab = location.pathname.split("/").pop();

	return (
		<DashboardLayout pageTitle={t("title")}>
			<Tabs value={currentTab} onValueChange={(value) => navigate(value)}>
				<div className="border-b w-full">
					<TabsList variant="line">
						<TabsTrigger value="organization">
							{t("tabs.organization")}
						</TabsTrigger>
						<TabsTrigger value="project">{t("tabs.project")}</TabsTrigger>
					</TabsList>
				</div>
			</Tabs>
			<Outlet />
		</DashboardLayout>
	);
};

export default DashboardPage;
