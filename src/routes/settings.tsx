import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
	AlertTriangleIcon,
	CheckIcon,
	CpuIcon,
	Trash2Icon,
	UserIcon,
	UsersIcon,
	MailIcon,
	BarChart3Icon,
	ServerIcon,
	GlobeIcon,
} from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Separator } from "@/components/shadcn/separator";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useAuthStore } from "@/features/auth/store/auth-store";

type ApiGroup =
	| "text_reasoning"
	| "text_fast"
	| "vision_ocr"
	| "embedding"
	| "speech";

interface ApiGroupConfig {
	group: ApiGroup;
	label: string;
	description: string;
	apis: string[];
}

const API_GROUPS: ApiGroupConfig[] = [
	{
		group: "text_reasoning",
		label: "Text Reasoning (Complex)",
		description:
			"Complex multi-step reasoning, tool use, and structured generation",
		apis: ["Chat", "RX Advisor", "AI Search", "EHR Summarize", "Health Score"],
	},
	{
		group: "text_fast",
		label: "Text Processing (Fast)",
		description: "Lightweight extraction, classification, and formatting tasks",
		apis: ["Data Masking", "BHXH Validator", "Knowledge Base", "Public Health"],
	},
	{
		group: "vision_ocr",
		label: "Vision / OCR",
		description: "Image understanding, document OCR, and visual analysis",
		apis: ["Medical Image", "Document→FHIR", "OCR"],
	},
	{
		group: "embedding",
		label: "Embedding / Retrieval",
		description: "Vector embeddings for knowledge base and semantic search",
		apis: ["Knowledge Base Indexing", "AI Search Retrieval"],
	},
	{
		group: "speech",
		label: "Speech / Audio",
		description: "Audio transcription and voice input processing",
		apis: ["Voice Transcribe"],
	},
];

const PROVIDER_PRESETS = [
	{
		provider: "OpenAI",
		prefix: "openai:",
		models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
	},
	{
		provider: "Anthropic",
		prefix: "anthropic:",
		models: ["claude-sonnet-4-20250514", "claude-haiku-4-20250514"],
	},
	{
		provider: "Groq",
		prefix: "groq:",
		models: [
			"llama-3.3-70b-versatile",
			"llama-3.1-8b-instant",
			"llama-3.2-90b-vision-preview",
		],
	},
	{ provider: "Azure OpenAI", prefix: "", models: ["gpt-4o", "gpt-4o-mini"] },
	{
		provider: "Self-Hosted (vLLM / Ollama)",
		prefix: "openai:",
		models: ["meta-llama/Llama-3.1-70B-Instruct", "llama3.1:70b"],
	},
	{
		provider: "WebGPU (Browser)",
		prefix: "webgpu:",
		models: ["GPT-OSS-WebGPU"],
	},
];

interface GroupFormState {
	name: string;
	provider: string;
	baseUrl: string;
	apiKey: string;
}

const DEFAULT_GROUP_STATE: Record<ApiGroup, GroupFormState> = {
	text_reasoning: {
		name: "openai:gpt-4o",
		provider: "OpenAI",
		baseUrl: "",
		apiKey: "",
	},
	text_fast: {
		name: "openai:gpt-4o-mini",
		provider: "OpenAI",
		baseUrl: "",
		apiKey: "",
	},
	vision_ocr: {
		name: "openai:gpt-4o",
		provider: "OpenAI",
		baseUrl: "",
		apiKey: "",
	},
	embedding: {
		name: "openai:text-embedding-3-small",
		provider: "OpenAI",
		baseUrl: "",
		apiKey: "",
	},
	speech: {
		name: "openai:whisper-1",
		provider: "OpenAI",
		baseUrl: "",
		apiKey: "",
	},
};

const MOCK_USAGE = [
	{ label: "Today", calls: 42, limit: 100 },
	{ label: "This Week", calls: 287, limit: 700 },
	{ label: "This Month", calls: 1_024, limit: 3_000 },
];

