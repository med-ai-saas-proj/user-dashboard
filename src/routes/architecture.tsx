import DashboardLayout from "@/layouts/dashboard-layout";

const LAYERS = {
	clients: {
		label: "Clients",
		color: "#6366f1",
		items: [
			{ id: "web", label: "Web Dashboard", icon: "🖥️" },
			{ id: "mobile", label: "Mobile App", icon: "📱" },
			{ id: "his", label: "HIS / EMR", icon: "🏥" },
			{ id: "third", label: "3rd-Party API", icon: "🔌" },
		],
	},
	gateway: {
		label: "API Gateway (FastAPI)",
		color: "#0ea5e9",
		items: [
			{ id: "auth", label: "Auth / API Key", icon: "🔑" },
			{ id: "rate", label: "Rate Limiter", icon: "⏱️" },
			{ id: "cors", label: "CORS", icon: "🌐" },
			{ id: "otel", label: "OpenTelemetry", icon: "📊" },
		],
	},
	apps: {
		label: "Mounted Sub-Apps",
		color: "#8b5cf6",
		items: [
			{ id: "service_app", label: "/service → Service API", icon: "⚙️" },
			{ id: "mgmt_app", label: "/management → Management API", icon: "🛠️" },
		],
	},
	services: {
		label: "Service Modules (/service/api/v1)",
		color: "#10b981",
		items: [
			{
				id: "ehr_conv",
				label: "EHR Converter",
				desc: "HL7v2/CDA/v3/BHXH → FHIR R4",
			},
			{
				id: "ehr_sum",
				label: "EHR Summary",
				desc: "AI clinical summarization",
			},
			{ id: "rx", label: "Rx Advisor", desc: "Prescription risk analysis" },
			{ id: "chat", label: "Chat", desc: "Medical chatbot (streaming)" },
			{
				id: "ai_search",
				label: "AI Search",
				desc: "Knowledge retrieval + citations",
			},
			{
				id: "voice",
				label: "Voice Transcribe",
				desc: "Audio → text (Whisper)",
			},
			{ id: "med_img", label: "Medical Image", desc: "GPT-4o vision analysis" },
			{
				id: "health",
				label: "Health Score",
				desc: "Patient health scoring (20-100)",
			},
			{
				id: "data_mask",
				label: "Data Masking",
				desc: "PHI de-identification + cross-facility",
			},
			{
				id: "kb",
				label: "Knowledge Base",
				desc: "RAG: create, ingest, search",
			},
			{
				id: "bhxh",
				label: "BHXH Validator",
				desc: "Vietnam 4210 XML validation",
			},
			{ id: "patient", label: "Patient", desc: "Registry, history, wearable" },
			{ id: "ocr", label: "OCR", desc: "Document text extraction" },
			{
				id: "pub_health",
				label: "Public Health",
				desc: "Population statistics",
			},
		],
	},
	management: {
		label: "Management Modules (/management/api/v1)",
		color: "#f59e0b",
		items: [
			{ id: "api_keys", label: "API Keys", desc: "CRUD + permissions" },
			{ id: "auth_mgmt", label: "Auth", desc: "Keycloak SSO" },
		],
	},
	infra: {
		label: "Infrastructure",
		color: "#ef4444",
		items: [
			{ id: "azure", label: "Azure OpenAI", desc: "GPT-4o / GPT-4o-mini" },
			{ id: "pg", label: "PostgreSQL", desc: "Patient, Facility, API Keys" },
			{ id: "minio", label: "MinIO / S3", desc: "FHIR document storage" },
			{
				id: "ehr_hub",
				label: "EHR Interop Hub",
				desc: "Standalone converter (port 8080)",
			},
			{ id: "otel_col", label: "OTLP Collector", desc: "Traces + metrics" },
			{ id: "keycloak", label: "Keycloak", desc: "Identity provider" },
		],
	},
};

