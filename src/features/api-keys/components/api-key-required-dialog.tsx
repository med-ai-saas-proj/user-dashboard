import { KeyIcon } from 'lucide-react';
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>API Key Required</DialogTitle>
          <DialogDescription>
            You need an API key to use this feature.
          </DialogDescription>
        </DialogHeader>
        <div className="py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-muted text-muted-foreground p-4 rounded-md">
              <KeyIcon className="size-12" />
            </div>
            <div className="text-center space-y-2">
              <p className="font-medium">No API Key</p>
              <p className="text-sm text-muted-foreground max-w-sm">
                Please create an API key to access this feature.
              </p>
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button asChild>
            <Link to="/api-keys">Create API Key</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
