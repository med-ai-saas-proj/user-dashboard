import { ApiReferenceReact } from "@scalar/api-reference-react";
import { useTheme } from "next-themes";
import { API_ROUTES, BASE_API_URL } from "@/config/api-routes";
import DashboardLayout from "@/layouts/dashboard-layout";
import "@scalar/api-reference-react/style.css";
import { useState } from "react";

const API_CATEGORIES = [
	{
		label: "Data Processing",
		color: "#10b981",
		apis: [
			{
				method: "POST",
				path: "/ehr_converter/convert",
				desc: "Auto-detect → FHIR R4",
			},
			{
				method: "POST",
				path: "/ehr_converter/convert/fhir-to-hl7v2",
				desc: "FHIR → HL7v2",
			},
			{
				method: "POST",
				path: "/ehr_converter/validate",
				desc: "Validate FHIR Bundle",
			},
			{
				method: "POST",
				path: "/ehr_converter/convert/document",
				desc: "Document → FHIR (OCR)",
			},
			{
				method: "POST",
				path: "/ehr_converter/convert/batch",
				desc: "Batch conversion",
			},
			{
				method: "POST",
				path: "/bhxh_validator/validate",
				desc: "BHXH 4210 validate",
			},
			{ method: "POST", path: "/data_masking/mask", desc: "De-identify FHIR" },
			{
				method: "*",
				path: "/knowledge_base/**",
				desc: "Knowledge base CRUD + search",
			},
		],
	},
	{
		label: "Data Management",
		color: "#0ea5e9",
		apis: [
			{
				method: "*",
				path: "/patient/**",
				desc: "Patient CRUD, history, wearable",
			},
			{
				method: "POST",
				path: "/public_health/statistics",
				desc: "Population statistics",
			},
			{ method: "POST", path: "/health_score/evaluate", desc: "Health score" },
			{
				method: "POST",
				path: "/data_masking/facility/register",
				desc: "Register facility DB",
			},
			{
				method: "POST",
				path: "/data_masking/facility/search",
				desc: "Cross-facility search",
			},
			{
				method: "GET",
				path: "/digital_twin/{id}",
				desc: "Full patient digital twin",
			},
			{
				method: "GET",
				path: "/digital_twin/{id}/vitals",
				desc: "Patient vitals",
			},
			{ method: "GET", path: "/digital_twin/{id}/labs", desc: "Lab results" },
			{
				method: "GET",
				path: "/digital_twin/{id}/conditions",
				desc: "Active conditions",
			},
			{
				method: "GET",
				path: "/digital_twin/{id}/medications",
				desc: "Medications + adherence",
			},
			{
				method: "GET",
				path: "/digital_twin/{id}/imaging",
				desc: "Imaging studies",
			},
			{
				method: "GET",
				path: "/digital_twin/{id}/tasks",
				desc: "Clinical tasks",
			},
			{
				method: "GET",
				path: "/digital_twin/{id}/timeline",
				desc: "Medical timeline",
			},
			{
				method: "POST",
				path: "/digital_twin/sync",
				desc: "Sync from data sources",
			},
			{
				method: "POST",
				path: "/digital_twin/{id}/predict",
				desc: "AI risk prediction",
			},
		],
	},
	{
		label: "Operation",
		color: "#8b5cf6",
		apis: [
			{ method: "POST", path: "/ehr_summarize", desc: "EHR clinical summary" },
			{
				method: "POST",
				path: "/rx_advisor",
				desc: "Prescription risk analysis",
			},
			{ method: "POST", path: "/chat", desc: "AI chat (SSE stream)" },
			{
				method: "POST",
				path: "/ai_search",
				desc: "AI search + deep research (SSE)",
			},
			{
				method: "POST",
				path: "/voice_transcribe",
				desc: "Audio transcription",
			},
			{
				method: "POST",
				path: "/medical_image/describe",
				desc: "Medical image analysis",
			},
			{
				method: "POST",
				path: "/symptom_checker/check",
				desc: "Symptom assessment + triage",
			},
			{
				method: "GET",
				path: "/clinic_search/search",
				desc: "Search clinics & doctors",
			},
			{
				method: "POST",
				path: "/clinic_search/recommend",
				desc: "Recommend by symptoms",
			},
			{
				method: "GET",
				path: "/clinic_search/provinces",
				desc: "List provinces",
			},
			{
				method: "GET",
				path: "/clinic_search/clinics",
				desc: "List all clinics",
			},
			{
				method: "GET",
				path: "/clinic_search/doctors",
				desc: "List all doctors",
			},
			{
				method: "POST",
				path: "/blood_panel/analyze",
				desc: "Blood test analysis",
			},
		],
	},
	{
		label: "Advanced / Research",
		color: "#ec4899",
		apis: [
			{
				method: "POST",
				path: "/gene_decoder/decode",
				desc: "Parse FASTA/FASTQ sequences",
			},
			{
				method: "POST",
				path: "/gene_decoder/analyze",
				desc: "AI variant annotation",
			},
			{
				method: "POST",
				path: "/gene_decoder/decode/batch",
				desc: "Batch sequence decoding",
			},
			{
				method: "POST",
				path: "/federated/projects",
				desc: "Create FL project",
			},
			{ method: "GET", path: "/federated/projects", desc: "List FL projects" },
			{
				method: "POST",
				path: "/federated/projects/{id}/join",
				desc: "Facility joins project",
			},
			{
				method: "POST",
				path: "/federated/projects/{id}/rounds",
				desc: "Start training round",
			},
			{
				method: "POST",
				path: "/federated/projects/{id}/updates",
				desc: "Submit gradient updates",
			},
			{
				method: "GET",
				path: "/federated/projects/{id}/model",
				desc: "Get aggregated model",
			},
			{
				method: "GET",
				path: "/federated/projects/{id}/metrics",
				desc: "Training metrics",
			},
		],
	},
	{
		label: "Interop & Workflow",
		color: "#f97316",
		apis: [
			{
				method: "*",
				path: "/cross_search/**",
				desc: "Cross-provider patient search",
			},
			{
				method: "*",
				path: "/workflows/**",
				desc: "Workflow builder CRUD + codegen",
			},
			{ method: "*", path: "/memory/**", desc: "Agent memory layer" },
			{ method: "*", path: "/playground/**", desc: "Seed demo environment" },
		],
	},
	{
		label: "Management",
		color: "#f59e0b",
		apis: [
			{ method: "GET", path: "/api-keys", desc: "List API keys", mgmt: true },
			{ method: "POST", path: "/api-keys", desc: "Create API key", mgmt: true },
			{
				method: "*",
				path: "/local-models/**",
				desc: "Local model management",
				mgmt: true,
			},
		],
	},
];

