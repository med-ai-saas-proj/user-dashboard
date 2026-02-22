import { useState } from "react";
import { API_ROUTES } from "@/config/api-routes";
import { ApiKeyRequiredDialog } from "@/features/api-keys/components/api-key-required-dialog";
import { useServiceApiKeyStore } from "@/features/api-keys/store/service-api-key.store";
import { ConverterForm } from "@/features/pg-ehr-converter/components/converter-form";
import { ConvertResultPanel } from "@/features/pg-ehr-converter/components/convert-result-panel";
import { BatchPanel } from "@/features/pg-ehr-converter/components/batch-panel";
import {
	DocumentPanel,
	type DocumentConvertResult,
} from "@/features/pg-ehr-converter/components/document-panel";
import type {
	ConvertResponse,
	ReverseConvertResponse,
	ValidateResponse,
	BatchConvertResponse,
} from "@/features/pg-ehr-converter/services/ehr-converter.dto";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";
import { toast } from "sonner";

const EhrConverterPage = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<ConvertResponse | null>(null);
	const [reverseResult, setReverseResult] =
		useState<ReverseConvertResponse | null>(null);
	const [validateResult, setValidateResult] = useState<ValidateResponse | null>(
		null
	);
	const [conversionTime, setConversionTime] = useState<number | null>(null);
	const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
	const [batchLoading, setBatchLoading] = useState(false);
	const [batchResult, setBatchResult] = useState<BatchConvertResponse | null>(
		null
	);
	const [showBatch, setShowBatch] = useState(false);
	const [showDocument, setShowDocument] = useState(false);
	const [docLoading, setDocLoading] = useState(false);
	const [docResult, setDocResult] = useState<DocumentConvertResult | null>(
		null
	);
	const { selectedApiKey } = useServiceApiKeyStore();

	const requireApiKey = (): boolean => {
		if (!selectedApiKey) {
			setShowApiKeyDialog(true);
			return false;
		}
		return true;
	};

	const clearResults = () => {
		setResult(null);
		setReverseResult(null);
		setValidateResult(null);
		setConversionTime(null);
	};

	const handleConvert = async (data: string, validate: boolean) => {
		if (!requireApiKey()) return;
		setIsLoading(true);
		clearResults();

		try {
			const t0 = performance.now();
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
		if (!requireApiKey()) return;
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
		if (!requireApiKey()) return;
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
		if (!requireApiKey()) return;
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

	const handleDocumentConvert = async (files: File[]) => {
		if (!requireApiKey()) return;
		setDocLoading(true);

		try {
			const formData = new FormData();
			for (const f of files) {
				formData.append("files", f);
			}

			const headers = await getAuthHeaders(
				API_ROUTES.SERVICES.EHR_CONVERTER_DOCUMENT
			);
			delete headers["Content-Type"];
			const resp = await fetch(API_ROUTES.SERVICES.EHR_CONVERTER_DOCUMENT, {
				method: "POST",
				headers,
				body: formData,
			});

			if (!resp.ok) {
				const errText = await resp.text();
				throw new Error(`HTTP ${resp.status}: ${errText}`);
			}

			const json: DocumentConvertResult = await resp.json();
			setDocResult(json);

			if (json.success) {
				toast.success(
					`Extracted ${json.resource_count} FHIR resources from ${files.length} file(s)`
				);
			} else {
				toast.error(json.errors.join(", ") || "Document conversion failed");
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Request failed");
		} finally {
			setDocLoading(false);
		}
	};

	const hasResult = result || reverseResult || validateResult;

	return (
		<DashboardLayout pageTitle="EHR Converter">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				{/* Two-panel layout */}
				<div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden border-b">
					{/* Left: Input */}
					<div className="border-r flex flex-col overflow-hidden">
						<ConverterForm
							onConvert={handleConvert}
							onReverseConvert={handleReverseConvert}
							onValidate={handleValidate}
							isLoading={isLoading}
						/>
					</div>

					{/* Right: Output */}
					<div className="flex flex-col overflow-hidden">
						{hasResult ? (
							<ConvertResultPanel
								result={result}
								reverseResult={reverseResult}
								validateResult={validateResult}
								conversionTime={conversionTime}
							/>
						) : (
							<div className="flex-1 flex items-center justify-center p-8">
								<div className="text-center space-y-3 max-w-sm">
									<div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
										<svg
											width="24"
											height="24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											className="text-muted-foreground"
											aria-hidden="true"
										>
											<title>Convert</title>
											<path d="M9 5l7 7-7 7" />
										</svg>
									</div>
									<p className="text-sm text-muted-foreground">
										Paste healthcare data on the left and click{" "}
										<strong>Convert to FHIR</strong> to see the output here.
									</p>
									<p className="text-[11px] text-muted-foreground/60">
										Supports HL7v2, CDA/C-CDA, HL7v3, BHXH 4210, and FHIR JSON
									</p>
								</div>
							</div>
						)}
					</div>
				</div>

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
				{/* Document conversion section */}
				<div className="flex-shrink-0">
					<button
						type="button"
						onClick={() => setShowDocument(!showDocument)}
						className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
					>
						<svg
							width="12"
							height="12"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							className={`transition-transform ${showDocument ? "rotate-90" : ""}`}
							aria-hidden="true"
						>
							<title>Toggle</title>
							<path d="M4 2l5 4-5 4" />
						</svg>
						Document → FHIR (GPT-4o Vision)
					</button>
					{showDocument && (
						<div className="px-4 pb-4">
							<DocumentPanel
								onConvert={handleDocumentConvert}
								isLoading={docLoading}
								result={docResult}
							/>
						</div>
					)}
				</div>
			</div>

			<ApiKeyRequiredDialog
				open={showApiKeyDialog}
				onOpenChange={setShowApiKeyDialog}
			/>
		</DashboardLayout>
	);
};

export default EhrConverterPage;
