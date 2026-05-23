import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/shadcn/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/shadcn/dialog";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/shadcn/select";
import { Spinner } from "@/components/shadcn/spinner";
import type { ProjectRagFile } from "@/features/project/services/project-files.dto";

type AddRagDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	file: ProjectRagFile | null;
	onConfirm: (
		fileId: string,
		params: {
			chunkSplitter: "simple" | "recursive" | "spacy";
			chunkSize: number;
			chunkOverlap: number;
		}
	) => Promise<void>;
	isPending: boolean;
};

export default function ProjectBucketsAddRagDialog({
	open,
	onOpenChange,
	file,
	onConfirm,
	isPending,
}: AddRagDialogProps) {
	const { t } = useTranslation(["bucket", "common"]);
	const [chunkSplitter, setChunkSplitter] = useState<
		"simple" | "recursive" | "spacy"
	>("recursive");
	const [chunkSize, setChunkSize] = useState(1000);
	const [chunkOverlap, setChunkOverlap] = useState(150);

	useEffect(() => {
		if (open) {
			setChunkSplitter("recursive");
			setChunkSize(1000);
			setChunkOverlap(150);
		}
	}, [open]);

	if (!file) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await onConfirm(file.id, { chunkSplitter, chunkSize, chunkOverlap });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>
						{t("bucket:rag.addTitle", "Add File to RAG")}
					</DialogTitle>
					<DialogDescription>
						{t(
							"bucket:rag.addDescription",
							"Configure parameters for processing the file for RAG."
						)}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label>{t("bucket:rag.chunkSplitter", "Chunk Splitter")}</Label>
						<Select
							value={chunkSplitter}
							onValueChange={(val: any) => setChunkSplitter(val)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="recursive">Recursive</SelectItem>
								<SelectItem value="simple">Simple</SelectItem>
								<SelectItem value="spacy">Spacy</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="grid gap-2">
						<Label>{t("bucket:rag.chunkSize", "Chunk Size")}</Label>
						<Input
							type="number"
							min={1}
							value={chunkSize}
							onChange={(e) => setChunkSize(parseInt(e.target.value) || 1000)}
							required
						/>
					</div>
					<div className="grid gap-2">
						<Label>{t("bucket:rag.chunkOverlap", "Chunk Overlap")}</Label>
						<Input
							type="number"
							min={0}
							value={chunkOverlap}
							onChange={(e) => setChunkOverlap(parseInt(e.target.value) || 0)}
							required
						/>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isPending}
						>
							{t("common:cancel", "Cancel")}
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending && <Spinner className="mr-2 size-4" />}
							{t("bucket:rag.confirmAdd", "Process File")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