export default function SettingsPage() {
	const { t } = useTranslation("settings");
	const { userInfo } = useAuthStore();
	const [groupConfigs, setGroupConfigs] =
		useState<Record<ApiGroup, GroupFormState>>(DEFAULT_GROUP_STATE);
	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteRole, setInviteRole] = useState<
		"admin" | "developer" | "viewer"
	>("developer");
	const [teamMembers] = useState([
		{
			name: userInfo?.name ?? "You",
			email: userInfo?.email ?? "",
			role: "admin" as const,
			status: "active" as const,
		},
	]);

	const updateGroup = (group: ApiGroup, updates: Partial<GroupFormState>) => {
		setGroupConfigs((prev) => ({
			...prev,
			[group]: { ...prev[group], ...updates },
		}));
	};

	const handleSaveModels = () => {
		toast.success("Model configuration saved (restart server to apply)");
	};

	return (
		<DashboardLayout pageTitle={t("pageTitle")}>
			<div className="mx-auto w-full max-w-3xl space-y-10 pb-12">
				{/* Profile */}
				<section className="space-y-4">
					<div className="flex items-center gap-2 text-lg font-semibold">
						<UserIcon className="size-5" aria-hidden="true" />
						{t("profile.title")}
					</div>
					<p className="text-sm text-muted-foreground">
						{t("profile.description")}
					</p>
					<div className="rounded-lg border p-4 space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">{t("profile.name")}</span>
							<span className="text-sm text-muted-foreground">
								{userInfo?.name ?? "—"}
							</span>
						</div>
						<Separator />
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">{t("profile.email")}</span>
							<span className="text-sm text-muted-foreground">
								{userInfo?.email ?? "—"}
							</span>
						</div>
					</div>
				</section>

				{/* Team */}
				<section className="space-y-4">
					<div className="flex items-center gap-2 text-lg font-semibold">
						<UsersIcon className="size-5" aria-hidden="true" />
						Team Members
					</div>
					<p className="text-sm text-muted-foreground">
						Invite teammates to collaborate. Team members share API keys and
						project access based on their role.
					</p>
					<div className="rounded-lg border p-4 space-y-4">
						<div className="space-y-2">
							{teamMembers.map((m) => (
								<div key={m.email} className="flex items-center gap-3 py-2">
									<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
										{m.name.charAt(0).toUpperCase()}
									</div>
									<div className="flex-1 min-w-0">
										<div className="text-sm font-medium truncate">{m.name}</div>
										<div className="text-xs text-muted-foreground truncate">
											{m.email}
										</div>
									</div>
									<span
										className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
											m.role === "admin"
												? "bg-primary/10 text-primary"
												: m.role === "developer"
													? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
													: "bg-muted text-muted-foreground"
										}`}
									>
										{m.role}
									</span>
								</div>
							))}
						</div>
						<Separator />
						<div>
							<div className="text-sm font-medium mb-2">Invite new member</div>
							<div className="flex gap-2 flex-wrap">
								<div className="flex-1 min-w-[200px]">
									<div className="relative">
										<MailIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
										<input
											value={inviteEmail}
											onChange={(e) => setInviteEmail(e.target.value)}
											placeholder="colleague@hospital.org"
											type="email"
											className="w-full rounded-md border bg-transparent pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
										/>
									</div>
								</div>
								<select
									value={inviteRole}
									onChange={(e) =>
										setInviteRole(
											e.target.value as "admin" | "developer" | "viewer"
										)
									}
									className="rounded-md border bg-transparent px-2 py-1.5 text-xs"
								>
									<option value="admin">Admin</option>
									<option value="developer">Developer</option>
									<option value="viewer">Viewer</option>
								</select>
								<Button
									size="sm"
									className="text-xs"
									onClick={() => {
										if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
											toast.error("Enter a valid email address");
											return;
										}
										toast.success(
											`Invitation sent to ${inviteEmail} as ${inviteRole}`
										);
										setInviteEmail("");
									}}
								>
									Send Invite
								</Button>
							</div>
							<div className="mt-3 text-[11px] text-muted-foreground space-y-1">
								<p>
									<strong>Admin</strong> — Full access: manage API keys, models,
									team, billing
								</p>
								<p>
									<strong>Developer</strong> — Use all playground APIs, view
									keys, cannot manage team/billing
								</p>
								<p>
									<strong>Viewer</strong> — Read-only access to dashboards and
									API reference
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* Model Configuration by API Group */}
				<section className="space-y-4">
					<div className="flex items-center gap-2 text-lg font-semibold">
						<CpuIcon className="size-5" aria-hidden="true" />
						{t("model.title")}
					</div>
					<p className="text-sm text-muted-foreground">
						Configure which model powers each API group. Group APIs by their
						capability requirements rather than model size.
					</p>

					<div className="space-y-4">
						{API_GROUPS.map((grp) => {
							const config = groupConfigs[grp.group];
							return (
								<div
									key={grp.group}
									className="rounded-lg border p-4 space-y-3"
								>
									<div className="flex items-start justify-between gap-2">
										<div>
											<h3 className="text-sm font-semibold">{grp.label}</h3>
											<p className="text-xs text-muted-foreground">
												{grp.description}
											</p>
											<div className="flex flex-wrap gap-1 mt-1">
												{grp.apis.map((api) => (
													<span
														key={api}
														className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground"
													>
														{api}
													</span>
												))}
											</div>
										</div>
										<span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary whitespace-nowrap">
											{config.provider || "Custom"}
										</span>
									</div>
									<Separator />
									<div className="grid gap-3 sm:grid-cols-3">
										<div className="space-y-1">
											<label className="text-[11px] font-medium text-muted-foreground">
												Model Name
												<input
													value={config.name}
													onChange={(e) =>
														updateGroup(grp.group, { name: e.target.value })
													}
													placeholder="openai:gpt-4o"
													className="mt-1 w-full rounded-md border bg-transparent px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
												/>
											</label>
										</div>
										<div className="space-y-1">
											<label className="text-[11px] font-medium text-muted-foreground">
												API Key
												<input
													type="password"
													value={config.apiKey}
													onChange={(e) =>
														updateGroup(grp.group, { apiKey: e.target.value })
													}
													placeholder="sk-... or key-..."
													className="mt-1 w-full rounded-md border bg-transparent px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
												/>
											</label>
										</div>
										<div className="space-y-1">
											<label className="text-[11px] font-medium text-muted-foreground">
												Base URL (for self-hosted)
												<input
													value={config.baseUrl}
													onChange={(e) =>
														updateGroup(grp.group, { baseUrl: e.target.value })
													}
													placeholder="http://localhost:8001/v1"
													className="mt-1 w-full rounded-md border bg-transparent px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
												/>
											</label>
										</div>
									</div>
									<div className="flex flex-wrap gap-1">
										{PROVIDER_PRESETS.map((p) => (
											<button
												key={p.provider}
												type="button"
												onClick={() =>
													updateGroup(grp.group, {
														provider: p.provider,
														name: `${p.prefix}${p.models[0]}`,
														baseUrl: p.provider.includes("Self-Hosted")
															? "http://localhost:11434/v1"
															: p.provider.includes("WebGPU")
																? "browser"
																: "",
													})
												}
												className={`px-2 py-0.5 text-[11px] font-medium rounded-md border transition-colors ${
													config.provider === p.provider
														? "border-primary bg-primary/10 text-primary"
														: "hover:bg-muted text-muted-foreground"
												}`}
											>
												{p.provider}
											</button>
										))}
									</div>
								</div>
							);
						})}
					</div>

					<div className="flex justify-end">
						<Button size="sm" className="text-xs" onClick={handleSaveModels}>
							<CheckIcon className="size-3.5 mr-1" />
							Save Model Configuration
						</Button>
					</div>
				</section>

				{/* Self-Host & WebGPU */}
				<section className="space-y-4">
					<div className="flex items-center gap-2 text-lg font-semibold">
						<ServerIcon className="size-5" aria-hidden="true" />
						Self-Host & Browser Models
					</div>
					<p className="text-sm text-muted-foreground">
						Deploy models locally or run them directly in the browser.
					</p>

					<div className="rounded-lg border p-4 space-y-4">
						<div>
							<h3 className="text-sm font-semibold mb-2">
								Self-Host with vLLM
							</h3>
							<p className="text-xs text-muted-foreground mb-3">
								Deploy open-source models from HuggingFace with vLLM for an
								OpenAI-compatible API.
							</p>
							<div className="bg-muted/50 rounded-lg p-3 text-xs font-mono space-y-1.5">
								<p className="text-muted-foreground"># Install vLLM</p>
								<p>pip install vllm</p>
								<p className="text-muted-foreground mt-2"># Serve a model</p>
								<p>vllm serve meta-llama/Llama-3.1-70B-Instruct \</p>
								<p> --host 0.0.0.0 --port 8001 \</p>
								<p> --tensor-parallel-size 2</p>
								<p className="text-muted-foreground mt-2">
									# Then set Base URL above to: http://localhost:8001/v1
								</p>
							</div>
							<div className="flex flex-wrap gap-2 mt-3">
								<a
									href="https://docs.vllm.ai"
									target="_blank"
									rel="noopener noreferrer"
									className="text-xs text-primary underline underline-offset-2"
								>
									vLLM Docs
								</a>
								<a
									href="https://huggingface.co/models?pipeline_tag=text-generation&sort=trending"
									target="_blank"
									rel="noopener noreferrer"
									className="text-xs text-primary underline underline-offset-2"
								>
									Browse Models on HuggingFace
								</a>
								<a
									href="https://github.com/ggerganov/llama.cpp"
									target="_blank"
									rel="noopener noreferrer"
									className="text-xs text-primary underline underline-offset-2"
								>
									llama.cpp (CPU)
								</a>
								<a
									href="https://ollama.com"
									target="_blank"
									rel="noopener noreferrer"
									className="text-xs text-primary underline underline-offset-2"
								>
									Ollama
								</a>
							</div>
						</div>

						<Separator />

						<div>
							<h3 className="text-sm font-semibold mb-2">
								Run in Browser (WebGPU)
							</h3>
							<p className="text-xs text-muted-foreground mb-3">
								Run small language models directly in the browser using WebGPU —
								no server needed. Requires a WebGPU-capable browser (Chrome
								113+, Edge 113+).
							</p>
							<div className="flex flex-wrap gap-2">
								<a
									href="https://huggingface.co/spaces/webml-community/GPT-OSS-WebGPU"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border bg-background text-xs font-medium hover:bg-muted transition-colors"
								>
									<GlobeIcon className="size-3.5" />
									GPT-OSS WebGPU Demo
								</a>
								<a
									href="https://huggingface.co/spaces/webml-community"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border bg-background text-xs font-medium hover:bg-muted transition-colors"
								>
									WebML Community Models
								</a>
							</div>
							<p className="text-[11px] text-muted-foreground/60 mt-2">
								Select "WebGPU (Browser)" as a provider in any API group above
								to use browser-based inference.
							</p>
						</div>
					</div>
				</section>

				{/* API Usage */}
				<section className="space-y-4">
					<div className="flex items-center gap-2 text-lg font-semibold">
						<BarChart3Icon className="size-5" aria-hidden="true" />
						{t("usage.title")}
					</div>
					<p className="text-sm text-muted-foreground">
						{t("usage.description")}
					</p>
					<div className="rounded-lg border p-4 space-y-4">
						{MOCK_USAGE.map((row) => {
							const pct = Math.round((row.calls / row.limit) * 100);
							return (
								<div key={row.label} className="space-y-1.5">
									<div className="flex items-center justify-between text-sm">
										<span className="font-medium">{row.label}</span>
										<span className="text-muted-foreground">
											{row.calls.toLocaleString()} /{" "}
											{row.limit.toLocaleString()}
										</span>
									</div>
									<div className="h-2 w-full rounded-full bg-muted">
										<div
											className="h-full rounded-full bg-primary transition-all"
											style={{ width: `${Math.min(pct, 100)}%` }}
										/>
									</div>
								</div>
							);
						})}
					</div>
				</section>

				{/* Danger Zone */}
				<section className="space-y-4">
					<div className="flex items-center gap-2 text-lg font-semibold text-destructive">
						<AlertTriangleIcon className="size-5" aria-hidden="true" />
						{t("danger.title")}
					</div>
					<div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
						<p className="text-sm text-muted-foreground mb-4">
							{t("danger.description")}
						</p>
						<Button
							type="button"
							variant="destructive"
							onClick={() => toast.error(t("danger.toast"))}
						>
							<Trash2Icon className="size-4" aria-hidden="true" />
							{t("danger.deleteAccount")}
						</Button>
					</div>
				</section>
			</div>
		</DashboardLayout>
	);
}
