import EHRForm from '@/features/pg-ehr-summary/components/ehr-form';
import DashboardLayout from '@/layouts/dashboard-layout';

const EHRSummaryPage = () => {
  return (
    <DashboardLayout pageTitle="EHR Summary">
      <div className="px-6">
        <EHRForm />
      </div>
    </DashboardLayout>
  );
};

export default EHRSummaryPage;
