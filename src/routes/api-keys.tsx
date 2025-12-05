import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/shadcn/button';
import UserAPIKeyDashboard from '@/components/user-api-key-dashboard/user-api-key-dashboard';
import UserAPIKeyDialog from '@/components/user-api-key-dashboard/user-api-key-dialog';
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
