import { CheckCircle2Icon, ClipboardIcon } from "lucide-react";
import Markdown from "react-markdown";
import { Button } from "@/components/shadcn/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/shadcn/dialog";
import { Separator } from "@/components/shadcn/separator";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

type AnalysisResponseDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	analysis?: string;
	reasoning?: string | null;
	isLoading?: boolean;
	error?: Error | null;
};

export function AnalysisResponseDialog({
	open,
	onOpenChange,
	analysis,
	reasoning,
	isLoading,
	error,
}: AnalysisResponseDialogProps) {
	const { copy, isCopied } = useCopyToClipboard();

	const copyAll = () => {
		const fullContent = `
# Phân tích đơn thuốc

${analysis || ""}

${reasoning ? `\n## Lý do\n\n${reasoning}` : ""}
        `.trim();
		copy(fullContent);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<div className="flex items-center justify-between gap-4">
						<div>
							<DialogTitle>Kết quả phân tích đơn thuốc</DialogTitle>
							<DialogDescription>Phân tích và tư vấn từ AI</DialogDescription>
						</div>
						{analysis && !error && (
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={copyAll}
								className="gap-2 shrink-0"
								disabled={isLoading}
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
					{error && (
						<div className="p-4 border border-destructive rounded-lg bg-destructive/10">
							<p className="text-destructive text-sm font-medium">
								Lỗi: {error.message}
							</p>
						</div>
					)}

					{analysis ? (
						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-semibold mb-3">Phân tích</h3>
								<div className="prose prose-sm max-w-none dark:prose-invert">
									<div className="flex items-end gap-1">
										<Markdown>{analysis}</Markdown>
										{isLoading && analysis === "" && (
											// Blinking cursor when waiting for stream to start
											<div className="animate-pulse bg-gray-400 w-3 h-4"> </div>
										)}
									</div>
								</div>
							</div>

							{reasoning && (
								<>
									<Separator />
									<div>
										<h3 className="text-lg font-semibold mb-3">Lý do</h3>
										<div className="prose prose-sm max-w-none dark:prose-invert">
											<Markdown>{reasoning}</Markdown>
										</div>
									</div>
								</>
							)}
						</div>
					) : (
						isLoading && (
							// Show blinking cursor when no content yet
							<div className="flex items-center gap-2 p-4">
								<span className="text-muted-foreground text-sm">
									Đang phân tích dữ liệu...
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
