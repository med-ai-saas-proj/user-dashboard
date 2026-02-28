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
import { MarkdownCustom } from "@/features/pg-chat/components/MarkdownCustom";
import { ViewCodeDialog } from "@/components/view-code-dialog";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";
import { ApiTopology, TOPOLOGIES } from "@/components/api-topology";
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

type EhrEntry = { id: number; label: string; data: string; facility: string };

const MULTI_SOURCE_EXAMPLE: EhrEntry[] = [
	{
		id: 1,
		label: "Hospital A — Admission",
		facility: "City General Hospital",
		data: EXAMPLES[0].data,
	},
	{
		id: 2,
		label: "Lab Center B — Blood Work",
		facility: "MedLab Diagnostics",
		data: EXAMPLES[1].data,
	},
	{
		id: 3,
		label: "Clinic C — Follow-up",
		facility: "District Health Center",
		data: JSON.stringify(
			{
				patient: {
					name: "Nguyen Van Anh",
					gender: "Female",
					dob: "1985-03-15",
					id: "MRN-12345",
				},
				encounter: {
					type: "outpatient",
					date: "2025-03-01",
					department: "Internal Medicine",
					physician: "Dr. Pham Duc",
				},
				diagnoses: [
					{ code: "J18.9", display: "Pneumonia — resolving", status: "active" },
					{ code: "E11.9", display: "Type 2 Diabetes", status: "active" },
				],
				medications: [
					{ name: "Metformin", dose: "500mg", frequency: "twice daily" },
					{
						name: "Amoxicillin",
						dose: "500mg",
						frequency: "3x daily",
						duration: "5 more days",
					},
				],
				lab_results: [
					{
						test: "WBC",
						value: "8.2",
						unit: "10^3/uL",
						reference: "4.5-11.0",
						flag: "N",
					},
					{
						test: "CRP",
						value: "12",
						unit: "mg/L",
						reference: "< 10",
						flag: "H",
					},
				],
				notes:
					"Patient recovering well from pneumonia. Continue antibiotics. Monitor blood sugar.",
			},
			null,
			2
		),
	},
];

let nextId = 100;

