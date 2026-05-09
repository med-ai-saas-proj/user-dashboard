import { ArrowRightIcon, GitBranchIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/shadcn/button";

export interface ApiNode {
	id: string;
	label: string;
	endpoint: string;
	method: string;
}

export interface TopologyDef {
	title: string;
	description: string;
	nodes: ApiNode[];
	flowId: string;
}

interface ApiTopologyProps extends TopologyDef {}

const METHOD_COLORS: Record<string, string> = {
	GET: "border-blue-400 bg-blue-500/10 text-blue-700 dark:text-blue-300",
	POST: "border-green-400 bg-green-500/10 text-green-700 dark:text-green-300",
	PUT: "border-amber-400 bg-amber-500/10 text-amber-700 dark:text-amber-300",
	DELETE: "border-red-400 bg-red-500/10 text-red-700 dark:text-red-300",
};

export function ApiTopology({
	title,
	description,
	nodes,
	flowId,
}: ApiTopologyProps) {
	const navigate = useNavigate();

	return (
		<div className="rounded-lg border bg-muted/10 p-3 space-y-2">
			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-1.5">
					<GitBranchIcon className="size-3.5 text-primary" />
					<span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
						{title}
					</span>
				</div>
				<Button
					variant="ghost"
					size="sm"
					className="h-6 text-[11px] text-primary hover:text-primary"
					onClick={() => navigate(`/api-flow-builder?flow=${flowId}`)}
				>
					Open in Flow Builder <ArrowRightIcon className="size-3 ml-1" />
				</Button>
			</div>
			{description && (
				<p className="text-[11px] text-muted-foreground">{description}</p>
			)}

			<div className="flex items-center gap-0 overflow-x-auto py-1">
				{nodes.map((node, i) => (
					<div key={node.id} className="flex items-center shrink-0">
						<div
							className={`rounded-md border-2 px-2.5 py-1.5 text-center min-w-[90px] ${METHOD_COLORS[node.method] || "border-muted"}`}
						>
							<div className="text-[10px] font-bold uppercase opacity-70">
								{node.method}
							</div>
							<div className="text-[11px] font-semibold leading-tight mt-0.5">
								{node.label}
							</div>
							<div className="text-[9px] font-mono text-muted-foreground mt-0.5 truncate max-w-[120px]">
								{node.endpoint}
							</div>
						</div>
						{i < nodes.length - 1 && (
							<div className="flex items-center px-1">
								<div className="w-4 h-px bg-muted-foreground/30" />
								<ArrowRightIcon className="size-3 text-muted-foreground/50 -ml-0.5" />
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}

export const TOPOLOGIES: Record<string, TopologyDef> = {
	chat: {
		title: "Chat API",
		description:
			"Multi-turn conversational AI with tool use, streaming SSE, and model selection.",
		flowId: "chat",
		nodes: [{ id: "chat", label: "Chat", endpoint: "/chat", method: "POST" }],
	},
	ehr_summary: {
		title: "EHR Summary Pipeline",
		description:
			"Converts raw clinical data to FHIR, then generates an AI clinical summary.",
		flowId: "ehr_summary",
		nodes: [
			{
				id: "convert",
				label: "EHR Converter",
				endpoint: "/ehr_converter/convert",
				method: "POST",
			},
			{
				id: "summarize",
				label: "EHR Summarize",
				endpoint: "/ehr_summarize",
				method: "POST",
			},
		],
	},
	ophth_summary: {
		title: "Ophthalmology Summary Pipeline",
		description:
			"Takes a patient's longitudinal ophthalmology EHR (1–63 visits), preprocesses encounters, and produces structured per-eye summary, deduplicated meds/diagnoses, condensed timeline, and follow-up plan.",
		flowId: "ophth_summary",
		nodes: [
			{
				id: "summarize",
				label: "Ophth Summarize",
				endpoint: "/ophth_summarize",
				method: "POST",
			},
		],
	},
	rx_advisor: {
		title: "Rx Advisor Pipeline",
		description:
			"Converts patient data to FHIR, searches drug knowledge base, then checks for interactions.",
		flowId: "rx_advisor",
		nodes: [
			{
				id: "convert",
				label: "EHR Converter",
				endpoint: "/ehr_converter/convert",
				method: "POST",
			},
			{
				id: "kb",
				label: "Knowledge Base",
				endpoint: "/knowledge_base/search",
				method: "POST",
			},
			{
				id: "rx",
				label: "Rx Advisor",
				endpoint: "/rx_advisor",
				method: "POST",
			},
		],
	},
	ai_search: {
		title: "AI Search Pipeline",
		description:
			"Searches the web, checks the local clinic/doctor directory, and synthesizes evidence-based results.",
		flowId: "ai_search",
		nodes: [
			{
				id: "search",
				label: "AI Search",
				endpoint: "/ai_search",
				method: "POST",
			},
			{
				id: "clinic",
				label: "Clinic Search",
				endpoint: "/clinic_search/search",
				method: "GET",
			},
		],
	},
	ehr_converter: {
		title: "EHR Converter",
		description:
			"Auto-detects input format (HL7v2, CDA, HL7v3, BHXH 4210) and converts to FHIR R4.",
		flowId: "ehr_converter",
		nodes: [
			{
				id: "convert",
				label: "EHR Converter",
				endpoint: "/ehr_converter/convert",
				method: "POST",
			},
		],
	},
	document_to_fhir: {
		title: "Document → FHIR Pipeline",
		description:
			"OCR extracts text from medical documents, then converts to FHIR resources via GPT-4o vision.",
		flowId: "document_to_fhir",
		nodes: [
			{ id: "ocr", label: "OCR", endpoint: "/ocr", method: "POST" },
			{
				id: "convert",
				label: "Document Convert",
				endpoint: "/ehr_converter/convert/document",
				method: "POST",
			},
		],
	},
	bhxh_validator: {
		title: "BHXH Validator",
		description:
			"Validates Vietnam Social Security (BHXH) 4210 XML — syntax, ICD-10 codes, date logic, business rules.",
		flowId: "bhxh_validator",
		nodes: [
			{
				id: "validate",
				label: "BHXH Validate",
				endpoint: "/bhxh_validator/validate",
				method: "POST",
			},
		],
	},
	data_masking: {
		title: "Data Masking Pipeline",
		description:
			"De-identifies FHIR bundles by hashing patient IDs and removing PII for cross-facility queries.",
		flowId: "data_masking",
		nodes: [
			{
				id: "mask",
				label: "Data Masking",
				endpoint: "/data_masking/mask",
				method: "POST",
			},
			{
				id: "query",
				label: "Masked Query",
				endpoint: "/data_masking/query",
				method: "POST",
			},
		],
	},
	knowledge_base: {
		title: "Knowledge Base",
		description:
			"Create, ingest, and search medical knowledge bases for RAG-powered responses.",
		flowId: "knowledge_base",
		nodes: [
			{
				id: "create",
				label: "Create KB",
				endpoint: "/knowledge_base",
				method: "POST",
			},
			{
				id: "ingest",
				label: "Ingest Data",
				endpoint: "/knowledge_base/{id}/ingest",
				method: "POST",
			},
			{
				id: "search",
				label: "Search KB",
				endpoint: "/knowledge_base/search",
				method: "POST",
			},
		],
	},
	patient_history: {
		title: "Patient History",
		description:
			"Store and retrieve longitudinal patient history from multiple visits and facilities.",
		flowId: "patient_history",
		nodes: [
			{
				id: "create",
				label: "Create Patient",
				endpoint: "/patient",
				method: "POST",
			},
			{
				id: "history",
				label: "Save History",
				endpoint: "/patient/{id}/history",
				method: "POST",
			},
			{
				id: "get",
				label: "Get History",
				endpoint: "/patient/{id}/history",
				method: "GET",
			},
		],
	},
	wearable_data: {
		title: "Wearable Data",
		description:
			"Ingest wearable device data (heart rate, steps, sleep) and link to patient records.",
		flowId: "wearable_data",
		nodes: [
			{
				id: "ingest",
				label: "Ingest Wearable",
				endpoint: "/patient/{id}/wearable",
				method: "POST",
			},
		],
	},
	public_health: {
		title: "Public Health Statistics",
		description:
			"Aggregate population-level stats — demographics, conditions, medication patterns, trends.",
		flowId: "public_health",
		nodes: [
			{
				id: "stats",
				label: "Public Health",
				endpoint: "/public_health/statistics",
				method: "POST",
			},
		],
	},
	symptom_checker: {
		title: "Symptom Assessment Pipeline",
		description:
			"Evaluates symptoms with AI differential diagnosis, then recommends nearby clinics.",
		flowId: "symptom_checker",
		nodes: [
			{
				id: "check",
				label: "Symptom Check",
				endpoint: "/symptom_checker/check",
				method: "POST",
			},
			{
				id: "clinic",
				label: "Clinic Recommend",
				endpoint: "/clinic_search/recommend",
				method: "POST",
			},
		],
	},
	healthcare_dashboard: {
		title: "Healthcare Dashboard",
		description:
			"One Digital Twin API call aggregates vitals, labs, conditions, meds, imaging, tasks, timeline.",
		flowId: "healthcare_dashboard",
		nodes: [
			{
				id: "twin",
				label: "Digital Twin",
				endpoint: "/digital_twin/{id}",
				method: "GET",
			},
		],
	},
	digital_twin: {
		title: "Digital Twin Pipeline",
		description:
			"Sync data from multiple facilities into a unified patient model, then run AI predictions.",
		flowId: "digital_twin",
		nodes: [
			{
				id: "sync",
				label: "Sync Sources",
				endpoint: "/digital_twin/sync",
				method: "POST",
			},
			{
				id: "twin",
				label: "Digital Twin",
				endpoint: "/digital_twin/{id}",
				method: "GET",
			},
			{
				id: "predict",
				label: "AI Predict",
				endpoint: "/digital_twin/{id}/predict",
				method: "POST",
			},
		],
	},
	health_score: {
		title: "Health Score Pipeline",
		description:
			"Loads patient data from the digital twin, then computes a 20–100 health score.",
		flowId: "health_score",
		nodes: [
			{
				id: "twin",
				label: "Digital Twin",
				endpoint: "/digital_twin/{id}",
				method: "GET",
			},
			{
				id: "score",
				label: "Health Score",
				endpoint: "/health_score/evaluate",
				method: "POST",
			},
		],
	},
	clinic_search: {
		title: "Clinic Search",
		description:
			"Search 37 certified traditional medicine clinics and 57 doctors across 18 provinces.",
		flowId: "clinic_search",
		nodes: [
			{
				id: "provinces",
				label: "List Provinces",
				endpoint: "/clinic_search/provinces",
				method: "GET",
			},
			{
				id: "search",
				label: "Search",
				endpoint: "/clinic_search/search",
				method: "GET",
			},
			{
				id: "recommend",
				label: "Recommend",
				endpoint: "/clinic_search/recommend",
				method: "POST",
			},
		],
	},
	medical_image: {
		title: "Medical Image Pipeline",
		description:
			"GPT-4o vision analyzes medical images, describes findings and suggests diagnoses.",
		flowId: "medical_image",
		nodes: [
			{
				id: "describe",
				label: "Image Describe",
				endpoint: "/medical_image/describe",
				method: "POST",
			},
		],
	},
	voice_transcribe: {
		title: "Voice Transcribe Pipeline",
		description:
			"Transcribes medical audio via Whisper, then feeds text into EHR Summarize for clinical notes.",
		flowId: "voice_transcribe",
		nodes: [
			{
				id: "transcribe",
				label: "Voice Transcribe",
				endpoint: "/voice_transcribe",
				method: "POST",
			},
			{
				id: "summarize",
				label: "EHR Summarize",
				endpoint: "/ehr_summarize",
				method: "POST",
			},
		],
	},
	federated_learning: {
		title: "Federated Learning Workflow",
		description:
			"Create project → facilities join → training rounds → gradient aggregation → global model.",
		flowId: "federated_learning",
		nodes: [
			{
				id: "create",
				label: "Create Project",
				endpoint: "/federated/projects",
				method: "POST",
			},
			{
				id: "join",
				label: "Join Facility",
				endpoint: "/federated/projects/{id}/join",
				method: "POST",
			},
			{
				id: "round",
				label: "Start Round",
				endpoint: "/federated/projects/{id}/rounds",
				method: "POST",
			},
			{
				id: "update",
				label: "Submit Updates",
				endpoint: "/federated/projects/{id}/updates",
				method: "POST",
			},
			{
				id: "model",
				label: "Get Model",
				endpoint: "/federated/projects/{id}/model",
				method: "GET",
			},
		],
	},
	blood_panel: {
		title: "Blood Panel Analyzer",
		description:
			"Analyzes CBC, BMP, CMP, lipid panels with 40+ marker reference ranges and clinical interpretation.",
		flowId: "blood_panel",
		nodes: [
			{
				id: "analyze",
				label: "Blood Panel",
				endpoint: "/blood_panel/analyze",
				method: "POST",
			},
		],
	},
	ehr_overview: {
		title: "EHR Health Overview Pipeline",
		description:
			"Aggregates patient data from multiple sources into a comprehensive health overview with AI narrative generation.",
		flowId: "ehr_overview",
		nodes: [
			{
				id: "ehr_overview",
				label: "EHR Overview",
				endpoint: "/ehr_overview/{id}",
				method: "GET",
			},
			{
				id: "narrative",
				label: "Clinical Narrative",
				endpoint: "/ehr_overview/{id}/narrative",
				method: "POST",
			},
		],
	},
	a2ui: {
		title: "A2UI: API → UI Generation",
		description:
			"Takes an API workflow, generates A2UI JSON surface, renders natively on any client, embeddable in HIS systems.",
		flowId: "a2ui",
		nodes: [
			{
				id: "workflow",
				label: "Workflow Builder",
				endpoint: "/workflows",
				method: "GET",
			},
			{
				id: "generate",
				label: "A2UI Generate",
				endpoint: "/a2ui/generate",
				method: "POST",
			},
			{
				id: "render",
				label: "A2UI Render",
				endpoint: "/a2ui/render/{id}",
				method: "GET",
			},
		],
	},
};
