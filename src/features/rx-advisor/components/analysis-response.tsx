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

type AnalysisResponseProps = {
  analysis?: string;
  reasoning?: string | null;
  isLoading?: boolean;
  error?: Error | null;
};

export function AnalysisResponse({
  analysis,
  reasoning,
  isLoading,
  error,
}: AnalysisResponseProps) {
  const { copy, isCopied } = useCopyToClipboard();

  if (isLoading) {
    return (
      <FieldSet>
        <FieldLegend>Kết quả phân tích</FieldLegend>
        <FieldGroup>
          <div className="flex items-center justify-center p-12 border rounded-lg bg-muted/20">
            <div className="flex flex-col items-center gap-3">
              <Spinner className="size-8" />
              <p className="text-muted-foreground text-sm">
                Đang phân tích dữ liệu...
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
        <FieldLegend>Kết quả phân tích</FieldLegend>
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

  if (!analysis) {
    return null;
  }

  return (
    <FieldSet>
      <div className="flex items-center justify-between mb-3">
        <FieldLegend>Kết quả phân tích</FieldLegend>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => copy(analysis)}
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
        <div className="space-y-4">
          <div>
            <FieldLabel>Phân tích</FieldLabel>
            <FieldContent>
              <Textarea
                value={analysis}
                readOnly
                className="min-h-[200px] resize-none bg-muted/30"
              />
            </FieldContent>
          </div>

          {reasoning && (
            <div>
              <FieldLabel>Lý do</FieldLabel>
              <FieldContent>
                <Textarea
                  value={reasoning}
                  readOnly
                  className="min-h-[150px] resize-none bg-muted/30"
                />
              </FieldContent>
            </div>
          )}
        </div>
      </FieldGroup>
    </FieldSet>
  );
}
