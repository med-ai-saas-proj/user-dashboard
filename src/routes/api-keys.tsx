import { Plus } from 'lucide-react';
import { useState } from 'react';
import UserAPIKeyDashboard from '@/components/api-key-dashboard/api-key-dashboard';
import UserAPIKeyDialog from '@/components/api-key-dashboard/api-key-dialog';
import { Button } from '@/components/shadcn/button';
import DashboardLayout from '@/layouts/dashboard-layout';

export default function APIKeysPage() {
  const [openApiKeyDialog, setOpenApiKeyDialog] = useState(false);

  return (
    <DashboardLayout
      pageTitle="API Keys"
      headerRight={
        <Button onClick={() => setOpenApiKeyDialog(true)}>
          <Plus /> Create new secret key
        </Button>
      }
    >
      <UserAPIKeyDashboard />

      <UserAPIKeyDialog
        open={openApiKeyDialog}
        onOpenChange={setOpenApiKeyDialog}
      />
    </DashboardLayout>
  );
}
