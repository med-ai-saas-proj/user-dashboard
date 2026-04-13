import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn/tabs";
import DashboardLayout from "@/layouts/dashboard-layout";

const DashboardPage = () => {
	const location = useLocation();
	const navigate = useNavigate();

	const currentTab = location.pathname.split("/").pop();

	return (
		<DashboardLayout pageTitle="Dashboard">
			<Tabs value={currentTab} onValueChange={(value) => navigate(value)}>
				<div className="border-b w-full">
					<TabsList variant="line">
						<TabsTrigger value="organization">{`Organization`}</TabsTrigger>
						<TabsTrigger value="project">{`Project`}</TabsTrigger>
						<TabsTrigger value="api-key">{`API Keys`}</TabsTrigger>
					</TabsList>
				</div>
			</Tabs>
			<Outlet />
		</DashboardLayout>
	);
};

export default DashboardPage;
