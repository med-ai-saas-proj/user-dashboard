import {
	ActivityIcon,
	AlertTriangleIcon,
	BrainIcon,
	CalendarIcon,
	CheckCircleIcon,
	ClipboardListIcon,
	DropletIcon,
	HeartPulseIcon,
	LayersIcon,
	PillIcon,
	ScanIcon,
	SearchIcon,
	ShieldIcon,
	ThermometerIcon,
	UserIcon,
	WindIcon,
	ZapIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ApiTopology, TOPOLOGIES } from "@/components/api-topology";
import { Button } from "@/components/shadcn/button";
import { ViewCodeDialog } from "@/components/view-code-dialog";
import { BASE_API_URL } from "@/config/api-routes";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";

/* ─── Interfaces ─── */
interface VitalSign {
	name: string;
	value: number;
	unit: string;
	timestamp: string;
	status: "normal" | "warning" | "critical";
}
interface LabResult {
	name: string;
	value: number;
	unit: string;
	reference_range: string;
	status: "normal" | "low" | "high" | "critical";
	loinc_code: string;
}
interface Condition {
	name: string;
	icd10: string;
	onset_date: string;
	status: string;
	symptoms: string[];
	description: string;
}
interface Medication {
	name: string;
	dosage: string;
	frequency: string;
	route: string;
	start_date: string;
	active: boolean;
	adherence_pct: number;
}
interface ImagingStudy {
	modality: string;
	body_region: string;
	date: string;
	findings: string;
	image_url: string;
	ai_description: string;
}
interface Task {
	title: string;
	due_date: string;
	priority: string;
	completed: boolean;
	assigned_to: string;
}
interface TimelineEvent {
	date: string;
	event_type: string;
	title: string;
	description: string;
	facility: string;
	provider: string;
}
interface PatientProfile {
	patient_id: number;
	first_name: string;
	last_name: string;
	dob: string;
	gender: string;
	age: number;
	mrn: string;
	blood_type: string;
	allergies: string[];
}
interface DigitalTwinFull {
	profile: PatientProfile;
	vitals: VitalSign[];
	labs: LabResult[];
	conditions: Condition[];
	medications: Medication[];
	imaging: ImagingStudy[];
	tasks: Task[];
	timeline: TimelineEvent[];
	risk_score: number;
	last_updated: string;
}
interface PredictionFactor {
	factor: string;
	impact: number;
	detail: string;
}
interface PredictionResult {
	patient_id: number;
	prediction_type: string;
	score: number;
	confidence: number;
	factors: PredictionFactor[];
	recommendations: string[];
}

/* ─── Helpers ─── */
const twinUrl = (pid: string) =>
	`${BASE_API_URL}service/api/v1/digital_twin/${pid}`;
const predictUrl = (pid: string) =>
	`${BASE_API_URL}service/api/v1/digital_twin/${pid}/predict`;

const statusDot = (s: string) => {
	if (s === "normal") return "bg-emerald-400";
	if (s === "warning" || s === "low" || s === "high") return "bg-amber-400";
	if (s === "critical") return "bg-red-400";
	return "bg-slate-400";
};

const statusBg = (s: string) => {
	if (s === "normal")
		return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
	if (s === "warning" || s === "low" || s === "high")
		return "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
	if (s === "critical")
		return "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300";
	return "bg-muted text-muted-foreground";
};

const riskMeta = (score: number) => {
	if (score < 30)
		return { color: "#22c55e", label: "Low", cls: "text-emerald-500" };
	if (score < 60)
		return { color: "#eab308", label: "Moderate", cls: "text-amber-500" };
	if (score < 80)
		return { color: "#f97316", label: "High", cls: "text-orange-500" };
	return { color: "#ef4444", label: "Critical", cls: "text-red-500" };
};

const vitalIcon = (name: string) => {
	const n = name.toLowerCase();
	if (n.includes("heart") || n.includes("pulse"))
		return <HeartPulseIcon className="w-3.5 h-3.5" />;
	if (n.includes("temp")) return <ThermometerIcon className="w-3.5 h-3.5" />;
	if (n.includes("respiratory") || n.includes("breath"))
		return <WindIcon className="w-3.5 h-3.5" />;
	if (n.includes("oxygen") || n.includes("spo2"))
		return <DropletIcon className="w-3.5 h-3.5" />;
	if (n.includes("blood") || n.includes("pressure"))
		return <ActivityIcon className="w-3.5 h-3.5" />;
	return <ZapIcon className="w-3.5 h-3.5" />;
};

