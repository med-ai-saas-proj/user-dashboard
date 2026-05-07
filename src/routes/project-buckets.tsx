import { useState } from "react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useTranslation } from "react-i18next";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/shadcn/table";
import { Button } from "@/components/shadcn/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/shadcn/card";
import {
	UploadCloud,
	File,
	Trash2,
	FileText,
	Search,
	Download,
	Tag,
	X,
} from "lucide-react";
import { Input } from "@/components/shadcn/input";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/shadcn/dialog";
import { Label } from "@/components/shadcn/label";

// Mock data for files
type UploadedFile = {
	id: string;
	name: string;
	size: string;
	uploadDate: string;
	tags: string[];
};

const MOCK_FILES: UploadedFile[] = [
	{
		id: "1",
		name: "Q1_Financial_Report.pdf",
		size: "2.4 MB",
		uploadDate: "2026-05-01",
		tags: ["finance", "report"],
	},
	{
		id: "2",
		name: "Employee_Handbook_2026.docx",
		size: "1.1 MB",
		uploadDate: "2026-05-02",
		tags: ["hr", "handbook"],
	},
	{
		id: "3",
		name: "Product_Roadmap_Q2.pptx",
		size: "3.5 MB",
		uploadDate: "2026-05-05",
		tags: ["product"],
	},
];

