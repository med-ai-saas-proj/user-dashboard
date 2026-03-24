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

/* ─── Architecture layers with ALL current services ─── */
interface LayerItem {
	id: string;
	label: string;
	icon?: LucideIcon;
	desc?: string;
}

const LAYERS: Record<
	string,
	{ label: string; color: string; items: LayerItem[]; columns?: number }
> = {
	clients: {
		label: "Clients",
		color: "#6366f1",
		items: [
			{
				id: "web",
				label: "Web Dashboard",
				icon: MonitorIcon,
				desc: "React + Vite SPA on :3000",
			},
			{
				id: "mobile",
				label: "Mobile App",
				icon: SmartphoneIcon,
				desc: "React Native / Flutter",
			},
			{
				id: "his",
				label: "HIS / EMR",
				icon: Building2Icon,
				desc: "Hospital Information System integration via SDK",
			},
			{
				id: "third",
				label: "3rd-Party API",
				icon: PlugIcon,
				desc: "Python/TypeScript/C# SDK consumers",
			},
		],
	},
	gateway: {
		label: "API Gateway (FastAPI :8000)",
		color: "#0ea5e9",
		items: [
			{
				id: "auth",
				label: "Auth / API Key",
				icon: KeyRoundIcon,
				desc: "API key validation + Keycloak JWT",
			},
			{
				id: "rate",
				label: "Rate Limiter",
				icon: TimerIcon,
				desc: "Per-key request throttling",
			},
			{
				id: "cors",
				label: "CORS",
				icon: GlobeIcon,
				desc: "Cross-origin resource sharing",
			},
			{
				id: "otel",
				label: "OpenTelemetry",
				icon: BarChart3Icon,
				desc: "Distributed tracing + metrics",
			},
		],
	},
	apps: {
		label: "Mounted Sub-Apps",
		color: "#8b5cf6",
		items: [
			{
				id: "service_app",
				label: "/service → Service API (93 endpoints)",
				icon: CogIcon,
			},
			{
				id: "mgmt_app",
				label: "/management → Management API (13 endpoints)",
				icon: WrenchIcon,
			},
		],
	},
	data_processing: {
		label: "Data Processing Layer",
		color: "#0d9488",
		columns: 4,
		items: [
			{
				id: "ehr_conv",
				label: "EHR Converter",
				desc: "HL7v2/CDA/v3/BHXH → FHIR R4 (8 endpoints)",
			},
			{
				id: "doc_fhir",
				label: "Document → FHIR",
				desc: "Images/PDFs → FHIR via Vision LLM",
			},
			{
				id: "bhxh",
				label: "BHXH Validator",
				desc: "Vietnam 4210 XML validation",
			},
			{
				id: "data_mask",
				label: "Data Masking",
				desc: "PHI de-identification + facility registry",
			},
			{
				id: "kb",
				label: "Knowledge Base",
				desc: "RAG: create, ingest, search",
			},
			{
				id: "gene",
				label: "Gene Decoder",
				desc: "DNA/RNA sequence analysis + variant annotation",
			},
			{
				id: "cross",
				label: "Cross-Provider Search",
				desc: "Federated search across HIS systems",
			},
			{ id: "ocr", label: "OCR", desc: "Document text extraction" },
		],
	},
	operation: {
		label: "Operation Layer (AI-Powered)",
		color: "#10b981",
		columns: 4,
		items: [
			{
				id: "ehr_sum",
				label: "EHR Summarize",
				desc: "AI clinical summarization (streaming)",
			},
			{
				id: "rx",
				label: "Rx Advisor",
				desc: "Prescription risk analysis (streaming)",
			},
			{ id: "chat", label: "Chat", desc: "Medical chatbot with memory (SSE)" },
			{
				id: "ai_search",
				label: "AI Search",
				desc: "Deep research + citations (SSE)",
			},
			{
				id: "voice",
				label: "Voice Transcribe",
				desc: "Audio → text (Whisper)",
			},
			{
				id: "med_img",
				label: "Medical Image",
				desc: "Vision LLM image analysis",
			},
			{
				id: "symptom",
				label: "Symptom Checker",
				desc: "AI differential diagnosis",
			},
			{
				id: "blood",
				label: "Blood Panel",
				desc: "CBC/BMP/CMP analysis + health score",
			},
			{
				id: "clinic",
				label: "Clinic Search",
				desc: "Traditional medicine doctor/clinic finder",
			},
		],
	},
	data_management: {
		label: "Data Management Layer (Dashboards)",
		color: "#f59e0b",
		columns: 4,
		items: [
			{
				id: "patient",
				label: "Patient",
				desc: "Registry, CRUD, match, history, wearable",
			},
			{
				id: "digital_twin",
				label: "Digital Twin",
				desc: "Unified patient model + AI prediction (11 endpoints)",
			},
			{
				id: "pub_health",
				label: "Public Health",
				desc: "Population-level epidemiology dashboard",
			},
			{
				id: "health_score",
				label: "Health Score",
				desc: "Patient health scoring 20-100",
			},
			{
				id: "memory",
				label: "Memory",
				desc: "User memory + conversation history",
			},
			{
				id: "facility",
				label: "Facility",
				desc: "Healthcare facility registry",
			},
		],
	},
	development: {
		label: "Development Layer (Builders)",
		color: "#a855f7",
		items: [
			{
				id: "workflow",
				label: "Workflow Builder",
				desc: "Visual API flow composition (6 endpoints)",
			},
			{
				id: "a2ui",
				label: "A2UI",
				desc: "Agent-to-User Interface generation (5 endpoints)",
			},
			{
				id: "federated",
				label: "Federated Learning",
				desc: "Cross-hospital model training",
			},
			{
				id: "playground",
				label: "Playground",
				desc: "Seed data + status monitoring",
			},
		],
	},
	management_api: {
		label: "Management API (/management/api/v1)",
		color: "#f97316",
		items: [
			{ id: "api_keys", label: "API Keys", desc: "CRUD + permissions" },
			{ id: "teams", label: "Teams", desc: "Team management + member roles" },
			{
				id: "local_models",
				label: "Local Models",
				desc: "llama.cpp deploy, download, start/stop",
			},
		],
	},
	infra: {
		label: "Infrastructure",
		color: "#ef4444",
		items: [
			{
				id: "llm",
				label: "LLM Provider",
				desc: "OpenAI / Anthropic / Groq / Self-Hosted / Cluster",
			},
			{
				id: "pg",
				label: "PostgreSQL",
				desc: "Patient, Facility, API Keys, Teams",
			},
			{
				id: "dynamo",
				label: "DynamoDB",
				desc: "Knowledge Base, Memory, Conversations",
			},
			{ id: "minio", label: "MinIO / S3", desc: "FHIR document storage" },
			{
				id: "ehr_hub",
				label: "EHR Interop Hub",
				desc: "Standalone FHIR converter (:8080)",
			},
			{ id: "keycloak", label: "Keycloak", desc: "Identity provider (SSO)" },
		],
	},
};

