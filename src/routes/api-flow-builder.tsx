import { useState, useCallback } from "react";
import { BASE_API_URL } from "@/config/api-routes";
import DashboardLayout from "@/layouts/dashboard-layout";
import { Button } from "@/components/shadcn/button";
import { ViewCodeDialog } from "@/components/view-code-dialog";
import { toast } from "sonner";
import {
	FileJson2Icon,
	ClipboardPlusIcon,
	PillIcon,
	HeartPulseIcon,
	EyeOffIcon,
	ShieldCheckIcon,
	UserRoundIcon,
	BarChart3Icon,
	BookOpenIcon,
	FlaskConicalIcon,
	RefreshCwIcon,
	SearchIcon,
	StethoscopeIcon,
	type LucideIcon,
} from "lucide-react";

// --- Available APIs ---

interface ApiDef {
	id: string;
	label: string;
	icon: LucideIcon;
	endpoint: string;
	method: string;
	sampleBody: Record<string, unknown>;
	outputKey?: string;
}

const AVAILABLE_APIS: ApiDef[] = [
	{
		id: "ehr_convert",
		label: "EHR Converter",
		icon: FileJson2Icon,
		endpoint: `${BASE_API_URL}service/api/v1/ehr_converter/convert`,
		method: "POST",
		sampleBody: { data: "<HL7v2 or CDA data>", validate_output: false },
		outputKey: "fhir_bundle",
	},
	{
		id: "ehr_summarize",
		label: "EHR Summary",
		icon: ClipboardPlusIcon,
		endpoint: `${BASE_API_URL}service/api/v1/ehr_summarize`,
		method: "POST",
		sampleBody: { ehr_data: {}, patient_info: {} },
	},
	{
		id: "rx_advisor",
		label: "Rx Advisor",
		icon: PillIcon,
		endpoint: `${BASE_API_URL}service/api/v1/rx_advisor`,
		method: "POST",
		sampleBody: { ehr_data: {}, prescription: "" },
	},
	{
		id: "health_score",
		label: "Health Score",
		icon: HeartPulseIcon,
		endpoint: `${BASE_API_URL}service/api/v1/health_score/evaluate`,
		method: "POST",
		sampleBody: { ehr_data: {} },
	},
	{
		id: "data_mask",
		label: "Data Masking",
		icon: EyeOffIcon,
		endpoint: `${BASE_API_URL}service/api/v1/data_masking/mask`,
		method: "POST",
		sampleBody: { bundle: {} },
	},
	{
		id: "bhxh_validate",
		label: "BHXH Validator",
		icon: ShieldCheckIcon,
		endpoint: `${BASE_API_URL}service/api/v1/bhxh_validator/validate`,
		method: "POST",
		sampleBody: { xml_data: "", strict: false },
	},
	{
		id: "patient_history",
		label: "Save Patient History",
		icon: UserRoundIcon,
		endpoint: `${BASE_API_URL}service/api/v1/patient/1/history`,
		method: "POST",
		sampleBody: { patient_id: 1, fhir_bundle: {} },
	},
	{
		id: "pub_health",
		label: "Public Health Stats",
		icon: BarChart3Icon,
		endpoint: `${BASE_API_URL}service/api/v1/public_health/statistics`,
		method: "POST",
		sampleBody: { metric: "overview" },
	},
	{
		id: "kb_search",
		label: "Knowledge Base Search",
		icon: BookOpenIcon,
		endpoint: `${BASE_API_URL}service/api/v1/knowledge_base/search`,
		method: "POST",
		sampleBody: { query: "", kb_ids: [] },
	},
	{
		id: "fhir_validate",
		label: "FHIR Validate",
		icon: FlaskConicalIcon,
		endpoint: `${BASE_API_URL}service/api/v1/ehr_converter/validate`,
		method: "POST",
		sampleBody: { bundle: {} },
	},
	{
		id: "fhir_to_hl7v2",
		label: "FHIR → HL7v2",
		icon: RefreshCwIcon,
		endpoint: `${BASE_API_URL}service/api/v1/ehr_converter/convert/fhir-to-hl7v2`,
		method: "POST",
		sampleBody: { bundle: {} },
	},
	{
		id: "facility_search",
		label: "Cross-Facility Search",
		icon: SearchIcon,
		endpoint: `${BASE_API_URL}service/api/v1/data_masking/facility/search`,
		method: "POST",
		sampleBody: { first_name: "", last_name: "", dob: "" },
	},
	{
		id: "symptom_check",
		label: "Symptom Checker",
		icon: StethoscopeIcon,
		endpoint: `${BASE_API_URL}service/api/v1/symptom_checker/check`,
		method: "POST",
		sampleBody: { symptoms: ["headache", "fever"], age: 35, gender: "female" },
	},
];

