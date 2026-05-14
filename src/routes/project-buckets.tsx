import type { ChangeEvent, DragEvent, KeyboardEvent } from "react";
import { useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/layouts/dashboard-layout";
import { Button } from "@/components/shadcn/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/shadcn/card";
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/shadcn/table";
import { Spinner } from "@/components/shadcn/spinner";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/features/project/store/project";
import { useGetProjectRagFiles } from "@/features/project/hooks/project-rag-files/use-get-project-rag-files";
import { useAddProjectRagFile } from "@/features/project/hooks/project-rag-files/use-add-project-rag-file";
import { useGetProjectStorageFiles } from "@/features/project/hooks/project-storage-files/use-get-project-storage-files";
import { useUploadProjectStorageFile } from "@/features/project/hooks/project-storage-files/use-upload-project-storage-file";
import { useDeleteProjectStorageFile } from "@/features/project/hooks/project-storage-files/use-delete-project-storage-file";
import { useUpdateProjectStorageFileMetadata } from "@/features/project/hooks/project-storage-files/use-update-project-storage-file-metadata";
import type { ProjectRagFile } from "@/features/project/services/project-files.dto";
import { getProjectStorageFileDownloadUrl } from "@/features/project/services/project-storage-files/get-project-storage-file-download-url";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/shadcn/tabs";
import {
	DownloadIcon,
	FileIcon,
	FileTextIcon,
	FolderSearch,
	LoaderCircle,
	Search,
	TagIcon,
	Trash2Icon,
	UploadCloud,
	X,
} from "lucide-react";
import { toast } from "sonner";

const ACCEPTED_TYPES = [
	"application/pdf",
	"text/plain",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/msword",
];

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

const isSupportedFile = (file: File) => {
	if (ACCEPTED_TYPES.includes(file.type)) {
		return true;
	}

	return /\.(pdf|txt|doc|docx)$/i.test(file.name);
};

const getFileTypeLabel = (mimeType: string, filename: string) => {
	if (mimeType.includes("pdf") || filename.toLowerCase().endsWith(".pdf")) {
		return "PDF";
	}

	if (
		mimeType.includes("wordprocessingml") ||
		filename.toLowerCase().endsWith(".docx")
	) {
		return "DOCX";
	}

	if (mimeType.includes("msword") || filename.toLowerCase().endsWith(".doc")) {
		return "DOC";
	}

	if (mimeType.startsWith("text/")) {
		return "TXT";
	}

	return mimeType || "FILE";
};

const formatFileSize = (sizeInBytes: number) => {
	if (sizeInBytes < 1024) {
		return `${sizeInBytes} B`;
	}

	const units = ["KB", "MB", "GB", "TB"];
	let size = sizeInBytes / 1024;
	let unitIndex = 0;

	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex += 1;
	}

	return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
};

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
	const [tagKeyInput, setTagKeyInput] = useState("");
	const [tagValueInput, setTagValueInput] = useState("");
	const [tempTags, setTempTags] = useState<string[]>([]);

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
	const deleteMutation = useDeleteProjectStorageFile();
	const updateMetadataMutation = useUpdateProjectStorageFileMetadata();
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

	const isBusy =
		uploadMutation.isPending ||
		deleteMutation.isPending ||
		updateMetadataMutation.isPending;

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
		setTempTags(file.tags);
		setTagKeyInput("");
		setTagValueInput("");
		setTagDialogOpen(true);
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
					else if (!isNaN(Number(val)) && val !== "")
						extraMetadata[key] = Number(val);
					else extraMetadata[key] = val;
				}
			}

			await updateMetadataMutation.mutateAsync({
				projectId,
				fileId: selectedFile.id,
				extraMetadata,
			});
			toast.success(t("bucket:messages.tagsUpdated"));
			setTagDialogOpen(false);
			setSelectedFile(null);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: t("bucket:messages.tagsUpdateError")
			);
		}
	};

	const addTempTag = (event?: KeyboardEvent<HTMLInputElement>) => {
		if (event && event.key !== "Enter") {
			return;
		}

		if (event) {
			event.preventDefault();
		}

		const key = tagKeyInput.trim();
		const value = tagValueInput.trim();
		if (!key) return;

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

	const removeTempTag = (tagToRemove: string) => {
		setTempTags(tempTags.filter((tag) => tag !== tagToRemove));
	};

	const downloadFile = async (file: ProjectRagFile) => {
		try {
			const downloadUrl = await getProjectStorageFileDownloadUrl({
				projectId,
				fileId: file.id,
			});

			const link = document.createElement("a");
			link.href = downloadUrl;
			link.download = file.filename;
			link.rel = "noreferrer";

			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: t("bucket:messages.downloadError")
			);
		}
	};

	const deleteFile = async (file: ProjectRagFile) => {
		const isConfirmed = window.confirm(
			t("bucket:messages.deleteConfirm", { fileName: file.filename })
		);

		if (!isConfirmed) {
			return;
		}

		try {
			await deleteMutation.mutateAsync({
				projectId,
				fileId: file.id,
			});
			toast.success(t("bucket:messages.deleted"));
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: t("bucket:messages.deleteError")
			);
		}
	};

	const addToRag = async (file: ProjectRagFile) => {
		try {
			await addRagFileMutation.mutateAsync({
				projectId,
				fileId: file.id,
			});
			toast.success("File added to RAG successfully");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to add file to RAG"
			);
		}
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
				<div className="space-y-1.5">
					<h2 className="text-2xl font-bold tracking-tight">
						{t("bucket:title")}
					</h2>
					<p className="text-muted-foreground">{t("bucket:description")}</p>
				</div>

				<Card className="w-full">
					<CardHeader>
						<CardTitle>{t("bucket:action.uploadTitle")}</CardTitle>
						<CardDescription>{t("bucket:action.upload")}</CardDescription>
					</CardHeader>
					<CardContent>
						<button
							type="button"
							onDragOver={handleDragOver}
							onDragLeave={handleDragLeave}
							onDrop={handleDrop}
							className={cn(
								"flex mx-auto cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border border-dashed px-6 py-12 text-center transition-colors",
								isDragging
									? "border-primary bg-accent"
									: "border-border bg-background hover:bg-accent/50"
							)}
							onClick={openFilePicker}
						>
							<div className="flex flex-col items-center gap-3">
								<div className="flex size-14 items-center justify-center rounded-full border border-border bg-muted">
									{uploadMutation.isPending ? (
										<Spinner className="size-6" />
									) : (
										<UploadCloud className="size-6 text-foreground" />
									)}
								</div>
								<div className="space-y-1">
									<p className="text-sm font-medium text-foreground">
										{uploadMutation.isPending
											? t("bucket:upload.processing")
											: t("bucket:action.upload")}
									</p>
									<p className="text-sm text-muted-foreground">
										{t("bucket:upload.hint")}
									</p>
									<p className="text-xs text-muted-foreground">
										{t("bucket:upload.supportedTypes")}
									</p>
								</div>
							</div>
							<input
								ref={inputRef}
								accept={ACCEPTED_TYPES.join(",")}
								title={t("bucket:upload.browse")}
								type="file"
								className="hidden"
								multiple
								onChange={handleFileInput}
								disabled={isBusy}
							/>
						</button>
					</CardContent>
				</Card>

				<Tabs defaultValue="storage" className="w-full">
					<TabsList className="grid w-full grid-cols-2 max-w-[400px]">
						<TabsTrigger value="storage">Storage Files</TabsTrigger>
						<TabsTrigger value="rag">RAG Files</TabsTrigger>
					</TabsList>
					<TabsContent value="storage">
						<Card>
							<CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<CardTitle>{t("bucket:table.title")}</CardTitle>
									<CardDescription>
										{t("bucket:table.description")}
									</CardDescription>
								</div>
								<div className="relative w-full sm:max-w-xs">
									<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										type="search"
										placeholder={t("bucket:table.searchPlaceholder")}
										className="pl-9"
										value={searchQuery}
										onChange={(event) => setSearchQuery(event.target.value)}
									/>
								</div>
							</CardHeader>
							<CardContent>
								<div className="rounded-lg border border-border">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead className="w-[34%]">
													{t("bucket:table.fileName")}
												</TableHead>
												<TableHead>{t("bucket:table.fileType")}</TableHead>
												<TableHead>{t("bucket:table.fileSize")}</TableHead>
												<TableHead>{t("bucket:table.uploadDate")}</TableHead>
												<TableHead>{t("bucket:table.tags")}</TableHead>
												<TableHead className="text-right">
													{t("bucket:table.actions")}
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{isLoading ? (
												<TableRow>
													<TableCell
														colSpan={6}
														className="py-16 text-center text-muted-foreground"
													>
														<div className="flex items-center justify-center gap-2">
															<Spinner />
															<span>{t("bucket:table.loading")}</span>
														</div>
													</TableCell>
												</TableRow>
											) : filteredFiles.length > 0 ? (
												filteredFiles.map((file) => (
													<TableRow key={file.id}>
														<TableCell className="font-medium">
															<div className="flex items-center gap-3">
																<div className="flex size-9 items-center justify-center rounded-md border border-border bg-muted">
																	<FileTextIcon className="size-4 text-foreground" />
																</div>
																<div className="min-w-0">
																	<p className="truncate font-medium text-foreground">
																		{file.filename}
																	</p>
																	<p className="truncate text-xs text-muted-foreground">
																		{file.id}
																	</p>
																</div>
															</div>
														</TableCell>
														<TableCell className="text-muted-foreground">
															{getFileTypeLabel(file.mimeType, file.filename)}
														</TableCell>
														<TableCell className="text-muted-foreground">
															{formatFileSize(file.size)}
														</TableCell>
														<TableCell className="text-muted-foreground">
															{file.createdAt.toLocaleDateString()}
														</TableCell>
														<TableCell>
															<div className="flex flex-wrap gap-1.5">
																{file.tags.length > 0 ? (
																	file.tags.slice(0, 3).map((tag) => (
																		<span
																			key={`${file.id}-${tag}`}
																			className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground"
																		>
																			{tag}
																		</span>
																	))
																) : (
																	<span className="text-xs text-muted-foreground">
																		{t("bucket:table.noTags")}
																	</span>
																)}
																{file.tags.length > 3 && (
																	<span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
																		+{file.tags.length - 3}
																	</span>
																)}
															</div>
														</TableCell>
														<TableCell className="text-right">
															<div className="flex justify-end gap-1">
																<Button
																	variant="ghost"
																	size="icon"
																	onClick={() => void addToRag(file)}
																	title="Add to RAG"
																	disabled={addRagFileMutation.isPending}
																>
																	<UploadCloud className="size-4" />
																</Button>
																<Button
																	variant="ghost"
																	size="icon"
																	onClick={() => void downloadFile(file)}
																	title={t("bucket:actions.download")}
																>
																	<DownloadIcon className="size-4" />
																</Button>
																<Button
																	variant="ghost"
																	size="icon"
																	onClick={() => openTagDialog(file)}
																	title={t("bucket:actions.editTags")}
																>
																	<TagIcon className="size-4" />
																</Button>
																<Button
																	variant="ghost"
																	size="icon"
																	className="text-destructive hover:text-destructive"
																	onClick={() => void deleteFile(file)}
																	title={t("bucket:actions.delete")}
																>
																	<Trash2Icon className="size-4" />
																</Button>
															</div>
														</TableCell>
													</TableRow>
												))
											) : (
												<TableRow>
													<TableCell
														colSpan={6}
														className="py-16 text-center text-muted-foreground"
													>
														<div className="flex flex-col items-center justify-center gap-3">
															<FileIcon className="size-10 text-muted-foreground" />
															<div className="space-y-1">
																<p className="font-medium text-foreground">
																	{t("bucket:emptyState.title")}
																</p>
																<p className="max-w-sm text-sm text-muted-foreground">
																	{t("bucket:emptyState.description")}
																</p>
															</div>
															<Button
																variant="outline"
																onClick={openFilePicker}
																disabled={isBusy}
															>
																{t("bucket:emptyState.buttonText")}
															</Button>
														</div>
													</TableCell>
												</TableRow>
											)}
										</TableBody>
									</Table>
								</div>
								{isFetching && !isLoading && (
									<p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
										<LoaderCircle className="size-4 animate-spin" />
										{t("bucket:table.refreshing")}
									</p>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="rag">
						<Card>
							<CardHeader>
								<CardTitle>RAG Files</CardTitle>
								<CardDescription>
									Files successfully uploaded and extracted into the Vector
									search engine.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="rounded-lg border border-border">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>File Name</TableHead>
												<TableHead>Type</TableHead>
												<TableHead>Size</TableHead>
												<TableHead>Date</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{isRagLoading ? (
												<TableRow>
													<TableCell
														colSpan={4}
														className="py-16 text-center text-muted-foreground"
													>
														<Spinner />
													</TableCell>
												</TableRow>
											) : ragFiles.length > 0 ? (
												ragFiles.map((file) => (
													<TableRow key={file.id}>
														<TableCell className="font-medium">
															{file.filename}
														</TableCell>
														<TableCell className="text-muted-foreground">
															{getFileTypeLabel(file.mimeType, file.filename)}
														</TableCell>
														<TableCell className="text-muted-foreground">
															{formatFileSize(file.size)}
														</TableCell>
														<TableCell className="text-muted-foreground">
															{file.createdAt.toLocaleDateString()}
														</TableCell>
													</TableRow>
												))
											) : (
												<TableRow>
													<TableCell
														colSpan={4}
														className="py-16 text-center text-muted-foreground"
													>
														No files found in RAG.
													</TableCell>
												</TableRow>
											)}
										</TableBody>
									</Table>
								</div>
								{isRagFetching && !isRagLoading && (
									<p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
										<LoaderCircle className="size-4 animate-spin" />
										{t("bucket:table.refreshing")}
									</p>
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>

			<Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
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
							<Label htmlFor="tags">{t("bucket:tagDialog.label")}</Label>
							<div className="mb-2 flex flex-wrap gap-2">
								{tempTags.map((tag) => (
									<span
										key={tag}
										className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2.5 py-1 text-sm font-medium text-foreground"
									>
										{tag}
										<button
											type="button"
											onClick={() => removeTempTag(tag)}
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
									onKeyDown={addTempTag}
									className="flex-1"
								/>
								<Input
									id="tags-value"
									placeholder="Value (e.g., film)"
									value={tagValueInput}
									onChange={(event) => setTagValueInput(event.target.value)}
									onKeyDown={addTempTag}
									className="flex-1"
								/>
								<Button
									type="button"
									onClick={() => addTempTag()}
									variant="secondary"
								>
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
		</DashboardLayout>
	);
}
