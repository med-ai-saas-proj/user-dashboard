import { ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ApiTopology, TOPOLOGIES } from "@/components/api-topology";
import {
	DemoEmptyState,
	DemoPageDescription,
	DemoPageShell,
	DemoSplitLayout,
} from "@/components/demo";
import { RawResponseViewer } from "@/components/raw-response-viewer";
import { ViewCodeDialog } from "@/components/view-code-dialog";
import { API_ROUTES } from "@/config/api-routes";
import { BatchPanel } from "@/features/pg-ehr-converter/components/batch-panel";
import { BhxhEnvelopeInspector } from "@/features/pg-ehr-converter/components/bhxh-envelope-inspector";
import { ConvertResultPanel } from "@/features/pg-ehr-converter/components/convert-result-panel";
import {
	ConverterForm,
	detectFormat,
} from "@/features/pg-ehr-converter/components/converter-form";
import {
	decodeBhxhEnvelopeToReadable,
	wrapBareBhxhTables,
} from "@/features/pg-ehr-converter/services/bhxh-envelope";
import type {
	BatchConvertResponse,
	ConvertResponse,
	ReverseConvertResponse,
	ValidateResponse,
} from "@/features/pg-ehr-converter/services/ehr-converter.dto";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";

const EhrConverterPage = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<ConvertResponse | null>(null);
	const [reverseResult, setReverseResult] =
		useState<ReverseConvertResponse | null>(null);
	const [validateResult, setValidateResult] = useState<ValidateResponse | null>(
		null
	);
	const [conversionTime, setConversionTime] = useState<number | null>(null);
	const [batchLoading, setBatchLoading] = useState(false);
	const [batchResult, setBatchResult] = useState<BatchConvertResponse | null>(
		null
	);
	const [showBatch, setShowBatch] = useState(false);
	const [showInspector, setShowInspector] = useState(false);
	// Decoded rendering of the BHXH input the worker actually saw — used to
	// surface a "Decoded Input" tab so the user can verify the bundle.
	const [decodedInput, setDecodedInput] = useState<string | null>(null);

	const clearResults = () => {
		setResult(null);
		setReverseResult(null);
		setValidateResult(null);
		setConversionTime(null);
		setDecodedInput(null);
	};

	// Split a paste/upload that may contain several bare BHXH tables
	// concatenated. Tables start at top-level tags (XML1..XML9 roots);
	// we use a forgiving split on blank lines + a leading `<` and let the
	// envelope helper drop anything that doesn't map to a known table.
	const splitConcatenatedXml = (raw: string): string[] => {
		const trimmed = raw.trim().replace(/^<\?xml[^?]*\?>\s*/i, "");
		// Try double-newline split first; if that yields a single chunk,
		// assume the whole input is one table.
		const blocks = trimmed
			.split(/\n\s*\n+/)
			.map((s) => s.trim())
			.filter((s) => s.startsWith("<"));
		return blocks.length > 0 ? blocks : [trimmed];
	};

	const handleConvert = async (data: string, validate: boolean) => {
		setIsLoading(true);
		clearResults();

		const format = detectFormat(data);
		const t0 = performance.now();

		try {
			// BHXH/BHYT XML uses the FHIR Converter Worker. The worker only
			// accepts the GIAMDINHHS envelope shape, so:
			//   - if the user pasted an envelope, send it as-is;
			//   - if the user pasted bare tables (one OR several concatenated),
			//     pack them all into one synthetic envelope. Sending XML1
			//     alone returns an empty bundle; bundling XML1 + line items
			//     yields a populated bundle.
			if (format === "BHXH 4210") {
				const lower = data.trim().toLowerCase();
				const inputIsEnvelope = lower.includes("<giamdinhhs");
				let xmlBody = data;
				if (!inputIsEnvelope) {
					const blocks = splitConcatenatedXml(data);
					const { envelope, tables, missingXml1 } = wrapBareBhxhTables(blocks);
					if (tables.length === 0) {
						throw new Error(
							"No recognisable BHXH tables found. Paste a <GIAMDINHHS> envelope, or one or more bare tables (TONG_HOP, CHITIEU_CHITIET_THUOC, etc.) separated by blank lines."
						);
					}
					if (missingXml1) {
						toast.warning(
							"No XML1 (TONG_HOP) detected. Without a patient/encounter header, line items have nothing to reference and the FHIR Bundle will be empty or rejected. Paste an XML1 alongside your line tables."
						);
					}
					xmlBody = envelope;
				}

				const url = API_ROUTES.SERVICES.FHIR_CONVERTER_BHYT_TO_FHIR;
				const headers = await getAuthHeaders(url);
				headers["Content-Type"] = "application/xml";
				const resp = await fetch(url, {
					method: "POST",
					headers,
					body: xmlBody,
				});

				if (!resp.ok) {
					const errText = await resp.text();
					if (resp.status >= 500) {
						throw new Error(
							"FHIR Converter Worker rejected this BHXH input. The most common cause is a child table (XML2-XML9) being sent without its XML1 (TONG_HOP) header — bundle them together so the worker can link line items to the patient/encounter."
						);
					}
					throw new Error(`HTTP ${resp.status}: ${errText}`);
				}

				const out = await resp.json();
				// bhyt-to-fhir returns an array of FHIR Bundles; merge into one
				// collection bundle for the result panel.
				const bundles: Record<string, unknown>[] = Array.isArray(out)
					? out
					: [out];
				const allEntries: Record<string, unknown>[] = [];
				for (const b of bundles) {
					const e = (b as { entry?: Record<string, unknown>[] }).entry || [];
					allEntries.push(...e);
				}
				const merged = {
					resourceType: "Bundle",
					type: "collection",
					total: allEntries.length,
					entry: allEntries,
				};
				const elapsed = Math.round(performance.now() - t0);
				setResult({
					success: true,
					source_format: "BHXH 4210",
					resource_count: allEntries.length,
					bundle: merged,
					errors: [],
					warnings: [],
					raw_response: out,
				} as unknown as ConvertResponse);
				setConversionTime(elapsed);
				// Decode the XML body the worker received so the user can verify
				// what got converted. wrapBareBhxhTables already produced a clean
				// envelope when needed, and decodeBhxhEnvelopeToReadable falls
				// back to the input itself if it's not a GIAMDINHHS envelope.
				try {
					setDecodedInput(decodeBhxhEnvelopeToReadable(xmlBody));
				} catch {
					setDecodedInput(null);
				}
				toast.success(
					`Converted BHXH XML → FHIR R4 (${allEntries.length} resources, ${elapsed}ms)`
				);
				return;
			}

			// Legacy /ehr_converter/convert handles HL7v2, CDA, FHIR JSON,
			// HL7v3 and falls back to LLM for narrative.
			const headers = await getAuthHeaders(
				API_ROUTES.SERVICES.EHR_CONVERTER_CONVERT
			);
			const resp = await fetch(API_ROUTES.SERVICES.EHR_CONVERTER_CONVERT, {
				method: "POST",
				headers,
				body: JSON.stringify({ data, validate_output: validate }),
			});

			if (!resp.ok) {
				const errText = await resp.text();
				throw new Error(`HTTP ${resp.status}: ${errText}`);
			}

			const json: ConvertResponse = await resp.json();
			const elapsed = Math.round(performance.now() - t0);
			setResult(json);
			setConversionTime(elapsed);

			if (json.success) {
				toast.success(
					`Converted ${json.source_format} → FHIR R4 (${json.resource_count} resources, ${elapsed}ms)`
				);
			} else {
				toast.error(json.errors.join(", ") || "Conversion failed");
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Request failed");
		} finally {
			setIsLoading(false);
		}
	};

	const handleReverseConvert = async (data: string) => {
		setIsLoading(true);
		clearResults();

		try {
			let bundle: Record<string, unknown>;
			try {
				bundle = JSON.parse(data);
			} catch {
				toast.error("Invalid JSON — please paste a valid FHIR Bundle");
				setIsLoading(false);
				return;
			}

			const t0 = performance.now();
			const headers = await getAuthHeaders(
				API_ROUTES.SERVICES.EHR_CONVERTER_REVERSE
			);
			const resp = await fetch(API_ROUTES.SERVICES.EHR_CONVERTER_REVERSE, {
				method: "POST",
				headers,
				body: JSON.stringify({ bundle, message_type: "ADT^A01" }),
			});

			if (!resp.ok) {
				const errText = await resp.text();
				throw new Error(`HTTP ${resp.status}: ${errText}`);
			}

			const json: ReverseConvertResponse = await resp.json();
			const elapsed = Math.round(performance.now() - t0);
			setReverseResult(json);
			setConversionTime(elapsed);

			if (json.success) {
				toast.success(
					`Converted to ${json.output_format} (${json.message_type}, ${elapsed}ms)`
				);
			} else {
				toast.error(json.errors.join(", ") || "Reverse conversion failed");
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Request failed");
		} finally {
			setIsLoading(false);
		}
	};

	const handleValidate = async (bundle: Record<string, unknown>) => {
		setIsLoading(true);
		clearResults();

		try {
			const headers = await getAuthHeaders(
				API_ROUTES.SERVICES.EHR_CONVERTER_VALIDATE
			);
			const resp = await fetch(API_ROUTES.SERVICES.EHR_CONVERTER_VALIDATE, {
				method: "POST",
				headers,
				body: JSON.stringify({ bundle }),
			});

			if (!resp.ok) {
				const errText = await resp.text();
				throw new Error(`HTTP ${resp.status}: ${errText}`);
			}

			const json: ValidateResponse = await resp.json();
			setValidateResult(json);

			if (json.valid) {
				toast.success("Bundle is valid FHIR R4");
			} else {
				toast.warning(`${json.errors.length} validation error(s)`);
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Request failed");
		} finally {
			setIsLoading(false);
		}
	};

	const handleBatchConvert = async (
		items: string[],
		validate: boolean,
		workers: number | null
	) => {
		setBatchLoading(true);

		try {
			const headers = await getAuthHeaders(
				API_ROUTES.SERVICES.EHR_CONVERTER_BATCH
			);
			const resp = await fetch(API_ROUTES.SERVICES.EHR_CONVERTER_BATCH, {
				method: "POST",
				headers,
				body: JSON.stringify({ items, validate_output: validate, workers }),
			});

			if (!resp.ok) {
				const errText = await resp.text();
				throw new Error(`HTTP ${resp.status}: ${errText}`);
			}

			const json: BatchConvertResponse = await resp.json();
			setBatchResult(json);
			toast.success(
				`Batch: ${json.succeeded}/${json.total} files, ${json.resource_count.toLocaleString()} resources`
			);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Batch request failed");
		} finally {
			setBatchLoading(false);
		}
	};

	const hasResult = result || reverseResult || validateResult;

	return (
		<DashboardLayout pageTitle="EHR Converter">
			<DemoPageShell>
				<DemoPageDescription>
					Auto-detect & convert HL7v2/v3, CDA/C-CDA, BHXH 4210, HSYT, EMRBYT to
					FHIR R4. Bidirectional conversion (FHIR ↔ HL7v2) via Azure FHIR
					Converter Worker.
				</DemoPageDescription>
				<DemoSplitLayout
					left={
						<ConverterForm
							onConvert={handleConvert}
							onReverseConvert={handleReverseConvert}
							onValidate={handleValidate}
							isLoading={isLoading}
						/>
					}
					right={
						<>
							<div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
								<h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
									Output
								</h2>
								<ViewCodeDialog
									endpoint={API_ROUTES.SERVICES.EHR_CONVERTER_CONVERT}
									method="POST"
									body={{
										data: "<HL7v2 or CDA or FHIR data>",
										validate_output: true,
									}}
									description="Convert healthcare data to FHIR R4"
								/>
							</div>
							{hasResult ? (
								<>
									<ConvertResultPanel
										result={result}
										reverseResult={reverseResult}
										validateResult={validateResult}
										conversionTime={conversionTime}
										decodedInput={decodedInput}
										decodedInputLabel="Decoded Input"
									/>
									<div className="px-4 pb-4">
										<RawResponseViewer
											data={result || reverseResult || validateResult}
										/>
									</div>
								</>
							) : (
								<DemoEmptyState
									icon={ChevronRightIcon}
									description={
										<>
											Paste healthcare data on the left and click{" "}
											<strong>Convert to FHIR</strong> to see the output here.
										</>
									}
									hint="Supports HL7v2, CDA/C-CDA, HL7v3, BHXH 4210, and FHIR JSON"
								/>
							)}
						</>
					}
				/>

				{/* Batch section */}
				<div className="flex-shrink-0">
					<button
						type="button"
						onClick={() => setShowBatch(!showBatch)}
						className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
					>
						<svg
							width="12"
							height="12"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							className={`transition-transform ${showBatch ? "rotate-90" : ""}`}
							aria-hidden="true"
						>
							<title>Toggle</title>
							<path d="M4 2l5 4-5 4" />
						</svg>
						Batch Conversion
					</button>
					{showBatch && (
						<div className="px-4 pb-4">
							<BatchPanel
								onBatchConvert={handleBatchConvert}
								isLoading={batchLoading}
								batchResult={batchResult}
							/>
						</div>
					)}
				</div>

				{/* BHXH envelope inspector — paste a GIAMDINHHS file or bare
				    BHXH tables to inspect what the worker actually parses. */}
				<div className="flex-shrink-0">
					<button
						type="button"
						onClick={() => setShowInspector(!showInspector)}
						className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
					>
						<svg
							width="12"
							height="12"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							className={`transition-transform ${showInspector ? "rotate-90" : ""}`}
							aria-hidden="true"
						>
							<title>Toggle</title>
							<path d="M4 2l5 4-5 4" />
						</svg>
						BHXH Envelope Inspector
					</button>
					{showInspector && (
						<div className="px-4 pb-4">
							<BhxhEnvelopeInspector />
						</div>
					)}
				</div>
			</DemoPageShell>

			<div className="px-4 py-2 border-t">
				<ApiTopology {...TOPOLOGIES.ehr_converter} />
			</div>
		</DashboardLayout>
	);
};

export default EhrConverterPage;
