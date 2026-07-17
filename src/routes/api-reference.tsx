import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn/tabs";
import { getServiceOpenApiUrl } from "@/config/api-routes";
import { useApiReference } from "@/features/api-reference/hooks/use-api-reference";
import DashboardLayout from "@/layouts/dashboard-layout";
import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export default function APIReferencePage() {
	const { t } = useTranslation("common");
	const { data: availableServices, isLoading, isError } = useApiReference();
	const [selectedDoc, setSelectedDoc] = useState<string>("");

	const docTabs = useMemo(
		() => [...(availableServices ?? [])],
		[availableServices]
	);

	useEffect(() => {
		if (docTabs.length === 0) {
			setSelectedDoc("");
			return;
		}
		if (!docTabs.includes(selectedDoc)) {
			setSelectedDoc(docTabs[0]);
		}
	}, [docTabs, selectedDoc]);

	if (docTabs.length === 0) {
		return (
			<DashboardLayout pageTitle={t("api-reference")}>
				<div className="text-muted-foreground py-8">
					{t("no-api-reference")}
				</div>
			</DashboardLayout>
		);
	}

	// Guard against the "not yet initialized" render
	if (!selectedDoc) {
		return (
			<DashboardLayout pageTitle={t("api-reference")}>
				<div className="bg-white flex flex-col h-full items-center justify-center">
					<div className="animate-spin size-10 border-4 rounded-full border-muted-foreground border-t-transparent"></div>
					<p className="mt-4 text-muted-foreground">{t("loading")}</p>
				</div>
			</DashboardLayout>
		);
	}

	const docUrl = getServiceOpenApiUrl(selectedDoc);
	const selectedDocLabel =
		selectedDoc.charAt(0).toUpperCase() + selectedDoc.slice(1);

	return (
		<DashboardLayout
			pageTitle={selectedDocLabel}
			headerRight={
				<Tabs value={selectedDoc} onValueChange={setSelectedDoc}>
					<TabsList variant="line" className="flex flex-wrap">
						{docTabs.map((doc) => (
							<TabsTrigger key={doc} value={doc}>
								{doc.charAt(0).toUpperCase() + doc.slice(1)}
							</TabsTrigger>
						))}
					</TabsList>
				</Tabs>
			}
		>
			{isLoading && (
				<div className="text-muted-foreground py-8">{t("loading")}</div>
			)}
			{isError && <div className="text-destructive py-8">{t("error")}</div>}
			{!isLoading && !isError && (
				<div>
					<ApiReferenceReact
						key={selectedDoc} // force full remount when the doc/url changes
						configuration={{
							url: docUrl,
							theme: "default",
							darkMode: false,
							hideModels: true,
						}}
					/>
				</div>
			)}
		</DashboardLayout>
	);
}
