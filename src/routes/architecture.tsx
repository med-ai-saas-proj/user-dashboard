import { useState, useEffect, useRef, useCallback } from "react";
import mermaid from "mermaid";
import { useTheme } from "next-themes";
import DashboardLayout from "@/layouts/dashboard-layout";
import {
	LayoutGridIcon,
	CodeIcon,
	CopyIcon,
	CheckIcon,
	MonitorIcon,
	SmartphoneIcon,
	Building2Icon,
	PlugIcon,
	KeyRoundIcon,
	TimerIcon,
	GlobeIcon,
	BarChart3Icon,
	CogIcon,
	WrenchIcon,
	FileCodeIcon,
	ZoomInIcon,
	ZoomOutIcon,
	MaximizeIcon,
	type LucideIcon,
} from "lucide-react";

interface LayerItem {
	id: string;
	label: string;
	icon?: LucideIcon;
	desc?: string;
}

const LAYERS: Record<
	string,
	{ label: string; color: string; items: LayerItem[] }
> = {
	clients: {
		label: "Clients",
		color: "#6366f1",
		items: [
			{ id: "web", label: "Web Dashboard", icon: MonitorIcon },
			{ id: "mobile", label: "Mobile App", icon: SmartphoneIcon },
			{ id: "his", label: "HIS / EMR", icon: Building2Icon },
			{ id: "third", label: "3rd-Party API", icon: PlugIcon },
		],
	},
	gateway: {
		label: "API Gateway (FastAPI)",
		color: "#0ea5e9",
		items: [
			{ id: "auth", label: "Auth / API Key", icon: KeyRoundIcon },
			{ id: "rate", label: "Rate Limiter", icon: TimerIcon },
			{ id: "cors", label: "CORS", icon: GlobeIcon },
			{ id: "otel", label: "OpenTelemetry", icon: BarChart3Icon },
		],
	},
	apps: {
		label: "Mounted Sub-Apps",
		color: "#8b5cf6",
		items: [
			{ id: "service_app", label: "/service → Service API", icon: CogIcon },
			{
				id: "mgmt_app",
				label: "/management → Management API",
				icon: WrenchIcon,
			},
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
	items: LayerItem[];
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
				{items.map((item) => {
					const IconComp = item.icon;
					return (
						<div
							key={item.id}
							className="group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all hover:shadow-md cursor-default"
							style={{ borderColor: `${color}40`, background: `${color}08` }}
						>
							{IconComp && <IconComp className="size-4" style={{ color }} />}
							<span>{item.label}</span>
							{showDesc && item.desc && (
								<div className="absolute left-0 top-full mt-1 z-20 hidden group-hover:block w-48 p-2 rounded-md border bg-popover text-[11px] text-muted-foreground shadow-lg">
									{item.desc}
								</div>
							)}
						</div>
					);
				})}
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

const MERMAID_DIAGRAM = `graph TD
    subgraph Clients
        WEB[Web Dashboard]
        MOB[Mobile App]
        HIS[HIS / EMR]
        EXT[3rd-Party API]
    end

    subgraph Gateway["API Gateway — FastAPI :8100"]
        AUTH[Auth / API Key]
        RATE[Rate Limiter]
        CORS_MW[CORS]
        OTEL[OpenTelemetry]
    end

    subgraph Apps["Mounted Sub-Apps"]
        SVC_APP["/service → Service API"]
        MGMT_APP["/management → Management API"]
    end

    subgraph Services["Service Modules — /service/api/v1"]
        EHR_CONV[EHR Converter<br/>HL7v2/CDA/v3/BHXH → FHIR R4]
        EHR_SUM[EHR Summary<br/>AI clinical summarization]
        RX[Rx Advisor<br/>Prescription risk analysis]
        CHAT_SVC[Chat<br/>Medical chatbot SSE]
        AI_SEARCH[AI Search<br/>Knowledge retrieval + citations]
        VOICE[Voice Transcribe<br/>Audio → text Whisper]
        MED_IMG[Medical Image<br/>GPT-4o vision analysis]
        HEALTH[Health Score<br/>Patient scoring 20-100]
        MASK[Data Masking<br/>PHI de-identification]
        KB[Knowledge Base<br/>RAG: create, ingest, search]
        BHXH[BHXH Validator<br/>Vietnam 4210 XML]
        PAT[Patient<br/>Registry, history, wearable]
        OCR_SVC[OCR<br/>Document text extraction]
        PUB[Public Health<br/>Population statistics]
    end

    subgraph Management["Management Modules — /management/api/v1"]
        API_KEYS[API Keys — CRUD + permissions]
        AUTH_MGMT[Auth — Keycloak SSO]
    end

    subgraph Infra["Infrastructure"]
        AZURE[Azure OpenAI<br/>GPT-4o / GPT-4o-mini]
        PG[PostgreSQL<br/>Patient, Facility, API Keys]
        MINIO[MinIO / S3<br/>FHIR document storage]
        EHR_HUB[EHR Interop Hub :8080<br/>Standalone converter]
        OTLP[OTLP Collector<br/>Traces + metrics]
        KC[Keycloak<br/>Identity provider]
    end

    WEB & MOB & HIS & EXT --> Gateway
    Gateway --> Apps
    SVC_APP --> Services
    MGMT_APP --> Management

    EHR_CONV --> EHR_HUB
    EHR_SUM & RX & CHAT_SVC & AI_SEARCH & MED_IMG & OCR_SVC --> AZURE
    MASK & PAT & KB --> PG
    EHR_CONV --> MINIO
    AUTH --> KC
    OTEL --> OTLP

    style Clients fill:#eef2ff,stroke:#6366f1,color:#312e81
    style Gateway fill:#f0f9ff,stroke:#0ea5e9,color:#0c4a6e
    style Apps fill:#f5f3ff,stroke:#8b5cf6,color:#4c1d95
    style Services fill:#ecfdf5,stroke:#10b981,color:#064e3b
    style Management fill:#fffbeb,stroke:#f59e0b,color:#78350f
    style Infra fill:#fef2f2,stroke:#ef4444,color:#7f1d1d
`;

const MERMAID_SEQUENCE = `sequenceDiagram
    participant C as Client
    participant GW as API Gateway :8100
    participant MW as Middleware
    participant SVC as /service app
    participant MOD as Service Module
    participant LLM as Azure OpenAI
    participant DB as PostgreSQL
    participant HUB as EHR Hub :8080

    C->>GW: HTTP Request
    GW->>MW: requestId, logging, OTLP
    MW->>MW: API Key auth / JWT auth
    MW->>SVC: Route to /service/*

    alt EHR Conversion
        SVC->>MOD: ehr_converter/convert
        MOD->>HUB: Proxy via httpx
        HUB-->>MOD: FHIR R4 Bundle
        MOD-->>C: JSON response
    else AI Feature (summary, chat, rx, search)
        SVC->>MOD: ehr_summarize / rx_advisor / chat
        MOD->>LLM: GPT-4o prompt
        LLM-->>MOD: AI response
        MOD-->>C: JSON / SSE stream
    else Data Persistence
        SVC->>MOD: patient / knowledge_base
        MOD->>DB: SQL query
        DB-->>MOD: Result set
        MOD-->>C: JSON response
    end
`;

function initMermaid(isDark: boolean) {
	mermaid.initialize({
		startOnLoad: false,
		theme: isDark ? "dark" : "default",
		themeVariables: isDark
			? {
					darkMode: true,
					background: "#1a1a2e",
					primaryColor: "#6366f1",
					primaryTextColor: "#e2e8f0",
					primaryBorderColor: "#4f46e5",
					secondaryColor: "#0ea5e9",
					tertiaryColor: "#1e293b",
					lineColor: "#94a3b8",
					textColor: "#e2e8f0",
					mainBkg: "#1e293b",
					nodeBorder: "#475569",
					clusterBkg: "#0f172a",
					clusterBorder: "#334155",
					titleColor: "#e2e8f0",
					edgeLabelBackground: "#1e293b",
					nodeTextColor: "#e2e8f0",
				}
			: {
					primaryColor: "#6366f1",
					primaryTextColor: "#1e293b",
					primaryBorderColor: "#4f46e5",
					secondaryColor: "#0ea5e9",
					lineColor: "#64748b",
					textColor: "#1e293b",
				},
		flowchart: { curve: "basis", padding: 12 },
		sequence: { mirrorActors: false },
	});
}

function MermaidRenderer({ diagram, id }: { diagram: string; id: string }) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [error, setError] = useState<string | null>(null);
	const [scale, setScale] = useState(1);
	const { resolvedTheme } = useTheme();

	useEffect(() => {
		let cancelled = false;
		const render = async () => {
			if (!containerRef.current) return;
			try {
				initMermaid(resolvedTheme === "dark");
				const { svg } = await mermaid.render(
					`mermaid-${id}-${Date.now()}`,
					diagram
				);
				if (!cancelled && containerRef.current) {
					containerRef.current.innerHTML = svg;
					setError(null);
				}
			} catch (e) {
				if (!cancelled) setError(e instanceof Error ? e.message : String(e));
			}
		};
		render();
		return () => {
			cancelled = true;
		};
	}, [diagram, id, resolvedTheme]);

	const zoom = useCallback((delta: number) => {
		setScale((s) => Math.min(3, Math.max(0.3, s + delta)));
	}, []);

	const resetZoom = useCallback(() => setScale(1), []);

	if (error) {
		return (
			<div className="p-4 text-sm text-red-400 border border-red-500/30 rounded-lg bg-red-500/5">
				Failed to render diagram: {error}
			</div>
		);
	}

	return (
		<div className="relative group">
			<div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
				<button
					type="button"
					onClick={() => zoom(0.2)}
					className="p-1.5 rounded-md bg-background/80 border shadow-sm hover:bg-muted transition-colors"
					title="Zoom in"
				>
					<ZoomInIcon className="size-3.5" />
				</button>
				<button
					type="button"
					onClick={() => zoom(-0.2)}
					className="p-1.5 rounded-md bg-background/80 border shadow-sm hover:bg-muted transition-colors"
					title="Zoom out"
				>
					<ZoomOutIcon className="size-3.5" />
				</button>
				<button
					type="button"
					onClick={resetZoom}
					className="p-1.5 rounded-md bg-background/80 border shadow-sm hover:bg-muted transition-colors"
					title="Reset zoom"
				>
					<MaximizeIcon className="size-3.5" />
				</button>
				<span className="flex items-center px-1.5 text-[10px] text-muted-foreground font-mono bg-background/80 border rounded-md">
					{Math.round(scale * 100)}%
				</span>
			</div>
			<div className="overflow-auto p-4 cursor-grab active:cursor-grabbing">
				<div
					ref={containerRef}
					className="flex justify-center [&_svg]:max-w-none transition-transform origin-top-left"
					style={{ transform: `scale(${scale})` }}
				/>
			</div>
		</div>
	);
}

function MermaidView() {
	const [activeTab, setActiveTab] = useState<"architecture" | "sequence">(
		"architecture"
	);
	const [showSource, setShowSource] = useState(false);
	const [copied, setCopied] = useState(false);

	const currentDiagram =
		activeTab === "architecture" ? MERMAID_DIAGRAM : MERMAID_SEQUENCE;

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(currentDiagram);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}, [currentDiagram]);

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={() => setActiveTab("architecture")}
					className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${activeTab === "architecture" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 hover:bg-muted"}`}
				>
					Architecture
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("sequence")}
					className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${activeTab === "sequence" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 hover:bg-muted"}`}
				>
					Request Flow
				</button>
				<div className="ml-auto flex items-center gap-2">
					<button
						type="button"
						onClick={() => setShowSource((p) => !p)}
						className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border transition-colors ${showSource ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted/50"}`}
					>
						<FileCodeIcon className="size-3.5" />
						Source
					</button>
					<button
						type="button"
						onClick={handleCopy}
						className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border hover:bg-muted/50 transition-colors"
					>
						{copied ? (
							<CheckIcon className="size-3.5" />
						) : (
							<CopyIcon className="size-3.5" />
						)}
						{copied ? "Copied" : "Copy"}
					</button>
				</div>
			</div>

			<div className="border rounded-lg bg-muted/10 overflow-auto min-h-[300px]">
				{showSource ? (
					<pre className="p-4 text-xs font-mono leading-relaxed whitespace-pre overflow-x-auto text-foreground/90">
						{currentDiagram}
					</pre>
				) : (
					<MermaidRenderer diagram={currentDiagram} id={activeTab} />
				)}
			</div>
		</div>
	);
}

export default function ArchitecturePage() {
	const [view, setView] = useState<"visual" | "mermaid">("visual");

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
						<div className="flex items-center justify-center gap-1 mt-4">
							<button
								type="button"
								onClick={() => setView("visual")}
								className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-l-md border transition-colors ${view === "visual" ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted/50"}`}
							>
								<LayoutGridIcon className="size-3.5" />
								Visual
							</button>
							<button
								type="button"
								onClick={() => setView("mermaid")}
								className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-r-md border transition-colors ${view === "mermaid" ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted/50"}`}
							>
								<CodeIcon className="size-3.5" />
								Mermaid
							</button>
						</div>
					</div>

					{view === "mermaid" ? (
						<MermaidView />
					) : (
						<>
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
										Client → main_app (port 8100) → global_middleware
										(requestId, logging, OTLP)
									</p>
									<p>
										{" "}
										├─ /service/* → service_app → /api/v1/&lt;module&gt; → API
										Key auth → Service logic
									</p>
									<p>
										{" "}
										└─ /management/* → management_app → /api/v1/api-keys → JWT
										auth → CRUD
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
										├─ EHR Interop Hub (port 8080) for format conversion (proxy
										via httpx)
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
										[
											"POST",
											"/service/api/v1/ai_search",
											"AI search (SSE stream)",
										],
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
						</>
					)}
				</div>
			</div>
		</DashboardLayout>
	);
}