const EhrSummaryPage = () => {
	const [entries, setEntries] = useState<EhrEntry[]>([]);
	const [selectedEntry, setSelectedEntry] = useState<number | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [summary, setSummary] = useState("");
	const [mergedFhir, setMergedFhir] = useState<Record<string, unknown> | null>(
		null
	);
	const [activeTab, setActiveTab] = useState<"summary" | "fhir" | "timeline">(
		"summary"
	);
	const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
	const [conversionTime, setConversionTime] = useState<number | null>(null);
	const { selectedApiKey } = useServiceApiKeyStore();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const addEntry = (label?: string, data?: string, facility?: string) => {
		const id = nextId++;
		setEntries((prev) => [
			...prev,
			{
				id,
				label: label || `Source ${prev.length + 1}`,
				data: data || "",
				facility: facility || "",
			},
		]);
		setSelectedEntry(id);
	};

	const removeEntry = (id: number) => {
		setEntries((prev) => prev.filter((e) => e.id !== id));
		if (selectedEntry === id)
			setSelectedEntry(entries.find((e) => e.id !== id)?.id ?? null);
	};

	const updateEntry = (id: number, updates: Partial<EhrEntry>) => {
		setEntries((prev) =>
			prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
		);
	};

	const loadMultiSourceExample = () => {
		setEntries(MULTI_SOURCE_EXAMPLE.map((e) => ({ ...e, id: nextId++ })));
		setSelectedEntry(MULTI_SOURCE_EXAMPLE[0].id);
	};

	const loadSingleExample = (data: string, label: string) => {
		const id = nextId++;
		setEntries([{ id, label, data, facility: "Example Facility" }]);
		setSelectedEntry(id);
	};

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files) return;
		for (const file of Array.from(files)) {
			const isText = /\.(json|txt|xml|hl7|cda|csv)$/i.test(file.name);
			const reader = new FileReader();
			reader.onload = () => {
				const id = nextId++;
				let data = "";
				if (isText) {
					data = reader.result as string;
				} else {
					const base64 = (reader.result as string).split(",")[1] || "";
					data = JSON.stringify(
						{
							_preprocess: true,
							filename: file.name,
							mime: file.type,
							base64_data: base64,
							note: "This file requires preprocessing (OCR/vision API). Run Document→FHIR or Medical Image first.",
						},
						null,
						2
					);
				}
				setEntries((prev) => [
					...prev,
					{
						id,
						label: file.name.replace(/\.[^.]+$/, ""),
						data,
						facility: "",
					},
				]);
				setSelectedEntry(id);
				if (!isText) {
					toast.info(
						`${file.name}: Non-text file loaded. Needs preprocessing via OCR/Document→FHIR API.`
					);
				}
			};
			if (isText) {
				reader.readAsText(file);
			} else {
				reader.readAsDataURL(file);
			}
		}
		e.target.value = "";
	};

	const TEMPLATES: Record<string, { label: string; data: string }> = {
		hl7v2: {
			label: "HL7v2 Template",
			data: `MSH|^~\\&|SENDING_APP|FACILITY|RECEIVING_APP|DEST|20250101120000||ADT^A01|MSG001|P|2.5\nEVN|A01|20250101120000\nPID|1||MRN001^^^FACILITY||DOE^JOHN||19800101|M|||123 MAIN ST^^CITY^STATE^12345||555-1234\nPV1|1|I|WARD^ROOM^BED||||ATTENDING^DR|||MED||||ADM|||V001|||||||||||||||||||||||||20250101120000`,
		},
		cda: {
			label: "CDA/C-CDA Template",
			data: `<?xml version="1.0" encoding="UTF-8"?>
<ClinicalDocument xmlns="urn:hl7-org:v3">
  <realmCode code="US"/>
  <typeId root="2.16.840.1.113883.1.3" extension="POCD_HD000040"/>
  <id root="2.16.840.1.113883.19.5.99999.1" extension="DOC001"/>
  <code code="34133-9" displayName="Summarization of Episode Note" codeSystem="2.16.840.1.113883.6.1"/>
  <title>Clinical Summary</title>
  <effectiveTime value="20250101"/>
  <recordTarget>
    <patientRole>
      <id extension="MRN001"/>
      <patient>
        <name><given>John</given><family>Doe</family></name>
        <administrativeGenderCode code="M"/>
        <birthTime value="19800101"/>
      </patient>
    </patientRole>
  </recordTarget>
  <component><structuredBody>
    <!-- Add sections here -->
  </structuredBody></component>
</ClinicalDocument>`,
		},
		fhir: {
			label: "FHIR Bundle Template",
			data: JSON.stringify(
				{
					resourceType: "Bundle",
					type: "collection",
					entry: [
						{
							resource: {
								resourceType: "Patient",
								id: "patient-1",
								name: [{ family: "Doe", given: ["John"] }],
								gender: "male",
								birthDate: "1980-01-01",
							},
						},
						{
							resource: {
								resourceType: "Encounter",
								id: "enc-1",
								status: "finished",
								class: { code: "IMP" },
								subject: { reference: "Patient/patient-1" },
							},
						},
					],
				},
				null,
				2
			),
		},
		bhxh: {
			label: "BHXH 4210 Template",
			data: `<?xml version="1.0" encoding="UTF-8"?>
<GIAMDINHHS>
  <THONGTINDONVI>
    <MACSKCB>00000</MACSKCB>
    <TENCSKCB>Sample Facility</TENCSKCB>
  </THONGTINDONVI>
  <THONGTINHOSO>
    <DANHSACHHOSO>
      <HOSO>
        <FILEHOSO>
          <LOAIHOSO>XML1</LOAIHOSO>
          <NOIDUNGFILE><!-- Base64 encoded XML1 --></NOIDUNGFILE>
        </FILEHOSO>
      </HOSO>
    </DANHSACHHOSO>
  </THONGTINHOSO>
</GIAMDINHHS>`,
		},
		custom_json: {
			label: "Custom JSON Template",
			data: JSON.stringify(
				{
					patient: {
						name: "John Doe",
						gender: "Male",
						dob: "1980-01-01",
						id: "MRN-001",
					},
					encounter: {
						type: "inpatient",
						date: "2025-01-01",
						department: "Internal Medicine",
						physician: "Dr. Smith",
					},
					diagnoses: [
						{ code: "J18.9", display: "Pneumonia", status: "active" },
					],
					medications: [
						{ name: "Amoxicillin", dose: "500mg", frequency: "3x daily" },
					],
					lab_results: [
						{
							test: "WBC",
							value: "11.2",
							unit: "10^3/uL",
							reference: "4.5-11.0",
							flag: "H",
						},
					],
				},
				null,
				2
			),
		},
	};

	const generateTemplateData = (format: string) => TEMPLATES[format] ?? null;

	const generateTemplate = (format: string) => {
		const tmpl = generateTemplateData(format);
		if (tmpl) {
			const id = nextId++;
			setEntries((prev) => [
				...prev,
				{ id, label: tmpl.label, data: tmpl.data, facility: "Template" },
			]);
			setSelectedEntry(id);
			toast.success(`Generated ${tmpl.label}`);
		}
	};

	const standardizeToFhir = async (
		rawData: string
	): Promise<Record<string, unknown> | null> => {
		const trimmed = rawData.trim();
		if (trimmed.startsWith("{")) {
			try {
				const parsed = JSON.parse(trimmed);
				if (parsed.resourceType === "Bundle") return parsed;
			} catch {
				/* not JSON */
			}
		}
		try {
			const headers = await getAuthHeaders(
				API_ROUTES.SERVICES.EHR_CONVERTER_CONVERT
			);
			const resp = await fetch(API_ROUTES.SERVICES.EHR_CONVERTER_CONVERT, {
				method: "POST",
				headers,
				body: JSON.stringify({ data: trimmed, validate_output: false }),
			});
			if (resp.ok) {
				const json = await resp.json();
				if (json.success && json.bundle) return json.bundle;
			}
		} catch {
			/* conversion failed */
		}
		return null;
	};

	const mergeBundles = (
		bundles: Record<string, unknown>[]
	): Record<string, unknown> => {
		const allEntries: Record<string, unknown>[] = [];
		for (const b of bundles) {
			const entries = (b as { entry?: Record<string, unknown>[] }).entry || [];
			allEntries.push(...entries);
		}
		return {
			resourceType: "Bundle",
			type: "collection",
			total: allEntries.length,
			entry: allEntries,
		};
	};

	const handleSummarize = async () => {
		if (entries.length === 0) return;
		if (!selectedApiKey) {
			setShowApiKeyDialog(true);
			return;
		}

		setIsLoading(true);
		setSummary("");
		setMergedFhir(null);
		setConversionTime(null);
		const t0 = performance.now();

		try {
			const fhirBundles: Record<string, unknown>[] = [];
			const sourceLabels: string[] = [];

			for (const entry of entries) {
				if (!entry.data.trim()) continue;
				toast.info(`Standardizing: ${entry.label}...`);
				const bundle = await standardizeToFhir(entry.data);
				if (bundle) {
					fhirBundles.push(bundle);
					sourceLabels.push(entry.facility || entry.label);
				}
			}

			if (fhirBundles.length === 0) {
				toast.error("No data could be standardized to FHIR");
				setIsLoading(false);
				return;
			}

			const merged = mergeBundles(fhirBundles);
			setMergedFhir(merged);

			toast.info("Generating summary...");
			const headers = await getAuthHeaders(API_ROUTES.SERVICES.EHR_SUMMARIZE);
			const resp = await fetch(API_ROUTES.SERVICES.EHR_SUMMARIZE, {
				method: "POST",
				headers,
				body: JSON.stringify({
					input_ehr: {
						type: "custom_json",
						custom_json: { sources: sourceLabels, merged_fhir_bundle: merged },
					},
					model: "gpt-4o-2",
					stream: false,
				}),
			});

			if (!resp.ok)
				throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);

			const json = await resp.json();
			const elapsed = Math.round(performance.now() - t0);
			setConversionTime(elapsed);

			const textParts = (json.output || []).filter(
				(p: { type: string }) => p.type === "text"
			);
			setSummary(
				textParts.map((p: { content: string }) => p.content).join("\n")
			);
			toast.success(
				`Summary generated from ${fhirBundles.length} source(s) in ${elapsed}ms`
			);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Request failed");
		} finally {
			setIsLoading(false);
		}
	};

	const current = entries.find((e) => e.id === selectedEntry);
	const hasResult = summary || mergedFhir;

	return (
		<DashboardLayout pageTitle="EHR Summary">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				<div className="flex-1 flex flex-col lg:grid lg:grid-cols-2 overflow-hidden">
					{/* Left: Multi-source input */}
					<div className="border-b lg:border-b-0 lg:border-r flex flex-col overflow-hidden min-h-0 lg:min-h-full">
						<div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30 gap-2 flex-wrap">
							<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
								EHR Sources ({entries.length})
							</h2>
							<div className="flex items-center gap-1.5 flex-wrap">
								<Button
									variant="ghost"
									size="sm"
									className="h-7 text-xs"
									onClick={loadMultiSourceExample}
								>
									Multi-Source Demo
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="h-7 text-xs"
									onClick={() => fileInputRef.current?.click()}
								>
									Upload EHR
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="h-7 text-xs"
									onClick={() => addEntry()}
								>
									+ Add Source
								</Button>
							</div>
							<input
								ref={fileInputRef}
								type="file"
								accept=".json,.txt,.hl7,.xml,.cda,.pdf,.png,.jpg,.jpeg,.tiff,.bmp"
								multiple
								className="hidden"
								onChange={handleFileUpload}
							/>
						</div>

						{entries.length === 0 ? (
							<div className="flex-1 flex items-center justify-center p-8">
								<div className="text-center space-y-4 max-w-sm">
									<p className="text-sm text-muted-foreground">
										Add EHR data from multiple facilities. Each source will be
										standardized to FHIR R4 and combined for a unified summary.
									</p>
									<div className="space-y-2">
										<Button
											variant="outline"
											size="sm"
											className="w-full text-xs"
											onClick={loadMultiSourceExample}
										>
											Load Multi-Source Demo (3 facilities)
										</Button>
										<Button
											variant="outline"
											size="sm"
											className="w-full text-xs"
											onClick={() => fileInputRef.current?.click()}
										>
											Upload EHR File(s) (txt, xml, json, pdf, image)
										</Button>
										<div className="text-[11px] font-semibold text-muted-foreground mt-2 mb-1">
											Generate Template
										</div>
										<div className="flex flex-wrap gap-1.5 justify-center">
											{[
												{ label: "HL7v2", key: "hl7v2" },
												{ label: "CDA/C-CDA", key: "cda" },
												{ label: "FHIR", key: "fhir" },
												{ label: "BHXH 4210", key: "bhxh" },
												{ label: "Custom JSON", key: "custom_json" },
											].map((t) => (
												<button
													key={t.key}
													type="button"
													onClick={() => generateTemplate(t.key)}
													className="px-2.5 py-1 text-[11px] font-medium rounded-md border bg-background hover:bg-muted transition-colors"
												>
													{t.label}
												</button>
											))}
										</div>
										<div className="text-[11px] font-semibold text-muted-foreground mt-2 mb-1">
											Quick Examples
										</div>
										<div className="flex flex-wrap gap-1.5 justify-center">
											{[
												{ label: "HL7v2 ADT", data: EXAMPLES[0].data },
												{ label: "HL7v2 Lab", data: EXAMPLES[1].data },
												{ label: "CDA/C-CDA", data: EXAMPLES[3].data },
												{ label: "FHIR Bundle", data: EXAMPLES[5].data },
											].map((ex) => (
												<button
													key={ex.label}
													type="button"
													onClick={() => loadSingleExample(ex.data, ex.label)}
													className="px-2.5 py-1 text-[11px] font-medium rounded-md border bg-background hover:bg-muted transition-colors"
												>
													{ex.label}
												</button>
											))}
										</div>
									</div>
								</div>
							</div>
						) : (
							<>
								{/* Source tabs */}
								<div className="flex overflow-x-auto border-b bg-muted/10 px-2 gap-1 py-1.5">
									{entries.map((entry) => {
										const fmt = detectFormat(entry.data);
										return (
											<button
												key={entry.id}
												type="button"
												onClick={() => setSelectedEntry(entry.id)}
												className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${selectedEntry === entry.id ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-muted text-muted-foreground"}`}
											>
												{entry.data.trim() && (
													<span
														className={`w-1.5 h-1.5 rounded-full ${FORMAT_COLORS[fmt]?.split(" ")[0] || "bg-gray-300"}`}
													/>
												)}
												{entry.label}
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														removeEntry(entry.id);
													}}
													className="ml-1 text-muted-foreground/50 hover:text-destructive"
												>
													×
												</button>
											</button>
										);
									})}
									<button
										type="button"
										onClick={() => addEntry()}
										className="px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
									>
										+
									</button>
								</div>

								{/* Generate template for selected source */}
								{current && !current.data.trim() && (
									<div className="px-4 py-2 border-b bg-muted/10">
										<span className="text-[10px] font-semibold text-muted-foreground">
											Generate example for this source:
										</span>
										<div className="flex flex-wrap gap-1.5 mt-1">
											{[
												{ label: "HL7v2", key: "hl7v2" },
												{ label: "CDA/C-CDA", key: "cda" },
												{ label: "FHIR", key: "fhir" },
												{ label: "BHXH 4210", key: "bhxh" },
												{ label: "Custom JSON", key: "custom_json" },
											].map((tmpl) => (
												<button
													key={tmpl.key}
													type="button"
													onClick={() => {
														const generated = generateTemplateData(tmpl.key);
														if (generated)
															updateEntry(current.id, {
																data: generated.data,
																label:
																	current.label ===
																	`Source ${entries.indexOf(current) + 1}`
																		? generated.label
																		: current.label,
															});
													}}
													className="px-2 py-0.5 text-[10px] font-medium rounded border bg-background hover:bg-muted transition-colors"
												>
													{tmpl.label}
												</button>
											))}
										</div>
									</div>
								)}

								{/* Current source editor */}
								{current && (
									<div className="flex-1 flex flex-col overflow-hidden">
										<div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/10">
											<input
												value={current.label}
												onChange={(e) =>
													updateEntry(current.id, { label: e.target.value })
												}
												className="flex-1 text-xs font-medium bg-transparent border-b border-transparent focus:border-primary focus:outline-none px-1 py-0.5"
												placeholder="Source label"
											/>
											<input
												value={current.facility}
												onChange={(e) =>
													updateEntry(current.id, { facility: e.target.value })
												}
												className="flex-1 text-xs bg-transparent border-b border-transparent focus:border-primary focus:outline-none px-1 py-0.5 text-muted-foreground"
												placeholder="Facility name"
											/>
											{current.data.trim() && (
												<span
													className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${FORMAT_COLORS[detectFormat(current.data)]}`}
												>
													{detectFormat(current.data)}
												</span>
											)}
										</div>
										<textarea
											value={current.data}
											onChange={(e) =>
												updateEntry(current.id, { data: e.target.value })
											}
											placeholder="Paste EHR data here — HL7v2, CDA, FHIR JSON, custom JSON, etc."
											className="flex-1 p-4 font-mono text-[12px] leading-relaxed bg-transparent focus:outline-none resize-none"
											spellCheck={false}
										/>
									</div>
								)}
							</>
						)}

						<div className="flex items-center justify-between px-4 py-2.5 border-t bg-muted/30 gap-2 flex-wrap">
							<span className="text-[11px] text-muted-foreground/60 hidden sm:inline">
								{entries.length} source(s) — standardize → merge → summarize
							</span>
							<Button
								size="sm"
								className="h-8 text-xs ml-auto"
								onClick={handleSummarize}
								disabled={
									entries.length === 0 ||
									entries.every((e) => !e.data.trim()) ||
									isLoading
								}
							>
								{isLoading ? (
									<span className="flex items-center gap-1.5">
										<span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
										Processing...
									</span>
								) : (
									`Summarize ${entries.length} Source(s)`
								)}
							</Button>
						</div>
					</div>

					{/* Right: Output */}
					<div className="flex flex-col overflow-hidden min-h-0 lg:min-h-full">
						<div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
							<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
								Output
								{conversionTime != null && (
									<span className="ml-2 text-[11px] font-normal normal-case tracking-normal">
										({conversionTime}ms)
									</span>
								)}
							</h2>
							<ViewCodeDialog
								endpoint={API_ROUTES.SERVICES.EHR_SUMMARIZE}
								method="POST"
								body={{
									input_ehr: {
										type: "custom_json",
										custom_json: {
											sources: ["Hospital A", "Lab B"],
											merged_fhir_bundle: {
												resourceType: "Bundle",
												type: "collection",
												entry: [],
											},
										},
									},
									model: "gpt-4o-2",
									stream: false,
								}}
								description="Generate clinical summary from merged FHIR data"
							/>
						</div>
						{hasResult ? (
							<>
								<div className="flex gap-0 border-b px-4">
									{(["summary", "fhir"] as const).map((tab) => (
										<button
											key={tab}
											type="button"
											onClick={() => setActiveTab(tab)}
											className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
										>
											{tab === "summary"
												? "Clinical Summary"
												: "Merged FHIR R4"}
										</button>
									))}
								</div>
								<div className="flex-1 overflow-auto p-4">
									{activeTab === "summary" && summary && (
										<MarkdownCustom content={summary} />
									)}
									{activeTab === "fhir" && mergedFhir && (
										<pre className="text-[12px] font-mono whitespace-pre-wrap leading-relaxed break-all">
											{JSON.stringify(mergedFhir, null, 2)}
										</pre>
									)}
								</div>
								<div className="flex justify-end gap-2 px-4 py-2.5 border-t bg-muted/30">
									{activeTab === "summary" && summary && (
										<Button
											variant="outline"
											size="sm"
											className="h-7 text-xs"
											onClick={() => navigator.clipboard.writeText(summary)}
										>
											Copy Summary
										</Button>
									)}
									{activeTab === "fhir" && mergedFhir && (
										<>
											<Button
												variant="outline"
												size="sm"
												className="h-7 text-xs"
												onClick={() =>
													navigator.clipboard.writeText(
														JSON.stringify(mergedFhir, null, 2)
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
														[JSON.stringify(mergedFhir, null, 2)],
														{ type: "application/json" }
													);
													const a = document.createElement("a");
													a.href = URL.createObjectURL(blob);
													a.download = "merged-fhir-bundle.json";
													a.click();
												}}
											>
												Download
											</Button>
										</>
									)}
								</div>
							</>
						) : (
							<div className="flex-1 flex items-center justify-center p-8">
								<div className="text-center space-y-3 max-w-sm">
									<p className="text-sm text-muted-foreground">
										Add EHR data from multiple facilities, then click{" "}
										<strong>Summarize</strong> to get a unified clinical
										summary.
									</p>
									<p className="text-[11px] text-muted-foreground/60">
										Pipeline: Standardize each source → FHIR R4 → Merge → GPT-4o
										Summary
									</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="px-4 py-2 border-t">
				<ApiTopology {...TOPOLOGIES.ehr_summary} />
			</div>

			<ApiKeyRequiredDialog
				open={showApiKeyDialog}
				onOpenChange={setShowApiKeyDialog}
			/>
		</DashboardLayout>
	);
};

export default EhrSummaryPage;