/* ─── Mini Sparkline (CSS-only bar chart) ─── */
function MiniSpark({
	value,
	max,
	color,
}: {
	value: number;
	max: number;
	color: string;
}) {
	const bars = useMemo(() => {
		const base = value / max;
		return Array.from({ length: 7 }, (_, i) => {
			const jitter = 0.7 + Math.sin(i * 1.8 + value) * 0.3;
			return Math.min(1, base * jitter);
		});
	}, [value, max]);

	return (
		<div className="flex items-end gap-px h-5">
			{bars.map((h, i) => (
				<div
					key={i}
					className="w-[3px] rounded-sm transition-all"
					style={{
						height: `${h * 100}%`,
						backgroundColor: color,
						opacity: i === bars.length - 1 ? 1 : 0.5,
					}}
				/>
			))}
		</div>
	);
}

/* ─── Risk Gauge (arc) ─── */
function RiskArc({ score, size = 140 }: { score: number; size?: number }) {
	const meta = riskMeta(score);
	const r = (size - 16) / 2;
	const circumference = Math.PI * r; // semicircle
	const filled = (score / 100) * circumference;

	return (
		<div className="flex flex-col items-center relative">
			<svg
				role="img"
				aria-label="Health gauge"
				width={size}
				height={size / 2 + 20}
				viewBox={`0 0 ${size} ${size / 2 + 20}`}
			>
				<path
					d={`M 8 ${size / 2 + 4} A ${r} ${r} 0 0 1 ${size - 8} ${size / 2 + 4}`}
					fill="none"
					stroke="currentColor"
					strokeWidth="8"
					className="text-muted/30"
					strokeLinecap="round"
				/>
				<path
					d={`M 8 ${size / 2 + 4} A ${r} ${r} 0 0 1 ${size - 8} ${size / 2 + 4}`}
					fill="none"
					stroke={meta.color}
					strokeWidth="8"
					strokeDasharray={circumference}
					strokeDashoffset={circumference - filled}
					strokeLinecap="round"
					style={{ transition: "stroke-dashoffset 1s ease-out" }}
				/>
				<text
					x={size / 2}
					y={size / 2 - 8}
					textAnchor="middle"
					className="font-bold fill-current"
					style={{ fontSize: size / 4, fill: meta.color }}
				>
					{score.toFixed(0)}
				</text>
				<text
					x={size / 2}
					y={size / 2 + 10}
					textAnchor="middle"
					className="fill-muted-foreground"
					style={{ fontSize: 11 }}
				>
					{meta.label} Risk
				</text>
			</svg>
		</div>
	);
}

/* ─── Human Body SVG with condition hotspots ─── */
function BodyModel({ conditions }: { conditions: Condition[] }) {
	const [hovered, setHovered] = useState<string | null>(null);

	const hotspots = useMemo(() => {
		const map: { name: string; x: number; y: number; condition: Condition }[] =
			[];
		for (const c of conditions) {
			const n = c.name.toLowerCase();
			if (n.includes("diabetes") || n.includes("pancrea"))
				map.push({ name: c.name, x: 50, y: 50, condition: c });
			else if (
				n.includes("hypertension") ||
				n.includes("cardio") ||
				n.includes("heart")
			)
				map.push({ name: c.name, x: 50, y: 35, condition: c });
			else if (
				n.includes("lipid") ||
				n.includes("cholesterol") ||
				n.includes("dyslipid")
			)
				map.push({ name: c.name, x: 35, y: 42, condition: c });
			else if (n.includes("kidney") || n.includes("renal"))
				map.push({ name: c.name, x: 62, y: 52, condition: c });
			else if (
				n.includes("lung") ||
				n.includes("pulmon") ||
				n.includes("respiratory")
			)
				map.push({ name: c.name, x: 40, y: 32, condition: c });
			else if (n.includes("liver") || n.includes("hepat"))
				map.push({ name: c.name, x: 38, y: 46, condition: c });
			else if (
				n.includes("brain") ||
				n.includes("neuro") ||
				n.includes("mental")
			)
				map.push({ name: c.name, x: 50, y: 12, condition: c });
			else if (n.includes("joint") || n.includes("arthri"))
				map.push({ name: c.name, x: 28, y: 70, condition: c });
			else map.push({ name: c.name, x: 50, y: 45, condition: c });
		}
		return map;
	}, [conditions]);

	return (
		<div
			className="relative w-full"
			style={{ maxWidth: 200, margin: "0 auto" }}
		>
			{/* Human body outline */}
			<svg
				role="img"
				aria-label="Human body outline"
				viewBox="0 0 100 150"
				className="w-full h-auto text-muted-foreground/20"
			>
				{/* Head */}
				<ellipse
					cx="50"
					cy="14"
					rx="10"
					ry="12"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.2"
				/>
				{/* Neck */}
				<line
					x1="50"
					y1="26"
					x2="50"
					y2="30"
					stroke="currentColor"
					strokeWidth="1.2"
				/>
				{/* Torso */}
				<path
					d="M 34 30 Q 34 60 38 75 L 50 78 L 62 75 Q 66 60 66 30 Z"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.2"
				/>
				{/* Left arm */}
				<path
					d="M 34 32 Q 22 42 18 60 Q 16 68 20 72"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.2"
				/>
				{/* Right arm */}
				<path
					d="M 66 32 Q 78 42 82 60 Q 84 68 80 72"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.2"
				/>
				{/* Left leg */}
				<path
					d="M 42 75 Q 40 100 38 120 Q 37 130 35 140"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.2"
				/>
				{/* Right leg */}
				<path
					d="M 58 75 Q 60 100 62 120 Q 63 130 65 140"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.2"
				/>
			</svg>

			{/* Condition hotspots */}
			{hotspots.map((h, i) => (
				<button
					type="button"
					key={`hs-${i}`}
					className="absolute"
					style={{
						left: `${h.x}%`,
						top: `${(h.y / 150) * 100}%`,
						transform: "translate(-50%, -50%)",
					}}
					onMouseEnter={() => setHovered(h.name)}
					onMouseLeave={() => setHovered(null)}
				>
					<div className="relative">
						<span className="flex h-4 w-4">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-50" />
							<span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white dark:border-slate-900 cursor-pointer" />
						</span>
						{hovered === h.name && (
							<div className="absolute z-50 left-6 -top-2 min-w-[160px] rounded-lg border bg-popover shadow-lg p-2.5 text-xs pointer-events-none">
								<p className="font-semibold">{h.condition.name}</p>
								<p className="text-muted-foreground font-mono text-[10px]">
									{h.condition.icd10}
								</p>
								<p className="text-muted-foreground text-[10px] mt-0.5">
									{h.condition.status} — since {h.condition.onset_date}
								</p>
								{h.condition.symptoms.length > 0 && (
									<div className="flex flex-wrap gap-0.5 mt-1">
										{h.condition.symptoms.map((s) => (
											<span
												key={s}
												className="rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-1 py-0.5 text-[9px]"
											>
												{s}
											</span>
										))}
									</div>
								)}
							</div>
						)}
					</div>
				</button>
			))}
		</div>
	);
}

