import ProjectGeneralForm from "@/features/project/components/project-general/project-general-form";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useTranslation } from "react-i18next";

const ProjectGeneral = () => {
	const { t } = useTranslation("project");

	return (
		<DashboardLayout pageTitle={t("general.pageTitle")}>
			<h2 className="text-2xl font-bold mb-4">{t("general.heading")}</h2>
			<ProjectGeneralForm />
		</DashboardLayout>
	);
};

export default ProjectGeneral;
