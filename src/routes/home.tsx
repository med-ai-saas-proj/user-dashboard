import {
	Book,
	BotIcon,
	ClipboardPlusIcon,
	DnaIcon,
	DropletIcon,
	FileJson2Icon,
	GitBranchPlusIcon,
	HeartPulseIcon,
	ImageIcon,
	KeyRound,
	MicIcon,
	PillIcon,
	SearchIcon,
	StethoscopeIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import DashboardLayout from "@/layouts/dashboard-layout";

const QUICK_LINKS = [
	{
		title: "AI Chat",
		description: "Multi-turn medical AI assistant with tool access",
		url: "/chat",
		icon: BotIcon,
		color: "text-blue-500",
	},
	{
		title: "AI Search",
		description: "Evidence-based medical search with citations",
		url: "/ai-search",
		icon: SearchIcon,
		color: "text-emerald-500",
	},
	{
		title: "EHR Summary",
		description: "Summarize patient records into clinical narratives",
		url: "/ehr-summary",
		icon: ClipboardPlusIcon,
		color: "text-violet-500",
	},
	{
		title: "RX Advisor",
		description: "Drug interaction analysis with OpenFDA data",
		url: "/rx-advisor",
		icon: PillIcon,
		color: "text-rose-500",
	},
	{
		title: "Voice Transcribe",
		description: "Convert speech to text (Vietnamese ASR)",
		url: "/voice-transcribe",
		icon: MicIcon,
		color: "text-amber-500",
	},
	{
		title: "Voice Agent",
		description: "Bidirectional voice conversation with the AI",
		url: "/voice-agent",
		icon: MicIcon,
		color: "text-amber-500",
	},
	{
		title: "Medical Image",
		description: "AI analysis of X-rays, CT, MRI, pathology",
		url: "/medical-image",
		icon: ImageIcon,
		color: "text-cyan-500",
	},
	{
		title: "EHR Converter",
		description: "HL7v2, CDA, BHXH to FHIR R4 conversion",
		url: "/ehr-converter",
		icon: FileJson2Icon,
		color: "text-orange-500",
	},
	{
		title: "Symptom Checker",
		description: "AI differential diagnosis and triage",
		url: "/symptom-checker",
		icon: StethoscopeIcon,
		color: "text-pink-500",
	},
	{
		title: "Blood Panel",
		description: "CBC/BMP/CMP analysis with reference ranges",
		url: "/blood-panel",
		icon: DropletIcon,
		color: "text-red-500",
	},
	{
		title: "Gene Decoder",
		description: "FASTA/FASTQ genomic parsing and annotation",
		url: "/gene-decoder",
		icon: DnaIcon,
		color: "text-indigo-500",
	},
	{
		title: "Health Score",
		description: "Patient health scoring on 20-100 scale",
		url: "/health-score",
		icon: HeartPulseIcon,
		color: "text-green-500",
	},
	{
		title: "API Flow Builder",
		description: "Build and publish workflow pipelines as APIs",
		url: "/api-flow-builder",
		icon: GitBranchPlusIcon,
		color: "text-teal-500",
	},
];

const MANAGEMENT_LINKS = [
	{
		title: "API Keys",
		description: "Manage your API keys and permissions",
		url: "/api-keys",
		icon: KeyRound,
	},
	{
		title: "API Reference",
		description: "Explore all endpoints with OpenAPI docs",
		url: "/api-reference",
		icon: Book,
	},
];

export default function DashboardPage() {
	return (
		<DashboardLayout pageTitle="Home">
			<div className="space-y-8">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">
						Welcome to Venera API Hub
					</h2>
					<p className="text-muted-foreground mt-1">
						AI-powered medical API platform. Try the playground features below
						or manage your API keys.
					</p>
				</div>

				<div>
					<h3 className="text-lg font-semibold mb-3">Quick Start</h3>
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{MANAGEMENT_LINKS.map((link) => (
							<NavLink
								key={link.url}
								to={link.url}
								className="group flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
							>
								<link.icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
								<div>
									<div className="font-medium group-hover:underline">
										{link.title}
									</div>
									<div className="text-sm text-muted-foreground">
										{link.description}
									</div>
								</div>
							</NavLink>
						))}
					</div>
				</div>

				<div>
					<h3 className="text-lg font-semibold mb-3">Playground</h3>
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{QUICK_LINKS.map((link) => (
							<NavLink
								key={link.url}
								to={link.url}
								className="group flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
							>
								<link.icon
									className={`mt-0.5 h-5 w-5 shrink-0 ${link.color}`}
								/>
								<div>
									<div className="font-medium group-hover:underline">
										{link.title}
									</div>
									<div className="text-sm text-muted-foreground">
										{link.description}
									</div>
								</div>
							</NavLink>
						))}
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}
