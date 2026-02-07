import { useState } from "react";
import { useTranslation } from "react-i18next";
import { API_ROUTES } from "@/config/api-routes";
import { ApiKeyRequiredDialog } from "@/features/api-keys/components/api-key-required-dialog";
import { useServiceApiKeyStore } from "@/features/api-keys/store/service-api-key.store";
import EHRForm from "@/features/pg-ehr-summary/components/ehr-form";
import type { EHRFormData } from "@/features/pg-ehr-summary/ehr-form.type";
import { AnalysisResponseDialog } from "@/features/pg-rx-advisor/components/analysis-response-dialog";
import type { RxAdvisorStreamRequest } from "@/features/pg-rx-advisor/services/rx-advisor.dto";
import { ehrFormToRxAdvisorStreamRequest } from "@/features/pg-rx-advisor/utils/rx-advisor.utils";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useStream } from "@/lib/streaming/use-stream";
import { toast } from "sonner";

const RxAdvisorPage = () => {
	const { t } = useTranslation("playground-rx-advisor");
	const { t: tCommon } = useTranslation("common");

	const [analysis, setAnalysis] = useState<string>("");
	const [reasoning, setReasoning] = useState<string | null>(null);
	const [conversationId, setConversationId] = useState<string | null>(null);
	const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
	const [showResultDialog, setShowResultDialog] = useState(false);
	const { startStream, isStreaming } = useStream<RxAdvisorStreamRequest>();
	const { selectedApiKey } = useServiceApiKeyStore();

	const handleSubmit = (data: EHRFormData) => {
		if (!selectedApiKey) {
			setShowApiKeyDialog(true);
			return;
		}

		// Reset content and show dialog
		setAnalysis("");
		setReasoning(null);
		setShowResultDialog(true);

		const request = ehrFormToRxAdvisorStreamRequest(
			data,
			"gpt-4o-mini",
			conversationId
		);

		startStream(
			{
				url: API_ROUTES.SERVICES.RX_ADVISOR,
				request,
			},
			{
				onConversationIdUpdate: (convId) => {
					setConversationId(convId);
				},
				onContentUpdate: (content) => {
					setAnalysis(content);
				},
				onError: (error) => {
					console.error("RX Advisor streaming error:", error);
				},
				onComplete: () => {
					toast.success(tCommon("requestDone"));
				},
			}
		);
	};

	return (
		<DashboardLayout pageTitle={t("pageTitle")}>
			<div className="px-6 space-y-8">
				<EHRForm
					onSubmit={handleSubmit}
					isSubmitting={isStreaming}
					submitButtonText={t("action.submit")}
				/>
			</div>

			<ApiKeyRequiredDialog
				open={showApiKeyDialog}
				onOpenChange={setShowApiKeyDialog}
			/>

			<AnalysisResponseDialog
				open={showResultDialog}
				onOpenChange={setShowResultDialog}
				analysis={analysis}
				reasoning={reasoning}
				isLoading={isStreaming}
			/>
		</DashboardLayout>
	);
};

export default RxAdvisorPage;
