import {
	CheckIcon,
	ChevronRightIcon,
	CodeIcon,
	CopyIcon,
	Loader2Icon,
	PlusIcon,
	Trash2Icon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ApiTopology, TOPOLOGIES } from "@/components/api-topology";
import {
	DemoEmptyState,
	DemoPageDescription,
	DemoPageShell,
	DemoSplitLayout,
} from "@/components/demo";
import { RawResponseViewer } from "@/components/raw-response-viewer";
import { Button } from "@/components/shadcn/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/shadcn/dialog";
import { Textarea } from "@/components/shadcn/textarea";
import { API_ROUTES } from "@/config/api-routes";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Wire types — mirror the backend POST /ehr_converter/ingest contract exactly.
// The SDK has no ingest method yet, so we type the response inline here rather
// than importing a generated DTO.
// ---------------------------------------------------------------------------

interface IngestItemInput {
	data: string;
	content_type?: string;
	filename?: string;
}

interface IngestResultRow {
	kind: string;
	cleaner: string;
	status: string;
	resource_count?: number;
	error?: string;
}

interface IngestResponse {
	success: boolean;
	item_count: number;
	converted_count: number;
	deferred_count: number;
	failed_count: number;
	resource_count: number;
	results: IngestResultRow[];
	bundle: Record<string, unknown>;
}

// A single editable input row in the left pane. `id` is a stable client-side
// key so React reconciliation survives add/remove without remounting siblings.
interface InputRow {
	id: string;
	data: string;
	content_type: string;
	filename: string;
}

const newRow = (): InputRow => ({
	id: crypto.randomUUID(),
	data: "",
	content_type: "",
	filename: "",
});

// Status → token-driven pill styling. Unknown statuses fall back to muted.
const STATUS_STYLES: Record<string, string> = {
	converted:
		"bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
	deferred:
		"bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
	failed: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
};

function StatusPill({ status }: { status: string }) {
	const key = status?.toLowerCase() ?? "";
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
				STATUS_STYLES[key] ?? "bg-muted text-muted-foreground border-border"
			)}
		>
			{status || "—"}
		</span>
	);
}

function StatCard({
	label,
	value,
	accent,
}: {
	label: string;
	value: number;
	accent?: string;
}) {
	return (
		<div className="flex flex-col rounded-lg border bg-muted/20 px-3 py-2">
			<span className={cn("text-lg font-semibold tabular-nums", accent)}>
				{value.toLocaleString()}
			</span>
			<span className="text-[10px] uppercase tracking-wider text-muted-foreground">
				{label}
			</span>
		</div>
	);
}

