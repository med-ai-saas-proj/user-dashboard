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
import { Spinner } from "@/components/shadcn/spinner";
import { useDeleteProjectStorageFile } from "@/features/project/hooks/project-storage-files/use-delete-project-storage-file";
import type { ProjectRagFile } from "@/features/project/services/project-files.dto";
import { toast } from "sonner";

type ProjectBucketsDeleteDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projectId: string;
	fileToDelete: ProjectRagFile | null;
	fileNameLabel: string;
};

export default function ProjectBucketsDeleteDialog({
	open,
	onOpenChange,
	projectId,
	fileToDelete,
	fileNameLabel,
}: ProjectBucketsDeleteDialogProps) {
	const { t } = useTranslation(["bucket", "common"]);
	const deleteMutation = useDeleteProjectStorageFile();

	const confirmDeleteFile = async () => {
		if (!fileToDelete) {
			return;
		}

		try {
			await deleteMutation.mutateAsync({
				projectId,
				fileId: fileToDelete.id,
			});
			toast.success(t("bucket:messages.deleted"));
			onOpenChange(false);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: t("bucket:messages.deleteError")
			);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>
						{t("bucket:messages.deleteConfirmTitle", "Delete File")}
					</DialogTitle>
					<DialogDescription>
						{t("bucket:messages.deleteConfirm", { fileName: fileNameLabel })}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">{t("common:action.cancel")}</Button>
					</DialogClose>
					<Button
						variant="destructive"
						onClick={confirmDeleteFile}
						disabled={deleteMutation.isPending}
					>
						{deleteMutation.isPending ? <Spinner className="size-4" /> : null}
						{t("common:action.confirm", "Delete")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
