import { useState } from "react";
import { API_ROUTES } from "@/config/api-routes";
import { ApiKeyRequiredDialog } from "@/features/api-keys/components/api-key-required-dialog";
import { useServiceApiKeyStore } from "@/features/api-keys/store/service-api-key.store";
import EHRForm from "@/features/pg-ehr-summary/components/ehr-form";
import { SummaryResponseDialog } from "@/features/pg-ehr-summary/components/summary-response-dialog";
import type { EHRFormData } from "@/features/pg-ehr-summary/ehr-form.type";
import type { EHRSummaryStreamRequest } from "@/features/pg-ehr-summary/services/ehr-summary.dto";
import { ehrFormToStreamRequest } from "@/features/pg-ehr-summary/utils/ehr-summary.utils";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useStream } from "@/lib/streaming/use-stream";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const EHRSummaryPage = () => {
	const { t: tCommon } = useTranslation("common");
	const [summary, setSummary] = useState<string>("");
	const [conversationId, setConversationId] = useState<string | null>(null);
	const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
	const [showResultDialog, setShowResultDialog] = useState(false);
	const { startStream, isStreaming } = useStream<EHRSummaryStreamRequest>();
	const { selectedApiKey } = useServiceApiKeyStore();

	const handleSubmit = (data: EHRFormData) => {
		// Check if API key is selected
		if (!selectedApiKey) {
			setShowApiKeyDialog(true);
			return;
		}

		// Reset summary and show dialog
		setSummary("");
		setShowResultDialog(true);

		const request = ehrFormToStreamRequest(data, "gpt-4o-mini", conversationId);

		startStream(
			{
				url: API_ROUTES.SERVICES.EHR_SUMMARIZE,
				request,
			},
			{
				onConversationIdUpdate: (convId) => {
					setConversationId(convId);
				},
				onContentUpdate: (content) => {
					setSummary(content);
				},
				onError: (error) => {
					console.error("EHR summary streaming error:", error);
				},
				onComplete: () => {
					toast.success(tCommon("requestDone"));
				},
			}
		);
	};

	return (
		<DashboardLayout pageTitle="Tóm tắt hồ sơ bệnh án">
			<div className="px-6 space-y-8">
				<EHRForm
					onSubmit={handleSubmit}
					isSubmitting={isStreaming}
					submitButtonText="Tóm tắt hồ sơ"
				/>
			</div>

			<ApiKeyRequiredDialog
				open={showApiKeyDialog}
				onOpenChange={setShowApiKeyDialog}
			/>

			<SummaryResponseDialog
				open={showResultDialog}
				onOpenChange={setShowResultDialog}
				summary={summary}
				isLoading={isStreaming}
			/>
		</DashboardLayout>
	);
};

export default EHRSummaryPage;