export default function APIReferencePage() {
	const { resolvedTheme } = useTheme();
	const [view, setView] = useState<"overview" | "openapi">("overview");

	return (
		<DashboardLayout pageTitle="API Reference">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				<div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/20">
					<button
						type="button"
						onClick={() => setView("overview")}
						className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${view === "overview" ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted/50"}`}
					>
						Grouped Overview
					</button>
					<button
						type="button"
						onClick={() => setView("openapi")}
						className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${view === "openapi" ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted/50"}`}
					>
						OpenAPI Explorer
					</button>
				</div>

				<div className="flex-1 overflow-auto">
					{view === "overview" ? (
						<div className="max-w-4xl mx-auto p-6 space-y-6">
							<div>
								<h1 className="text-lg font-bold">API Endpoints by Category</h1>
								<p className="text-sm text-muted-foreground mt-1">
									Base URL:{" "}
									<code className="text-xs bg-muted px-1.5 py-0.5 rounded">
										{BASE_API_URL}service/api/v1/
									</code>
								</p>
							</div>
							{API_CATEGORIES.map((cat) => (
								<div
									key={cat.label}
									className="rounded-lg border overflow-hidden"
								>
									<div
										className="px-4 py-2.5 font-semibold text-sm flex items-center gap-2"
										style={{ borderLeft: `3px solid ${cat.color}` }}
									>
										<span
											className="w-2 h-2 rounded-full"
											style={{ background: cat.color }}
										/>
										{cat.label}
										<span className="ml-auto text-xs text-muted-foreground font-normal">
											{cat.apis.length} endpoint(s)
										</span>
									</div>
									<div className="divide-y">
										{cat.apis.map((api) => (
											<div
												key={api.path}
												className="flex items-center gap-3 px-4 py-2 text-xs hover:bg-muted/30 transition-colors"
											>
												<span
													className={`w-11 shrink-0 font-bold text-center rounded px-1 py-0.5 ${
														api.method === "POST"
															? "text-green-600 dark:text-green-400 bg-green-500/10"
															: api.method === "GET"
																? "text-blue-600 dark:text-blue-400 bg-blue-500/10"
																: "text-muted-foreground bg-muted"
													}`}
												>
													{api.method}
												</span>
												<code className="font-mono text-foreground">
													{api.mgmt ? "/management/api/v1" : "/service/api/v1"}
													{api.path}
												</code>
												<span className="ml-auto text-muted-foreground shrink-0">
													{api.desc}
												</span>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					) : (
						<ApiReferenceReact
							configuration={{
								url: API_ROUTES.MANAGEMENT.DOCS_OPENAPI,
								theme: "default",
								darkMode: resolvedTheme === "dark",
								hideModels: true,
							}}
						/>
					)}
				</div>
			</div>
		</DashboardLayout>
	);
}
