import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiKeyRequiredDialog } from "@/features/api-keys/components/api-key-required-dialog";
import { useServiceApiKeyStore } from "@/features/api-keys/store/service-api-key.store";
import EHRForm from "@/features/pg-ehr-summary/components/ehr-form";
import type { EHRFormData } from "@/features/pg-ehr-summary/ehr-form.type";
import { AnalysisResponseDialog } from "@/features/pg-rx-advisor/components/analysis-response-dialog";
import { useRxAdvisor } from "@/features/pg-rx-advisor/hooks/use-rx-advisor";
import { ehrFormToRxAdvisorRequest } from "@/features/pg-rx-advisor/utils/rx-advisor.utils";
import DashboardLayout from "@/layouts/dashboard-layout";

const RxAdvisorPage = () => {
	const { t } = useTranslation("playground-rx-advisor");

	const [analysis, setAnalysis] = useState<{
		analysis: string;
		reasoning: string | null;
	}>();
	const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
	const [showResultDialog, setShowResultDialog] = useState(false);
	const rxAdvisorMutation = useRxAdvisor();
	const { selectedApiKey } = useServiceApiKeyStore();

	const handleSubmit = async (data: EHRFormData) => {
		if (!selectedApiKey) {
			setShowApiKeyDialog(true);
			return;
		}

		try {
			const request = ehrFormToRxAdvisorRequest(data);
			const response = await rxAdvisorMutation.mutateAsync(request);
			setAnalysis({
				analysis: response.analysis,
				reasoning: response.reasoning,
			});
			setShowResultDialog(true);
		} catch (error) {
			console.error("Failed to get prescription advice:", error);
			setShowResultDialog(true);
		}
	};

	return (
		<DashboardLayout pageTitle={t("pageTitle")}>
			<div className="px-6 space-y-8">
				<EHRForm
					onSubmit={handleSubmit}
					isSubmitting={rxAdvisorMutation.isPending}
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
				analysis={analysis?.analysis}
				reasoning={analysis?.reasoning}
				isLoading={rxAdvisorMutation.isPending}
				error={rxAdvisorMutation.error}
			/>
		</DashboardLayout>
	);
};

export default RxAdvisorPage;