// --- Demo flows ---

const DEMO_FLOWS: {
	label: string;
	description: string;
	steps: {
		apiId: string;
		input: Record<string, unknown>;
		output: Record<string, unknown>;
	}[];
}[] = [
	{
		label: "EHR → FHIR → Summary",
		description:
			"Convert HL7v2 admission data to FHIR, then generate a clinical summary",
		steps: [
			{
				apiId: "ehr_convert",
				input: {
					data: "MSH|^~\\&|HIS|HOSP|EHR|FAC|20250201||ADT^A01|MSG001|P|2.5\rPID|1||MRN-001||Nguyen^Van Minh||19850315|M\rDG1|1|ICD10|E11.9^Type 2 Diabetes\rDG1|2|ICD10|I10^Hypertension",
					validate_output: true,
				},
				output: {
					success: true,
					source_format: "hl7v2",
					resource_count: 3,
					bundle: {
						resourceType: "Bundle",
						type: "collection",
						entry: [
							{
								resource: {
									resourceType: "Patient",
									id: "p-001",
									name: [{ family: "Nguyen", given: ["Van Minh"] }],
								},
							},
							{
								resource: {
									resourceType: "Condition",
									code: { text: "Type 2 Diabetes" },
								},
							},
						],
					},
				},
			},
			{
				apiId: "ehr_summarize",
				input: {
					input_ehr: { type: "fhir", fhir_bundle: "{{prev.bundle}}" },
					model: "gpt-4o-2",
					stream: false,
				},
				output: {
					output: [
						{
							type: "text",
							content:
								"## Clinical Summary\n**Patient**: Nguyen Van Minh, Male, 39y\n**Active Conditions**: Type 2 Diabetes (E11.9), Hypertension (I10)\n**Recommendation**: Monitor HbA1c quarterly, BP target <130/80",
						},
					],
				},
			},
		],
	},
	{
		label: "EHR → FHIR → Rx Check",
		description:
			"Convert patient data then check prescription for drug interactions",
		steps: [
			{
				apiId: "ehr_convert",
				input: {
					data: "MSH|^~\\&|HIS|HOSP|EHR|FAC|20250215||ADT^A01|MSG002|P|2.5\rPID|1||MRN-002||Tran^Thi Lan||19470610|F\rAL1|1|DA|PCN^Penicillin|SV|Anaphylaxis\rDG1|1|ICD10|I48^Atrial Fibrillation",
					validate_output: false,
				},
				output: {
					success: true,
					source_format: "hl7v2",
					resource_count: 3,
					bundle: {
						resourceType: "Bundle",
						type: "collection",
						entry: [{ resource: { resourceType: "Patient", id: "p-002" } }],
					},
				},
			},
			{
				apiId: "rx_advisor",
				input: {
					ehr: { type: "fhir", fhir_bundle: "{{prev.bundle}}" },
					prescription: {
						type: "custom_json",
						custom_json: [
							{ name: "Warfarin", dose: "5mg", frequency: "once daily" },
							{ name: "Aspirin", dose: "81mg", frequency: "once daily" },
						],
					},
					model: "gpt-4o-2",
					stream: false,
				},
				output: {
					output: [
						{
							type: "text",
							content:
								"## HIGH RISK: Warfarin + Aspirin\n**Interaction**: Increased bleeding risk (major)\n**Penicillin allergy**: No conflict with current Rx\n**Recommendation**: Monitor INR closely, consider PPI for GI protection",
						},
					],
				},
			},
		],
	},
	{
		label: "EHR → Mask → Store",
		description: "Convert, de-identify PHI, then store in patient history",
		steps: [
			{
				apiId: "ehr_convert",
				input: {
					data: "MSH|^~\\&|LAB|FAC|EHR|FAC|20250301||ORU^R01|MSG003|P|2.5\rPID|1||MRN-001||Nguyen^Van Minh||19850315|M\rOBX|1|NM|4548-4^HbA1c||7.2|%",
					validate_output: false,
				},
				output: {
					success: true,
					source_format: "hl7v2",
					resource_count: 2,
					bundle: {
						resourceType: "Bundle",
						type: "collection",
						entry: [
							{ resource: { resourceType: "Patient", id: "p-001" } },
							{
								resource: {
									resourceType: "Observation",
									code: { text: "HbA1c" },
									valueQuantity: { value: 7.2, unit: "%" },
								},
							},
						],
					},
				},
			},
			{
				apiId: "data_mask",
				input: { bundle: "{{prev.bundle}}" },
				output: {
					masked_bundle: {
						resourceType: "Bundle",
						entry: [
							{
								resource: {
									resourceType: "Patient",
									id: "MASKED",
									name: [{ family: "***", given: ["***"] }],
								},
							},
						],
					},
					fields_masked: 4,
				},
			},
			{
				apiId: "patient_history",
				input: {
					patient_id: 1,
					fhir_bundle: "{{prev.masked_bundle}}",
					facility: "MedLab Diagnostics",
				},
				output: {
					visit_count: 3,
					timeline_updated: true,
					latest_visit: "2025-03-01",
				},
			},
		],
	},
	{
		label: "BHXH Validate → Convert → Summary",
		description:
			"Validate Vietnam insurance XML, convert to FHIR, then summarize",
		steps: [
			{
				apiId: "bhxh_validate",
				input: { xml_data: "<GIAMDINHHS>...</GIAMDINHHS>", strict: true },
				output: { valid: true, errors: [], warnings: 1, record_count: 1 },
			},
			{
				apiId: "ehr_convert",
				input: { data: "<GIAMDINHHS>...</GIAMDINHHS>", validate_output: true },
				output: {
					success: true,
					source_format: "bhxh_4210",
					resource_count: 6,
					bundle: { resourceType: "Bundle", type: "collection", total: 6 },
				},
			},
			{
				apiId: "ehr_summarize",
				input: {
					input_ehr: { type: "fhir", fhir_bundle: "{{prev.bundle}}" },
					model: "gpt-4o-2",
					stream: false,
				},
				output: {
					output: [
						{
							type: "text",
							content:
								"## BHXH Claim Summary\n**Facility**: 10065\n**Diagnosis**: J18.9 Pneumonia\n**Treatment period**: 2 days inpatient\n**Total cost**: 850,000 VND",
						},
					],
				},
			},
		],
	},
];

