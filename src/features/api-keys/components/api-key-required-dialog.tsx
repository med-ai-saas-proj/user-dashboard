import { KeyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn/dialog';

type ApiKeyRequiredDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ApiKeyRequiredDialog({
  open,
  onOpenChange,
}: ApiKeyRequiredDialogProps) {
  const { t: tCommon } = useTranslation('common');
  const { t: tApiKeys } = useTranslation('api-keys');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{tApiKeys('requiredDialog.title')}</DialogTitle>
          <DialogDescription>
            {tApiKeys('requiredDialog.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-muted text-muted-foreground p-4 rounded-md">
              <KeyIcon className="size-12" />
            </div>
            <div className="text-center space-y-2">
              <p className="font-medium">
                {tApiKeys('requiredDialog.noKeyState.title')}
              </p>
              <p className="text-sm text-muted-foreground max-w-sm">
                {tApiKeys('requiredDialog.noKeyState.description')}
              </p>
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tCommon('action.close')}
          </Button>
          <Button asChild>
            <Link to="/api-keys">{tApiKeys('actions.create')}</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
