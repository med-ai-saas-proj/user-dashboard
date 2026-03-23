import DashboardLayout from "@/layouts/dashboard-layout";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn/tabs";

const ProjectPeople = () => {
	const { t } = useTranslation("project");
	const location = useLocation();
	const navigate = useNavigate();

	const currentTab = location.pathname.split("/").pop();

	return (
		<DashboardLayout pageTitle={t("people.pageTitle")}>
			<h2 className="text-2xl font-bold mb-4">{t("people.heading")}</h2>
			<Tabs value={currentTab} onValueChange={(value) => navigate(value)}>
				<div className="border-b w-full">
					<TabsList variant="line">
						<TabsTrigger value="members">
							{t("people.tabs.members")}
						</TabsTrigger>
						<TabsTrigger value="roles">{t("people.tabs.roles")}</TabsTrigger>
					</TabsList>
				</div>
				<Outlet />
			</Tabs>
		</DashboardLayout>
	);
};

export default ProjectPeople;
