import { Lock, Plus } from 'lucide-react';
import { Activity } from 'react';
import { Button } from '@/components/shadcn/button';
import { useUserAPIKeyStore } from '@/store/user-api-key-store';
import UserAPIKeyTable from './user-api-key-table';

const UserAPIKeyDashboard = () => {
  const apiKeys = useUserAPIKeyStore((state) => state.apiKeys);
  const hasKeys = apiKeys.length > 0;

  return (
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
          <div className="bg-muted-foreground p-4 rounded-md mb-3">
            <Lock />
          </div>
          <p className="font-bold">
            Create an API key to access the OpenAI API
          </p>
          <Button className="mt-3">
            <Plus />
            Create new secret key
          </Button>
        </div>
      </Activity>

      <Activity mode={hasKeys ? 'visible' : 'hidden'}>
        <UserAPIKeyTable apiKeys={apiKeys} />
      </Activity>
    </div>
  );
};

export default UserAPIKeyDashboard;
