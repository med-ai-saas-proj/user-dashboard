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
import { ConvertResultPanel } from "@/features/pg-ehr-converter/components/convert-result-panel";
import {
	ConverterForm,
	detectFormat,
} from "@/features/pg-ehr-converter/components/converter-form";
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

	const clearResults = () => {
		setResult(null);
		setReverseResult(null);
		setValidateResult(null);
		setConversionTime(null);
	};

	// Wrap a bare BHXH XML fragment (e.g. <CHITIEU_CHITIET_DICHVUCANLAMSANG>)
	// in the GIAMDINHHS envelope shape the FHIR Converter Worker expects.
	// The worker reads each table from <NOIDUNGFILE>base64</NOIDUNGFILE> with
	// a <LOAIHOSO>XMLn</LOAIHOSO> tag describing which table it is.
	const wrapBhxhFragment = (raw: string): string => {
		const stripped = raw.trim().replace(/^<\?xml[^?]*\?>\s*/i, "");
		// Pull out the root element tag to map to a table number.
		const m = stripped.match(/^<([A-Z0-9_]+)/i);
		const root = m?.[1]?.toUpperCase() ?? "";
		const ROOT_TO_LOAI: Record<string, string> = {
			TONG_HOP: "XML1",
			CHITIEUKCB: "XML1",
			CHI_TIET_THUOC: "XML2",
			CHITIETTHUOC: "XML2",
			CHITIEU_CHITIET_DICHVUCANLAMSANG: "XML3",
			CHITIET_DVKT: "XML3",
			CHITIEU_CHITIET_DVKT_VTYT: "XML3",
			CHITIET_CLSANLAMSANG: "XML3",
			CHITIET_DIEN_BIEN: "XML4",
			CHITIET_DIEN_BIEN_BENH: "XML4",
			CHITIET_RA_VIEN: "XML5",
			THONGTINDONTHUOC: "XML6",
			CHITIET_GIAM_DINH: "XML7",
			CHITIET_CHUYEN_DE: "XML8",
			CHITIET_THANH_TOAN: "XML9",
		};
		// XML[1-9] tags pass through verbatim.
		const xmlTagMatch = root.match(/^XML([1-9])$/);
		const loaiHoSo =
			ROOT_TO_LOAI[root] ?? (xmlTagMatch ? `XML${xmlTagMatch[1]}` : "XML1");
		// btoa wants Latin-1; encode UTF-8 first to keep Vietnamese diacritics intact.
		const utf8 = unescape(encodeURIComponent(stripped));
		const b64 = btoa(utf8);
		return `<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<GIAMDINHHS>
  <THONGTINDONVI>
    <MACSKCB>00000</MACSKCB>
  </THONGTINDONVI>
  <THONGTINHOSO>
    <NGAYLAP>${new Date().toISOString().slice(0, 10).replace(/-/g, "")}</NGAYLAP>
    <SOLUONGHOSO>1</SOLUONGHOSO>
    <DANHSACHHOSO>
      <HOSO>
        <FILEHOSO>
          <LOAIHOSO>${loaiHoSo}</LOAIHOSO>
          <NOIDUNGFILE>${b64}</NOIDUNGFILE>
        </FILEHOSO>
      </HOSO>
    </DANHSACHHOSO>
  </THONGTINHOSO>
</GIAMDINHHS>`;
	};

	const handleConvert = async (data: string, validate: boolean) => {
		setIsLoading(true);
		clearResults();

		const format = detectFormat(data);
		const t0 = performance.now();

		try {
			// BHXH/BHYT XML uses the FHIR Converter Worker. If the user pasted
			// a bare child table (XML1..XML9) instead of the GIAMDINHHS envelope,
			// auto-wrap it before sending — the worker only accepts envelopes.
			if (format === "BHXH 4210") {
				const lower = data.trim().toLowerCase();
				const isEnvelope = lower.includes("<giamdinhhs");
				const xmlBody = isEnvelope ? data : wrapBhxhFragment(data);

				// Detect a wrap of a child table that lacks XML1: the worker
				// needs at least an XML1 patient/encounter record because XML2-9
				// records reference it via MA_LK.
				if (!isEnvelope) {
					const rootMatch = data
						.trim()
						.replace(/^<\?xml[^?]*\?>\s*/i, "")
						.match(/^<([A-Z0-9_]+)/i);
					const root = rootMatch?.[1]?.toUpperCase() ?? "";
					const isXml1 =
						root === "TONG_HOP" || root === "CHITIEUKCB" || root === "XML1";
					if (!isXml1) {
						toast.warning(
							"BHXH child table detected (XML2–XML9). The worker needs an XML1 (TONG_HOP) header in the same envelope to know which patient/encounter the records belong to. Wrap your data in <GIAMDINHHS> with both XML1 and the child table, or paste an XML1 by itself."
						);
					}
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
					// Worker often returns 502/500 when fed a child table without
					// an XML1 header — surface a friendlier message.
					if (resp.status >= 500) {
						throw new Error(
							"FHIR Converter Worker rejected this BHXH input. If you pasted a child table (XML2-XML9), include an XML1 (TONG_HOP) record in the same <GIAMDINHHS> envelope so the worker can resolve patient references."
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
			</DemoPageShell>

			<div className="px-4 py-2 border-t">
				<ApiTopology {...TOPOLOGIES.ehr_converter} />
			</div>
		</DashboardLayout>
	);
};

export default EhrConverterPage;
