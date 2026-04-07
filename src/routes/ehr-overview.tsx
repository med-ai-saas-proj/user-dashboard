import { useState } from "react";
import { toast } from "sonner";
import { ApiTopology, TOPOLOGIES } from "@/components/api-topology";
import { Button } from "@/components/shadcn/button";
import { ViewCodeDialog } from "@/components/view-code-dialog";
import { API_ROUTES } from "@/config/api-routes";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";
import {
	HeartPulseIcon,
	ActivityIcon,
	PillIcon,
	ClipboardListIcon,
	AlertTriangleIcon,
	ThermometerIcon,
	WindIcon,
	DropletIcon,
	ZapIcon,
	CalendarIcon,
	ShieldAlertIcon,
	FileTextIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	WatchIcon,
	TrendingUpIcon,
	TrendingDownIcon,
	MinusIcon,
	UserIcon,
} from "lucide-react";

/* ─── Interfaces ─── */
interface PatientHeader {
	name: string;
	age: number;
	gender: string;
	mrn: string;
	blood_type: string;
	allergies: string[];
	health_score: number;
	data_sources: string[];
}

interface ConditionItem {
	name: string;
	icd10: string;
	status: string;
	onset_date: string;
}

interface MedicationItem {
	name: string;
	dosage: string;
	frequency: string;
	route: string;
	adherence_pct?: number;
	recent_change?: boolean;
}

interface VitalReading {
	name: string;
	value: number;
	unit: string;
	status: "normal" | "warning" | "critical";
	trend?: number[];
}

interface LabResultItem {
	name: string;
	value: number;
	unit: string;
	reference_range: string;
	status: "normal" | "low" | "high" | "critical";
	loinc_code: string;
}

interface WearableInsight {
	metric: string;
	value: number;
	unit: string;
	trend: "up" | "down" | "stable";
	alert?: string;
}

interface VisitItem {
	date: string;
	facility: string;
	encounter_type: string;
	summary: string;
}

interface CareGap {
	description: string;
	due_date?: string;
	priority: "high" | "medium" | "low";
}

interface RiskFactor {
	name: string;
	level: "high" | "medium" | "low";
	detail?: string;
}

interface NarrativeSection {
	title: string;
	content: string;
}

interface EHROverviewData {
	patient: PatientHeader;
	conditions: ConditionItem[];
	medications: MedicationItem[];
	vitals: VitalReading[];
	labs: LabResultItem[];
	wearable_insights: WearableInsight[];
	visits: VisitItem[];
	care_gaps: CareGap[];
	risk_factors: RiskFactor[];
}

interface NarrativeData {
	sections: NarrativeSection[];
	generated_at: string;
	language: string;
}

/* ─── Helpers ─── */
const vitalStatusColor = (s: string) => {
	if (s === "normal")
		return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
	if (s === "warning")
		return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
	if (s === "critical")
		return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
	return "bg-muted text-muted-foreground border-muted";
};

const statusDot = (s: string) => {
	if (s === "normal") return "bg-emerald-400";
	if (s === "warning" || s === "low" || s === "high") return "bg-amber-400";
	if (s === "critical") return "bg-red-400";
	return "bg-slate-400";
};

const labStatusBadge = (s: string) => {
	if (s === "normal")
		return "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-300";
	if (s === "high")
		return "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-300";
	if (s === "low")
		return "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300";
	if (s === "critical")
		return "text-red-700 bg-red-100 dark:bg-red-900/40 dark:text-red-200";
	return "text-muted-foreground bg-muted";
};

const conditionStatusBadge = (s: string) => {
	const lower = s.toLowerCase();
	if (lower === "active")
		return "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-300";
	if (lower === "resolved")
		return "text-slate-500 bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400";
	if (lower === "recurring")
		return "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-300";
	return "text-muted-foreground bg-muted";
};

const healthScoreColor = (score: number) => {
	if (score >= 70) return "bg-emerald-500 text-white";
	if (score >= 50) return "bg-amber-500 text-white";
	return "bg-red-500 text-white";
};

const priorityColor = (p: string) => {
	if (p === "high")
		return "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-300";
	if (p === "medium")
		return "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-300";
	return "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300";
};

const riskLevelColor = (l: string) => {
	if (l === "high") return "border-l-red-500 bg-red-50/50 dark:bg-red-900/10";
	if (l === "medium")
		return "border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/10";
	return "border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10";
};

