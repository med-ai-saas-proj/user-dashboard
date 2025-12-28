import { CheckCircle2Icon, ClipboardIcon } from 'lucide-react';
import Markdown from 'react-markdown';
import { Button } from '@/components/shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn/dialog';
import { Spinner } from '@/components/shadcn/spinner';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

type SummaryResponseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary?: string;
  isLoading?: boolean;
  error?: Error | null;
};

export function SummaryResponseDialog({
  open,
  onOpenChange,
  summary,
  isLoading,
  error,
}: SummaryResponseDialogProps) {
  const { copy, isCopied } = useCopyToClipboard();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle>Tóm tắt hồ sơ bệnh án</DialogTitle>
              <DialogDescription>
                Kết quả tóm tắt tự động từ AI
              </DialogDescription>
            </div>
            {summary && !isLoading && !error && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => copy(summary)}
                className="gap-2 shrink-0"
              >
                {isCopied ? (
                  <>
                    <CheckCircle2Icon className="size-4" />
                    Đã sao chép
                  </>
                ) : (
                  <>
                    <ClipboardIcon className="size-4" />
                    Sao chép
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          {isLoading && (
            <div className="flex items-center justify-center p-12">
              <div className="flex flex-col items-center gap-3">
                <Spinner className="size-8" />
                <p className="text-muted-foreground text-sm">
                  Đang tóm tắt hồ sơ...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 border border-destructive rounded-lg bg-destructive/10">
              <p className="text-destructive text-sm font-medium">
                Lỗi: {error.message}
              </p>
            </div>
          )}

          {summary && !isLoading && !error && (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <Markdown>{summary}</Markdown>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
