import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiReferenceReact } from "@scalar/api-reference-react";
import { API_ROUTES } from "@/config/api-routes";
import DashboardLayout from "@/layouts/dashboard-layout";
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn/tabs";
import "@scalar/api-reference-react/style.css";

export default function APIReferencePage() {
	const { t } = useTranslation("common");
	const [docType, setDocType] = useState<"management" | "service">(
		"management"
	);

	const docUrl =
		docType === "management"
			? API_ROUTES.MANAGEMENT.DOCS_MANAGEMENT_OPENAPI
			: API_ROUTES.MANAGEMENT.DOCS_SERVICES_OPENAPI;

	return (
		<DashboardLayout
			pageTitle="API Reference"
			headerRight={
				<Tabs
					value={docType}
					onValueChange={(value) =>
						setDocType(value as "management" | "service")
					}
				>
					<TabsList variant="line">
						<TabsTrigger value="management">
							{t("apiDocs.management")}
						</TabsTrigger>
						<TabsTrigger value="service">{t("apiDocs.service")}</TabsTrigger>
					</TabsList>
				</Tabs>
			}
		>
			<div>
				<ApiReferenceReact
					configuration={{
						url: docUrl,
						theme: "default",
						darkMode: false,
						hideModels: true,
					}}
				/>
			</div>
		</DashboardLayout>
	);
}
