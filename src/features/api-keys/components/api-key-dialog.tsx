import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/shadcn/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn/dialog';
import { Input } from '@/components/shadcn/input';
import { Label } from '@/components/shadcn/label';
import type { APIKey } from '@/features/api-keys/api-key.type';
import { useCreateApiKey } from '@/features/api-keys/hooks/use-create-api-key';
import { useAPIKeyStore } from '@/features/api-keys/store/api-key.store';
import { useServiceApiKeyStore } from '@/features/api-keys/store/service-api-key.store';
import { APIKeySaveDialog } from './api-key-save-dialog';

const apiCreationSchema = z.object({
  name: z.string().min(1, 'Name must be at least 1 character long'),
});

type ApiCreationFormData = z.infer<typeof apiCreationSchema>;

const APIKeyDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const addAPIKey = useAPIKeyStore((state) => state.addAPIKey);
  const setSelectedApiKey = useServiceApiKeyStore(
    (state) => state.setSelectedApiKey
  );
  const createApiKeyMutation = useCreateApiKey();

  const [openSave, setOpenSave] = useState(false);
  const [createdKey, setCreatedKey] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApiCreationFormData>({
    resolver: zodResolver(apiCreationSchema),
  });

  const onSubmit = async (data: ApiCreationFormData) => {
    const response = await createApiKeyMutation.mutateAsync({
      name: data.name,
      project_id: 'default',
      permissions: ['placeholder'],
    });

    const newKey: Omit<APIKey, 'id' | 'createdAt' | 'lastUsed'> = {
      name: data.name,
      secretKey: response.secretKey,
      createdBy: 'Current User',
      permissions: ['placeholder'],
    };

    addAPIKey(newKey);

    // Automatically set this as the service API key
    setSelectedApiKey(response.secretKey);
    setCreatedKey(response.secretKey);

    setOpenSave(true);
    onOpenChange(false);
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create new secret key</DialogTitle>
            <DialogDescription>
              This API key is tied to your user and can make requests against
              the selected project. If you are removed from the organiation or
              project, this key will be disabled.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid gap-3">
                <Label>Name</Label>
                <Input
                  id="name"
                  placeholder="My API Key"
                  aria-invalid={!!errors.name}
                  {...register('name')}
                />
                <div className="h-5 mt-1.5 px-4">
                  {errors.name && (
                    <p className="text-destructive text-xs">
                      {errors.name.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={createApiKeyMutation.isPending}>
                {createApiKeyMutation.isPending
                  ? 'Creating...'
                  : 'Create secret key'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <APIKeySaveDialog
        open={openSave}
        onOpenChange={setOpenSave}
        apiKey={createdKey}
      />
    </div>
  );
};

export default APIKeyDialog;
