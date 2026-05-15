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
import { useUpdateProjectStorageFileMetadata } from "@/features/project/hooks/project-storage-files/use-update-project-storage-file-metadata";
import type { ProjectRagFile } from "@/features/project/services/project-files.dto";
import { X } from "lucide-react";
import { toast } from "sonner";

type ProjectBucketsTagDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projectId: string;
	selectedFile: ProjectRagFile | null;
};

export default function ProjectBucketsTagDialog({
	open,
	onOpenChange,
	projectId,
	selectedFile,
}: ProjectBucketsTagDialogProps) {
	const { t } = useTranslation(["bucket", "common"]);
	const updateMetadataMutation = useUpdateProjectStorageFileMetadata();
	const [tagKeyInput, setTagKeyInput] = useState("");
	const [tagValueInput, setTagValueInput] = useState("");
	const [tempTags, setTempTags] = useState<string[]>([]);

	useEffect(() => {
		if (open && selectedFile) {
			setTempTags(selectedFile.tags);
			setTagKeyInput("");
			setTagValueInput("");
		}
	}, [open, selectedFile]);

	const addTempTag = () => {
		const key = tagKeyInput.trim();
		const value = tagValueInput.trim();
		if (!key) {
			return;
		}

		let newTag = key;
		if (value) {
			newTag += `: ${value}`;
		}

		if (!tempTags.includes(newTag)) {
			setTempTags([...tempTags, newTag]);
		}
		setTagKeyInput("");
		setTagValueInput("");
	};

	const saveTags = async () => {
		if (!selectedFile || !projectId) {
			return;
		}

		try {
			const extraMetadata: Record<string, unknown> = {};
			for (const tag of tempTags) {
				const separatorIndex = tag.indexOf(":");
				if (separatorIndex === -1) {
					extraMetadata[tag.trim()] = true;
				} else {
					const key = tag.substring(0, separatorIndex).trim();
					const val = tag.substring(separatorIndex + 1).trim();
					if (val === "true") extraMetadata[key] = true;
					else if (val === "false") extraMetadata[key] = false;
					else if (!Number.isNaN(Number(val)) && val !== "") {
						extraMetadata[key] = Number(val);
					} else {
						extraMetadata[key] = val;
					}
				}
			}

			await updateMetadataMutation.mutateAsync({
				projectId,
				fileId: selectedFile.id,
				extraMetadata,
			});
			toast.success(t("bucket:messages.tagsUpdated"));
			onOpenChange(false);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: t("bucket:messages.tagsUpdateError")
			);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{t("bucket:tagDialog.title")}</DialogTitle>
					<DialogDescription>
						{t("bucket:tagDialog.description", {
							fileName:
								selectedFile?.filename ||
								t("bucket:tagDialog.fallbackFileName"),
						})}
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="tags-key">{t("bucket:tagDialog.label")}</Label>
						<div className="mb-2 flex flex-wrap gap-2">
							{tempTags.map((tag) => (
								<span
									key={tag}
									className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2.5 py-1 text-sm font-medium text-foreground"
								>
									{tag}
									<button
										type="button"
										onClick={() =>
											setTempTags(tempTags.filter((item) => item !== tag))
										}
										className="rounded-full text-muted-foreground hover:text-foreground focus:outline-none"
									>
										<X className="size-3" />
									</button>
								</span>
							))}
						</div>
						<div className="flex gap-2">
							<Input
								id="tags-key"
								placeholder="Key (e.g., type)"
								value={tagKeyInput}
								onChange={(event) => setTagKeyInput(event.target.value)}
								onKeyDown={(event) => {
									if (event.key === "Enter") {
										event.preventDefault();
										addTempTag();
									}
								}}
								className="flex-1"
							/>
							<Input
								id="tags-value"
								placeholder="Value (e.g., film)"
								value={tagValueInput}
								onChange={(event) => setTagValueInput(event.target.value)}
								onKeyDown={(event) => {
									if (event.key === "Enter") {
										event.preventDefault();
										addTempTag();
									}
								}}
								className="flex-1"
							/>
							<Button type="button" onClick={addTempTag} variant="secondary">
								Add
							</Button>
						</div>
						<p className="text-xs text-muted-foreground">
							Enter a key and an optional value to add it as metadata.
						</p>
					</div>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">{t("common:action.cancel")}</Button>
					</DialogClose>
					<Button
						onClick={saveTags}
						disabled={updateMetadataMutation.isPending}
					>
						{updateMetadataMutation.isPending ? (
							<Spinner className="size-4" />
						) : null}
						{t("common:action.save")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
