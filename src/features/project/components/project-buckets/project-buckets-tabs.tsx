import {
	Search,
	LoaderCircle,
	UploadCloud,
	DownloadIcon,
	TagIcon,
	Trash2Icon,
	FileIcon,
	FileTextIcon,
} from "lucide-react";
import { Button } from "@/components/shadcn/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/shadcn/card";
import { Input } from "@/components/shadcn/input";
import { Spinner } from "@/components/shadcn/spinner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/shadcn/table";
import type { ProjectRagFile } from "@/features/project/services/project-files.dto";
import { formatFileSize, getFileTypeLabel } from "./project-buckets.utils";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/shadcn/tabs";

type ProjectBucketsTabsProps = {
	files: ProjectRagFile[];
	ragFiles: ProjectRagFile[];
	searchQuery: string;
	isLoading: boolean;
	isFetching: boolean;
	isRagLoading: boolean;
	isRagFetching: boolean;
	isAddToRagDisabled: boolean;
	onOpenFilePicker: () => void;
	onSearchQueryChange: (value: string) => void;
	onOpenQueryDialog: () => void;
	onAddToRag: (file: ProjectRagFile) => void;
	onDownloadFile: (file: ProjectRagFile) => void;
	onOpenTagDialog: (file: ProjectRagFile) => void;
	onDeleteFile: (file: ProjectRagFile) => void;
	tableTitle: string;
	tableDescription: string;
	searchPlaceholder: string;
	tableLoading: string;
	tableRefreshing: string;
	tableNoTags: string;
	tableActions: string;
	tableFileName: string;
	tableFileType: string;
	tableFileSize: string;
	tableUploadDate: string;
	tableTags: string;
	emptyStateTitle: string;
	emptyStateDescription: string;
	emptyStateButtonText: string;
	ragTitle: string;
	ragDescription: string;
	ragEmptyState: string;
	ragQueryButton: string;
};

export default function ProjectBucketsTabs({
	files,
	ragFiles,
	searchQuery,
	isLoading,
	isFetching,
	isRagLoading,
	isRagFetching,
	isAddToRagDisabled,
	onOpenFilePicker,
	onSearchQueryChange,
	onOpenQueryDialog,
	onAddToRag,
	onDownloadFile,
	onOpenTagDialog,
	onDeleteFile,
	tableTitle,
	tableDescription,
	searchPlaceholder,
	tableLoading,
	tableRefreshing,
	tableNoTags,
	tableActions,
	tableFileName,
	tableFileType,
	tableFileSize,
	tableUploadDate,
	tableTags,
	emptyStateTitle,
	emptyStateDescription,
	emptyStateButtonText,
	ragTitle,
	ragDescription,
	ragEmptyState,
	ragQueryButton,
}: ProjectBucketsTabsProps) {
	return (
		<Tabs defaultValue="storage" className="w-full">
			<TabsList className="grid w-full grid-cols-2 max-w-[400px]">
				<TabsTrigger value="storage">Storage Files</TabsTrigger>
				<TabsTrigger value="rag">RAG Files</TabsTrigger>
			</TabsList>
			<TabsContent value="storage">
				<Card>
					<CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<CardTitle>{tableTitle}</CardTitle>
							<CardDescription>{tableDescription}</CardDescription>
						</div>
						<div className="relative w-full sm:max-w-xs">
							<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								type="search"
								placeholder={searchPlaceholder}
								className="pl-9"
								value={searchQuery}
								onChange={(event) => onSearchQueryChange(event.target.value)}
							/>
						</div>
					</CardHeader>
					<CardContent>
						<div className="rounded-lg border border-border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-[34%]">{tableFileName}</TableHead>
										<TableHead>{tableFileType}</TableHead>
										<TableHead>{tableFileSize}</TableHead>
										<TableHead>{tableUploadDate}</TableHead>
										<TableHead>{tableTags}</TableHead>
										<TableHead className="text-right">{tableActions}</TableHead>
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
													<span>{tableLoading}</span>
												</div>
											</TableCell>
										</TableRow>
									) : files.length > 0 ? (
										files.map((file) => (
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
																{tableNoTags}
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
															onClick={() => onAddToRag(file)}
															title="Add to RAG"
															disabled={
																isAddToRagDisabled ||
																ragFiles.some(
																	(ragFile) => ragFile.id === file.id
																)
															}
														>
															<UploadCloud className="size-4" />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															onClick={() => onDownloadFile(file)}
															title="Download"
														>
															<DownloadIcon className="size-4" />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															onClick={() => onOpenTagDialog(file)}
															title="Edit tags"
														>
															<TagIcon className="size-4" />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															className="text-destructive hover:text-destructive"
															onClick={() => onDeleteFile(file)}
															title="Delete"
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
															{emptyStateTitle}
														</p>
														<p className="max-w-sm text-sm text-muted-foreground">
															{emptyStateDescription}
														</p>
													</div>
													<Button variant="outline" onClick={onOpenFilePicker}>
														{emptyStateButtonText}
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
								{tableRefreshing}
							</p>
						)}
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="rag">
				<Card>
					<CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<CardTitle>{ragTitle}</CardTitle>
							<CardDescription>{ragDescription}</CardDescription>
						</div>
						<Button onClick={onOpenQueryDialog}>{ragQueryButton}</Button>
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
												{ragEmptyState}
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>
						{isRagFetching && !isRagLoading && (
							<p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
								<LoaderCircle className="size-4 animate-spin" />
								{tableRefreshing}
							</p>
						)}
					</CardContent>
				</Card>
			</TabsContent>
		</Tabs>
	);
}
