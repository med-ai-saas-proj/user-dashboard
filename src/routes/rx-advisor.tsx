import { useState } from 'react';
import EHRForm from '@/features/pg-ehr-summary/components/ehr-form';
import type { EHRFormData } from '@/features/pg-ehr-summary/ehr-form.type';
import { AnalysisResponse } from '@/features/rx-advisor/components/analysis-response';
import { useRxAdvisor } from '@/features/rx-advisor/hooks/use-rx-advisor';
import { ehrFormToRxAdvisorRequest } from '@/features/rx-advisor/services/rx-advisor.utils';
import DashboardLayout from '@/layouts/dashboard-layout';

const RxAdvisorPage = () => {
  const [analysis, setAnalysis] = useState<{
    analysis: string;
    reasoning: string | null;
  }>();
  const rxAdvisorMutation = useRxAdvisor();

  const handleSubmit = async (data: EHRFormData) => {
    try {
      const request = ehrFormToRxAdvisorRequest(data);
      const response = await rxAdvisorMutation.mutateAsync(request);
      setAnalysis({
        analysis: response.analysis,
        reasoning: response.reasoning,
      });
    } catch (error) {
      console.error('Failed to get prescription advice:', error);
    }
  };

  return (
    <DashboardLayout pageTitle="Tư vấn đơn thuốc">
      <div className="px-6 space-y-8">
        <EHRForm
          onSubmit={handleSubmit}
          isSubmitting={rxAdvisorMutation.isPending}
          submitButtonText="Phân tích đơn thuốc"
        />

        <AnalysisResponse
          analysis={analysis?.analysis}
          reasoning={analysis?.reasoning}
          isLoading={rxAdvisorMutation.isPending}
          error={rxAdvisorMutation.error}
        />
      </div>
    </DashboardLayout>
  );
};

export default RxAdvisorPage;
