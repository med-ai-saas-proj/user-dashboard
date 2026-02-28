import { useState, useEffect, useCallback, useRef } from "react";
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
	LoaderIcon,
	RocketIcon,
	SquareIcon,
	RefreshCwIcon,
} from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Separator } from "@/components/shadcn/separator";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useAuthStore } from "@/features/auth/store/auth-store";
import {
	loadWebGPUModel,
	getWebGPUState,
	subscribeWebGPU,
	isWebGPUSupported,
	unloadModel as unloadWebGPUModel,
} from "@/lib/webgpu-inference";

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
		provider: "Local (Qwen3-VL-2B)",
		prefix: "openai:",
		models: ["qwen3-vl-2b-instruct"],
	},
	{
		provider: "WebGPU (Browser)",
		prefix: "webgpu:",
		models: ["Qwen3-VL-2B-Instruct"],
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

	// --- llama.cpp deploy state ---
	const [llamaStatus, setLlamaStatus] = useState<{
		models: Record<
			string,
			{
				name: string;
				size_mb: number;
				status: string;
				progress: {
					percent: number;
					downloaded_mb: number;
					total_mb: number;
					speed_mbps: number;
				} | null;
			}
		>;
		server: {
			running: boolean;
			pid?: number;
			port?: number;
			model_name?: string;
			endpoint?: string;
		};
		error: string | null;
	} | null>(null);
	const [llamaDeploying, setLlamaDeploying] = useState(false);
	const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const BASE = import.meta.env.VITE_BASE_API_URL;

	const fetchLlamaStatus = useCallback(async () => {
		try {
			const resp = await fetch(`${BASE}/management/api/v1/local-models/status`);
			setLlamaStatus(await resp.json());
		} catch {
			/* backend unreachable */
		}
	}, []);

	useEffect(() => {
		fetchLlamaStatus();
	}, [fetchLlamaStatus]);

	const startPolling = useCallback(() => {
		if (pollRef.current) return;
		pollRef.current = setInterval(fetchLlamaStatus, 1500);
	}, [fetchLlamaStatus]);

	const stopPolling = useCallback(() => {
		if (pollRef.current) {
			clearInterval(pollRef.current);
			pollRef.current = null;
		}
	}, []);

	useEffect(() => () => stopPolling(), [stopPolling]);

	const handleLlamaDeploy = async (modelId: string) => {
		setLlamaDeploying(true);
		startPolling();
		try {
			const resp = await fetch(
				`${BASE}/management/api/v1/local-models/deploy`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ model_id: modelId }),
				}
			);
			const data = await resp.json();
			if (data.success) {
				toast.success(`Deployed! ${data.endpoint}`);
			} else {
				toast.error(data.error || "Deploy failed");
			}
		} catch {
			toast.error("Backend unreachable");
		} finally {
			setLlamaDeploying(false);
			setTimeout(() => {
				stopPolling();
				fetchLlamaStatus();
			}, 2000);
		}
	};

	const handleLlamaStop = async () => {
		try {
			await fetch(`${BASE}/management/api/v1/local-models/stop`, {
				method: "POST",
			});
			toast.success("Server stopped");
			fetchLlamaStatus();
		} catch {
			toast.error("Backend unreachable");
		}
	};

	// --- WebGPU deploy state ---
	const [webgpuState, setWebgpuState] = useState(getWebGPUState());
	useEffect(() => subscribeWebGPU(setWebgpuState), []);
	const webgpuSupported = isWebGPUSupported();

	const handleWebGPUDeploy = async () => {
		if (!webgpuSupported) {
			toast.error("WebGPU not supported in this browser");
			return;
		}
		toast.info("Loading model into GPU memory...");
		const ok = await loadWebGPUModel(
			"onnx-community/Qwen2.5-VL-3B-Instruct",
			"image-text-to-text"
		);
		if (ok) toast.success("WebGPU model ready!");
		else toast.error("Failed to load model");
	};

	const q4 = llamaStatus?.models?.["qwen3-vl-2b-q4"];
	const q8 = llamaStatus?.models?.["qwen3-vl-2b-q8"];
	const srv = llamaStatus?.server;
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

				{/* Inference Engine */}
				<section className="space-y-4">
					<div className="flex items-center gap-2 text-lg font-semibold">
						<ServerIcon className="size-5" aria-hidden="true" />
						Inference Engine
					</div>
					<p className="text-sm text-muted-foreground">
						Choose how to run AI models. We natively support{" "}
						<strong>llama.cpp</strong> and <strong>WebGPU</strong> with
						Qwen3-VL-2B. You can also connect any OpenAI-compatible engine.
					</p>

					{/* Engine comparison */}
					<div className="grid gap-3 md:grid-cols-2">
						{/* llama.cpp */}
						<div className="rounded-xl border-2 border-primary/50 p-4 space-y-3 relative">
							<div className="absolute -top-2.5 left-3 px-2 bg-background text-[10px] font-bold text-primary uppercase">
								Recommended
							</div>
							<div className="flex items-center gap-2">
								<CpuIcon className="size-5 text-primary" />
								<h3 className="text-sm font-bold">llama.cpp</h3>
								{srv?.running && (
									<span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-green-600 dark:text-green-400">
										<span className="size-1.5 rounded-full bg-green-500 animate-pulse" />{" "}
										Running on :{srv.port}
									</span>
								)}
							</div>
							<p className="text-xs text-muted-foreground">
								Runs on your machine. Model persists, serves all backend APIs.
								Text + Vision.
							</p>
							<div className="space-y-1 text-[11px]">
								<div className="flex items-center gap-1.5">
									<CheckIcon className="size-3 text-green-500" /> Text + Vision
									(Qwen3-VL)
								</div>
								<div className="flex items-center gap-1.5">
									<CheckIcon className="size-3 text-green-500" /> All backend
									APIs work
								</div>
								<div className="flex items-center gap-1.5">
									<CheckIcon className="size-3 text-green-500" /> CPU + GPU,
									multi-user
								</div>
								<div className="flex items-center gap-1.5 text-muted-foreground">
									<AlertTriangleIcon className="size-3 text-amber-500" /> No
									voice (text+vision only)
								</div>
							</div>
							<Separator />

							{/* Progress bars for models */}
							{[
								{ id: "qwen3-vl-2b-q4", label: "Q4_K_M (1.1 GB)", info: q4 },
								{ id: "qwen3-vl-2b-q8", label: "Q8_0 (1.8 GB)", info: q8 },
							].map(({ id, label, info: m }) => (
								<div key={id}>
									{m?.status === "downloading" && m.progress && (
										<div className="space-y-1">
											<div className="flex items-center justify-between text-[11px]">
												<span className="font-medium">{label}</span>
												<span className="text-muted-foreground">
													{m.progress.downloaded_mb} / {m.progress.total_mb} MB
													({m.progress.speed_mbps} MB/s)
												</span>
											</div>
											<div className="h-2 w-full rounded-full bg-muted overflow-hidden">
												<div
													className="h-full rounded-full bg-primary transition-all"
													style={{ width: `${m.progress.percent}%` }}
												/>
											</div>
											<div className="text-[10px] text-muted-foreground text-right">
												{m.progress.percent}%
											</div>
										</div>
									)}
									{m?.status === "downloaded" && !srv?.running && (
										<div className="flex items-center gap-2 text-[11px]">
											<CheckIcon className="size-3 text-green-500" />
											<span className="text-green-600 dark:text-green-400 font-medium">
												{label} downloaded
											</span>
										</div>
									)}
									{m?.status === "running" && (
										<div className="flex items-center gap-2 text-[11px]">
											<span className="size-2 rounded-full bg-green-500 animate-pulse" />
											<span className="text-green-600 dark:text-green-400 font-medium">
												{label} — serving on :{srv?.port}
											</span>
										</div>
									)}
								</div>
							))}

							{/* One-click deploy buttons */}
							<div className="flex items-center gap-2 flex-wrap">
								{srv?.running ? (
									<>
										<Button
											size="sm"
											variant="destructive"
											className="text-xs h-8"
											onClick={handleLlamaStop}
										>
											<SquareIcon className="size-3 mr-1" /> Stop Server
										</Button>
										<span className="text-[10px] text-muted-foreground">
											{srv.model_name}
										</span>
									</>
								) : (
									<>
										<Button
											size="sm"
											className="text-xs h-8"
											onClick={() => handleLlamaDeploy("qwen3-vl-2b-q4")}
											disabled={llamaDeploying}
										>
											{llamaDeploying ? (
												<>
													<LoaderIcon className="size-3 mr-1 animate-spin" />{" "}
													Deploying...
												</>
											) : (
												<>
													<RocketIcon className="size-3 mr-1" /> Deploy Q4 (1.1
													GB)
												</>
											)}
										</Button>
										<Button
											size="sm"
											variant="outline"
											className="text-xs h-8"
											onClick={() => handleLlamaDeploy("qwen3-vl-2b-q8")}
											disabled={llamaDeploying}
										>
											{llamaDeploying ? "..." : "Deploy Q8 (1.8 GB)"}
										</Button>
										<Button
											size="sm"
											variant="ghost"
											className="text-xs h-7"
											onClick={fetchLlamaStatus}
										>
											<RefreshCwIcon className="size-3" />
										</Button>
									</>
								)}
							</div>
							<div className="rounded-md bg-muted/50 p-2 text-[11px] font-mono space-y-0.5">
								<p>
									Base URL:{" "}
									<span className="text-primary">http://localhost:8085/v1</span>
								</p>
								<p>
									Model:{" "}
									<span className="text-primary">qwen3-vl-2b-instruct</span>
								</p>
							</div>
						</div>

						{/* WebGPU */}
						<div className="rounded-xl border p-4 space-y-3">
							<div className="flex items-center gap-2">
								<GlobeIcon className="size-5 text-primary" />
								<h3 className="text-sm font-bold">WebGPU (Browser)</h3>
								{webgpuState.status === "ready" && (
									<span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-green-600 dark:text-green-400">
										<span className="size-1.5 rounded-full bg-green-500 animate-pulse" />{" "}
										Model loaded
									</span>
								)}
							</div>
							<p className="text-xs text-muted-foreground">
								Runs entirely in your browser. Zero setup, full privacy. Text +
								Vision via Transformers.js.
							</p>
							<div className="space-y-1 text-[11px]">
								<div className="flex items-center gap-1.5">
									<CheckIcon className="size-3 text-green-500" /> Text + Vision
									(ONNX)
								</div>
								<div className="flex items-center gap-1.5">
									<CheckIcon className="size-3 text-green-500" /> Zero install
								</div>
								<div className="flex items-center gap-1.5">
									<CheckIcon className="size-3 text-green-500" /> Full privacy
								</div>
								<div className="flex items-center gap-1.5 text-muted-foreground">
									<AlertTriangleIcon className="size-3 text-amber-500" />{" "}
									Re-downloads on refresh
								</div>
								<div className="flex items-center gap-1.5 text-muted-foreground">
									<AlertTriangleIcon className="size-3 text-amber-500" /> No
									backend API endpoints
								</div>
							</div>
							<Separator />

							{/* WebGPU progress */}
							{webgpuState.status === "loading" && (
								<div className="space-y-1">
									<div className="flex items-center justify-between text-[11px]">
										<span className="font-medium">
											Loading model into GPU...
										</span>
										<span className="text-muted-foreground">
											{Math.round(webgpuState.progress)}%
										</span>
									</div>
									<div className="h-2 w-full rounded-full bg-muted overflow-hidden">
										<div
											className="h-full rounded-full bg-primary transition-all"
											style={{ width: `${webgpuState.progress}%` }}
										/>
									</div>
								</div>
							)}
							{webgpuState.status === "ready" && (
								<div className="flex items-center gap-2 text-[11px]">
									<CheckIcon className="size-3 text-green-500" />
									<span className="text-green-600 dark:text-green-400 font-medium">
										{webgpuState.model} loaded
									</span>
								</div>
							)}
							{webgpuState.status === "error" && (
								<div className="flex items-center gap-2 text-[11px] text-red-600 dark:text-red-400">
									<AlertTriangleIcon className="size-3" />
									<span>{webgpuState.error}</span>
								</div>
							)}
							{webgpuState.status === "unsupported" && (
								<div className="rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 p-2 text-[11px] text-amber-700 dark:text-amber-400">
									WebGPU not supported in this browser. Use Chrome 113+, Edge
									113+, or enable <code>dom.webgpu.enabled</code> in Firefox.
								</div>
							)}

							{/* One-click deploy */}
							<div className="flex items-center gap-2 flex-wrap">
								{webgpuState.status === "ready" ? (
									<Button
										size="sm"
										variant="destructive"
										className="text-xs h-8"
										onClick={() => {
											unloadWebGPUModel();
											toast.success("Model unloaded");
										}}
									>
										<SquareIcon className="size-3 mr-1" /> Unload Model
									</Button>
								) : (
									<Button
										size="sm"
										className="text-xs h-8"
										onClick={handleWebGPUDeploy}
										disabled={
											webgpuState.status === "loading" || !webgpuSupported
										}
									>
										{webgpuState.status === "loading" ? (
											<>
												<LoaderIcon className="size-3 mr-1 animate-spin" />{" "}
												Loading...
											</>
										) : (
											<>
												<RocketIcon className="size-3 mr-1" /> Deploy in Browser
											</>
										)}
									</Button>
								)}
							</div>
							<p className="text-[10px] text-muted-foreground">
								Uses{" "}
								<a
									href="https://huggingface.co/docs/transformers.js/en/guides/webgpu"
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary underline"
								>
									Transformers.js
								</a>{" "}
								+ WebGPU • Model:{" "}
								<a
									href="https://huggingface.co/onnx-community/Qwen2.5-VL-3B-Instruct"
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary underline"
								>
									Qwen2.5-VL-3B-Instruct
								</a>
							</p>
						</div>
					</div>

					{/* Other engines */}
					<div className="rounded-lg border p-4 space-y-3">
						<h3 className="text-sm font-semibold">
							Other Inference Engines (OpenAI-compatible)
						</h3>
						<p className="text-xs text-muted-foreground">
							Not officially supported, but any engine with an OpenAI-compatible{" "}
							<code>/v1/chat/completions</code> endpoint works. Set the Base URL
							in Model Config above.
						</p>
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
							{[
								{
									name: "Ollama",
									url: "https://ollama.com",
									port: "11434",
									cmd: "ollama serve",
								},
								{
									name: "vLLM",
									url: "https://docs.vllm.ai",
									port: "8001",
									cmd: "vllm serve MODEL",
								},
								{
									name: "SGLang",
									url: "https://sgl-project.github.io",
									port: "30000",
									cmd: "python -m sglang.launch_server",
								},
								{
									name: "TGI",
									url: "https://huggingface.co/docs/text-generation-inference",
									port: "8080",
									cmd: "docker run ghcr.io/huggingface/tgi",
								},
							].map((e) => (
								<a
									key={e.name}
									href={e.url}
									target="_blank"
									rel="noopener noreferrer"
									className="rounded-lg border p-3 hover:bg-muted/50 transition-colors block"
								>
									<div className="text-xs font-semibold">{e.name}</div>
									<div className="text-[10px] text-muted-foreground mt-0.5">
										:{e.port}
									</div>
									<div className="text-[10px] font-mono text-muted-foreground/60 mt-1 truncate">
										{e.cmd}
									</div>
								</a>
							))}
						</div>
						<p className="text-[10px] text-muted-foreground/60">
							To use: start the engine, then set Base URL to{" "}
							<code>http://localhost:PORT/v1</code> in Model Config above.
						</p>
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
