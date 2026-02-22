import { useState, useRef } from "react";
import { API_ROUTES } from "@/config/api-routes";
import { ApiKeyRequiredDialog } from "@/features/api-keys/components/api-key-required-dialog";
import { useServiceApiKeyStore } from "@/features/api-keys/store/service-api-key.store";
import { EXAMPLES } from "@/features/pg-ehr-converter/services/examples";
import {
	detectFormat,
	type DetectedFormat,
} from "@/features/pg-ehr-converter/components/converter-form";
import { Button } from "@/components/shadcn/button";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";
import { toast } from "sonner";

const FORMAT_COLORS: Record<DetectedFormat, string> = {
	HL7v2: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
	"CDA / C-CDA":
		"bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
	"HL7v3 / RIM":
		"bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
	"FHIR JSON":
		"bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
	"BHXH 4210": "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
	Unknown: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

const EHR_EXAMPLES = [
	{ label: "ADT^A01 (Admit)", data: EXAMPLES[0].data },
	{ label: "ORU^R01 (Lab)", data: EXAMPLES[1].data },
	{ label: "CDA/C-CDA", data: EXAMPLES[3].data },
	{ label: "FHIR R4 Bundle", data: EXAMPLES[5].data },
	{
		label: "Custom JSON",
		data: JSON.stringify(
			{
				patient: {
					name: "Nguyen Van Minh",
					age: 45,
					gender: "Male",
					id: "MRN-12345",
				},
				diagnoses: [
					{
						code: "E11.9",
						display: "Type 2 Diabetes",
						status: "active",
						onset: "2023-01-15",
					},
					{
						code: "I10",
						display: "Essential Hypertension",
						status: "active",
						onset: "2022-06-01",
					},
					{
						code: "J18.9",
						display: "Pneumonia",
						status: "active",
						onset: "2025-02-10",
					},
				],
				medications: [
					{
						name: "Metformin",
						dose: "500mg",
						frequency: "twice daily",
						route: "oral",
					},
					{
						name: "Lisinopril",
						dose: "10mg",
						frequency: "once daily",
						route: "oral",
					},
					{
						name: "Amoxicillin",
						dose: "500mg",
						frequency: "3 times daily",
						route: "oral",
						duration: "7 days",
					},
				],
				lab_results: [
					{
						test: "HbA1c",
						value: "7.2%",
						date: "2025-02-08",
						reference: "< 7.0%",
					},
					{
						test: "WBC",
						value: "12.5 x10^3/uL",
						date: "2025-02-10",
						reference: "4.5-11.0",
						flag: "H",
					},
					{ test: "Blood Pressure", value: "145/92 mmHg", date: "2025-02-10" },
					{
						test: "Creatinine",
						value: "1.1 mg/dL",
						date: "2025-02-08",
						reference: "0.7-1.3",
					},
				],
				allergies: [
					{ substance: "Penicillin", reaction: "Rash", severity: "moderate" },
				],
				vital_signs: {
					temperature: "38.2°C",
					heart_rate: "88 bpm",
					respiratory_rate: "20/min",
					spo2: "96%",
				},
			},
			null,
			2
		),
	},
];

const EhrSummaryPage = () => {
	const [inputData, setInputData] = useState("");
	const [showExamples, setShowExamples] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [summary, setSummary] = useState("");
	const [fhirBundle, setFhirBundle] = useState<Record<string, unknown> | null>(
		null
	);
	const [activeTab, setActiveTab] = useState<"summary" | "fhir">("summary");
	const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
	const [conversionTime, setConversionTime] = useState<number | null>(null);
	const { selectedApiKey } = useServiceApiKeyStore();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const detectedFormat = detectFormat(inputData);

	const handleSummarize = async () => {
		if (!inputData.trim()) return;
		if (!selectedApiKey) {
			setShowApiKeyDialog(true);
			return;
		}

		setIsLoading(true);
		setSummary("");
		setFhirBundle(null);
		setConversionTime(null);

		const t0 = performance.now();

		try {
			let inputPayload: Record<string, unknown>;
			const trimmed = inputData.trim();

			if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
				try {
					const parsed = JSON.parse(trimmed);
					if (parsed.resourceType) {
						inputPayload = { input_ehr: { type: "fhir", fhir: parsed } };
					} else {
						inputPayload = {
							input_ehr: { type: "custom_json", custom_json: parsed },
						};
					}
				} catch {
					inputPayload = {
						input_ehr: {
							type: "custom_json",
							custom_json: { raw_text: trimmed },
						},
					};
				}
			} else {
				inputPayload = {
					input_ehr: {
						type: "custom_json",
						custom_json: { raw_text: trimmed },
					},
				};
			}

			const headers = await getAuthHeaders(API_ROUTES.SERVICES.EHR_SUMMARIZE);
			const resp = await fetch(API_ROUTES.SERVICES.EHR_SUMMARIZE, {
				method: "POST",
				headers,
				body: JSON.stringify({
					...inputPayload,
					model: "gpt-4o-2",
					stream: false,
				}),
			});

			if (!resp.ok) {
				const errText = await resp.text();
				throw new Error(`HTTP ${resp.status}: ${errText}`);
			}

			const json = await resp.json();
			const elapsed = Math.round(performance.now() - t0);
			setConversionTime(elapsed);

			const textParts = (json.output || []).filter(
				(p: { type: string }) => p.type === "text"
			);
			const summaryText = textParts
				.map((p: { content: string }) => p.content)
				.join("\n");
			setSummary(summaryText);

			if (detectedFormat !== "FHIR JSON") {
				try {
					const convHeaders = await getAuthHeaders(
						API_ROUTES.SERVICES.EHR_CONVERTER_CONVERT
					);
					const convResp = await fetch(
						API_ROUTES.SERVICES.EHR_CONVERTER_CONVERT,
						{
							method: "POST",
							headers: convHeaders,
							body: JSON.stringify({ data: trimmed, validate_output: false }),
						}
					);
					if (convResp.ok) {
						const convJson = await convResp.json();
						if (convJson.success && convJson.bundle) {
							setFhirBundle(convJson.bundle);
						}
					}
				} catch {
					/* FHIR conversion optional */
				}
			} else {
				try {
					setFhirBundle(JSON.parse(trimmed));
				} catch {
					/* ignore */
				}
			}

			toast.success(`Summary generated in ${elapsed}ms`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Request failed");
		} finally {
			setIsLoading(false);
		}
	};

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => setInputData(reader.result as string);
		reader.readAsText(file);
		e.target.value = "";
	};

	const hasResult = summary || fhirBundle;

	return (
		<DashboardLayout pageTitle="EHR Summary">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				<div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
					{/* Left: Input */}
					<div className="border-r flex flex-col overflow-hidden">
						<div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
							<div className="flex items-center gap-3">
								<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
									EHR Input
								</h2>
								{inputData.trim() && (
									<span
										className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${FORMAT_COLORS[detectedFormat]}`}
									>
										{detectedFormat}
									</span>
								)}
							</div>
							<div className="flex items-center gap-1.5">
								<Button
									variant="ghost"
									size="sm"
									className="h-7 text-xs"
									onClick={() => setShowExamples(!showExamples)}
								>
									{showExamples ? "Hide" : "Examples"}
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="h-7 text-xs"
									onClick={() => fileInputRef.current?.click()}
								>
									Upload
								</Button>
								{inputData && (
									<Button
										variant="ghost"
										size="sm"
										className="h-7 text-xs text-muted-foreground"
										onClick={() => setInputData("")}
									>
										Clear
									</Button>
								)}
							</div>
							<input
								ref={fileInputRef}
								type="file"
								accept=".hl7,.xml,.json,.txt,.cda"
								className="hidden"
								onChange={handleFileUpload}
							/>
						</div>

						{showExamples && (
							<div className="px-4 py-2 border-b bg-muted/20">
								<div className="flex flex-wrap gap-1.5">
									{EHR_EXAMPLES.map((ex) => (
										<button
											key={ex.label}
											type="button"
											onClick={() => {
												setInputData(ex.data);
												setShowExamples(false);
											}}
											className="px-2.5 py-1 text-[11px] font-medium rounded-md border bg-background hover:bg-muted transition-colors"
										>
											{ex.label}
										</button>
									))}
								</div>
							</div>
						)}

						<div className="flex-1 relative">
							<textarea
								value={inputData}
								onChange={(e) => setInputData(e.target.value)}
								onKeyDown={(e) => {
									if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
										e.preventDefault();
										handleSummarize();
									}
								}}
								placeholder={
									"Paste EHR data here — HL7v2, CDA/C-CDA, FHIR JSON, or custom JSON.\n\nClick 'Examples' to try sample data."
								}
								className="w-full h-full min-h-[400px] p-4 font-mono text-[13px] leading-relaxed bg-transparent focus:outline-none resize-none"
								spellCheck={false}
							/>
						</div>

						<div className="flex items-center justify-between px-4 py-2.5 border-t bg-muted/30">
							<span className="text-[11px] text-muted-foreground/60">
								{inputData.length.toLocaleString()} chars
							</span>
							<Button
								size="sm"
								className="h-8 text-xs"
								onClick={handleSummarize}
								disabled={!inputData.trim() || isLoading}
							>
								{isLoading ? (
									<span className="flex items-center gap-1.5">
										<span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
										Summarizing...
									</span>
								) : (
									"Summarize EHR"
								)}
							</Button>
						</div>
					</div>

					{/* Right: Output */}
					<div className="flex flex-col overflow-hidden">
						{hasResult ? (
							<>
								<div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
									<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
										Output
									</h2>
									{conversionTime && (
										<span className="text-[11px] text-muted-foreground">
											{conversionTime}ms
										</span>
									)}
								</div>
								<div className="flex gap-0 border-b px-4">
									<button
										type="button"
										onClick={() => setActiveTab("summary")}
										className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${activeTab === "summary" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
									>
										Summary
									</button>
									{fhirBundle && (
										<button
											type="button"
											onClick={() => setActiveTab("fhir")}
											className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${activeTab === "fhir" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
										>
											FHIR R4
										</button>
									)}
								</div>
								<div className="flex-1 overflow-auto p-4">
									{activeTab === "summary" && summary && (
										<div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-[13px] leading-relaxed">
											{summary}
										</div>
									)}
									{activeTab === "fhir" && fhirBundle && (
										<pre className="text-[12px] font-mono whitespace-pre-wrap leading-relaxed">
											{JSON.stringify(fhirBundle, null, 2)}
										</pre>
									)}
								</div>
								{activeTab === "summary" && summary && (
									<div className="flex justify-end gap-2 px-4 py-2.5 border-t bg-muted/30">
										<Button
											variant="outline"
											size="sm"
											className="h-7 text-xs"
											onClick={() => navigator.clipboard.writeText(summary)}
										>
											Copy Summary
										</Button>
									</div>
								)}
								{activeTab === "fhir" && fhirBundle && (
									<div className="flex justify-end gap-2 px-4 py-2.5 border-t bg-muted/30">
										<Button
											variant="outline"
											size="sm"
											className="h-7 text-xs"
											onClick={() =>
												navigator.clipboard.writeText(
													JSON.stringify(fhirBundle, null, 2)
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
													[JSON.stringify(fhirBundle, null, 2)],
													{ type: "application/json" }
												);
												const a = document.createElement("a");
												a.href = URL.createObjectURL(blob);
												a.download = "fhir-bundle.json";
												a.click();
											}}
										>
											Download JSON
										</Button>
									</div>
								)}
							</>
						) : (
							<div className="flex-1 flex items-center justify-center p-8">
								<div className="text-center space-y-3 max-w-sm">
									<p className="text-sm text-muted-foreground">
										Paste EHR data on the left and click{" "}
										<strong>Summarize EHR</strong> to generate a clinical
										summary and FHIR R4 output.
									</p>
									<p className="text-[11px] text-muted-foreground/60">
										Powered by GPT-4o — supports HL7v2, CDA, FHIR, and custom
										JSON
									</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			<ApiKeyRequiredDialog
				open={showApiKeyDialog}
				onOpenChange={setShowApiKeyDialog}
			/>
		</DashboardLayout>
	);
};

export default EhrSummaryPage;
