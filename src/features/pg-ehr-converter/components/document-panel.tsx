import { useState, useRef } from "react";
import { Button } from "@/components/shadcn/button";

type DocumentConvertResult = {
	success: boolean;
	extracted_text: string;
	source_type: string;
	bundle: Record<string, unknown> | null;
	resource_count: number;
	errors: string[];
};

type DocumentPanelProps = {
	onConvert: (files: File[]) => Promise<void>;
	isLoading: boolean;
	result: DocumentConvertResult | null;
};

export function DocumentPanel({
	onConvert,
	isLoading,
	result,
}: DocumentPanelProps) {
	const [files, setFiles] = useState<File[]>([]);
	const [previews, setPreviews] = useState<string[]>([]);
	const [activeTab, setActiveTab] = useState<"extracted" | "fhir">("extracted");
	const fileInputRef = useRef<HTMLInputElement>(null);
	const dropRef = useRef<HTMLButtonElement>(null);

	const handleFiles = (newFiles: File[]) => {
		const valid = newFiles.filter(
			(f) => f.type.startsWith("image/") || f.type === "application/pdf"
		);
		setFiles((prev) => [...prev, ...valid]);

		for (const f of valid) {
			if (f.type.startsWith("image/")) {
				const reader = new FileReader();
				reader.onload = () =>
					setPreviews((prev) => [...prev, reader.result as string]);
				reader.readAsDataURL(f);
			} else {
				setPreviews((prev) => [...prev, ""]);
			}
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		dropRef.current?.classList.remove("ring-2", "ring-primary");
		handleFiles(Array.from(e.dataTransfer.files));
	};

	const handleRun = async () => {
		if (!files.length) return;
		await onConvert(files);
	};

	return (
		<div className="border rounded-lg overflow-hidden">
			<div className="px-4 py-3 bg-muted/30 border-b">
				<h3 className="text-sm font-semibold">
					Document → FHIR R4 (GPT-4o Vision)
				</h3>
				<p className="text-[11px] text-muted-foreground mt-0.5">
					Upload medical record images or PDFs — GPT-4o extracts clinical data
					and converts to FHIR R4
				</p>
			</div>

			<div className="p-4 space-y-4">
				<button
					type="button"
					ref={dropRef}
					onDrop={handleDrop}
					onDragOver={(e) => {
						e.preventDefault();
						dropRef.current?.classList.add("ring-2", "ring-primary");
					}}
					onDragLeave={() =>
						dropRef.current?.classList.remove("ring-2", "ring-primary")
					}
					onClick={() => fileInputRef.current?.click()}
					className="w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/30 transition-colors"
				>
					{files.length > 0 ? (
						<div className="space-y-2">
							<p className="text-sm font-medium">
								{files.length} file(s) selected
							</p>
							<div className="flex flex-wrap gap-2 justify-center">
								{files.map((f, i) => (
									<div
										key={`${f.name}-${i}`}
										className="flex items-center gap-2 px-2 py-1 bg-muted rounded text-xs"
									>
										{previews[i] ? (
											<img
												src={previews[i]}
												alt={f.name}
												className="w-8 h-8 object-cover rounded"
											/>
										) : (
											<span className="w-8 h-8 flex items-center justify-center bg-muted-foreground/10 rounded text-[10px]">
												PDF
											</span>
										)}
										<span className="truncate max-w-[120px]">{f.name}</span>
									</div>
								))}
							</div>
						</div>
					) : (
						<p className="text-sm text-muted-foreground">
							Drop medical record images/PDFs here, or click to browse
						</p>
					)}
				</button>
				<input
					ref={fileInputRef}
					type="file"
					multiple
					accept="image/*,application/pdf"
					className="hidden"
					onChange={(e) => {
						handleFiles(Array.from(e.target.files || []));
						e.target.value = "";
					}}
				/>

				<div className="flex items-center gap-2">
					{files.length > 0 && (
						<Button
							variant="ghost"
							size="sm"
							className="h-7 text-xs"
							onClick={() => {
								setFiles([]);
								setPreviews([]);
							}}
						>
							Clear files
						</Button>
					)}
					<div className="flex-1" />
					<Button
						size="sm"
						className="h-8 text-xs"
						onClick={handleRun}
						disabled={!files.length || isLoading}
					>
						{isLoading ? (
							<span className="flex items-center gap-1.5">
								<span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
								Extracting...
							</span>
						) : (
							"Convert to FHIR"
						)}
					</Button>
				</div>
			</div>

			{result && (
				<div className="border-t">
					<div className="flex items-center justify-between px-4 py-2 bg-muted/20">
						<div className="flex items-center gap-2">
							<span
								className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${result.success ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"}`}
							>
								{result.success
									? `${result.resource_count} resources`
									: "Failed"}
							</span>
						</div>
						<div className="flex gap-1">
							<button
								type="button"
								onClick={() => setActiveTab("extracted")}
								className={`px-2 py-1 text-[11px] font-medium rounded ${activeTab === "extracted" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
							>
								Extracted Data
							</button>
							{result.bundle && (
								<button
									type="button"
									onClick={() => setActiveTab("fhir")}
									className={`px-2 py-1 text-[11px] font-medium rounded ${activeTab === "fhir" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
								>
									FHIR Bundle
								</button>
							)}
						</div>
					</div>

					{result.errors.length > 0 && (
						<div className="px-4 py-2 bg-red-50 dark:bg-red-950/30">
							{result.errors.map((err, i) => (
								<p
									key={`err-${i}`}
									className="text-xs text-red-700 dark:text-red-300"
								>
									{err}
								</p>
							))}
						</div>
					)}

					<div className="max-h-[400px] overflow-auto">
						{activeTab === "extracted" && (
							<pre className="p-4 text-[12px] font-mono whitespace-pre-wrap leading-relaxed">
								{result.extracted_text || "No data extracted"}
							</pre>
						)}
						{activeTab === "fhir" && result.bundle && (
							<pre className="p-4 text-[12px] font-mono whitespace-pre-wrap leading-relaxed">
								{JSON.stringify(result.bundle, null, 2)}
							</pre>
						)}
					</div>

					<div className="flex justify-end gap-2 px-4 py-2 border-t bg-muted/20">
						{activeTab === "fhir" && result.bundle && (
							<>
								<Button
									variant="outline"
									size="sm"
									className="h-7 text-xs"
									onClick={() =>
										navigator.clipboard.writeText(
											JSON.stringify(result.bundle, null, 2)
										)
									}
								>
									Copy FHIR
								</Button>
								<Button
									variant="outline"
									size="sm"
									className="h-7 text-xs"
									onClick={() => {
										const blob = new Blob(
											[JSON.stringify(result.bundle, null, 2)],
											{ type: "application/json" }
										);
										const a = document.createElement("a");
										a.href = URL.createObjectURL(blob);
										a.download = "fhir-bundle.json";
										a.click();
									}}
								>
									Download
								</Button>
							</>
						)}
						{activeTab === "extracted" && result.extracted_text && (
							<Button
								variant="outline"
								size="sm"
								className="h-7 text-xs"
								onClick={() =>
									navigator.clipboard.writeText(result.extracted_text)
								}
							>
								Copy Extracted
							</Button>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

export type { DocumentConvertResult };
