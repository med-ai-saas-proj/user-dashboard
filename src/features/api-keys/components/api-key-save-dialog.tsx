import { useTranslation } from 'react-i18next';
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
import InputCopy from '@/components/shadcn/input-copy';

type APIKeySaveDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey?: string;
};

export function APIKeySaveDialog({
  open,
  onOpenChange,
  apiKey = '',
}: APIKeySaveDialogProps) {
  const { t: tCommon } = useTranslation('common');
  const { t: tApiKeys } = useTranslation('api-keys');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{tApiKeys('saveDialog.title')}</DialogTitle>
          <DialogDescription>
            {tApiKeys('saveDialog.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <InputCopy copiedValue={apiKey} />
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-sm text-muted-foreground">
              {tApiKeys('saveDialog.keySet')}
            </p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{tCommon('action.done')}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
