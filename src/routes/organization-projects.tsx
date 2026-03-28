import OrganizationProjectHeader from "@/features/organization/components/organization-project/organization-project-header";
import DashboardLayout from "@/layouts/dashboard-layout";

const OrganizationProjects = () => {
	return (
		<DashboardLayout pageTitle="Organization Projects">
			<h2 className="text-2xl font-bold mb-4">Organization Projects</h2>
			<OrganizationProjectHeader />
		</DashboardLayout>
	);
};

export default OrganizationProjects;
