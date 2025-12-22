import { useState } from 'react';
import { ApiKeyRequiredDialog } from '@/features/api-keys/components/api-key-required-dialog';
import { useServiceApiKeyStore } from '@/features/api-keys/store/service-api-key.store';
import EHRForm from '@/features/pg-ehr-summary/components/ehr-form';
import { SummaryResponse } from '@/features/pg-ehr-summary/components/summary-response';
import type { EHRFormData } from '@/features/pg-ehr-summary/ehr-form.type';
import { useSummarizeEHR } from '@/features/pg-ehr-summary/hooks/use-summarize-ehr';
import { ehrFormToSummaryRequest } from '@/features/rx-advisor/services/rx-advisor.utils';
import DashboardLayout from '@/layouts/dashboard-layout';

const EHRSummaryPage = () => {
  const [summary, setSummary] = useState<string>();
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const summarizeMutation = useSummarizeEHR();
  const { selectedApiKey } = useServiceApiKeyStore();

  const handleSubmit = async (data: EHRFormData) => {
    // Check if API key is selected
    if (!selectedApiKey) {
      setShowApiKeyDialog(true);
      return;
    }

    try {
      const request = ehrFormToSummaryRequest(data);
      const response = await summarizeMutation.mutateAsync(request);
      setSummary(response.summary);
    } catch (error) {
      console.error('Failed to summarize EHR:', error);
    }
  };

  return (
    <DashboardLayout pageTitle="Tóm tắt hồ sơ bệnh án">
      <div className="px-6 space-y-8">
        <EHRForm
          onSubmit={handleSubmit}
          isSubmitting={summarizeMutation.isPending}
          submitButtonText="Tóm tắt hồ sơ"
        />

        <SummaryResponse
          summary={summary}
          isLoading={summarizeMutation.isPending}
          error={summarizeMutation.error}
        />
      </div>

      <ApiKeyRequiredDialog
        open={showApiKeyDialog}
        onOpenChange={setShowApiKeyDialog}
      />
    </DashboardLayout>
  );
};

export default EHRSummaryPage;
