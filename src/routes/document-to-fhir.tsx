import { useState } from "react";
import { API_ROUTES } from "@/config/api-routes";
import {
	DocumentPanel,
	type DocumentConvertResult,
} from "@/features/pg-ehr-converter/components/document-panel";
import { ViewCodeDialog } from "@/components/view-code-dialog";
import { ApiTopology, TOPOLOGIES } from "@/components/api-topology";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";
import { toast } from "sonner";

const DocumentToFhirPage = () => {
	const [docLoading, setDocLoading] = useState(false);
	const [docResult, setDocResult] = useState<DocumentConvertResult | null>(
		null
	);

	const handleDocumentConvert = async (files: File[]) => {
		setDocLoading(true);

		try {
			const formData = new FormData();
			for (const f of files) {
				formData.append("files", f);
			}

			const headers = await getAuthHeaders(
				API_ROUTES.SERVICES.EHR_CONVERTER_DOCUMENT
			);
			delete headers["Content-Type"];
			const resp = await fetch(API_ROUTES.SERVICES.EHR_CONVERTER_DOCUMENT, {
				method: "POST",
				headers,
				body: formData,
			});

			if (!resp.ok) {
				const errText = await resp.text();
				throw new Error(`HTTP ${resp.status}: ${errText}`);
			}

			const json: DocumentConvertResult = await resp.json();
			setDocResult(json);

			if (json.success) {
				toast.success(
					`Extracted ${json.resource_count} FHIR resources from ${files.length} file(s)`
				);
			} else {
				toast.error(json.errors.join(", ") || "Document conversion failed");
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Request failed");
		} finally {
			setDocLoading(false);
		}
	};

	return (
		<DashboardLayout pageTitle="Document to FHIR">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-auto">
				<div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
					<div>
						<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
							Document → FHIR R4
						</h2>
						<p className="text-[11px] text-muted-foreground mt-0.5">
							Upload medical record images or PDFs — GPT-4o Vision extracts
							clinical data and converts to FHIR R4 resources
						</p>
					</div>
					<ViewCodeDialog
						endpoint={API_ROUTES.SERVICES.EHR_CONVERTER_DOCUMENT}
						method="POST"
						body={{
							files: "<multipart/form-data: image or PDF files>",
						}}
						description="Convert scanned medical documents to FHIR R4 via GPT-4o Vision"
					/>
				</div>
				<div className="flex-1 p-4 max-w-4xl mx-auto w-full">
					<DocumentPanel
						onConvert={handleDocumentConvert}
						isLoading={docLoading}
						result={docResult}
					/>
				</div>
			</div>

			<div className="px-4 py-2 border-t">
				<ApiTopology {...TOPOLOGIES.document_to_fhir} />
			</div>
		</DashboardLayout>
	);
};

export default DocumentToFhirPage;
