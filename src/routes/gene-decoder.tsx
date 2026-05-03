import { DnaIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DemoEmptyState } from "@/components/demo";
import { Button } from "@/components/shadcn/button";
import { ViewCodeDialog } from "@/components/view-code-dialog";
import { API_ROUTES } from "@/config/api-routes";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";

interface SequenceRecord {
	id: string;
	description: string;
	sequence: string;
	length: number;
	gc_content: number;
	quality_scores?: string;
}

interface DecodeResponse {
	success: boolean;
	detected_format: string;
	records: SequenceRecord[];
	total_bases: number;
	avg_gc_content: number;
	errors: string[];
}

interface AnalyzeResponse {
	success: boolean;
	sequence_length: number;
	gc_content: number;
	variants: {
		position: number;
		ref: string;
		alt: string;
		variant_type: string;
		gene: string;
		annotation: string;
	}[];
	open_reading_frames: {
		start: number;
		end: number;
		length: number;
		frame: string;
		protein_length: number;
	}[];
	repeat_regions: {
		motif: string;
		count: number;
		start: number;
		end: number;
		type: string;
	}[];
	clinical_summary: string;
	errors: string[];
}

const FASTA_EXAMPLE = `>BRCA1_exon11 Homo sapiens breast cancer 1
ATGGATTTATCTGCTCTTCGCGTTGAAGAAGTACAAAATGTCATTAATGCTATGCAGAAAATCTTAGAGTGTCCCATCTGTCTGGAGTTGATCAA
>TP53_exon7 Homo sapiens tumor protein p53
GCCTCATCTTGGGCCTGTGTTATCTCCTAGGTTGGCTCTGACTGTACCACCATCCACTACAACTACATGTGTAACAGTTCCTGCATGGGCGGC`;

const gcColor = (gc: number) => {
	if (gc >= 55) return "text-red-600 dark:text-red-400";
	if (gc >= 45) return "text-green-600 dark:text-green-400";
	if (gc >= 35) return "text-yellow-600 dark:text-yellow-400";
	return "text-blue-600 dark:text-blue-400";
};

