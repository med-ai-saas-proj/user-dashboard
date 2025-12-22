import { CheckCircle2Icon, ClipboardIcon } from 'lucide-react';
import { Button } from '@/components/shadcn/button';
import {
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/shadcn/field';
import { Spinner } from '@/components/shadcn/spinner';
import { Textarea } from '@/components/shadcn/textarea';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

type SummaryResponseProps = {
  summary?: string;
  isLoading?: boolean;
  error?: Error | null;
};

export function SummaryResponse({
  summary,
  isLoading,
  error,
}: SummaryResponseProps) {
  const { copy, isCopied } = useCopyToClipboard();

  if (isLoading) {
    return (
      <FieldSet>
        <FieldLegend>Tóm tắt hồ sơ bệnh án</FieldLegend>
        <FieldGroup>
          <div className="flex items-center justify-center p-12 border rounded-lg bg-muted/20">
            <div className="flex flex-col items-center gap-3">
              <Spinner className="size-8" />
              <p className="text-muted-foreground text-sm">
                Đang tóm tắt hồ sơ...
              </p>
            </div>
          </div>
        </FieldGroup>
      </FieldSet>
    );
  }

  if (error) {
    return (
      <FieldSet>
        <FieldLegend>Tóm tắt hồ sơ bệnh án</FieldLegend>
        <FieldGroup>
          <div className="p-4 border border-destructive rounded-lg bg-destructive/10">
            <p className="text-destructive text-sm font-medium">
              Lỗi: {error.message}
            </p>
          </div>
        </FieldGroup>
      </FieldSet>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <FieldSet>
      <div className="flex items-center justify-between mb-3">
        <FieldLegend>Tóm tắt hồ sơ bệnh án</FieldLegend>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => copy(summary)}
          className="gap-2"
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
      </div>
      <FieldGroup>
        <div>
          <FieldLabel>Nội dung tóm tắt</FieldLabel>
          <FieldContent>
            <Textarea
              value={summary}
              readOnly
              className="min-h-[300px] resize-none bg-muted/30"
            />
          </FieldContent>
        </div>
      </FieldGroup>
    </FieldSet>
  );
}
