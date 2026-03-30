import { useState } from "react";
import OrganizationProjectHeader from "@/features/organization/components/organization-project/organization-project-header";
import OrganizationProjectContent from "@/features/organization/components/organization-project/organization-project-content";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useTranslation } from "react-i18next";

const OrganizationProjects = () => {
	const { t } = useTranslation("organization");
	const [isArchived, setIsArchived] = useState(false);

	return (
		<DashboardLayout pageTitle={t("project.pageTitle")}>
			<h2 className="text-2xl font-bold mb-4">{t("project.heading")}</h2>
			<OrganizationProjectHeader setIsArchived={setIsArchived} />
			<OrganizationProjectContent isArchived={isArchived} />
		</DashboardLayout>
	);
};

export default OrganizationProjects;
