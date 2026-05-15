import type { ChangeEvent, DragEvent } from "react";
import { useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FolderSearch } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/layouts/dashboard-layout";
import { Card, CardContent } from "@/components/shadcn/card";
import { useProjectStore } from "@/features/project/store/project";
import { useGetProjectRagFiles } from "@/features/project/hooks/project-rag-files/use-get-project-rag-files";
import { useAddProjectRagFile } from "@/features/project/hooks/project-rag-files/use-add-project-rag-file";
import { useGetProjectStorageFiles } from "@/features/project/hooks/project-storage-files/use-get-project-storage-files";
import { useUploadProjectStorageFile } from "@/features/project/hooks/project-storage-files/use-upload-project-storage-file";
import type { ProjectRagFile } from "@/features/project/services/project-files.dto";
import { getProjectStorageFileDownloadUrl } from "@/features/project/services/project-storage-files/get-project-storage-file-download-url";
import ProjectBucketsDeleteDialog from "@/features/project/components/project-buckets/project-buckets-delete-dialog";
import ProjectBucketsQueryDialog from "@/features/project/components/project-buckets/project-buckets-query-dialog";
import ProjectBucketsTagDialog from "@/features/project/components/project-buckets/project-buckets-tag-dialog";
import ProjectBucketsTabs from "@/features/project/components/project-buckets/project-buckets-tabs";
import ProjectBucketsUploadCard from "@/features/project/components/project-buckets/project-buckets-upload-card";
import {
	MAX_FILE_SIZE_BYTES,
	isSupportedFile,
} from "@/features/project/components/project-buckets/project-buckets.utils";

