import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/shadcn/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/shadcn/dialog";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { Spinner } from "@/components/shadcn/spinner";
import { useQueryProjectRagByText } from "@/features/project/hooks/project-rag-files/use-query-project-rag-by-text";
import type { ProjectRagQueryResult } from "@/features/project/services/project-files.dto";
import { formatFileSize, getFileTypeLabel } from "./project-buckets.utils";
import { toast } from "sonner";

type ProjectBucketsQueryDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projectId: string;
};

export default function ProjectBucketsQueryDialog({
	open,
	onOpenChange,
	projectId,
}: ProjectBucketsQueryDialogProps) {
	const { t } = useTranslation(["bucket", "common"]);
	const queryRagMutation = useQueryProjectRagByText();
	const [queryText, setQueryText] = useState("");
	const [queryResults, setQueryResults] = useState<ProjectRagQueryResult[]>([]);

	useEffect(() => {
		if (!open) {
			setQueryText("");
			setQueryResults([]);
		}
	}, [open]);

	const runRagQuery = async () => {
		const normalizedQuery = queryText.trim();

		if (!normalizedQuery) {
			toast.error(
				t("bucket:rag.queryRequired", "Enter a query to search the RAG.")
			);
			return;
		}

		try {
			const results = await queryRagMutation.mutateAsync({
				projectId,
				queryText: normalizedQuery,
			});
			setQueryResults(results);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: t("bucket:rag.queryError", "Failed to query the RAG.")
			);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[720px]">
				<DialogHeader>
					<DialogTitle>{t("bucket:rag.queryTitle", "Query RAG")}</DialogTitle>
					<DialogDescription>
						{t(
							"bucket:rag.queryDescription",
							"Search the RAG and view the matching chunks returned by the backend."
						)}
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(event) => {
						event.preventDefault();
						void runRagQuery();
					}}
					className="grid gap-4"
				>
					<div className="grid gap-2">
						<Label htmlFor="rag-query-input">
							{t("bucket:rag.queryLabel", "Query")}
						</Label>
						<div className="flex gap-2">
							<Input
								id="rag-query-input"
								placeholder={t(
									"bucket:rag.queryPlaceholder",
									"Ask something about the RAG content"
								)}
								value={queryText}
								onChange={(event) => setQueryText(event.target.value)}
								onKeyDown={(event) => {
									if (event.key === "Enter") {
										event.preventDefault();
										void runRagQuery();
									}
								}}
							/>
							<Button type="submit" disabled={queryRagMutation.isPending}>
								{queryRagMutation.isPending ? (
									<Spinner className="size-4" />
								) : null}
								{t("bucket:rag.queryAction", "Query")}
							</Button>
						</div>
					</div>
				</form>

				<div className="grid gap-3">
					<div className="flex items-center justify-between">
						<p className="text-sm font-medium text-foreground">
							{t("bucket:rag.resultsTitle", "Results")}
						</p>
						<p className="text-xs text-muted-foreground">
							{queryResults.length} result{queryResults.length === 1 ? "" : "s"}
						</p>
					</div>
					<div className="max-h-[50vh] space-y-3 overflow-auto pr-1">
						{queryRagMutation.isPending ? (
							<div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-10 text-sm text-muted-foreground">
								<Spinner className="size-4" />
								{t("bucket:rag.searching", "Searching the RAG...")}
							</div>
						) : queryResults.length > 0 ? (
							queryResults.map((result, index) => (
								<div
									key={`${result.file.id}-${result.createdAt.toISOString()}-${index}`}
									className="rounded-lg border border-border bg-background p-4"
								>
									<p className="truncate text-sm font-semibold text-foreground">
										{result.file.filename}
									</p>
									<p className="text-xs text-muted-foreground">
										{getFileTypeLabel(
											result.file.mimeType,
											result.file.filename
										)}
										{` • ${formatFileSize(result.file.size)} • ${result.createdAt.toLocaleString()}`}
									</p>
									<p className="mt-3 text-sm leading-6 text-muted-foreground">
										{result.text}
									</p>
								</div>
							))
						) : (
							<div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
								{t(
									"bucket:rag.emptyResults",
									"Run a query to see matching chunks here."
								)}
							</div>
						)}
					</div>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							{t("common:action.close", "Close")}
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
