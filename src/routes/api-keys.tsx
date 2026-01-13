import { LockIcon, Plus } from 'lucide-react';
import { Activity, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shadcn/button';
import APIKeyDialog from '@/features/api-keys/components/api-key-dialog';
import APIKeyTable from '@/features/api-keys/components/api-key-table';
import { useAPIKeyStore } from '@/features/api-keys/store/api-key.store';
import DashboardLayout from '@/layouts/dashboard-layout';

export default function APIKeysPage() {
  const { t } = useTranslation('apiKeys');
  const [openApiKeyDialog, setOpenApiKeyDialog] = useState(false);
  const apiKeys = useAPIKeyStore((state) => state.apiKeys);
  const hasKeys = apiKeys.length > 0;

  return (
    <DashboardLayout
      pageTitle="API Keys"
      headerRight={
        <Button onClick={() => setOpenApiKeyDialog(true)}>
          <Plus /> {t('create')}
        </Button>
      }
    >
      <div>
        <p className="mb-4">
          You have permission to view and manage all API keys in this project.
        </p>
        <p className="mb-4">
          Do not share your API key with others or expose it in the browser or
          other client-side code. To protect your account's security, OpenAI may
          automatically disable any API key that has leaked publicly.
        </p>
        <p className="mb-4">View usage per API key on the Usage page.</p>

        <Activity mode={hasKeys ? 'hidden' : 'visible'}>
          <div className="flex flex-col items-center justify-center mt-20">
            <div className="bg-muted text-muted-foreground p-4 rounded-md mb-3">
              <LockIcon />
            </div>
            <p className="font-bold">
              Create an API key to access the OpenAI API
            </p>
            <Button className="mt-3" onClick={() => setOpenApiKeyDialog(true)}>
              <Plus />
              Create new secret key
            </Button>
          </div>
        </Activity>

        <Activity mode={hasKeys ? 'visible' : 'hidden'}>
          <APIKeyTable apiKeys={apiKeys} />
        </Activity>
      </div>

      <APIKeyDialog
        open={openApiKeyDialog}
        onOpenChange={setOpenApiKeyDialog}
      />
    </DashboardLayout>
  );
}
