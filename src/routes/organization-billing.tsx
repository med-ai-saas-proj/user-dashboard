import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn/tabs";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useTranslation } from "react-i18next";

const OrganizationBilling = () => {
	const { t } = useTranslation("organization");
	const location = useLocation();
	const navigate = useNavigate();

	const currentTab = location.pathname.split("/").pop();

	return (
		<DashboardLayout pageTitle={t("billing.pageTitle")}>
			<h2 className="text-2xl font-bold mb-4">{t("billing.heading")}</h2>
			<Tabs value={currentTab} onValueChange={(value) => navigate(value)}>
				<div className="border-b w-full">
					<TabsList variant="line">
						<TabsTrigger value="overview">
							{t("billing.tabs.overview")}
						</TabsTrigger>
						<TabsTrigger value="payment-methods">
							{t("billing.tabs.payment-methods")}
						</TabsTrigger>
						<TabsTrigger value="billing-history">
							{t("billing.tabs.billing-history")}
						</TabsTrigger>
						<TabsTrigger value="credit-grants">
							{t("billing.tabs.credit-grants")}
						</TabsTrigger>
						<TabsTrigger value="activity-log">
							{t("billing.tabs.activity-log")}
						</TabsTrigger>
						{/* <TabsTrigger value="sources">
                            {t("billing.tabs.sources")}
                        </TabsTrigger> */}
					</TabsList>
				</div>

				<Outlet />
			</Tabs>
		</DashboardLayout>
	);
};

export default OrganizationBilling;