/* ─── Reusable Components ─── */
function LayerRow({
	label,
	color,
	items,
	showDesc,
	columns,
}: {
	label: string;
	color: string;
	items: LayerItem[];
	showDesc?: boolean;
	columns?: number;
}) {
	return (
		<div
			className="rounded-xl border p-3 space-y-2"
			style={{ borderColor: `${color}30`, background: `${color}04` }}
		>
			<div
				className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-2"
				style={{ color }}
			>
				<span
					className="w-2 h-2 rounded-full"
					style={{ backgroundColor: color }}
				/>
				{label}
				<span className="text-[10px] font-normal text-muted-foreground ml-auto">
					{items.length} modules
				</span>
			</div>
			<div
				className="grid gap-1.5"
				style={{
					gridTemplateColumns: `repeat(${columns || Math.min(items.length, 4)}, minmax(0, 1fr))`,
				}}
			>
				{items.map((item) => {
					const IconComp = item.icon;
					return (
						<div
							key={item.id}
							className="group relative flex items-start gap-1.5 px-2 py-1.5 rounded-lg border text-[11px] transition-all hover:shadow-sm cursor-default"
							style={{ borderColor: `${color}25`, background: `${color}06` }}
						>
							{IconComp && (
								<IconComp
									className="size-3.5 shrink-0 mt-0.5"
									style={{ color }}
								/>
							)}
							<div className="min-w-0">
								<span className="font-semibold leading-tight block">
									{item.label}
								</span>
								{showDesc && item.desc && (
									<span className="text-[9px] text-muted-foreground leading-tight block mt-0.5">
										{item.desc}
									</span>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function ConnectorArrow({ label }: { label?: string }) {
	return (
		<div className="flex items-center justify-center py-0.5 gap-2">
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
			{label && (
				<span className="text-[9px] text-muted-foreground">{label}</span>
			)}
		</div>
	);
}

/* ─── Mermaid Diagrams ─── */
const MERMAID_DIAGRAM = `graph TD
    subgraph Clients["Clients"]
        WEB[Web Dashboard :3000]
        MOB[Mobile App]
        HIS[HIS / EMR]
        SDK[Python/TS/C# SDK]
    end

    subgraph Gateway["API Gateway — FastAPI :8000"]
        AUTH[Auth / API Key]
        RATE[Rate Limiter]
        CORS_MW[CORS]
        OTEL[OpenTelemetry]
    end

    subgraph Apps["Mounted Sub-Apps"]
        SVC_APP["/service — 93 endpoints"]
        MGMT_APP["/management — 13 endpoints"]
    end

    subgraph DataProc["Data Processing"]
        EHR_CONV[EHR Converter]
        DOC_FHIR[Document→FHIR]
        BHXH[BHXH Validator]
        MASK[Data Masking]
        KB[Knowledge Base]
        GENE[Gene Decoder]
        CROSS[Cross-Provider Search]
        OCR_SVC[OCR]
    end

    subgraph Operation["Operation — AI-Powered"]
        EHR_SUM[EHR Summarize]
        RX[Rx Advisor]
        CHAT_SVC[Chat + Memory]
        AI_SEARCH[AI Search]
        VOICE[Voice Transcribe]
        MED_IMG[Medical Image]
        SYMPTOM[Symptom Checker]
        BLOOD[Blood Panel]
        CLINIC[Clinic Search]
    end

    subgraph DataMgmt["Data Management — Dashboards"]
        PAT[Patient Registry]
        TWIN[Digital Twin]
        PUB[Public Health]
        HSCORE[Health Score]
        MEM[Memory]
    end

    subgraph Dev["Development — Builders"]
        WF[Workflow Builder]
        A2UI[A2UI Generator]
        FED[Federated Learning]
    end

    subgraph Mgmt["Management API"]
        API_KEYS[API Keys]
        TEAMS[Teams]
        LOCAL[Local Models]
    end

    subgraph Infra["Infrastructure"]
        LLM[LLM Provider<br/>OpenAI/Anthropic/Cluster]
        PG[PostgreSQL]
        DYNAMO[DynamoDB]
        MINIO[MinIO / S3]
        EHR_HUB[EHR Interop Hub :8080]
        KC[Keycloak]
    end

    WEB & MOB & HIS & SDK --> Gateway
    Gateway --> Apps
    SVC_APP --> DataProc & Operation & DataMgmt & Dev
    MGMT_APP --> Mgmt

    EHR_CONV --> EHR_HUB
    DOC_FHIR & MED_IMG & OCR_SVC --> LLM
    EHR_SUM & RX & CHAT_SVC & AI_SEARCH & SYMPTOM & BLOOD & GENE --> LLM
    MASK & PAT & TWIN --> PG
    KB & MEM --> DYNAMO
    EHR_CONV --> MINIO
    AUTH --> KC

    style Clients fill:#eef2ff,stroke:#6366f1,color:#312e81
    style Gateway fill:#f0f9ff,stroke:#0ea5e9,color:#0c4a6e
    style Apps fill:#f5f3ff,stroke:#8b5cf6,color:#4c1d95
    style DataProc fill:#f0fdfa,stroke:#0d9488,color:#134e4a
    style Operation fill:#ecfdf5,stroke:#10b981,color:#064e3b
    style DataMgmt fill:#fffbeb,stroke:#f59e0b,color:#78350f
    style Dev fill:#faf5ff,stroke:#a855f7,color:#581c87
    style Mgmt fill:#fff7ed,stroke:#f97316,color:#7c2d12
    style Infra fill:#fef2f2,stroke:#ef4444,color:#7f1d1d
`;

const MERMAID_SEQUENCE = `sequenceDiagram
    participant C as Client
    participant GW as API Gateway :8000
    participant MW as Middleware
    participant SVC as /service app
    participant MOD as Service Module
    participant LLM as LLM Provider
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
    else AI Feature (summary, chat, rx, search, symptom)
        SVC->>MOD: ehr_summarize / rx_advisor / chat
        MOD->>LLM: LLM prompt (OpenAI / Cluster / Local)
        LLM-->>MOD: AI response
        MOD-->>C: JSON / SSE stream
    else Dashboard (Digital Twin, Public Health)
        SVC->>MOD: digital_twin / public_health
        MOD->>DB: Aggregate patient data
        DB-->>MOD: Result set
        MOD-->>C: JSON dashboard response
    else Data Persistence
        SVC->>MOD: patient / knowledge_base / memory
        MOD->>DB: SQL / DynamoDB query
        DB-->>MOD: Result set
        MOD-->>C: JSON response
    end
`;

/* ─── Mermaid Renderer ─── */
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
					className="p-1.5 rounded-md bg-background/80 border shadow-sm hover:bg-muted"
					title="Zoom in"
				>
					<ZoomInIcon className="size-3.5" />
				</button>
				<button
					type="button"
					onClick={() => zoom(-0.2)}
					className="p-1.5 rounded-md bg-background/80 border shadow-sm hover:bg-muted"
					title="Zoom out"
				>
					<ZoomOutIcon className="size-3.5" />
				</button>
				<button
					type="button"
					onClick={() => setScale(1)}
					className="p-1.5 rounded-md bg-background/80 border shadow-sm hover:bg-muted"
					title="Reset"
				>
					<MaximizeIcon className="size-3.5" />
				</button>
				<span className="flex items-center px-1.5 text-[10px] text-muted-foreground font-mono bg-background/80 border rounded-md">
					{Math.round(scale * 100)}%
				</span>
			</div>
			<div className="overflow-auto p-4">
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
		<div className="space-y-3">
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
			<div className="border rounded-xl bg-muted/10 overflow-auto min-h-[300px]">
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

/* ─── Stats Summary ─── */
function StatPill({
	label,
	value,
	color,
}: {
	label: string;
	value: string;
	color: string;
}) {
	return (
		<div
			className="flex items-center gap-2 rounded-lg border px-3 py-2"
			style={{ borderColor: `${color}30` }}
		>
			<span
				className="w-2 h-2 rounded-full"
				style={{ backgroundColor: color }}
			/>
			<span className="text-[11px] text-muted-foreground">{label}</span>
			<span className="text-sm font-bold font-mono ml-auto">{value}</span>
		</div>
	);
}

/* ─── Main Page ─── */
export default function ArchitecturePage() {
	const [view, setView] = useState<"visual" | "mermaid">("visual");

	return (
		<DashboardLayout pageTitle="System Architecture">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-auto">
				<div className="max-w-6xl mx-auto w-full p-6 space-y-3">
					{/* Header */}
					<div className="text-center mb-4">
						<h1 className="text-xl font-bold">
							Venera API Hub — System Architecture
						</h1>
						<p className="text-sm text-muted-foreground mt-1">
							Unified medical API gateway — 106 endpoints across 25 service
							modules
						</p>
						<div className="flex items-center justify-center gap-1 mt-3">
							<button
								type="button"
								onClick={() => setView("visual")}
								className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-l-lg border transition-colors ${view === "visual" ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted/50"}`}
							>
								<LayoutGridIcon className="size-3.5" />
								Visual
							</button>
							<button
								type="button"
								onClick={() => setView("mermaid")}
								className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-r-lg border transition-colors ${view === "mermaid" ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted/50"}`}
							>
								<CodeIcon className="size-3.5" />
								Mermaid
							</button>
						</div>
					</div>

					{/* Stats row */}
					<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
						<StatPill label="Service Endpoints" value="93" color="#10b981" />
						<StatPill label="Management Endpoints" value="13" color="#f97316" />
						<StatPill label="Service Modules" value="25" color="#6366f1" />
						<StatPill label="AI-Powered APIs" value="9" color="#a855f7" />
						<StatPill label="Data Layers" value="4" color="#0d9488" />
						<StatPill label="LLM Providers" value="7" color="#ef4444" />
					</div>

					{view === "mermaid" ? (
						<MermaidView />
					) : (
						<div className="space-y-1">
							<LayerRow {...LAYERS.clients} showDesc />
							<ConnectorArrow label="HTTPS" />
							<LayerRow {...LAYERS.gateway} showDesc />
							<ConnectorArrow label="Route" />
							<LayerRow {...LAYERS.apps} />
							<ConnectorArrow />

							{/* Service layers — side by side where possible */}
							<div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
								<LayerRow {...LAYERS.data_processing} showDesc />
								<LayerRow {...LAYERS.operation} showDesc />
							</div>
							<div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
								<LayerRow {...LAYERS.data_management} showDesc />
								<LayerRow {...LAYERS.development} showDesc />
							</div>

							<ConnectorArrow />
							<LayerRow {...LAYERS.management_api} showDesc />
							<ConnectorArrow label="Persistence + LLM" />
							<LayerRow {...LAYERS.infra} showDesc />

							{/* Request flow summary */}
							<div className="mt-4 rounded-xl border p-4 bg-muted/10 space-y-3">
								<h3 className="text-sm font-bold">Request Flow</h3>
								<div className="text-[11px] text-muted-foreground space-y-1 font-mono leading-relaxed">
									<p>
										Client → API Gateway (:8000) → Middleware (requestId, OTLP,
										auth)
									</p>
									<p>
										{" "}
										├─ /service/* → service_app → /api/v1/&lt;module&gt; → API
										Key auth → Service logic
									</p>
									<p>
										{" "}
										└─ /management/* → management_app → /api/v1/&lt;resource&gt;
										→ JWT auth → CRUD
									</p>
									<p className="mt-2">Service modules call:</p>
									<p>
										{" "}
										├─ LLM Provider (OpenAI/Anthropic/Groq/Cluster/Local) for AI
										features
									</p>
									<p>
										{" "}
										├─ EHR Interop Hub (:8080) for format conversion (proxy via
										httpx)
									</p>
									<p>
										{" "}
										├─ PostgreSQL for patient/facility/API key/team persistence
									</p>
									<p> ├─ DynamoDB for knowledge base, memory, conversations</p>
									<p> └─ MinIO/S3 for FHIR document storage</p>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</DashboardLayout>
	);
}