export default function ProjectBucketsPage() {
	const { t } = useTranslation(["sidebar", "common", "bucket"]);
	const [files, setFiles] = useState<UploadedFile[]>(MOCK_FILES);
	const [isDragging, setIsDragging] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const [tagDialogOpen, setTagDialogOpen] = useState(false);
	const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
	const [tagInput, setTagInput] = useState("");
	const [tempTags, setTempTags] = useState<string[]>([]);

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			handleFiles(e.dataTransfer.files);
		}
	};

	const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			handleFiles(e.target.files);
		}
	};

	const handleFiles = (uploadedFiles: FileList) => {
		const newFiles = Array.from(uploadedFiles).map((file) => ({
			id: Math.random().toString(36).substring(7),
			name: file.name,
			size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
			uploadDate: new Date().toISOString().split("T")[0],
			tags: [],
		}));
		setFiles((prev) => [...newFiles, ...prev]);
	};

	const deleteFile = (id: string) => {
		setFiles((prev) => prev.filter((file) => file.id !== id));
	};

	const downloadFile = (file: UploadedFile) => {
		// Mock download logic
		console.log("Downloading", file.name);
	};

	const openTagDialog = (file: UploadedFile) => {
		setSelectedFile(file);
		setTempTags(file.tags || []);
		setTagInput("");
		setTagDialogOpen(true);
	};

	const saveTags = () => {
		if (selectedFile) {
			setFiles((prev) =>
				prev.map((f) =>
					f.id === selectedFile.id ? { ...f, tags: tempTags } : f
				)
			);
		}
		setTagDialogOpen(false);
	};

	const addTempTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && tagInput.trim()) {
			e.preventDefault();
			const newTag = tagInput.trim();
			if (!tempTags.includes(newTag)) {
				setTempTags([...tempTags, newTag]);
			}
			setTagInput("");
		}
	};

	const removeTempTag = (tagToRemove: string) => {
		setTempTags(tempTags.filter((tag) => tag !== tagToRemove));
	};

	const filteredFiles = files.filter((file) =>
		file.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<DashboardLayout pageTitle={t("sidebar:project.buckets.title", "Buckets")}>
			<div className="flex flex-col gap-6">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">
						{t("bucket:title")}
					</h2>
					<p className="text-muted-foreground">{t("bucket:description")}</p>
				</div>

				<div className="grid gap-6 md:grid-cols-3">
					{/* Upload Area */}
					<Card className="col-span-1 md:col-span-3">
						<CardHeader>
							<CardTitle>Upload Documents</CardTitle>
							<CardDescription>
								Drag and drop your files here or click to browse.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<button
								type="button"
								onDragOver={handleDragOver}
								onDragLeave={handleDragLeave}
								onDrop={handleDrop}
								className={`relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg transition-colors w-full ${
									isDragging
										? "border-primary bg-primary/5"
										: "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
								}`}
							>
								<div className="flex flex-col items-center gap-4 text-center">
									<div className="p-4 bg-primary/10 rounded-full">
										<UploadCloud className="w-8 h-8 text-primary" />
									</div>
									<div>
										<p className="text-sm font-medium">
											{t("bucket:action.upload")}
										</p>
										<p className="text-xs text-muted-foreground mt-1">
											PDF, TXT, DOCX, PPTX (max 50MB)
										</p>
									</div>
								</div>
								<input
									title="Upload documents"
									type="file"
									className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
									multiple
									onChange={handleFileInput}
								/>
							</button>
						</CardContent>
					</Card>

					{/* File Explorer / List */}
					<Card className="col-span-1 md:col-span-3">
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle>Uploaded Files</CardTitle>
								<CardDescription>
									Browse and manage documents in this bucket
								</CardDescription>
							</div>
							<div className="relative w-64">
								<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									type="search"
									placeholder="Search files..."
									className="pl-8"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</div>
						</CardHeader>
						<CardContent>
							<div className="border rounded-md">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-[400px]">
												{t("bucket:table.fileName")}
											</TableHead>
											<TableHead>{t("bucket:table.fileSize")}</TableHead>
											<TableHead>{t("bucket:table.uploadDate")}</TableHead>
											<TableHead>Tags</TableHead>
											<TableHead className="text-right">
												{t("bucket:table.actions")}
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredFiles.length > 0 ? (
											filteredFiles.map((file) => (
												<TableRow key={file.id}>
													<TableCell className="font-medium">
														<div className="flex items-center gap-2">
															<FileText className="w-4 h-4 text-primary/70" />
															<span className="truncate max-w-[300px]">
																{file.name}
															</span>
														</div>
													</TableCell>
													<TableCell className="text-muted-foreground">
														{file.size}
													</TableCell>
													<TableCell className="text-muted-foreground">
														{file.uploadDate}
													</TableCell>
													<TableCell>
														<div className="flex flex-wrap gap-1">
															{file.tags && file.tags.length > 0 ? (
																file.tags.slice(0, 2).map((tag, i) => (
																	<span
																		key={i}
																		className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground"
																	>
																		{tag}
																	</span>
																))
															) : (
																<span className="text-xs text-muted-foreground">
																	No tags
																</span>
															)}
															{file.tags && file.tags.length > 2 && (
																<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
																	+{file.tags.length - 2}
																</span>
															)}
														</div>
													</TableCell>
													<TableCell className="text-right">
														<div className="flex justify-end gap-1">
															<Button
																variant="ghost"
																size="icon"
																className="text-muted-foreground hover:text-foreground"
																onClick={() => downloadFile(file)}
																title="Download file"
															>
																<Download className="w-4 h-4" />
															</Button>
															<Button
																variant="ghost"
																size="icon"
																className="text-muted-foreground hover:text-foreground"
																onClick={() => openTagDialog(file)}
																title="Edit tags"
															>
																<Tag className="w-4 h-4" />
															</Button>
															<Button
																variant="ghost"
																size="icon"
																className="text-destructive hover:text-destructive hover:bg-destructive/10"
																onClick={() => deleteFile(file.id)}
																title="Delete file"
															>
																<Trash2 className="w-4 h-4" />
															</Button>
														</div>
													</TableCell>
												</TableRow>
											))
										) : (
											<TableRow>
												<TableCell
													colSpan={5}
													className="h-32 text-center text-muted-foreground"
												>
													<div className="flex flex-col items-center justify-center gap-2">
														<File className="w-8 h-8 opacity-20" />
														<p>{t("bucket:emptyState.title")}</p>
													</div>
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			<Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>{t("bucket:tagDialog.title")}</DialogTitle>
						<DialogDescription>
							{t("bucket:tagDialog.description", {
								fileName: selectedFile?.name || "this file",
							})}
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="tags">Tags</Label>
							<div className="flex flex-wrap gap-2 mb-2">
								{tempTags.map((tag) => (
									<span
										key={tag}
										className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium bg-primary/10 text-primary"
									>
										{tag}
										<button
											type="button"
											onClick={() => removeTempTag(tag)}
											className="text-primary/70 hover:text-primary rounded-full focus:outline-none"
										>
											<X className="w-3 h-3" />
										</button>
									</span>
								))}
							</div>
							<Input
								id="tags"
								placeholder="Add a new tag and press Enter..."
								value={tagInput}
								onChange={(e) => setTagInput(e.target.value)}
								onKeyDown={addTempTag}
							/>
						</div>
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline">{t("common:action.cancel")}</Button>
						</DialogClose>
						<Button onClick={saveTags}>{t("common:action.save")}</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</DashboardLayout>
	);
}