const vitalIcon = (name: string) => {
	const n = name.toLowerCase();
	if (n.includes("heart") || n.includes("pulse") || n.includes("hr"))
		return <HeartPulseIcon className="w-4 h-4" />;
	if (n.includes("temp")) return <ThermometerIcon className="w-4 h-4" />;
	if (n.includes("respiratory") || n.includes("rr") || n.includes("breath"))
		return <WindIcon className="w-4 h-4" />;
	if (n.includes("oxygen") || n.includes("spo2"))
		return <DropletIcon className="w-4 h-4" />;
	if (n.includes("blood") || n.includes("bp") || n.includes("pressure"))
		return <ActivityIcon className="w-4 h-4" />;
	if (n.includes("weight") || n.includes("bmi"))
		return <UserIcon className="w-4 h-4" />;
	return <ZapIcon className="w-4 h-4" />;
};

const trendIcon = (t: string) => {
	if (t === "up")
		return <TrendingUpIcon className="w-3.5 h-3.5 text-red-500" />;
	if (t === "down")
		return <TrendingDownIcon className="w-3.5 h-3.5 text-emerald-500" />;
	return <MinusIcon className="w-3.5 h-3.5 text-muted-foreground" />;
};

/* ─── Inline Sparkline SVG ─── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
	if (!data || data.length < 2) return null;
	const min = Math.min(...data);
	const max = Math.max(...data);
	const range = max - min || 1;
	const w = 60;
	const h = 20;
	const points = data
		.map((v, i) => {
			const x = (i / (data.length - 1)) * w;
			const y = h - ((v - min) / range) * h;
			return `${x},${y}`;
		})
		.join(" ");

	return (
		<svg width={w} height={h} className="inline-block ml-1" aria-hidden="true">
			<polyline
				fill="none"
				stroke={color}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				points={points}
			/>
		</svg>
	);
}

/* ─── Section Card Wrapper ─── */
function SectionCard({
	title,
	icon,
	children,
	className = "",
	fullWidth = false,
}: {
	title: string;
	icon: React.ReactNode;
	children: React.ReactNode;
	className?: string;
	fullWidth?: boolean;
}) {
	return (
		<div
			className={`rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow ${fullWidth ? "col-span-full" : ""} ${className}`}
		>
			<div className="flex items-center gap-2 px-4 py-3 border-b">
				<span className="text-muted-foreground">{icon}</span>
				<h3 className="text-sm font-semibold tracking-tight">{title}</h3>
			</div>
			<div className="p-4">{children}</div>
		</div>
	);
}

/* ─── Spinner ─── */
function Spinner() {
	return (
		<svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
			<title>Loading</title>
			<circle
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				strokeWidth="4"
				className="opacity-25"
			/>
			<path
				d="M4 12a8 8 0 018-8"
				stroke="currentColor"
				strokeWidth="4"
				strokeLinecap="round"
				className="opacity-75"
			/>
		</svg>
	);
}

/* ════════════════════════════════════════════════════════
   Main Page Component
   ════════════════════════════════════════════════════════ */
