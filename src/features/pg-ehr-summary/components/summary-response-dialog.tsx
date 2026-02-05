import { Button } from "@/components/shadcn/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/shadcn/dialog";
import { MarkdownCustom } from "@/features/pg-chat/components/MarkdownCustom";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { CheckCircle2Icon, ClipboardIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

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
	const { t } = useTranslation("summary-response");

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<div className="flex items-center justify-between gap-4">
						<div>
							<DialogTitle>{t("dialogTitle")}</DialogTitle>
							<DialogDescription>{t("dialogDescription")}</DialogDescription>
						</div>
						{summary && !error && (
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => copy(summary)}
								className="gap-2 shrink-0"
								disabled={isLoading}
							>
								{isCopied ? (
									<>
										<CheckCircle2Icon className="size-4" />
										{t("actions.copied")}
									</>
								) : (
									<>
										<ClipboardIcon className="size-4" />
										{t("actions.copy")}
									</>
								)}
							</Button>
						)}
					</div>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto pr-2">
					{error && (
						<div className="p-4 border border-destructive rounded-lg bg-destructive/10">
							<p className="text-destructive text-sm font-medium">
								{t("errors.summaryFailed", { message: error.message })}
							</p>
						</div>
					)}

					{summary ? (
						<div className="prose prose-sm max-w-none dark:prose-invert">
							<div className="flex items-end gap-1">
								<MarkdownCustom content={summary} />
								{isLoading && summary === "" && (
									// Blinking cursor when waiting for stream to start
									<div className="animate-pulse bg-gray-400 w-3 h-4"> </div>
								)}
							</div>
						</div>
					) : (
						isLoading && (
							// Show blinking cursor when no content yet
							<div className="flex items-center gap-2 p-4">
								<span className="text-muted-foreground text-sm">
									{t("summarizing")}
								</span>
								<div className="animate-pulse bg-gray-400 w-3 h-4"> </div>
							</div>
						)
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