// --- Pipeline step ---

interface PipelineStep {
	id: string;
	api: ApiDef;
	bodyOverride: string;
	mapFromPrevious: string;
	sampleOutput: string;
}

// --- Code generation ---

function generateFlowCode(steps: PipelineStep[]): Record<string, string> {
	const curlParts = steps.map((s, i) => {
		let body: string;
		try {
			body = s.bodyOverride.trim() || JSON.stringify(s.api.sampleBody);
		} catch {
			body = JSON.stringify(s.api.sampleBody);
		}
		let code = `# Step ${i + 1}: ${s.api.label}\n`;
		if (i > 0 && s.mapFromPrevious) {
			code += `# Uses output from step ${i}: ${s.mapFromPrevious}\n`;
		}
		code += `curl -X ${s.api.method} "${s.api.endpoint}" \\\n`;
		code += `  -H "Content-Type: application/json" \\\n`;
		code += `  -H "X-Api-Key: YOUR_API_KEY" \\\n`;
		code += `  -d '${body}'`;
		return code;
	});

	const pyParts = steps.map((s, i) => {
		let body: string;
		try {
			body = s.bodyOverride.trim() || JSON.stringify(s.api.sampleBody, null, 4);
		} catch {
			body = JSON.stringify(s.api.sampleBody, null, 4);
		}
		const pyBody = body
			.replace(/null/g, "None")
			.replace(/true/g, "True")
			.replace(/false/g, "False");

		let code = `# Step ${i + 1}: ${s.api.label}\n`;
		if (i > 0 && s.mapFromPrevious) {
			code += `# Map from previous: ${s.mapFromPrevious}\n`;
			code += `step_${i + 1}_body = ${pyBody}\n`;
			code += `# TODO: Replace placeholder with result_${i}["${s.mapFromPrevious}"]\n`;
		} else {
			code += `step_${i + 1}_body = ${pyBody}\n`;
		}
		code += `resp_${i + 1} = requests.${s.api.method.toLowerCase()}(\n`;
		code += `    "${s.api.endpoint}",\n`;
		code += `    headers=headers,\n`;
		code += `    json=step_${i + 1}_body,\n`;
		code += `)\n`;
		code += `result_${i + 1} = resp_${i + 1}.json()\n`;
		code += `print(f"Step ${i + 1} ({s.api.label}): {resp_${i + 1}.status_code}")`;
		return code;
	});

	const jsParts = steps.map((s, i) => {
		let body: string;
		try {
			body = s.bodyOverride.trim() || JSON.stringify(s.api.sampleBody, null, 2);
		} catch {
			body = JSON.stringify(s.api.sampleBody, null, 2);
		}
		let code = `// Step ${i + 1}: ${s.api.label}\n`;
		if (i > 0 && s.mapFromPrevious) {
			code += `// Uses result_${i}.${s.mapFromPrevious}\n`;
		}
		code += `const resp${i + 1} = await fetch("${s.api.endpoint}", {\n`;
		code += `  method: "${s.api.method}",\n`;
		code += `  headers: { "Content-Type": "application/json", "X-Api-Key": API_KEY },\n`;
		code += `  body: JSON.stringify(${body}),\n`;
		code += `});\n`;
		code += `const result${i + 1} = await resp${i + 1}.json();\n`;
		code += `console.log("Step ${i + 1}:", resp${i + 1}.status);`;
		return code;
	});

	const goParts = steps.map((s, i) => {
		let body: string;
		try {
			body = s.bodyOverride.trim() || JSON.stringify(s.api.sampleBody);
		} catch {
			body = JSON.stringify(s.api.sampleBody);
		}
		let code = `// Step ${i + 1}: ${s.api.label}\n`;
		code += `body${i + 1} := strings.NewReader(\`${body}\`)\n`;
		code += `req${i + 1}, _ := http.NewRequest("${s.api.method}", "${s.api.endpoint}", body${i + 1})\n`;
		code += `req${i + 1}.Header.Set("Content-Type", "application/json")\n`;
		code += `req${i + 1}.Header.Set("X-Api-Key", apiKey)\n`;
		code += `resp${i + 1}, _ := client.Do(req${i + 1})\n`;
		code += `defer resp${i + 1}.Body.Close()\n`;
		code += `fmt.Printf("Step ${i + 1} (%s): %d\\n", "${s.api.label}", resp${i + 1}.StatusCode)`;
		return code;
	});

	return {
		python: `import requests\n\nheaders = {\n    "Content-Type": "application/json",\n    "X-Api-Key": "YOUR_API_KEY",\n}\n\n${pyParts.join("\n\n")}`,
		curl: curlParts.join("\n\n"),
		javascript: `const API_KEY = "YOUR_API_KEY";\n\nasync function runPipeline() {\n${jsParts
			.map((p) =>
				p
					.split("\n")
					.map((l) => `  ${l}`)
					.join("\n")
			)
			.join("\n\n")}\n}\n\nrunPipeline();`,
		go: `package main\n\nimport (\n\t"fmt"\n\t"net/http"\n\t"strings"\n)\n\nfunc main() {\n\tclient := &http.Client{}\n\tapiKey := "YOUR_API_KEY"\n\n${goParts
			.map((p) =>
				p
					.split("\n")
					.map((l) => `\t${l}`)
					.join("\n")
			)
			.join("\n\n")}\n}`,
	};
}

