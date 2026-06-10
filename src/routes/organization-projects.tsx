import { useState } from "react";
import OrganizationProjectHeader from "@/features/organization/components/organization-project/organization-project-header";
import OrganizationProjectContent from "@/features/organization/components/organization-project/organization-project-content";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { itemVariants } from "@/lib/animations";

const OrganizationProjects = () => {
	const { t } = useTranslation("organization");
	const [isArchived, setIsArchived] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	return (
		<DashboardLayout pageTitle={t("project.pageTitle")}>
			<h2 className="text-2xl font-bold mb-4">{t("project.heading")}</h2>
			<motion.div
				initial="hidden"
				animate="visible"
				variants={itemVariants}
				className="flex flex-col gap-y-6"
			>
				<OrganizationProjectHeader
					setIsArchived={setIsArchived}
					onSearch={setSearchQuery}
				/>
				<OrganizationProjectContent
					isArchived={isArchived}
					searchQuery={searchQuery}
				/>
			</motion.div>
		</DashboardLayout>
	);
};

export default OrganizationProjects;