// Lightweight raw-only code dialog. We deliberately do NOT use ViewCodeDialog
// here: it always emits a Venera SDK tab, and the SDK has no `ingest` method
// yet. Showing an SDK snippet would be a lie. This dialog renders cURL + fetch
// against the live endpoint instead.
function IngestCodeDialog({
	endpoint,
	items,
}: {
	endpoint: string;
	items: IngestItemInput[];
}) {
	const [tab, setTab] = useState<"curl" | "fetch">("curl");
	const [copied, setCopied] = useState(false);

	const sample =
		items.length > 0
			? { items }
			: {
					items: [
						{
							data: "MSH|^~\\&|HIS|FAC|...",
							content_type: "text/plain",
							filename: "adt.hl7",
						},
					],
				};
	const bodyJson = JSON.stringify(sample, null, 2);
	const bodyInline = JSON.stringify(sample);

	const curl = `curl -X POST "${endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "X-Api-Key: YOUR_API_KEY" \\
  -d '${bodyInline}'`;

	const fetchJs = `const res = await fetch("${endpoint}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Api-Key": "YOUR_API_KEY",
  },
  body: JSON.stringify(${bodyJson}),
});

const result = await res.json();
console.log(result.results, result.bundle);`;

	const active = tab === "curl" ? curl : fetchJs;

	const copy = () => {
		navigator.clipboard.writeText(active);
		setCopied(true);
		toast.success("Copied to clipboard");
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
					<CodeIcon className="size-3" />
					View Code
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>API Code Snippets</DialogTitle>
					<DialogDescription>
						POST {endpoint} — the Venera SDK has no <code>ingest</code> method
						yet, so use raw HTTP for now.
					</DialogDescription>
				</DialogHeader>
				<div className="flex gap-1 border-b pb-0">
					{(["curl", "fetch"] as const).map((id) => (
						<button
							key={id}
							type="button"
							onClick={() => setTab(id)}
							className={cn(
								"px-3 py-1.5 text-xs font-medium border-b-2 transition-colors -mb-px",
								tab === id
									? "border-primary text-primary"
									: "border-transparent text-muted-foreground hover:text-foreground"
							)}
						>
							{id === "curl" ? "cURL" : "JavaScript (fetch)"}
						</button>
					))}
				</div>
				<div className="flex-1 overflow-auto">
					<div className="relative">
						<pre className="p-4 bg-muted/50 rounded-lg text-[12px] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
							{active}
						</pre>
						<button
							type="button"
							onClick={copy}
							className="absolute top-2 right-2 p-1.5 rounded-md bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
						>
							{copied ? (
								<CheckIcon className="size-3.5" />
							) : (
								<CopyIcon className="size-3.5" />
							)}
						</button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

const EhrIngestPage = () => {
	const [rows, setRows] = useState<InputRow[]>([newRow()]);
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<IngestResponse | null>(null);
	const [elapsed, setElapsed] = useState<number | null>(null);

	const endpoint = API_ROUTES.SERVICES.EHR_CONVERTER_INGEST;

	// Build the request payload from non-empty rows; optional fields are only
	// included when the user actually typed something.
	const items = useMemo<IngestItemInput[]>(
		() =>
			rows
				.filter((r) => r.data.trim().length > 0)
				.map((r) => {
					const item: IngestItemInput = { data: r.data };
					if (r.content_type.trim()) item.content_type = r.content_type.trim();
					if (r.filename.trim()) item.filename = r.filename.trim();
					return item;
				}),
		[rows]
	);

	const updateRow = (id: string, patch: Partial<InputRow>) => {
		setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
	};

	const addRow = () => setRows((prev) => [...prev, newRow()]);

	const removeRow = (id: string) =>
		setRows((prev) =>
			prev.length > 1 ? prev.filter((r) => r.id !== id) : prev
		);

	const handleRun = async () => {
		if (items.length === 0) {
			toast.error("Add at least one item with some data to ingest");
			return;
		}

		setIsLoading(true);
		setResult(null);
		setElapsed(null);
		const t0 = performance.now();

		try {
			const headers = await getAuthHeaders(endpoint);
			const resp = await fetch(endpoint, {
				method: "POST",
				headers,
				credentials: "include",
				body: JSON.stringify({ items }),
			});

			if (!resp.ok) {
				const errText = await resp.text();
				throw new Error(`HTTP ${resp.status}: ${errText}`);
			}

			const json: IngestResponse = await resp.json();
			const ms = Math.round(performance.now() - t0);
			setResult(json);
			setElapsed(ms);

			if (json.success) {
				toast.success(
					`Ingested ${json.item_count} item(s) → ${json.resource_count.toLocaleString()} FHIR resources (${ms}ms)`
				);
			} else {
				toast.warning(
					`${json.failed_count} item(s) failed, ${json.converted_count} converted`
				);
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Request failed");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<DashboardLayout pageTitle="EHR Ingest">
			<DemoPageShell>
				<DemoPageDescription>
					Ingestion Orchestrator — drop in mixed raw inputs (HL7v2, CDA, BHXH
					4210, FHIR JSON, image, PDF, audio, text). Each item is
					format-detected, routed to the right cleaner/converter, and merged
					into one FHIR R4 bundle. Bộ điều phối nhập liệu — gộp nhiều nguồn
					thành một bundle FHIR R4.
				</DemoPageDescription>
				<DemoSplitLayout
					left={
						<>
							<div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
								<h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
									Inputs ({items.length})
								</h2>
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="h-7 text-xs gap-1.5"
									onClick={addRow}
								>
									<PlusIcon className="size-3" />
									Add item
								</Button>
							</div>
							<div className="flex-1 overflow-auto px-4 py-3 space-y-4">
								{rows.map((row, idx) => (
									<div
										key={row.id}
										className="rounded-lg border bg-card/40 p-3 space-y-2"
									>
										<div className="flex items-center justify-between">
											<span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
												Item {idx + 1}
											</span>
											<button
												type="button"
												onClick={() => removeRow(row.id)}
												disabled={rows.length === 1}
												className="text-muted-foreground hover:text-destructive disabled:opacity-30 disabled:hover:text-muted-foreground transition-colors"
												title="Remove item"
											>
												<Trash2Icon className="size-3.5" />
											</button>
										</div>
										<Textarea
											value={row.data}
											onChange={(e) =>
												updateRow(row.id, { data: e.target.value })
											}
											placeholder="Paste raw input — HL7v2 message, CDA/C-CDA XML, BHXH 4210, FHIR JSON, or free text…"
											className="min-h-28 font-mono text-xs resize-y"
										/>
										<div className="grid grid-cols-2 gap-2">
											<input
												type="text"
												value={row.content_type}
												onChange={(e) =>
													updateRow(row.id, { content_type: e.target.value })
												}
												placeholder="content_type (optional)"
												className="h-8 rounded-md border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
											/>
											<input
												type="text"
												value={row.filename}
												onChange={(e) =>
													updateRow(row.id, { filename: e.target.value })
												}
												placeholder="filename (optional)"
												className="h-8 rounded-md border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
											/>
										</div>
									</div>
								))}
							</div>
							<div className="border-t px-4 py-3">
								<Button
									type="button"
									onClick={handleRun}
									disabled={isLoading || items.length === 0}
									className="w-full gap-2"
								>
									{isLoading ? (
										<>
											<Loader2Icon className="size-4 animate-spin" />
											Ingesting…
										</>
									) : (
										<>Run Ingestion</>
									)}
								</Button>
							</div>
						</>
					}
					right={
						<>
							<div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
								<h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
									Output
									{elapsed !== null && (
										<span className="ml-2 font-normal normal-case tracking-normal text-muted-foreground/70">
											{elapsed}ms
										</span>
									)}
								</h2>
								<IngestCodeDialog endpoint={endpoint} items={items} />
							</div>
							{result ? (
								<div className="flex-1 overflow-auto p-4 space-y-4">
									{/* Totals */}
									<div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
										<StatCard label="Items" value={result.item_count} />
										<StatCard
											label="Converted"
											value={result.converted_count}
											accent="text-emerald-600 dark:text-emerald-400"
										/>
										<StatCard
											label="Deferred"
											value={result.deferred_count}
											accent="text-amber-600 dark:text-amber-400"
										/>
										<StatCard
											label="Failed"
											value={result.failed_count}
											accent={
												result.failed_count > 0
													? "text-rose-600 dark:text-rose-400"
													: undefined
											}
										/>
										<StatCard
											label="Resources"
											value={result.resource_count}
											accent="text-primary"
										/>
									</div>

									{/* Per-item results table */}
									<div className="rounded-lg border overflow-hidden">
										<div className="px-3 py-2 border-b bg-muted/30">
											<h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
												Per-item results
											</h3>
										</div>
										<div className="overflow-x-auto">
											<table className="w-full text-xs">
												<thead>
													<tr className="border-b text-muted-foreground">
														<th className="px-3 py-1.5 text-left font-medium">
															#
														</th>
														<th className="px-3 py-1.5 text-left font-medium">
															Kind
														</th>
														<th className="px-3 py-1.5 text-left font-medium">
															Cleaner
														</th>
														<th className="px-3 py-1.5 text-left font-medium">
															Status
														</th>
														<th className="px-3 py-1.5 text-right font-medium">
															Resources / Error
														</th>
													</tr>
												</thead>
												<tbody>
													{result.results.map((r, i) => (
														<tr
															key={`${r.kind}-${i}`}
															className="border-b last:border-0 hover:bg-muted/20"
														>
															<td className="px-3 py-2 tabular-nums text-muted-foreground">
																{i + 1}
															</td>
															<td className="px-3 py-2 font-medium">
																{r.kind || "—"}
															</td>
															<td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">
																{r.cleaner || "—"}
															</td>
															<td className="px-3 py-2">
																<StatusPill status={r.status} />
															</td>
															<td className="px-3 py-2 text-right">
																{r.error ? (
																	<span className="text-rose-600 dark:text-rose-400">
																		{r.error}
																	</span>
																) : (
																	<span className="tabular-nums font-medium">
																		{(r.resource_count ?? 0).toLocaleString()}
																	</span>
																)}
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>

									{/* Merged FHIR bundle (collapsible JSON) */}
									<div>
										<h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
											Merged FHIR R4 bundle
										</h3>
										<RawResponseViewer data={result.bundle} />
									</div>

									{/* Full raw response */}
									<RawResponseViewer data={result} />
								</div>
							) : (
								<DemoEmptyState
									icon={ChevronRightIcon}
									description={
										<>
											Add one or more raw inputs on the left and click{" "}
											<strong>Run Ingestion</strong> to see the merged bundle
											here.
										</>
									}
									hint="Each item is auto-detected (HL7v2, CDA, BHXH 4210, FHIR JSON, image, PDF, audio, text) and routed to the right converter."
								/>
							)}
						</>
					}
				/>
			</DemoPageShell>

			<div className="px-4 py-2 border-t">
				<ApiTopology {...TOPOLOGIES.ehr_ingest} />
			</div>
		</DashboardLayout>
	);
};

export default EhrIngestPage;
