import OrganizationProjectHeader from "@/features/organization/components/organization-project/organization-project-header";
import OrganizationProjectContent from "@/features/organization/components/organization-project/organization-project-content";
import DashboardLayout from "@/layouts/dashboard-layout";

const OrganizationProjects = () => {
	return (
		<DashboardLayout pageTitle="Organization Projects">
			<h2 className="text-2xl font-bold mb-4">Organization Projects</h2>
			<OrganizationProjectHeader />
			<OrganizationProjectContent />
		</DashboardLayout>
	);
};

export default OrganizationProjects;