function LayerRow({
	label,
	color,
	items,
	showDesc,
}: {
	label: string;
	color: string;
	items: { id: string; label: string; icon?: string; desc?: string }[];
	showDesc?: boolean;
}) {
	return (
		<div className="flex flex-col gap-1.5">
			<div
				className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded"
				style={{ color }}
			>
				{label}
			</div>
			<div className="flex flex-wrap gap-2">
				{items.map((item) => (
					<div
						key={item.id}
						className="group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all hover:shadow-md cursor-default"
						style={{ borderColor: `${color}40`, background: `${color}08` }}
					>
						{item.icon && <span className="text-sm">{item.icon}</span>}
						<span>{item.label}</span>
						{showDesc && item.desc && (
							<div className="absolute left-0 top-full mt-1 z-20 hidden group-hover:block w-48 p-2 rounded-md border bg-popover text-[10px] text-muted-foreground shadow-lg">
								{item.desc}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}

function Arrow() {
	return (
		<div className="flex justify-center py-1">
			<svg
				width="20"
				height="18"
				className="text-muted-foreground/50"
				aria-hidden="true"
			>
				<path
					d="M10 0 L10 12 M5 8 L10 14 L15 8"
					stroke="currentColor"
					strokeWidth="1.5"
					fill="none"
				/>
			</svg>
		</div>
	);
}

export default function ArchitecturePage() {
	return (
		<DashboardLayout pageTitle="System Architecture">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-auto">
				<div className="max-w-5xl mx-auto w-full p-6 space-y-1">
					<div className="text-center mb-6">
						<h1 className="text-xl font-bold">Venera API Hub — Architecture</h1>
						<p className="text-sm text-muted-foreground mt-1">
							Unified medical API gateway — AI assistants, EHR interoperability,
							patient management, clinical data processing
						</p>
					</div>

					<LayerRow {...LAYERS.clients} />
					<Arrow />
					<LayerRow {...LAYERS.gateway} />
					<Arrow />
					<LayerRow {...LAYERS.apps} />
					<Arrow />
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
						<div className="lg:col-span-2">
							<LayerRow {...LAYERS.services} showDesc />
						</div>
						<div>
							<LayerRow {...LAYERS.management} showDesc />
						</div>
					</div>
					<Arrow />
					<LayerRow {...LAYERS.infra} showDesc />

					{/* Data flow summary */}
					<div className="mt-8 border rounded-lg p-4 bg-muted/20">
						<h3 className="text-sm font-semibold mb-3">Request Flow</h3>
						<div className="text-xs text-muted-foreground space-y-1.5 font-mono">
							<p>
								Client → main_app (port 8100) → global_middleware (requestId,
								logging, OTLP)
							</p>
							<p>
								{" "}
								├─ /service/* → service_app → /api/v1/&lt;module&gt; → API Key
								auth → Service logic
							</p>
							<p>
								{" "}
								└─ /management/* → management_app → /api/v1/api-keys → JWT auth
								→ CRUD
							</p>
							<p>{""}</p>
							<p>Service modules call:</p>
							<p>
								{" "}
								├─ Azure OpenAI (GPT-4o) for AI features (summary, rx, chat,
								search, image, ocr)
							</p>
							<p>
								{" "}
								├─ EHR Interop Hub (port 8080) for format conversion (proxy via
								httpx)
							</p>
							<p> ├─ PostgreSQL for patient/facility/API key persistence</p>
							<p> └─ MinIO for FHIR document storage</p>
						</div>
					</div>

					{/* API endpoint summary */}
					<div className="mt-4 border rounded-lg p-4 bg-muted/20">
						<h3 className="text-sm font-semibold mb-3">
							API Endpoints Summary
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-[11px] font-mono">
							{[
								[
									"POST",
									"/service/api/v1/ehr_converter/convert",
									"Auto-detect → FHIR R4",
								],
								[
									"POST",
									"/service/api/v1/ehr_converter/convert/fhir-to-hl7v2",
									"FHIR → HL7v2",
								],
								[
									"POST",
									"/service/api/v1/ehr_converter/validate",
									"Validate FHIR Bundle",
								],
								[
									"POST",
									"/service/api/v1/ehr_converter/convert/document",
									"Document → FHIR (OCR)",
								],
								[
									"POST",
									"/service/api/v1/ehr_converter/convert/batch",
									"Batch conversion",
								],
								[
									"POST",
									"/service/api/v1/ehr_summarize",
									"EHR clinical summary",
								],
								[
									"POST",
									"/service/api/v1/rx_advisor",
									"Prescription risk analysis",
								],
								["POST", "/service/api/v1/chat", "AI chat (SSE stream)"],
								["POST", "/service/api/v1/ai_search", "AI search (SSE stream)"],
								[
									"POST",
									"/service/api/v1/voice_transcribe",
									"Audio transcription",
								],
								[
									"POST",
									"/service/api/v1/medical_image/describe",
									"Medical image analysis",
								],
								[
									"POST",
									"/service/api/v1/health_score/evaluate",
									"Health score",
								],
								[
									"POST",
									"/service/api/v1/data_masking/mask",
									"De-identify FHIR",
								],
								[
									"POST",
									"/service/api/v1/data_masking/facility/register",
									"Register facility DB",
								],
								[
									"POST",
									"/service/api/v1/data_masking/facility/search",
									"Cross-facility search",
								],
								[
									"POST",
									"/service/api/v1/bhxh_validator/validate",
									"BHXH 4210 validate",
								],
								[
									"*",
									"/service/api/v1/knowledge_base/**",
									"Knowledge base CRUD + search",
								],
								[
									"*",
									"/service/api/v1/patient/**",
									"Patient CRUD, history, wearable",
								],
								[
									"POST",
									"/service/api/v1/public_health/statistics",
									"Population statistics",
								],
								["GET", "/management/api/v1/api-keys", "List API keys"],
								["POST", "/management/api/v1/api-keys", "Create API key"],
							].map(([method, path, desc]) => (
								<div key={path} className="flex gap-2 py-0.5">
									<span
										className={`w-9 shrink-0 font-bold ${method === "POST" ? "text-green-600 dark:text-green-400" : method === "GET" ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"}`}
									>
										{method}
									</span>
									<span className="text-foreground truncate">{path}</span>
									<span className="text-muted-foreground ml-auto shrink-0 hidden lg:inline">
										{desc}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}
