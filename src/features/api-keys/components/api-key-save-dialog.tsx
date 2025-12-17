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
import { useAPIKeyStore } from '@/features/api-keys/store/api-key.store';

const APIKeySaveDialog = ({
  open,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const newKey = useAPIKeyStore((state) => state.apiKeys.at(-1)?.secretKey);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save your key</DialogTitle>
            <DialogDescription>
              Please save your secret key in a safe place since you won't be
              able to view it again. Keep it secure, as anyone with your API key
              can make requests on your behalf. If you do lose it, you'll need
              to generate a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <InputCopy copiedValue={newKey ?? ''} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Done</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export { APIKeySaveDialog };
