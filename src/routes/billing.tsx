import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn/tabs";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useTranslation } from "react-i18next";

const Billing = () => {
	const { t } = useTranslation("organization");
	const location = useLocation();
	const navigate = useNavigate();

	const currentTab = location.pathname.split("/").pop();

	return (
		<DashboardLayout pageTitle={t("billing.pageTitle")}>
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
						<TabsTrigger value="preferences">
							{t("billing.tabs.preferences")}
						</TabsTrigger>
					</TabsList>
				</div>

				<Outlet />
			</Tabs>
		</DashboardLayout>
	);
};

export default Billing;