export default function ProjectBucketsPage() {
	const params = useParams();
	const projectId =
		useProjectStore((state) => state.projectId) || params.projectId || "";
	const { t } = useTranslation(["sidebar", "common", "bucket"]);
	const inputRef = useRef<HTMLInputElement>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [isDragging, setIsDragging] = useState(false);
	const [tagDialogOpen, setTagDialogOpen] = useState(false);
	const [selectedFile, setSelectedFile] = useState<ProjectRagFile | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [fileToDelete, setFileToDelete] = useState<ProjectRagFile | null>(null);
	const [queryDialogOpen, setQueryDialogOpen] = useState(false);

	const {
		data: files = [],
		isLoading,
		isFetching,
	} = useGetProjectStorageFiles(projectId);

	const {
		data: ragFiles = [],
		isLoading: isRagLoading,
		isFetching: isRagFetching,
	} = useGetProjectRagFiles(projectId);

	const uploadMutation = useUploadProjectStorageFile();
	const addRagFileMutation = useAddProjectRagFile();

	const filteredFiles = useMemo(() => {
		const normalizedSearch = searchQuery.trim().toLowerCase();

		if (!normalizedSearch) {
			return files;
		}

		return files.filter((file) => {
			const filenameMatch = file.filename
				.toLowerCase()
				.includes(normalizedSearch);
			const tagMatch = file.tags.some((tag) =>
				tag.toLowerCase().includes(normalizedSearch)
			);

			return filenameMatch || tagMatch;
		});
	}, [files, searchQuery]);

	const isBusy = uploadMutation.isPending;

	const openFilePicker = () => {
		inputRef.current?.click();
	};

	const resetFilePicker = () => {
		if (inputRef.current) {
			inputRef.current.value = "";
		}
	};

	const handleFiles = async (uploadedFiles: File[]) => {
		if (!projectId) {
			toast.error(t("bucket:messages.missingProject"));
			return;
		}

		const validFiles = uploadedFiles.filter(
			(file) => isSupportedFile(file) && file.size <= MAX_FILE_SIZE_BYTES
		);

		const rejectedFiles = uploadedFiles.length - validFiles.length;
		if (rejectedFiles > 0) {
			toast.info(
				t("bucket:messages.partialRejected", { count: rejectedFiles })
			);
		}

		if (validFiles.length === 0) {
			toast.error(t("bucket:validation.noValidFiles"));
			return;
		}

		try {
			for (const file of validFiles) {
				await uploadMutation.mutateAsync({
					projectId,
					file,
				});
			}

			toast.success(
				t("bucket:messages.uploadSuccess", { count: validFiles.length })
			);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: t("bucket:messages.uploadError")
			);
		}
	};

	const handleDragOver = (event: DragEvent<HTMLButtonElement>) => {
		event.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const handleDrop = async (event: DragEvent<HTMLButtonElement>) => {
		event.preventDefault();
		setIsDragging(false);
		await handleFiles(Array.from(event.dataTransfer.files));
	};

	const handleFileInput = async (event: ChangeEvent<HTMLInputElement>) => {
		const uploadedFiles = Array.from(event.target.files || []);
		resetFilePicker();
		await handleFiles(uploadedFiles);
	};

	const openTagDialog = (file: ProjectRagFile) => {
		setSelectedFile(file);
		setTagDialogOpen(true);
	};

	const downloadFile = async (file: ProjectRagFile) => {
		try {
			toast.loading(
				t("bucket:messages.downloading", { fileName: file.filename }),
				{ id: "downloading" }
			);
			const downloadUrl = await getProjectStorageFileDownloadUrl({
				projectId,
				fileId: file.id,
			});

			const response = await fetch(downloadUrl);
			if (!response.ok) throw new Error("Failed to fetch file content");
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);

			const link = document.createElement("a");
			link.href = url;
			link.download = file.filename;
			link.rel = "noreferrer";

			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
			toast.dismiss("downloading");
		} catch (error) {
			toast.dismiss("downloading");
			toast.error(
				error instanceof Error
					? error.message
					: t("bucket:messages.downloadError")
			);
		}
	};

	const promptDeleteFile = (file: ProjectRagFile) => {
		setFileToDelete(file);
		setDeleteDialogOpen(true);
	};

	const addToRag = async (file: ProjectRagFile) => {
		toast.promise(
			addRagFileMutation.mutateAsync({
				projectId,
				fileId: file.id,
			}),
			{
				loading: t("bucket:rag.loading", { fileName: file.filename }),
				success: t("bucket:rag.success", { fileName: file.filename }),
				error: (err) =>
					err instanceof Error
						? err.message
						: t("bucket:rag.error", { fileName: file.filename }),
			}
		);
	};

	if (!projectId) {
		return (
			<DashboardLayout
				pageTitle={t("sidebar:project.buckets.title", "Buckets")}
			>
				<Card>
					<CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
						<FolderSearch className="size-10 text-muted-foreground" />
						<div className="space-y-1">
							<p className="font-medium text-foreground">
								{t("bucket:emptyState.missingProjectTitle")}
							</p>
							<p className="max-w-md text-sm text-muted-foreground">
								{t("bucket:emptyState.missingProjectDescription")}
							</p>
						</div>
					</CardContent>
				</Card>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout pageTitle={t("sidebar:project.buckets.title", "Buckets")}>
			<div className="flex flex-col gap-6">
				<ProjectBucketsUploadCard
					inputRef={inputRef}
					isDragging={isDragging}
					isUploading={uploadMutation.isPending}
					isBusy={isBusy}
					uploadTitle={t("bucket:action.uploadTitle")}
					uploadAction={t("bucket:action.upload")}
					uploadProcessing={t("bucket:upload.processing")}
					uploadHint={t("bucket:upload.hint")}
					uploadSupportedTypes={t("bucket:upload.supportedTypes")}
					uploadBrowseTitle={t("bucket:upload.browse")}
					onOpenFilePicker={openFilePicker}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					onFileInput={handleFileInput}
				/>

				<ProjectBucketsTabs
					files={filteredFiles}
					ragFiles={ragFiles}
					searchQuery={searchQuery}
					isLoading={isLoading}
					isFetching={isFetching}
					isRagLoading={isRagLoading}
					isRagFetching={isRagFetching}
					isAddToRagDisabled={addRagFileMutation.isPending}
					onOpenFilePicker={openFilePicker}
					onSearchQueryChange={setSearchQuery}
					onOpenQueryDialog={() => setQueryDialogOpen(true)}
					onAddToRag={addToRag}
					onDownloadFile={downloadFile}
					onOpenTagDialog={openTagDialog}
					onDeleteFile={promptDeleteFile}
					tableTitle={t("bucket:table.title")}
					tableDescription={t("bucket:table.description")}
					searchPlaceholder={t("bucket:table.searchPlaceholder")}
					tableLoading={t("bucket:table.loading")}
					tableRefreshing={t("bucket:table.refreshing")}
					tableNoTags={t("bucket:table.noTags")}
					tableActions={t("bucket:table.actions")}
					tableFileName={t("bucket:table.fileName")}
					tableFileType={t("bucket:table.fileType")}
					tableFileSize={t("bucket:table.fileSize")}
					tableUploadDate={t("bucket:table.uploadDate")}
					tableTags={t("bucket:table.tags")}
					emptyStateTitle={t("bucket:emptyState.title")}
					emptyStateDescription={t("bucket:emptyState.description")}
					emptyStateButtonText={t("bucket:emptyState.buttonText")}
					ragTitle={t("bucket:rag.title", "RAG Data")}
					ragDescription={t(
						"bucket:rag.description",
						"Files successfully uploaded and extracted into the Vector search engine."
					)}
					ragEmptyState={t("bucket:rag.emptyState", "No files found in RAG.")}
					ragQueryButton={t("bucket:rag.queryButton", "Query")}
				/>
			</div>

			<ProjectBucketsTagDialog
				open={tagDialogOpen}
				onOpenChange={setTagDialogOpen}
				projectId={projectId}
				selectedFile={selectedFile}
			/>

			<ProjectBucketsDeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				projectId={projectId}
				fileToDelete={fileToDelete}
				fileNameLabel={fileToDelete?.filename || ""}
			/>

			<ProjectBucketsQueryDialog
				open={queryDialogOpen}
				onOpenChange={setQueryDialogOpen}
				projectId={projectId}
			/>
		</DashboardLayout>
	);
}
