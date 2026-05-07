import DashboardLayout from "@/layouts/dashboard-layout";
import { useTranslation } from "react-i18next";

export default function ProjectBucketsPage() {
	const { t } = useTranslation("sidebar");
	return (
		<DashboardLayout pageTitle={t("project.buckets.title", "Buckets")}>
			<div className="flex flex-col gap-6">
				<div className="flex justify-between items-center">
					<div>
						<h2 className="text-2xl font-bold tracking-tight">Buckets</h2>
						<p className="text-muted-foreground">
							Manage buckets and documents for the RAG search system.
						</p>
					</div>
				</div>

				<div className="p-8 text-center border rounded-lg bg-card text-card-foreground shadow-sm">
					<p className="text-muted-foreground">
						Bucket management UI will be implemented here.
					</p>
				</div>
			</div>
		</DashboardLayout>
	);
}
