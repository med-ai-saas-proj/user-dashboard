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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Save your key</DialogTitle>
          <DialogDescription>
            Please save this secret key somewhere safe and accessible. For
            security reasons, you won't be able to view it again through your
            Venera account. If you lose this secret key, you'll need to generate
            a new one.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <InputCopy copiedValue={apiKey} />
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-sm text-muted-foreground">
              This key has been automatically set for AI services
            </p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Done</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
