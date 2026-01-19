import { LockIcon, Plus } from 'lucide-react';
import { Activity, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shadcn/button';
import APIKeyDialog from '@/features/api-keys/components/api-key-dialog';
import APIKeyTable from '@/features/api-keys/components/api-key-table';
import { useAPIKeyStore } from '@/features/api-keys/store/api-key.store';
import DashboardLayout from '@/layouts/dashboard-layout';

export default function APIKeysPage() {
  const { t } = useTranslation('api-keys');

  const [openApiKeyDialog, setOpenApiKeyDialog] = useState(false);
  const apiKeys = useAPIKeyStore((state) => state.apiKeys);
  const hasKeys = apiKeys.length > 0;

  return (
    <DashboardLayout
      pageTitle={t('pageTitle')}
      headerRight={
        <Button onClick={() => setOpenApiKeyDialog(true)}>
          <Plus /> {t('actions.create')}
        </Button>
      }
    >
      <div>
        <p className="mb-4">{t('description.permissions')}</p>
        <p className="mb-4">{t('description.security')}</p>
        <p className="mb-4">{t('description.usage')}</p>

        <Activity mode={hasKeys ? 'hidden' : 'visible'}>
          <div className="flex flex-col items-center justify-center mt-20">
            <div className="bg-muted text-muted-foreground p-4 rounded-md mb-3">
              <LockIcon />
            </div>
            <p className="font-bold">{t('emptyState.title')}</p>
            <Button className="mt-3" onClick={() => setOpenApiKeyDialog(true)}>
              <Plus />
              {t('actions.createSecret')}
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