/* ─── Adherence Bar ─── */
function AdherenceBar({ pct }: { pct: number }) {
	const color =
		pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";
	return (
		<div className="flex items-center gap-2">
			<div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
				<div
					className={`h-full rounded-full ${color}`}
					style={{ width: `${pct}%` }}
				/>
			</div>
			<span className="text-[10px] font-mono w-7 text-right">{pct}%</span>
		</div>
	);
}

/* ─── Section Header ─── */
function SectionHead({
	icon,
	title,
	count,
}: {
	icon: React.ReactNode;
	title: string;
	count?: number;
}) {
	return (
		<div className="flex items-center gap-1.5 mb-2">
			<span className="text-muted-foreground">{icon}</span>
			<h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
				{title}
			</h3>
			{count !== undefined && (
				<span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums">
					{count}
				</span>
			)}
		</div>
	);
}

/* ─── Main Page ─── */
export default function DigitalTwinPage() {
	const [patientId, setPatientId] = useState("1");
	const [isLoading, setIsLoading] = useState(false);
	const [twin, setTwin] = useState<DigitalTwinFull | null>(null);
	const [prediction, setPrediction] = useState<PredictionResult | null>(null);
	const [isPredicting, setIsPredicting] = useState(false);
	const [activeTab, setActiveTab] = useState<"overview" | "labs" | "timeline">(
		"overview"
	);

	const requireApiKey = useCallback((): boolean => {
		return true;
	}, []);

	const handleLoad = useCallback(
		async (pid?: string) => {
			if (!requireApiKey()) return;
			const id = pid || patientId || "1";
			setIsLoading(true);
			setTwin(null);
			setPrediction(null);

			try {
				const url = twinUrl(id);
				const headers = await getAuthHeaders(url);
				const resp = await fetch(url, { method: "GET", headers });
				if (!resp.ok)
					throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
				const json: DigitalTwinFull = await resp.json();
				setTwin(json);
				toast.success(
					`Loaded digital twin for ${json.profile.first_name} ${json.profile.last_name}`
				);
			} catch (err) {
				toast.error(
					err instanceof Error ? err.message : "Failed to load digital twin"
				);
			} finally {
				setIsLoading(false);
			}
		},
		[patientId, requireApiKey]
	);

	const handlePredict = async () => {
		if (!requireApiKey() || !twin) return;
		setIsPredicting(true);
		try {
			const url = predictUrl(patientId || "1");
			const headers = await getAuthHeaders(url);
			const resp = await fetch(url, {
				method: "POST",
				headers,
				body: JSON.stringify({
					patient_id: Number(patientId || "1"),
					prediction_type: "risk",
					time_horizon_days: 30,
				}),
			});
			if (!resp.ok)
				throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
			const json: PredictionResult = await resp.json();
			setPrediction(json);
			toast.success(`Prediction complete — score: ${json.score}`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Prediction failed");
		} finally {
			setIsPredicting(false);
		}
	};

	useEffect(() => {
		handleLoad("1");
	}, [handleLoad]);

	return (
		<DashboardLayout pageTitle="Digital Twin">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				{/* ─── Top Navigation Bar ─── */}
				<div className="flex items-center justify-between px-4 py-2 border-b bg-card gap-3 flex-wrap">
					<div className="flex items-center gap-3">
						{twin && (
							<div className="flex items-center gap-2">
								<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
									<UserIcon className="w-4 h-4 text-primary" />
								</div>
								<div className="min-w-0">
									<p className="text-sm font-bold leading-tight">
										{twin.profile.first_name} {twin.profile.last_name}
									</p>
									<p className="text-[10px] text-muted-foreground">
										{twin.profile.age}y {twin.profile.gender} · MRN{" "}
										{twin.profile.mrn}
									</p>
								</div>
							</div>
						)}
						{/* Tab navigation */}
						<div className="flex items-center border rounded-lg overflow-hidden ml-2">
							{(["overview", "labs", "timeline"] as const).map((tab) => (
								<button
									type="button"
									key={tab}
									onClick={() => setActiveTab(tab)}
									className={`px-3 py-1.5 text-[11px] font-medium capitalize transition-colors ${
										activeTab === tab
											? "bg-primary text-primary-foreground"
											: "hover:bg-muted text-muted-foreground"
									}`}
								>
									{tab}
								</button>
							))}
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex items-center gap-1.5 border rounded-md px-2 py-1">
							<SearchIcon className="w-3 h-3 text-muted-foreground" />
							<input
								value={patientId}
								onChange={(e) => setPatientId(e.target.value)}
								placeholder="Patient ID"
								className="w-16 bg-transparent text-xs focus:outline-none"
							/>
						</div>
						<Button
							size="sm"
							className="h-7 text-xs"
							onClick={() => handleLoad()}
							disabled={isLoading}
						>
							{isLoading ? "Loading..." : "Load Twin"}
						</Button>
						<ViewCodeDialog
							endpoint={twinUrl("{patient_id}")}
							method="GET"
							description="Fetch full digital twin for a patient"
						/>
					</div>
				</div>

				{/* ─── Main Content ─── */}
				<div className="flex-1 overflow-y-auto">
					{twin ? (
						<div className="p-3 max-w-[1800px] mx-auto">
							{/* ═══ OVERVIEW TAB ═══ */}
							{activeTab === "overview" && (
								<div className="grid grid-cols-12 gap-3">
									{/* ── Column 1: Vitals (3 cols) ── */}
									<div className="col-span-12 lg:col-span-3 space-y-3">
										{/* Patient card */}
										<div className="rounded-xl border bg-card p-3 space-y-2">
											<div className="flex items-center gap-3">
												<div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border">
													<UserIcon className="w-6 h-6 text-primary" />
												</div>
												<div className="min-w-0 flex-1">
													<h2 className="text-base font-bold leading-tight">
														{twin.profile.first_name} {twin.profile.last_name}
													</h2>
													<p className="text-[11px] text-muted-foreground">
														{twin.profile.gender}, {twin.profile.age} years
													</p>
												</div>
											</div>
											<div className="grid grid-cols-2 gap-1.5 text-[10px]">
												<div className="rounded-md bg-muted/50 px-2 py-1.5">
													<span className="text-muted-foreground">DOB</span>
													<p className="font-medium">{twin.profile.dob}</p>
												</div>
												<div className="rounded-md bg-muted/50 px-2 py-1.5">
													<span className="text-muted-foreground">MRN</span>
													<p className="font-mono font-medium">
														{twin.profile.mrn}
													</p>
												</div>
												<div className="rounded-md bg-muted/50 px-2 py-1.5">
													<span className="text-muted-foreground">Blood</span>
													<p className="font-bold text-red-600 dark:text-red-400">
														<ShieldIcon className="w-2.5 h-2.5 inline mr-0.5" />
														{twin.profile.blood_type}
													</p>
												</div>
												<div className="rounded-md bg-muted/50 px-2 py-1.5">
													<span className="text-muted-foreground">Updated</span>
													<p className="font-medium">
														{new Date(twin.last_updated).toLocaleDateString()}
													</p>
												</div>
											</div>
											{twin.profile.allergies.length > 0 && (
												<div className="flex flex-wrap gap-1">
													<span className="text-[9px] text-red-600 dark:text-red-400 font-bold uppercase w-full">
														Allergies
													</span>
													{twin.profile.allergies.map((a) => (
														<span
															key={a}
															className="inline-flex items-center gap-0.5 rounded bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 text-[10px] text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
														>
															<AlertTriangleIcon className="w-2.5 h-2.5" /> {a}
														</span>
													))}
												</div>
											)}
										</div>

										{/* Vitals */}
										<div className="rounded-xl border bg-card p-3">
											<SectionHead
												icon={<HeartPulseIcon className="w-3.5 h-3.5" />}
												title="Vitals"
												count={twin.vitals.length}
											/>
											<div className="space-y-1.5">
												{twin.vitals.map((v) => {
													const maxMap: Record<string, number> = {
														"heart rate": 180,
														"blood pressure": 200,
														temperature: 42,
														spo2: 100,
														"respiratory rate": 40,
													};
													const max = maxMap[v.name.toLowerCase()] || 200;
													return (
														<div
															key={v.name}
															className="flex items-center gap-2 rounded-lg border px-2.5 py-2 group hover:bg-muted/30 transition-colors"
														>
															<span
																className={`shrink-0 ${v.status === "normal" ? "text-emerald-500" : v.status === "warning" ? "text-amber-500" : "text-red-500"}`}
															>
																{vitalIcon(v.name)}
															</span>
															<div className="flex-1 min-w-0">
																<p className="text-[10px] text-muted-foreground leading-none">
																	{v.name}
																</p>
																<p className="text-sm font-bold font-mono leading-tight mt-0.5">
																	{v.value}
																	<span className="text-[10px] font-normal text-muted-foreground ml-0.5">
																		{v.unit}
																	</span>
																</p>
															</div>
															<MiniSpark
																value={v.value}
																max={max}
																color={
																	v.status === "normal"
																		? "#22c55e"
																		: v.status === "warning"
																			? "#eab308"
																			: "#ef4444"
																}
															/>
															<div
																className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot(v.status)}`}
															/>
														</div>
													);
												})}
											</div>
										</div>
									</div>

									{/* ── Column 2: Body Model + Conditions + Meds (3 cols) ── */}
									<div className="col-span-12 lg:col-span-3 space-y-3">
										{/* Body model */}
										<div className="rounded-xl border bg-card p-3">
											<SectionHead
												icon={<UserIcon className="w-3.5 h-3.5" />}
												title="Body Map"
												count={twin.conditions.length}
											/>
											<BodyModel conditions={twin.conditions} />
											<p className="text-[9px] text-center text-muted-foreground mt-1">
												Hover hotspots to view conditions
											</p>
										</div>

										{/* Conditions list */}
										<div className="rounded-xl border bg-card p-3">
											<SectionHead
												icon={<AlertTriangleIcon className="w-3.5 h-3.5" />}
												title="Conditions"
												count={twin.conditions.length}
											/>
											<div className="space-y-1.5">
												{twin.conditions.map((c) => (
													<div
														key={c.icd10}
														className="rounded-lg border px-2.5 py-2 hover:bg-muted/30 transition-colors"
													>
														<div className="flex items-start justify-between gap-1">
															<p className="text-xs font-semibold leading-tight">
																{c.name}
															</p>
															<span className="text-[9px] font-mono text-muted-foreground shrink-0">
																{c.icd10}
															</span>
														</div>
														<p className="text-[10px] text-muted-foreground mt-0.5">
															{c.status} · since {c.onset_date}
														</p>
														{c.symptoms.length > 0 && (
															<div className="flex flex-wrap gap-0.5 mt-1">
																{c.symptoms.map((s) => (
																	<span
																		key={s}
																		className="rounded bg-muted px-1 py-0.5 text-[9px]"
																	>
																		{s}
																	</span>
																))}
															</div>
														)}
													</div>
												))}
											</div>
										</div>

										{/* Medications */}
										<div className="rounded-xl border bg-card p-3">
											<SectionHead
												icon={<PillIcon className="w-3.5 h-3.5" />}
												title="Medications"
												count={twin.medications.length}
											/>
											<div className="space-y-1.5">
												{twin.medications.map((m) => (
													<div
														key={`${m.name}-${m.dosage}`}
														className="rounded-lg border px-2.5 py-2 hover:bg-muted/30 transition-colors"
													>
														<div className="flex items-center justify-between gap-1">
															<p className="text-xs font-semibold">{m.name}</p>
															{m.active ? (
																<span
																	className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"
																	title="Active"
																/>
															) : (
																<span
																	className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"
																	title="Inactive"
																/>
															)}
														</div>
														<p className="text-[10px] text-muted-foreground">
															{m.dosage} · {m.frequency} · {m.route}
														</p>
														<div className="mt-1.5">
															<AdherenceBar pct={m.adherence_pct} />
														</div>
													</div>
												))}
											</div>
										</div>
									</div>

									{/* ── Column 3: Labs + Imaging (3 cols) ── */}
									<div className="col-span-12 lg:col-span-3 space-y-3">
										{/* Lab Results */}
										<div className="rounded-xl border bg-card p-3">
											<SectionHead
												icon={<ActivityIcon className="w-3.5 h-3.5" />}
												title="Labs"
												count={twin.labs.length}
											/>
											<div className="overflow-x-auto">
												<table className="w-full text-[11px]">
													<thead>
														<tr className="border-b">
															<th className="text-left py-1.5 font-semibold text-muted-foreground">
																Test
															</th>
															<th className="text-right py-1.5 font-semibold text-muted-foreground">
																Value
															</th>
															<th className="text-right py-1.5 font-semibold text-muted-foreground">
																Ref
															</th>
															<th className="text-center py-1.5 font-semibold text-muted-foreground">
																Status
															</th>
														</tr>
													</thead>
													<tbody>
														{twin.labs.map((l) => (
															<tr
																key={l.loinc_code}
																className="border-b last:border-0 hover:bg-muted/30 transition-colors"
															>
																<td className="py-1.5 font-medium">{l.name}</td>
																<td className="text-right py-1.5 font-mono font-bold">
																	{l.value}{" "}
																	<span className="font-normal text-muted-foreground">
																		{l.unit}
																	</span>
																</td>
																<td className="text-right py-1.5 text-muted-foreground">
																	{l.reference_range}
																</td>
																<td className="text-center py-1.5">
																	<span
																		className={`inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold ${statusBg(l.status)}`}
																	>
																		{l.status}
																	</span>
																</td>
															</tr>
														))}
													</tbody>
												</table>
											</div>
										</div>

										{/* Imaging */}
										<div className="rounded-xl border bg-card p-3">
											<SectionHead
												icon={<ScanIcon className="w-3.5 h-3.5" />}
												title="Imaging"
												count={twin.imaging.length}
											/>
											<div className="space-y-1.5">
												{twin.imaging.map((img, i) => (
													<div
														key={`img-${i}`}
														className="rounded-lg border p-2.5 hover:bg-muted/30 transition-colors"
													>
														<div className="flex items-center gap-2">
															<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shrink-0 border">
																<ScanIcon className="w-5 h-5 text-muted-foreground" />
															</div>
															<div className="min-w-0 flex-1">
																<p className="text-xs font-semibold">
																	{img.modality}
																</p>
																<p className="text-[10px] text-muted-foreground">
																	{img.body_region} · {img.date}
																</p>
															</div>
														</div>
														<p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
															{img.findings}
														</p>
														{img.ai_description && (
															<div className="mt-1.5 rounded bg-primary/5 border border-primary/10 px-2 py-1">
																<p className="text-[10px] text-primary flex items-start gap-1">
																	<BrainIcon className="w-3 h-3 shrink-0 mt-0.5" />
																	{img.ai_description}
																</p>
															</div>
														)}
													</div>
												))}
											</div>
										</div>
									</div>

									{/* ── Column 4: Risk + Tasks (3 cols) ── */}
									<div className="col-span-12 lg:col-span-3 space-y-3">
										{/* Risk Score */}
										<div className="rounded-xl border bg-card p-3">
											<SectionHead
												icon={<BrainIcon className="w-3.5 h-3.5" />}
												title="Risk Score"
											/>
											<RiskArc score={twin.risk_score} size={160} />
											<Button
												size="sm"
												className="w-full text-xs mt-2"
												onClick={handlePredict}
												disabled={isPredicting}
											>
												<BrainIcon className="w-3 h-3 mr-1" />
												{isPredicting
													? "Predicting..."
													: "Run 30-Day Prediction"}
											</Button>
											{prediction && (
												<div className="mt-3 space-y-2">
													<div className="flex items-center justify-between rounded-lg bg-muted/50 p-2.5">
														<div>
															<p className="text-[10px] text-muted-foreground">
																Predicted
															</p>
															<p
																className={`text-xl font-bold font-mono ${riskMeta(prediction.score).cls}`}
															>
																{prediction.score.toFixed(1)}
															</p>
														</div>
														<div className="text-right">
															<p className="text-[10px] text-muted-foreground">
																Confidence
															</p>
															<p className="text-lg font-bold font-mono">
																{(prediction.confidence * 100).toFixed(0)}%
															</p>
														</div>
													</div>
													{prediction.factors.length > 0 && (
														<div className="space-y-1">
															<p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
																Risk Factors
															</p>
															{prediction.factors.map((f, i) => (
																<div
																	key={`pf-${i}`}
																	className="flex items-start gap-1.5 text-[10px] rounded-md border px-2 py-1.5"
																>
																	<span
																		className={`font-bold font-mono shrink-0 ${f.impact > 0 ? "text-red-500" : "text-emerald-500"}`}
																	>
																		{f.impact > 0 ? "+" : ""}
																		{f.impact.toFixed(1)}
																	</span>
																	<div>
																		<p className="font-medium">{f.factor}</p>
																		<p className="text-muted-foreground">
																			{f.detail}
																		</p>
																	</div>
																</div>
															))}
														</div>
													)}
													{prediction.recommendations.length > 0 && (
														<div className="space-y-1">
															<p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
																Recommendations
															</p>
															{prediction.recommendations.map((r, i) => (
																<div
																	key={`rec-${i}`}
																	className="flex items-start gap-1 text-[10px]"
																>
																	<CheckCircleIcon className="w-3 h-3 text-primary shrink-0 mt-0.5" />
																	<span>{r}</span>
																</div>
															))}
														</div>
													)}
												</div>
											)}
										</div>

										{/* Tasks */}
										<div className="rounded-xl border bg-card p-3">
											<SectionHead
												icon={<ClipboardListIcon className="w-3.5 h-3.5" />}
												title="Tasks"
												count={twin.tasks.length}
											/>
											<div className="space-y-1">
												{twin.tasks.map((t, i) => (
													<div
														key={`task-${i}`}
														className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/30 transition-colors"
													>
														{t.completed ? (
															<CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
														) : (
															<div className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
														)}
														<div className="flex-1 min-w-0">
															<p
																className={`text-[11px] font-medium truncate ${t.completed ? "line-through text-muted-foreground" : ""}`}
															>
																{t.title}
															</p>
															<p className="text-[9px] text-muted-foreground">
																{t.due_date} · {t.assigned_to}
															</p>
														</div>
														<span
															className={`rounded px-1 py-0.5 text-[8px] font-bold uppercase ${
																t.priority === "high" || t.priority === "urgent"
																	? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
																	: t.priority === "medium"
																		? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
																		: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
															}`}
														>
															{t.priority}
														</span>
													</div>
												))}
											</div>
										</div>

										{/* Quick Timeline (last 3) */}
										<div className="rounded-xl border bg-card p-3">
											<SectionHead
												icon={<CalendarIcon className="w-3.5 h-3.5" />}
												title="Recent"
												count={twin.timeline.length}
											/>
											<div className="space-y-2">
												{twin.timeline.slice(0, 4).map((ev, i) => (
													<div
														key={`ev-${i}`}
														className="flex items-start gap-2"
													>
														<div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
															<CalendarIcon className="w-2.5 h-2.5 text-muted-foreground" />
														</div>
														<div className="min-w-0">
															<p className="text-[10px] font-mono text-muted-foreground">
																{ev.date}
															</p>
															<p className="text-[11px] font-medium">
																{ev.title}
															</p>
															<p className="text-[10px] text-muted-foreground">
																{ev.facility}
															</p>
														</div>
													</div>
												))}
												{twin.timeline.length > 4 && (
													<button
														type="button"
														onClick={() => setActiveTab("timeline")}
														className="text-[10px] text-primary font-medium hover:underline"
													>
														View all {twin.timeline.length} events →
													</button>
												)}
											</div>
										</div>
									</div>
								</div>
							)}

							{/* ═══ LABS TAB ═══ */}
							{activeTab === "labs" && (
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
									{/* Full lab table */}
									<div className="rounded-xl border bg-card p-4">
										<SectionHead
											icon={<ActivityIcon className="w-3.5 h-3.5" />}
											title="All Lab Results"
											count={twin.labs.length}
										/>
										<table className="w-full text-xs mt-2">
											<thead>
												<tr className="border-b text-muted-foreground">
													<th className="text-left py-2 font-semibold">Test</th>
													<th className="text-left py-2 font-semibold">
														LOINC
													</th>
													<th className="text-right py-2 font-semibold">
														Value
													</th>
													<th className="text-right py-2 font-semibold">
														Reference
													</th>
													<th className="text-center py-2 font-semibold">
														Status
													</th>
												</tr>
											</thead>
											<tbody>
												{twin.labs.map((l) => (
													<tr
														key={l.loinc_code}
														className="border-b last:border-0 hover:bg-muted/30"
													>
														<td className="py-2 font-medium">{l.name}</td>
														<td className="py-2 font-mono text-muted-foreground">
															{l.loinc_code}
														</td>
														<td className="text-right py-2 font-mono font-bold">
															{l.value}{" "}
															<span className="font-normal text-muted-foreground">
																{l.unit}
															</span>
														</td>
														<td className="text-right py-2 text-muted-foreground">
															{l.reference_range}
														</td>
														<td className="text-center py-2">
															<span
																className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${statusBg(l.status)}`}
															>
																{l.status}
															</span>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>

									{/* Lab visualization */}
									<div className="space-y-3">
										<div className="rounded-xl border bg-card p-4">
											<SectionHead
												icon={<ScanIcon className="w-3.5 h-3.5" />}
												title="Imaging Studies"
												count={twin.imaging.length}
											/>
											<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
												{twin.imaging.map((img, i) => (
													<div
														key={`img-lab-${i}`}
														className="rounded-lg border p-3 space-y-2"
													>
														<div className="aspect-[4/3] rounded-md bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center border">
															<ScanIcon className="w-10 h-10 text-muted-foreground/30" />
														</div>
														<div>
															<p className="text-xs font-semibold">
																{img.modality} — {img.body_region}
															</p>
															<p className="text-[10px] text-muted-foreground">
																{img.date}
															</p>
															<p className="text-[10px] text-muted-foreground mt-1">
																{img.findings}
															</p>
														</div>
													</div>
												))}
											</div>
										</div>
									</div>
								</div>
							)}

							{/* ═══ TIMELINE TAB ═══ */}
							{activeTab === "timeline" && (
								<div className="max-w-2xl mx-auto">
									<div className="rounded-xl border bg-card p-4">
										<SectionHead
											icon={<CalendarIcon className="w-3.5 h-3.5" />}
											title="Medical Timeline"
											count={twin.timeline.length}
										/>
										<div className="relative pl-6 mt-4">
											<div className="absolute left-[9px] top-0 bottom-0 w-px bg-border" />
											<div className="space-y-4">
												{twin.timeline.map((ev, i) => (
													<div key={`tl-${i}`} className="relative">
														<div className="absolute -left-6 top-1 w-[18px] h-[18px] rounded-full bg-card border-2 border-primary flex items-center justify-center">
															<div className="w-2 h-2 rounded-full bg-primary" />
														</div>
														<div className="rounded-lg border p-3 hover:bg-muted/30 transition-colors">
															<div className="flex items-center gap-2 mb-1">
																<span className="font-mono text-[10px] text-muted-foreground">
																	{ev.date}
																</span>
																<span className="rounded bg-primary/10 text-primary px-1.5 py-0.5 text-[9px] font-bold uppercase">
																	{ev.event_type}
																</span>
															</div>
															<p className="text-sm font-semibold">
																{ev.title}
															</p>
															<p className="text-xs text-muted-foreground mt-0.5">
																{ev.description}
															</p>
															{(ev.facility || ev.provider) && (
																<p className="text-[10px] text-muted-foreground/60 mt-1">
																	{[ev.facility, ev.provider]
																		.filter(Boolean)
																		.join(" — ")}
																</p>
															)}
														</div>
													</div>
												))}
											</div>
										</div>
									</div>
								</div>
							)}
						</div>
					) : (
						/* ─── Empty State ─── */
						<div className="flex-1 flex items-center justify-center p-8 h-full">
							<div className="text-center space-y-4 max-w-md">
								<div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border flex items-center justify-center">
									<HeartPulseIcon className="w-10 h-10 text-primary/50" />
								</div>
								<div>
									<h3 className="text-lg font-bold">Digital Twin Dashboard</h3>
									<p className="text-sm text-muted-foreground mt-1">
										Enter a Patient ID and click <strong>Load Twin</strong> to
										view a comprehensive holistic view — vitals, labs,
										conditions, medications, imaging, and AI risk prediction.
									</p>
								</div>
								<Button
									size="sm"
									className="text-xs"
									onClick={() => handleLoad("1")}
								>
									Load Demo Patient (ID: 1)
								</Button>
								{isLoading && (
									<p className="text-xs text-muted-foreground animate-pulse">
										Loading patient data...
									</p>
								)}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* ─── API Topology ─── */}
			<div className="px-4 py-2 border-t">
				<details className="group">
					<summary className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
						<LayersIcon className="w-3.5 h-3.5" />
						<span className="font-medium">API Topology & Architecture</span>
						<span className="text-[10px] ml-auto group-open:hidden">Show</span>
						<span className="text-[10px] ml-auto hidden group-open:inline">
							Hide
						</span>
					</summary>
					<div className="mt-2 pb-2 space-y-2">
						<ApiTopology {...TOPOLOGIES.digital_twin} />
						<div className="rounded-lg bg-muted/30 border p-3 text-[11px] text-muted-foreground">
							<p className="font-semibold text-foreground mb-1">
								Underlying APIs (9 endpoints)
							</p>
							<div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
								{[
									"POST /digital_twin/sync",
									"GET /digital_twin/{id}",
									"GET /…/profile",
									"GET /…/vitals",
									"GET /…/labs",
									"GET /…/conditions",
									"GET /…/medications",
									"GET /…/imaging",
									"POST /…/{id}/predict",
								].map((ep) => (
									<span key={ep} className="font-mono text-[10px]">
										{ep}
									</span>
								))}
							</div>
						</div>
					</div>
				</details>
			</div>
		</DashboardLayout>
	);
}