const EHROverviewPage = () => {
	const [patientId, setPatientId] = useState<number | null>(null);
	const [patientIdInput, setPatientIdInput] = useState("");
	const [overview, setOverview] = useState<EHROverviewData | null>(null);
	const [narrative, setNarrative] = useState<NarrativeData | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isNarrativeLoading, setIsNarrativeLoading] = useState(false);
	const [language, setLanguage] = useState("en");
	const [narrativeOpen, setNarrativeOpen] = useState(false);

	const fetchOverview = async (pid: number) => {
		setIsLoading(true);
		setOverview(null);
		setNarrative(null);
		setNarrativeOpen(false);
		try {
			const url = `${API_ROUTES.SERVICES.EHR_OVERVIEW}/${pid}`;
			const headers = await getAuthHeaders(url);
			const resp = await fetch(url, { headers });
			if (!resp.ok)
				throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
			const data: EHROverviewData = await resp.json();
			setOverview(data);
			setPatientId(pid);
			toast.success(`Loaded overview for patient ${pid}`);
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to load overview"
			);
		} finally {
			setIsLoading(false);
		}
	};

	const generateNarrative = async () => {
		if (!patientId) return;
		setIsNarrativeLoading(true);
		try {
			const url = `${API_ROUTES.SERVICES.EHR_OVERVIEW_NARRATIVE}/${patientId}/narrative`;
			const headers = await getAuthHeaders(url);
			const resp = await fetch(url, {
				method: "POST",
				headers,
				body: JSON.stringify({ language, format: "clinical" }),
			});
			if (!resp.ok)
				throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
			const data: NarrativeData = await resp.json();
			setNarrative(data);
			setNarrativeOpen(true);
			toast.success("Clinical narrative generated");
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to generate narrative"
			);
		} finally {
			setIsNarrativeLoading(false);
		}
	};

	const handleLoadPatient = () => {
		const pid = Number.parseInt(patientIdInput, 10);
		if (Number.isNaN(pid) || pid <= 0) {
			toast.error("Enter a valid patient ID");
			return;
		}
		fetchOverview(pid);
	};

	const sparklineColor = (s: string) => {
		if (s === "normal") return "#10b981";
		if (s === "warning") return "#f59e0b";
		return "#ef4444";
	};

	return (
		<DashboardLayout pageTitle="EHR Overview">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				{/* ─── Top Bar ─── */}
				<div className="flex items-center justify-between gap-3 px-4 py-2 border-b bg-muted/30">
					<div className="flex items-center gap-2">
						<input
							type="number"
							value={patientIdInput}
							onChange={(e) => setPatientIdInput(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleLoadPatient()}
							placeholder="Patient ID"
							className="w-32 rounded-md border px-3 py-1.5 text-sm bg-background"
						/>
						<Button
							size="sm"
							onClick={handleLoadPatient}
							disabled={isLoading || !patientIdInput.trim()}
						>
							{isLoading ? (
								<>
									<Spinner /> Loading...
								</>
							) : (
								"Load Patient"
							)}
						</Button>
						<ViewCodeDialog
							endpoint={`${API_ROUTES.SERVICES.EHR_OVERVIEW}/1`}
							method="GET"
							description="Get comprehensive patient health overview"
						/>
					</div>
					<div className="flex items-center gap-2">
						<select
							value={language}
							onChange={(e) => setLanguage(e.target.value)}
							className="rounded-md border px-2 py-1.5 text-sm bg-background"
						>
							<option value="en">EN</option>
							<option value="vi">VI</option>
						</select>
						<Button
							size="sm"
							variant="outline"
							onClick={generateNarrative}
							disabled={isNarrativeLoading || !patientId}
						>
							{isNarrativeLoading ? (
								<>
									<Spinner /> Generating...
								</>
							) : (
								"Generate Narrative"
							)}
						</Button>
					</div>
				</div>

				{/* ─── Main Content ─── */}
				<div className="flex-1 overflow-y-auto">
					{overview ? (
						<div className="p-4 space-y-4 max-w-7xl mx-auto">
							{/* ── Patient Header ── */}
							<PatientHeaderCard patient={overview.patient} />

							{/* ── 2-column grid ── */}
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
								{/* Active Conditions */}
								<SectionCard
									title="Active Conditions"
									icon={<ClipboardListIcon className="w-4 h-4" />}
								>
									{overview.conditions.length === 0 ? (
										<p className="text-sm text-muted-foreground">
											No conditions recorded
										</p>
									) : (
										<div className="space-y-2">
											{overview.conditions.map((c, i) => (
												<div
													key={i}
													className="flex items-start justify-between gap-2 py-1.5 border-b last:border-0"
												>
													<div className="min-w-0">
														<p className="text-sm font-medium">{c.name}</p>
														<p className="text-xs text-muted-foreground font-mono">
															{c.icd10}
														</p>
													</div>
													<div className="flex items-center gap-2 shrink-0">
														<span className="text-[10px] text-muted-foreground">
															{c.onset_date}
														</span>
														<span
															className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${conditionStatusBadge(c.status)}`}
														>
															{c.status}
														</span>
													</div>
												</div>
											))}
										</div>
									)}
								</SectionCard>

								{/* Current Medications */}
								<SectionCard
									title="Current Medications"
									icon={<PillIcon className="w-4 h-4" />}
								>
									{overview.medications.length === 0 ? (
										<p className="text-sm text-muted-foreground">
											No medications recorded
										</p>
									) : (
										<div className="space-y-2">
											{overview.medications.map((m, i) => (
												<div
													key={i}
													className={`py-1.5 border-b last:border-0 ${m.recent_change ? "bg-amber-50/50 dark:bg-amber-900/10 -mx-2 px-2 rounded" : ""}`}
												>
													<div className="flex items-center justify-between gap-2">
														<div className="min-w-0">
															<p className="text-sm font-medium">
																{m.name}
																{m.recent_change && (
																	<span className="ml-1.5 text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
																		CHANGED
																	</span>
																)}
															</p>
															<p className="text-xs text-muted-foreground">
																{m.dosage} &middot; {m.frequency} &middot;{" "}
																{m.route}
															</p>
														</div>
														{m.adherence_pct != null && (
															<div className="shrink-0 flex items-center gap-1.5">
																<div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
																	<div
																		className={`h-full rounded-full ${m.adherence_pct >= 80 ? "bg-emerald-500" : m.adherence_pct >= 50 ? "bg-amber-500" : "bg-red-500"}`}
																		style={{ width: `${m.adherence_pct}%` }}
																	/>
																</div>
																<span className="text-[10px] text-muted-foreground font-mono w-7 text-right">
																	{m.adherence_pct}%
																</span>
															</div>
														)}
													</div>
												</div>
											))}
										</div>
									)}
								</SectionCard>
							</div>

							{/* ── Vitals (full width) ── */}
							<SectionCard
								title="Vitals"
								icon={<HeartPulseIcon className="w-4 h-4" />}
								fullWidth
							>
								{overview.vitals.length === 0 ? (
									<p className="text-sm text-muted-foreground">
										No vitals recorded
									</p>
								) : (
									<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
										{overview.vitals.map((v, i) => (
											<div
												key={i}
												className={`rounded-lg border p-3 text-center ${vitalStatusColor(v.status)}`}
											>
												<div className="flex items-center justify-center gap-1.5 mb-1 text-muted-foreground">
													{vitalIcon(v.name)}
													<span className="text-[10px] font-semibold uppercase tracking-wider">
														{v.name}
													</span>
												</div>
												<div className="text-xl font-bold font-mono">
													{v.value}
												</div>
												<div className="text-[10px] opacity-70">{v.unit}</div>
												{v.trend && v.trend.length >= 2 && (
													<div className="flex justify-center mt-1">
														<Sparkline
															data={v.trend}
															color={sparklineColor(v.status)}
														/>
													</div>
												)}
												<div
													className={`mt-1 w-1.5 h-1.5 rounded-full mx-auto ${statusDot(v.status)}`}
												/>
											</div>
										))}
									</div>
								)}
							</SectionCard>

							{/* ── 2-column: Labs + Wearables ── */}
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
								{/* Lab Results */}
								<SectionCard
									title="Lab Results"
									icon={<DropletIcon className="w-4 h-4" />}
								>
									{overview.labs.length === 0 ? (
										<p className="text-sm text-muted-foreground">
											No lab results
										</p>
									) : (
										<div className="overflow-x-auto">
											<table className="w-full text-sm">
												<thead>
													<tr className="text-[10px] text-muted-foreground uppercase tracking-wider border-b">
														<th className="text-left py-1.5 font-medium">
															Test
														</th>
														<th className="text-right py-1.5 font-medium">
															Value
														</th>
														<th className="text-right py-1.5 font-medium">
															Ref Range
														</th>
														<th className="text-center py-1.5 font-medium">
															Status
														</th>
													</tr>
												</thead>
												<tbody>
													{overview.labs.map((l, i) => (
														<tr key={i} className="border-b last:border-0">
															<td className="py-1.5">
																<span className="font-medium">{l.name}</span>
																<span className="block text-[9px] text-muted-foreground font-mono">
																	{l.loinc_code}
																</span>
															</td>
															<td
																className={`py-1.5 text-right font-mono text-xs ${l.status !== "normal" ? "font-bold" : ""}`}
															>
																{l.value} {l.unit}
															</td>
															<td className="py-1.5 text-right text-xs text-muted-foreground">
																{l.reference_range}
															</td>
															<td className="py-1.5 text-center">
																<span
																	className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${labStatusBadge(l.status)}`}
																>
																	{l.status.toUpperCase()}
																</span>
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									)}
								</SectionCard>

								{/* Wearable Insights */}
								<SectionCard
									title="Wearable Insights"
									icon={<WatchIcon className="w-4 h-4" />}
								>
									{overview.wearable_insights.length === 0 ? (
										<p className="text-sm text-muted-foreground">
											No wearable data
										</p>
									) : (
										<div className="space-y-3">
											{overview.wearable_insights.map((w, i) => (
												<div
													key={i}
													className="flex items-center justify-between py-1.5 border-b last:border-0"
												>
													<div className="flex items-center gap-2">
														<span className="text-sm font-medium">
															{w.metric}
														</span>
														{trendIcon(w.trend)}
													</div>
													<div className="text-right">
														<span className="text-sm font-mono font-bold">
															{w.value}
														</span>
														<span className="text-xs text-muted-foreground ml-1">
															{w.unit}
														</span>
													</div>
												</div>
											))}
											{overview.wearable_insights.some((w) => w.alert) && (
												<div className="rounded-md border border-amber-200 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-800 p-2.5 mt-2">
													<p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">
														Alerts
													</p>
													{overview.wearable_insights
														.filter((w) => w.alert)
														.map((w, i) => (
															<p
																key={i}
																className="text-xs text-amber-600 dark:text-amber-400"
															>
																{w.alert}
															</p>
														))}
												</div>
											)}
										</div>
									)}
								</SectionCard>
							</div>

							{/* ── Visit History (full width) ── */}
							<SectionCard
								title={`Visit History${overview.visits.length > 0 ? ` (${overview.visits.length})` : ""}`}
								icon={<CalendarIcon className="w-4 h-4" />}
								fullWidth
							>
								{overview.visits.length === 0 ? (
									<p className="text-sm text-muted-foreground">
										No visit history
									</p>
								) : (
									<div className="space-y-0">
										{overview.visits.map((v, i) => (
											<div
												key={i}
												className="flex gap-3 py-2.5 border-b last:border-0"
											>
												{/* Timeline dot + line */}
												<div className="flex flex-col items-center shrink-0 pt-0.5">
													<div className="w-2 h-2 rounded-full bg-primary" />
													{i < overview.visits.length - 1 && (
														<div className="w-px flex-1 bg-border mt-1" />
													)}
												</div>
												<div className="min-w-0 flex-1">
													<div className="flex items-center gap-2 flex-wrap">
														<span className="text-xs font-mono text-muted-foreground">
															{v.date}
														</span>
														<span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 font-medium">
															{v.encounter_type}
														</span>
													</div>
													<p className="text-sm font-medium mt-0.5">
														{v.facility}
													</p>
													<p className="text-xs text-muted-foreground">
														{v.summary}
													</p>
												</div>
											</div>
										))}
									</div>
								)}
							</SectionCard>

							{/* ── Care Gaps & Risk (full width) ── */}
							<SectionCard
								title="Care Gaps & Risk"
								icon={<ShieldAlertIcon className="w-4 h-4" />}
								fullWidth
							>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{/* Care Gaps */}
									<div>
										<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
											Care Gaps
										</p>
										{overview.care_gaps.length === 0 ? (
											<p className="text-sm text-muted-foreground">
												No care gaps identified
											</p>
										) : (
											<div className="space-y-2">
												{overview.care_gaps.map((g, i) => (
													<div key={i} className="flex items-start gap-2 py-1">
														<AlertTriangleIcon
															className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${g.priority === "high" ? "text-red-500" : g.priority === "medium" ? "text-amber-500" : "text-blue-500"}`}
														/>
														<div className="min-w-0">
															<p className="text-sm">{g.description}</p>
															<div className="flex items-center gap-2 mt-0.5">
																{g.due_date && (
																	<span className="text-[10px] text-muted-foreground">
																		Due: {g.due_date}
																	</span>
																)}
																<span
																	className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${priorityColor(g.priority)}`}
																>
																	{g.priority}
																</span>
															</div>
														</div>
													</div>
												))}
											</div>
										)}
									</div>
									{/* Risk Factors */}
									<div>
										<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
											Risk Factors
										</p>
										{overview.risk_factors.length === 0 ? (
											<p className="text-sm text-muted-foreground">
												No risk factors identified
											</p>
										) : (
											<div className="space-y-2">
												{overview.risk_factors.map((r, i) => (
													<div
														key={i}
														className={`border-l-4 rounded-r-md px-3 py-2 ${riskLevelColor(r.level)}`}
													>
														<div className="flex items-center justify-between">
															<span className="text-sm font-medium">
																{r.name}
															</span>
															<span
																className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${priorityColor(r.level)}`}
															>
																{r.level}
															</span>
														</div>
														{r.detail && (
															<p className="text-xs text-muted-foreground mt-0.5">
																{r.detail}
															</p>
														)}
													</div>
												))}
											</div>
										)}
									</div>
								</div>
							</SectionCard>

							{/* ── Clinical Narrative (collapsible, full width) ── */}
							{narrative && (
								<div className="col-span-full rounded-xl border bg-card shadow-sm">
									<button
										type="button"
										className="w-full flex items-center justify-between gap-2 px-4 py-3 border-b hover:bg-muted/30 transition-colors"
										onClick={() => setNarrativeOpen(!narrativeOpen)}
									>
										<div className="flex items-center gap-2">
											<FileTextIcon className="w-4 h-4 text-muted-foreground" />
											<h3 className="text-sm font-semibold tracking-tight">
												Clinical Narrative
											</h3>
											<span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">
												{narrative.language.toUpperCase()} &middot;{" "}
												{narrative.generated_at}
											</span>
										</div>
										{narrativeOpen ? (
											<ChevronUpIcon className="w-4 h-4 text-muted-foreground" />
										) : (
											<ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
										)}
									</button>
									{narrativeOpen && (
										<div className="p-4 space-y-4">
											{narrative.sections.map((s, i) => (
												<div key={i}>
													<h4 className="text-sm font-semibold text-foreground mb-1">
														{s.title}
													</h4>
													<p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
														{s.content}
													</p>
												</div>
											))}
										</div>
									)}
								</div>
							)}
						</div>
					) : (
						/* ── Empty State ── */
						<div className="flex-1 flex items-center justify-center p-8 min-h-[60vh]">
							<div className="text-center space-y-4 max-w-sm">
								<div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/20 flex items-center justify-center shadow-sm">
									<ClipboardListIcon className="w-8 h-8 text-blue-500 dark:text-blue-400" />
								</div>
								<div>
									<p className="text-base font-semibold">No patient loaded</p>
									<p className="text-sm text-muted-foreground mt-1">
										Enter a patient ID above and click{" "}
										<strong className="text-foreground">Load Patient</strong> to
										view a comprehensive health overview.
									</p>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										setPatientIdInput("1");
										fetchOverview(1);
									}}
								>
									Load Example (Patient 1)
								</Button>
							</div>
						</div>
					)}
				</div>

				{/* ─── API Topology ─── */}
				<div className="border-t">
					<details className="group">
						<summary className="px-4 py-2.5 cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 select-none">
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="transition-transform group-open:rotate-90"
							>
								<title>Toggle</title>
								<polyline points="9 18 15 12 9 6" />
							</svg>
							API Topology
						</summary>
						<div className="px-4 pb-3">
							<ApiTopology {...TOPOLOGIES.ehr_overview} />
						</div>
					</details>
				</div>
			</div>
		</DashboardLayout>
	);
};

/* ─── Patient Header Sub-component ─── */
function PatientHeaderCard({ patient }: { patient: PatientHeader }) {
	return (
		<div className="rounded-xl border bg-card shadow-sm p-4 col-span-full">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="flex items-center gap-4">
					{/* Avatar */}
					<div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-lg font-bold text-primary shrink-0">
						{patient.name.charAt(0)}
					</div>
					<div>
						<h2 className="text-lg font-bold">{patient.name}</h2>
						<div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
							<span>
								{patient.age}y &middot; {patient.gender}
							</span>
							<span className="font-mono">MRN: {patient.mrn}</span>
							{patient.blood_type && (
								<span className="px-1.5 py-0.5 rounded bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300 font-semibold text-[10px]">
									{patient.blood_type}
								</span>
							)}
						</div>
						{patient.allergies.length > 0 && (
							<div className="flex items-center gap-1 mt-1 flex-wrap">
								<span className="text-[10px] text-red-500 font-semibold">
									ALLERGIES:
								</span>
								{patient.allergies.map((a, i) => (
									<span
										key={i}
										className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300"
									>
										{a}
									</span>
								))}
							</div>
						)}
					</div>
				</div>
				<div className="flex items-center gap-3 shrink-0">
					{/* Health Score Badge */}
					<div
						className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center ${healthScoreColor(patient.health_score)}`}
					>
						<span className="text-lg font-bold leading-none">
							{patient.health_score}
						</span>
						<span className="text-[8px] uppercase tracking-wider opacity-80">
							Score
						</span>
					</div>
					{/* Data Sources */}
					<div className="flex flex-col gap-1">
						{patient.data_sources.map((ds, i) => (
							<span
								key={i}
								className="text-[9px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono"
							>
								{ds}
							</span>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export default EHROverviewPage;
