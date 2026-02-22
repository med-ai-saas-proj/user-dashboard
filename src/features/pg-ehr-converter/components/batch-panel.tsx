import { useState, useRef } from "react";
import { Button } from "@/components/shadcn/button";
import type { BatchConvertResponse } from "../services/ehr-converter.dto";

type BatchPanelProps = {
	onBatchConvert: (
		items: string[],
		validate: boolean,
		workers: number | null
	) => Promise<void>;
	isLoading: boolean;
	batchResult: BatchConvertResponse | null;
};

export function BatchPanel({
	onBatchConvert,
	isLoading,
	batchResult,
}: BatchPanelProps) {
	const [files, setFiles] = useState<File[]>([]);
	const [validate, setValidate] = useState(false);
	const [workers, setWorkers] = useState<string>("auto");
	const fileInputRef = useRef<HTMLInputElement>(null);
	const dropRef = useRef<HTMLButtonElement>(null);

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		dropRef.current?.classList.remove("ring-2", "ring-primary");
		const newFiles = Array.from(e.dataTransfer.files);
		setFiles((prev) => [...prev, ...newFiles]);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		dropRef.current?.classList.add("ring-2", "ring-primary");
	};

	const handleDragLeave = () => {
		dropRef.current?.classList.remove("ring-2", "ring-primary");
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newFiles = Array.from(e.target.files || []);
		setFiles((prev) => [...prev, ...newFiles]);
		e.target.value = "";
	};

	const handleRun = async () => {
		if (!files.length) return;
		const items: string[] = [];
		for (const file of files) {
			const text = await file.text();
			items.push(text);
		}
		const w = workers === "auto" ? null : parseInt(workers, 10);
		await onBatchConvert(items, validate, w);
		setFiles([]);
	};

	return (
		<div className="border rounded-lg overflow-hidden">
			<div className="px-4 py-3 bg-muted/30 border-b">
				<h3 className="text-sm font-semibold">Batch Conversion</h3>
				<p className="text-[11px] text-muted-foreground mt-0.5">
					Drop multiple HL7/CDA/XML files to convert them in parallel
				</p>
			</div>

			<div className="p-4 space-y-4">
				<button
					type="button"
					ref={dropRef}
					onDrop={handleDrop}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onClick={() => fileInputRef.current?.click()}
					className="w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/30 transition-colors"
				>
					<p className="text-sm text-muted-foreground">
						{files.length > 0
							? `${files.length} file(s): ${files.map((f) => f.name).join(", ")}`
							: "Drop files here or click to browse"}
					</p>
				</button>
				<input
					ref={fileInputRef}
					type="file"
					multiple
					accept=".hl7,.xml,.json,.txt,.cda"
					className="hidden"
					onChange={handleFileSelect}
				/>

				<div className="flex items-center gap-4">
					<label className="flex items-center gap-2 text-xs">
						<input
							type="checkbox"
							checked={validate}
							onChange={(e) => setValidate(e.target.checked)}
							className="rounded border-muted-foreground/30"
						/>
						<span className="text-muted-foreground">Validate outputs</span>
					</label>
					<label className="flex items-center gap-2 text-xs">
						<span className="text-muted-foreground">Workers:</span>
						<select
							value={workers}
							onChange={(e) => setWorkers(e.target.value)}
							className="text-xs border rounded px-1.5 py-0.5 bg-background"
						>
							<option value="auto">Auto</option>
							{[1, 2, 4, 8].map((n) => (
								<option key={n} value={n}>
									{n}
								</option>
							))}
						</select>
					</label>
					<div className="flex-1" />
					{files.length > 0 && (
						<Button
							variant="ghost"
							size="sm"
							className="h-7 text-xs"
							onClick={() => setFiles([])}
						>
							Clear files
						</Button>
					)}
					<Button
						size="sm"
						className="h-8 text-xs"
						onClick={handleRun}
						disabled={!files.length || isLoading}
					>
						{isLoading ? (
							<span className="flex items-center gap-1.5">
								<span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
								Processing...
							</span>
						) : (
							"Run Batch"
						)}
					</Button>
				</div>
			</div>

			{batchResult && (
				<div className="border-t">
					<div className="px-4 py-3 bg-muted/20 flex flex-wrap gap-x-6 gap-y-1 text-xs">
						<span>
							Total: <strong>{batchResult.total}</strong>
						</span>
						<span className="text-green-700 dark:text-green-400">
							Success: <strong>{batchResult.succeeded}</strong>
						</span>
						<span className="text-red-700 dark:text-red-400">
							Failed: <strong>{batchResult.failed}</strong>
						</span>
						<span>
							Resources:{" "}
							<strong>{batchResult.resource_count.toLocaleString()}</strong>
						</span>
						<span>
							Time:{" "}
							<strong>
								{batchResult.elapsed_ms > 1000
									? `${(batchResult.elapsed_ms / 1000).toFixed(1)}s`
									: `${batchResult.elapsed_ms}ms`}
							</strong>
						</span>
						<span>
							Throughput: <strong>{batchResult.throughput_per_sec}/s</strong>
						</span>
					</div>
					{batchResult.results.length > 0 && (
						<div className="overflow-auto max-h-[300px]">
							<table className="w-full text-xs">
								<thead className="bg-muted/30 sticky top-0">
									<tr>
										<th className="px-3 py-2 text-left font-medium">#</th>
										<th className="px-3 py-2 text-left font-medium">File</th>
										<th className="px-3 py-2 text-left font-medium">Format</th>
										<th className="px-3 py-2 text-left font-medium">Type</th>
										<th className="px-3 py-2 text-right font-medium">
											Resources
										</th>
										<th className="px-3 py-2 text-left font-medium">Status</th>
									</tr>
								</thead>
								<tbody className="divide-y">
									{batchResult.results.map((r) => (
										<tr key={r.index} className="hover:bg-muted/30">
											<td className="px-3 py-1.5">{r.index + 1}</td>
											<td className="px-3 py-1.5 font-mono">
												{r.filename || `File ${r.index + 1}`}
											</td>
											<td className="px-3 py-1.5">{r.source_format || "—"}</td>
											<td className="px-3 py-1.5">{r.message_type || "—"}</td>
											<td className="px-3 py-1.5 text-right">
												{(r.resource_count || 0).toLocaleString()}
											</td>
											<td
												className={`px-3 py-1.5 ${r.success ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
											>
												{r.success ? "OK" : (r.errors || []).join("; ")}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