// --- Main component ---

export default function ApiFlowBuilderPage() {
	const [pipeline, setPipeline] = useState<PipelineStep[]>([]);
	const [generatedCode, setGeneratedCode] = useState<Record<
		string,
		string
	> | null>(null);
	const [activeTab, setActiveTab] = useState<string>("python");
	const [dragIdx, setDragIdx] = useState<number | null>(null);
	const [showDocs, setShowDocs] = useState(false);
	const [showPackDialog, setShowPackDialog] = useState(false);
	const [packedName, setPackedName] = useState("");
	const [publishedFlows, setPublishedFlows] = useState<
		{ name: string; steps: PipelineStep[] }[]
	>([]);
	const [activeStepIdx, setActiveStepIdx] = useState<number | null>(null);

	const CODE_TABS = ["python", "javascript", "go", "curl"] as const;

	const addStep = useCallback((api: ApiDef) => {
		setPipeline((prev) => [
			...prev,
			{
				id: `step_${Date.now()}`,
				api,
				bodyOverride: JSON.stringify(api.sampleBody, null, 2),
				mapFromPrevious: api.outputKey || "",
				sampleOutput: "",
			},
		]);
	}, []);

	const removeStep = useCallback((id: string) => {
		setPipeline((prev) => prev.filter((s) => s.id !== id));
	}, []);

	const moveStep = useCallback((id: string, direction: -1 | 1) => {
		setPipeline((prev) => {
			const idx = prev.findIndex((s) => s.id === id);
			if (idx < 0) return prev;
			const newIdx = idx + direction;
			if (newIdx < 0 || newIdx >= prev.length) return prev;
			const copy = [...prev];
			[copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
			return copy;
		});
	}, []);

	const updateStepBody = useCallback((id: string, body: string) => {
		setPipeline((prev) =>
			prev.map((s) => (s.id === id ? { ...s, bodyOverride: body } : s))
		);
	}, []);

	const updateStepMapping = useCallback((id: string, mapping: string) => {
		setPipeline((prev) =>
			prev.map((s) => (s.id === id ? { ...s, mapFromPrevious: mapping } : s))
		);
	}, []);

	const handleGenerate = useCallback(() => {
		if (pipeline.length === 0) {
			toast.error("Add at least one API step");
			return;
		}
		setGeneratedCode(generateFlowCode(pipeline));
		toast.success("Code generated");
	}, [pipeline]);

	const loadDemoFlow = useCallback((demo: (typeof DEMO_FLOWS)[number]) => {
		const steps: PipelineStep[] = [];
		for (const step of demo.steps) {
			const api = AVAILABLE_APIS.find((a) => a.id === step.apiId);
			if (api) {
				steps.push({
					id: `step_${Date.now()}_${step.apiId}`,
					api,
					bodyOverride: JSON.stringify(step.input, null, 2),
					mapFromPrevious: api.outputKey || "",
					sampleOutput: JSON.stringify(step.output, null, 2),
				});
			}
		}
		setPipeline(steps);
		setGeneratedCode(null);
		setActiveStepIdx(0);
		toast.success(`Loaded demo: ${demo.label}`);
	}, []);

	const handleDragStart = (idx: number) => {
		setDragIdx(idx);
	};

	const handleDragOver = (e: React.DragEvent, idx: number) => {
		e.preventDefault();
		if (dragIdx === null || dragIdx === idx) return;
		setPipeline((prev) => {
			const copy = [...prev];
			const [moved] = copy.splice(dragIdx, 1);
			copy.splice(idx, 0, moved);
			return copy;
		});
		setDragIdx(idx);
	};

	const handleDragEnd = () => {
		setDragIdx(null);
	};

	const handlePackAsApi = () => {
		if (!packedName.trim()) {
			toast.error("Enter an endpoint name");
			return;
		}
		const name = packedName.trim().replace(/\s+/g, "_").toLowerCase();
		setPublishedFlows((prev) => [...prev, { name, steps: [...pipeline] }]);
		toast.success(`Flow published as /service/api/v1/flows/${name}`);
		setShowPackDialog(false);
		setPackedName("");
	};

	return (
		<DashboardLayout pageTitle="API Flow Builder">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				<div className="flex-1 flex overflow-hidden">
					{/* Left: API palette */}
					<div className="w-52 shrink-0 border-r overflow-y-auto bg-muted/20 p-3 space-y-3">
						<h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
							Available APIs
						</h3>
						{AVAILABLE_APIS.map((api) => {
							const IconComp = api.icon;
							return (
								<button
									key={api.id}
									type="button"
									onClick={() => addStep(api)}
									className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md border text-left text-xs hover:bg-muted/50 transition-colors"
								>
									<IconComp className="size-4 shrink-0 text-muted-foreground" />
									<span className="truncate">{api.label}</span>
								</button>
							);
						})}

						<div className="border-t pt-3">
							<h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
								Demo Flows
							</h3>
							{DEMO_FLOWS.map((demo) => (
								<button
									key={demo.label}
									type="button"
									onClick={() => loadDemoFlow(demo)}
									className="w-full flex flex-col gap-0.5 px-2 py-1.5 rounded-md text-left text-[11px] text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors mb-0.5"
									title={demo.description}
								>
									<span className="truncate font-medium">{demo.label}</span>
									<span className="text-[10px] text-muted-foreground/60 truncate">
										{demo.steps.length} steps
									</span>
								</button>
							))}
						</div>

						{publishedFlows.length > 0 && (
							<div className="border-t pt-3">
								<h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
									Custom Flows
								</h3>
								{publishedFlows.map((flow) => (
									<button
										key={flow.name}
										type="button"
										onClick={() => {
											setPipeline([...flow.steps]);
											setGeneratedCode(null);
											setActiveStepIdx(0);
											toast.success(`Loaded flow: ${flow.name}`);
										}}
										className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-[11px] text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
									>
										<span className="truncate">/flows/{flow.name}</span>
										<span className="ml-auto text-[10px] text-muted-foreground/50">
											{flow.steps.length}x
										</span>
									</button>
								))}
							</div>
						)}

						<div className="border-t pt-3">
							<button
								type="button"
								onClick={() => setShowDocs(!showDocs)}
								className="w-full text-left text-[11px] font-medium text-primary hover:underline"
							>
								{showDocs ? "Hide" : "Show"} API Docs
							</button>
							{showDocs && (
								<div className="mt-2 space-y-1.5 text-[11px] text-muted-foreground">
									{AVAILABLE_APIS.map((api) => (
										<div
											key={api.id}
											className="p-1.5 rounded border bg-muted/10"
										>
											<div className="font-medium text-foreground">
												{api.label}
											</div>
											<div className="font-mono text-[10px] truncate">
												{api.method} {api.endpoint.replace(BASE_API_URL, "/")}
											</div>
											<div className="text-[10px] mt-0.5">
												Body: {Object.keys(api.sampleBody).join(", ")}
											</div>
											{api.outputKey && (
												<div className="text-[10px]">
													Output key: {api.outputKey}
												</div>
											)}
										</div>
									))}
								</div>
							)}
						</div>
					</div>

					{/* Center: Pipeline builder */}
					<div className="flex-1 flex flex-col overflow-hidden">
						<div className="flex items-center justify-between px-4 py-2 border-b bg-muted/20 gap-2 flex-wrap">
							<span className="text-xs text-muted-foreground">
								{pipeline.length} step(s) — drag to reorder
							</span>
							<div className="flex gap-2 flex-wrap">
								<Button
									variant="outline"
									size="sm"
									className="h-6 text-[11px]"
									onClick={() => {
										setPipeline([]);
										setGeneratedCode(null);
									}}
								>
									Clear
								</Button>
								{pipeline.length > 0 && (
									<ViewCodeDialog
										endpoint={pipeline[0]?.api.endpoint || ""}
										method="POST"
										description={`Flow: ${pipeline.map((s) => s.api.label).join(" → ")}`}
										steps={pipeline.map((s) => ({
											label: s.api.label,
											endpoint: s.api.endpoint,
											method: s.api.method,
											body: (() => {
												try {
													return JSON.parse(s.bodyOverride);
												} catch {
													return s.api.sampleBody;
												}
											})(),
										}))}
									/>
								)}
								<Button
									variant="outline"
									size="sm"
									className="h-7 text-xs"
									disabled={pipeline.length === 0}
									onClick={() => setShowPackDialog(true)}
								>
									Pack as API
								</Button>
								<Button
									size="sm"
									className="h-7 text-xs"
									disabled={pipeline.length === 0}
									onClick={handleGenerate}
								>
									Generate Code
								</Button>
							</div>
						</div>

						{/* Pack as API dialog */}
						{showPackDialog && (
							<div className="px-4 py-3 border-b bg-primary/5 flex items-center gap-3 flex-wrap">
								<span className="text-xs font-medium">
									Pack as API endpoint:
								</span>
								<code className="text-xs text-muted-foreground">
									/service/api/v1/flows/
								</code>
								<input
									value={packedName}
									onChange={(e) => setPackedName(e.target.value)}
									placeholder="my_pipeline"
									className="rounded border bg-transparent px-2 py-1 text-xs font-mono w-40"
								/>
								<Button
									size="sm"
									className="h-6 text-[11px]"
									onClick={handlePackAsApi}
								>
									Publish
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="h-6 text-[11px]"
									onClick={() => setShowPackDialog(false)}
								>
									Cancel
								</Button>
							</div>
						)}

						<div className="flex-1 overflow-auto p-4 space-y-3">
							{pipeline.length === 0 ? (
								<div className="flex items-center justify-center h-full">
									<div className="text-center space-y-2">
										<p className="text-sm text-muted-foreground">
											Build a custom API pipeline
										</p>
										<p className="text-[11px] text-muted-foreground/60">
											Click APIs from the palette or load a demo flow. Drag
											steps to reorder.
										</p>
									</div>
								</div>
							) : (
								pipeline.map((step, idx) => (
									// biome-ignore lint/a11y/useSemanticElements: draggable div for reordering
									<div
										key={step.id}
										role="group"
										draggable
										onDragStart={() => handleDragStart(idx)}
										onDragOver={(e) => handleDragOver(e, idx)}
										onDragEnd={handleDragEnd}
									>
										{idx > 0 && (
											<div className="flex justify-center py-1">
												<svg
													width="16"
													height="20"
													className="text-muted-foreground/40"
													aria-hidden="true"
												>
													<path
														d="M8 0 L8 14 M4 10 L8 16 L12 10"
														stroke="currentColor"
														strokeWidth="1.5"
														fill="none"
													/>
												</svg>
											</div>
										)}
										{/* biome-ignore lint/a11y/useSemanticElements: clickable step card with drag support */}
										<div
											className={`rounded-lg border p-3 space-y-2 transition-colors cursor-pointer ${dragIdx === idx ? "border-primary bg-primary/5" : activeStepIdx === idx ? "border-primary/50 bg-primary/5" : ""}`}
											onClick={() => setActiveStepIdx(idx)}
											onKeyDown={() => {}}
											role="button"
											tabIndex={0}
										>
											<div className="flex items-center gap-2">
												<span className="text-xs font-bold text-muted-foreground w-5 cursor-grab">
													⠿
												</span>
												<span className="text-xs font-bold text-muted-foreground w-5">
													{idx + 1}
												</span>
												{(() => {
													const StepIcon = step.api.icon;
													return (
														<StepIcon className="size-4 text-muted-foreground" />
													);
												})()}
												<span className="text-xs font-medium flex-1">
													{step.api.label}
												</span>
												<span className="text-[11px] text-muted-foreground font-mono">
													{step.api.method}
												</span>
												<div className="flex gap-0.5">
													<button
														type="button"
														onClick={() => moveStep(step.id, -1)}
														disabled={idx === 0}
														className="px-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
													>
														↑
													</button>
													<button
														type="button"
														onClick={() => moveStep(step.id, 1)}
														disabled={idx === pipeline.length - 1}
														className="px-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
													>
														↓
													</button>
													<button
														type="button"
														onClick={() => removeStep(step.id)}
														className="px-1 text-xs text-destructive hover:text-destructive/80"
													>
														✕
													</button>
												</div>
											</div>
											<div className="text-[11px] text-muted-foreground font-mono truncate">
												{step.api.endpoint}
											</div>
											{idx > 0 && (
												<div className="flex items-center gap-2">
													<span className="text-[11px] text-muted-foreground shrink-0">
														Map from prev:
													</span>
													<input
														value={step.mapFromPrevious}
														onChange={(e) =>
															updateStepMapping(step.id, e.target.value)
														}
														placeholder="e.g. fhir_bundle"
														className="flex-1 rounded border bg-transparent px-2 py-0.5 text-[11px] font-mono"
													/>
												</div>
											)}
											<div className="grid grid-cols-2 gap-2">
												<div>
													<div className="text-[10px] font-semibold text-muted-foreground mb-1">
														INPUT
													</div>
													<textarea
														value={step.bodyOverride}
														onChange={(e) =>
															updateStepBody(step.id, e.target.value)
														}
														rows={4}
														className="w-full rounded border bg-transparent px-2 py-1 text-[11px] font-mono resize-y"
													/>
												</div>
												<div>
													<div className="text-[10px] font-semibold text-muted-foreground mb-1">
														OUTPUT (preview)
													</div>
													<pre className="w-full rounded border bg-muted/30 px-2 py-1 text-[11px] font-mono h-[6.5rem] overflow-auto text-muted-foreground">
														{step.sampleOutput ||
															`{  "status": "ok",\n  "data": "..."  }`}
													</pre>
												</div>
											</div>
										</div>
									</div>
								))
							)}
						</div>
					</div>

					{/* Right: Generated code / Step preview */}
					{(generatedCode ||
						(pipeline.length > 0 && activeStepIdx !== null)) && (
						<div className="w-80 shrink-0 border-l flex flex-col overflow-hidden">
							{activeStepIdx !== null &&
								pipeline[activeStepIdx] &&
								!generatedCode && (
									<>
										<div className="px-3 py-2 border-b bg-muted/20">
											<div className="text-xs font-semibold">
												Step {activeStepIdx + 1}:{" "}
												{pipeline[activeStepIdx].api.label}
											</div>
											<div className="text-[10px] text-muted-foreground font-mono truncate mt-0.5">
												{pipeline[activeStepIdx].api.method}{" "}
												{pipeline[activeStepIdx].api.endpoint.replace(
													BASE_API_URL,
													"/"
												)}
											</div>
										</div>
										<div className="flex-1 overflow-auto p-3 space-y-3">
											<div>
												<div className="text-[10px] font-bold text-green-600 dark:text-green-400 mb-1">
													INPUT
												</div>
												<pre className="text-[10px] font-mono bg-muted/30 rounded p-2 whitespace-pre-wrap break-all leading-relaxed max-h-48 overflow-auto">
													{pipeline[activeStepIdx].bodyOverride}
												</pre>
											</div>
											{pipeline[activeStepIdx].sampleOutput && (
												<div>
													<div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-1">
														OUTPUT
													</div>
													<pre className="text-[10px] font-mono bg-muted/30 rounded p-2 whitespace-pre-wrap break-all leading-relaxed max-h-48 overflow-auto">
														{pipeline[activeStepIdx].sampleOutput}
													</pre>
												</div>
											)}
										</div>
										<div className="p-2 border-t">
											<div className="flex gap-1">
												<Button
													variant="outline"
													size="sm"
													className="text-[10px] h-6 flex-1"
													disabled={activeStepIdx === 0}
													onClick={() =>
														setActiveStepIdx((p) => Math.max(0, (p ?? 0) - 1))
													}
												>
													← Prev
												</Button>
												<Button
													variant="outline"
													size="sm"
													className="text-[10px] h-6 flex-1"
													disabled={activeStepIdx >= pipeline.length - 1}
													onClick={() =>
														setActiveStepIdx((p) =>
															Math.min(pipeline.length - 1, (p ?? 0) + 1)
														)
													}
												>
													Next →
												</Button>
											</div>
										</div>
									</>
								)}
							{generatedCode && (
								<>
									<div className="flex border-b flex-wrap">
										{CODE_TABS.map((tab) => (
											<button
												key={tab}
												type="button"
												onClick={() => setActiveTab(tab)}
												className={`flex-1 px-2 py-2 text-[11px] font-medium border-b-2 transition-colors ${
													activeTab === tab
														? "border-primary text-primary"
														: "border-transparent text-muted-foreground"
												}`}
											>
												{tab === "python"
													? "Python"
													: tab === "javascript"
														? "JS/TS"
														: tab === "go"
															? "Go"
															: "cURL"}
											</button>
										))}
									</div>
									<div className="flex-1 overflow-auto p-3">
										<pre className="text-[11px] font-mono whitespace-pre-wrap leading-relaxed">
											{generatedCode[activeTab]}
										</pre>
									</div>
									<div className="p-2 border-t flex gap-2">
										<Button
											variant="outline"
											size="sm"
											className="text-[11px] h-6 flex-1"
											onClick={() => {
												navigator.clipboard.writeText(generatedCode[activeTab]);
												toast.success("Copied");
											}}
										>
											Copy
										</Button>
										<Button
											variant="outline"
											size="sm"
											className="text-[11px] h-6 flex-1"
											onClick={() => {
												const ext: Record<string, string> = {
													python: "py",
													curl: "sh",
													javascript: "js",
													go: "go",
												};
												const blob = new Blob([generatedCode[activeTab]], {
													type: "text/plain",
												});
												const url = URL.createObjectURL(blob);
												const a = document.createElement("a");
												a.href = url;
												a.download = `api-flow.${ext[activeTab] || "txt"}`;
												a.click();
												URL.revokeObjectURL(url);
											}}
										>
											Download
										</Button>
									</div>
								</>
							)}
						</div>
					)}
				</div>
			</div>
		</DashboardLayout>
	);
}
