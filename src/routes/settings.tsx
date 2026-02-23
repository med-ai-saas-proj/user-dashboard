import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
	AlertTriangleIcon,
	CheckIcon,
	CpuIcon,
	Trash2Icon,
	UserIcon,
	BarChart3Icon,
} from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Separator } from "@/components/shadcn/separator";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useAuthStore } from "@/features/auth/store/auth-store";

type ModelSlot = "BigModel" | "MediumModel" | "SmallModel" | "OcrModel";

interface ModelSlotConfig {
	slot: ModelSlot;
	label: string;
	description: string;
	usedBy: string;
}

const MODEL_SLOTS: ModelSlotConfig[] = [
	{
		slot: "BigModel",
		label: "Big Model",
		description: "Highest capability — complex reasoning and tool use",
		usedBy: "Chat, RX Advisor, AI Search, EHR Summarize",
	},
	{
		slot: "MediumModel",
		label: "Medium Model",
		description: "Balanced cost/performance for structured tasks",
		usedBy: "Health Score, BHXH Validator, Knowledge Base",
	},
	{
		slot: "SmallModel",
		label: "Small Model",
		description: "Fast and cost-effective for lightweight tasks",
		usedBy: "Data Masking, simple extraction",
	},
	{
		slot: "OcrModel",
		label: "OCR / Vision Model",
		description: "Requires vision capability for image input",
		usedBy: "Medical Image, Document→FHIR, OCR",
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
];

interface SlotFormState {
	name: string;
	provider: string;
	baseUrl: string;
}

const DEFAULT_STATE: Record<ModelSlot, SlotFormState> = {
	BigModel: { name: "openai:gpt-4o", provider: "OpenAI", baseUrl: "" },
	MediumModel: { name: "openai:gpt-4o", provider: "OpenAI", baseUrl: "" },
	SmallModel: { name: "openai:gpt-4o-mini", provider: "OpenAI", baseUrl: "" },
	OcrModel: { name: "openai:gpt-4o", provider: "OpenAI", baseUrl: "" },
};

const MOCK_USAGE = [
	{ label: "Today", calls: 42, limit: 100 },
	{ label: "This Week", calls: 287, limit: 700 },
	{ label: "This Month", calls: 1_024, limit: 3_000 },
];

export default function SettingsPage() {
	const { t } = useTranslation("settings");
	const { userInfo } = useAuthStore();
	const [slotConfigs, setSlotConfigs] =
		useState<Record<ModelSlot, SlotFormState>>(DEFAULT_STATE);

	const updateSlot = (slot: ModelSlot, updates: Partial<SlotFormState>) => {
		setSlotConfigs((prev) => ({
			...prev,
			[slot]: { ...prev[slot], ...updates },
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

				{/* Model Configuration */}
				<section className="space-y-4">
					<div className="flex items-center gap-2 text-lg font-semibold">
						<CpuIcon className="size-5" aria-hidden="true" />
						{t("model.title")}
					</div>
					<p className="text-sm text-muted-foreground">
						Configure which LLM powers each capability slot. Use cloud API keys
						or point to a self-hosted inference server (vLLM, Ollama, etc.).
					</p>

					<div className="space-y-4">
						{MODEL_SLOTS.map((slot) => {
							const config = slotConfigs[slot.slot];
							return (
								<div
									key={slot.slot}
									className="rounded-lg border p-4 space-y-3"
								>
									<div className="flex items-start justify-between gap-2">
										<div>
											<h3 className="text-sm font-semibold">{slot.label}</h3>
											<p className="text-[11px] text-muted-foreground">
												{slot.description}
											</p>
											<p className="text-[10px] text-muted-foreground/60 mt-0.5">
												Used by: {slot.usedBy}
											</p>
										</div>
										<span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary whitespace-nowrap">
											{config.provider || "Custom"}
										</span>
									</div>
									<Separator />
									<div className="grid gap-3 sm:grid-cols-2">
										<div className="space-y-1">
											<label className="text-[11px] font-medium text-muted-foreground">
												Model Name
												<input
													value={config.name}
													onChange={(e) =>
														updateSlot(slot.slot, { name: e.target.value })
													}
													placeholder="openai:gpt-4o"
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
														updateSlot(slot.slot, { baseUrl: e.target.value })
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
													updateSlot(slot.slot, {
														provider: p.provider,
														name: `${p.prefix}${p.models[0]}`,
														baseUrl: p.provider.includes("Self-Hosted")
															? "http://localhost:11434/v1"
															: "",
													})
												}
												className={`px-2 py-0.5 text-[10px] font-medium rounded-md border transition-colors ${
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