const GeneDecoderPage = () => {
	const [input, setInput] = useState("");
	const [mode, setMode] = useState<"decode" | "analyze">("decode");
	const [isLoading, setIsLoading] = useState(false);
	const [decodeResult, setDecodeResult] = useState<DecodeResponse | null>(null);
	const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResponse | null>(
		null
	);

	const handleSubmit = async () => {
		if (!input.trim()) return;
		setIsLoading(true);
		setDecodeResult(null);
		setAnalyzeResult(null);

		try {
			const endpoint =
				mode === "decode"
					? API_ROUTES.SERVICES.GENE_DECODER_DECODE
					: API_ROUTES.SERVICES.GENE_DECODER_ANALYZE;

			const body =
				mode === "decode"
					? { data: input, format: "auto" }
					: {
							sequence: input.replace(/^>.*\n/gm, "").replace(/\n/g, ""),
							include_clinical: false,
						};

			const headers = await getAuthHeaders(endpoint);
			const resp = await fetch(endpoint, {
				method: "POST",
				headers,
				body: JSON.stringify(body),
			});

			if (!resp.ok)
				throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
			const json = await resp.json();

			if (mode === "decode") {
				setDecodeResult(json);
				toast.success(`Decoded ${json.records?.length ?? 0} sequence(s)`);
			} else {
				setAnalyzeResult(json);
				toast.success(`Analysis complete: ${json.sequence_length}bp`);
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Request failed");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<DashboardLayout pageTitle="Gene Decoder">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				<div className="flex items-center justify-between px-4 py-1.5 border-b">
					<div className="flex gap-1">
						<Button
							type="button"
							variant={mode === "decode" ? "default" : "ghost"}
							size="sm"
							onClick={() => setMode("decode")}
						>
							Decode
						</Button>
						<Button
							type="button"
							variant={mode === "analyze" ? "default" : "ghost"}
							size="sm"
							onClick={() => setMode("analyze")}
						>
							Analyze
						</Button>
					</div>
					<ViewCodeDialog
						endpoint={API_ROUTES.SERVICES.GENE_DECODER_DECODE}
						method="POST"
						body={{ data: ">seq1\nATCGATCG", format: "auto" }}
						description="Decode gene sequences from sequencing machine output"
					/>
				</div>

				<div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden border-b">
					{/* Left: Input */}
					<div className="border-r flex flex-col overflow-hidden">
						<div className="p-4 border-b flex items-center justify-between">
							<span className="text-sm font-medium">
								{mode === "decode"
									? "Sequence Data (FASTA / FASTQ / Raw)"
									: "Raw Nucleotide Sequence"}
							</span>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setInput(FASTA_EXAMPLE)}
							>
								Load Example
							</Button>
						</div>
						<div className="flex-1 p-4 overflow-hidden flex flex-col">
							<textarea
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder={
									mode === "decode"
										? "Paste FASTA, FASTQ, or raw ATCG sequence..."
										: "Paste raw nucleotide sequence (ATCG)..."
								}
								className="flex-1 w-full rounded-md border px-3 py-2 text-xs font-mono bg-background resize-none"
								spellCheck={false}
							/>
							<div className="mt-3">
								<Button
									type="button"
									onClick={handleSubmit}
									disabled={isLoading || !input.trim()}
								>
									{isLoading
										? "Processing..."
										: mode === "decode"
											? "Decode Sequence"
											: "Analyze Sequence"}
								</Button>
							</div>
						</div>
					</div>

					{/* Right: Results */}
					<div className="flex flex-col overflow-hidden">
						{decodeResult ? (
							<div className="flex-1 overflow-y-auto p-4 space-y-4">
								<div className="flex gap-6 text-sm">
									<div>
										<span className="text-muted-foreground">Format:</span>{" "}
										<strong>{decodeResult.detected_format}</strong>
									</div>
									<div>
										<span className="text-muted-foreground">Sequences:</span>{" "}
										<strong>{decodeResult.records.length}</strong>
									</div>
									<div>
										<span className="text-muted-foreground">Total bases:</span>{" "}
										<strong>{decodeResult.total_bases.toLocaleString()}</strong>
									</div>
									<div>
										<span className="text-muted-foreground">Avg GC:</span>{" "}
										<strong className={gcColor(decodeResult.avg_gc_content)}>
											{decodeResult.avg_gc_content}%
										</strong>
									</div>
								</div>
								{decodeResult.records.map((r, i) => (
									<div
										key={`rec-${i}`}
										className="border rounded-md p-3 space-y-2"
									>
										<div className="flex items-center justify-between">
											<span className="font-medium text-sm">{r.id}</span>
											<span className="text-xs text-muted-foreground">
												{r.length}bp | GC:{" "}
												<span className={gcColor(r.gc_content)}>
													{r.gc_content}%
												</span>
											</span>
										</div>
										{r.description && (
											<p className="text-xs text-muted-foreground">
												{r.description}
											</p>
										)}
										<pre className="text-[10px] font-mono bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap break-all">
											{r.sequence}
										</pre>
									</div>
								))}
							</div>
						) : analyzeResult ? (
							<div className="flex-1 overflow-y-auto p-4 space-y-4">
								<div className="flex gap-6 text-sm">
									<div>
										<span className="text-muted-foreground">Length:</span>{" "}
										<strong>
											{analyzeResult.sequence_length.toLocaleString()}bp
										</strong>
									</div>
									<div>
										<span className="text-muted-foreground">GC:</span>{" "}
										<strong className={gcColor(analyzeResult.gc_content)}>
											{analyzeResult.gc_content}%
										</strong>
									</div>
									<div>
										<span className="text-muted-foreground">ORFs:</span>{" "}
										<strong>{analyzeResult.open_reading_frames.length}</strong>
									</div>
									<div>
										<span className="text-muted-foreground">Repeats:</span>{" "}
										<strong>{analyzeResult.repeat_regions.length}</strong>
									</div>
								</div>
								{analyzeResult.open_reading_frames.length > 0 && (
									<div>
										<span className="text-sm font-medium">
											Open Reading Frames
										</span>
										<div className="mt-2 space-y-1">
											{analyzeResult.open_reading_frames.map((orf, i) => (
												<div
													key={`orf-${i}`}
													className="flex items-center gap-3 p-2 rounded border text-xs"
												>
													<span className="font-mono font-medium">
														{orf.frame}
													</span>
													<span>
														{orf.start}-{orf.end}
													</span>
													<span className="text-muted-foreground">
														{orf.length}bp ({orf.protein_length} aa)
													</span>
												</div>
											))}
										</div>
									</div>
								)}
								{analyzeResult.repeat_regions.length > 0 && (
									<div>
										<span className="text-sm font-medium">Repeat Regions</span>
										<div className="mt-2 space-y-1">
											{analyzeResult.repeat_regions.map((rep, i) => (
												<div
													key={`rep-${i}`}
													className="flex items-center gap-3 p-2 rounded border text-xs"
												>
													<span className="font-mono font-medium">
														{rep.motif}
													</span>
													<span>&times;{rep.count}</span>
													<span className="text-muted-foreground">
														{rep.type} ({rep.start}-{rep.end})
													</span>
												</div>
											))}
										</div>
									</div>
								)}
								{analyzeResult.clinical_summary && (
									<div>
										<span className="text-sm font-medium">
											Clinical Summary
										</span>
										<p className="text-sm mt-1 text-muted-foreground">
											{analyzeResult.clinical_summary}
										</p>
									</div>
								)}
							</div>
						) : (
							<DemoEmptyState
								icon={DnaIcon}
								description={
									<>
										Paste sequence data on the left and click{" "}
										<strong>{mode === "decode" ? "Decode" : "Analyze"}</strong>{" "}
										to see results. Supports FASTA, FASTQ, and raw nucleotide
										formats.
									</>
								}
							/>
						)}
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
};

export default GeneDecoderPage;
