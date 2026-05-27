import {
	ActivityIcon,
	AlertTriangleIcon,
	ArrowRightIcon,
	BellIcon,
	CalendarIcon,
	CheckCircle2Icon,
	ChevronDownIcon,
	ChevronUpIcon,
	CircleDotIcon,
	ClipboardListIcon,
	ClockIcon,
	DropletIcon,
	FileTextIcon,
	HeartPulseIcon,
	LinkIcon,
	MessageSquareIcon,
	PillIcon,
	ScanIcon,
	ShieldCheckIcon,
	SparklesIcon,
	StethoscopeIcon,
	UserIcon,
	UsersIcon,
	XCircleIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { toast } from "sonner";
import { ApiTopology, TOPOLOGIES } from "@/components/api-topology";
import { Button } from "@/components/shadcn/button";
import { BASE_API_URL } from "@/config/api-routes";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";

const TWIN_BASE = `${BASE_API_URL}service/api/v1/digital_twin`;

interface VitalSign {
	name: string;
	value: number;
	unit: string;
	status: string;
}
interface LabResult {
	name: string;
	value: number;
	unit: string;
	reference_range: string;
	status: string;
}
interface Condition {
	name: string;
	icd10: string;
	onset_date: string | null;
	status: string;
	symptoms: string[];
}
interface Medication {
	name: string;
	dosage: string;
	frequency: string;
	active: boolean;
	adherence_pct: number;
}
interface ImagingStudy {
	modality: string;
	body_region: string;
	date: string;
	findings: string;
}
interface ClinicalTask {
	title: string;
	due_date: string | null;
	priority: string;
	completed: boolean;
}
interface TimelineEvent {
	date: string;
	event_type: string;
	title: string;
	description: string;
	facility: string;
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
interface TwinData {
	profile: PatientProfile;
	vitals: VitalSign[];
	labs: LabResult[];
	conditions: Condition[];
	medications: Medication[];
	imaging: ImagingStudy[];
	tasks: ClinicalTask[];
	timeline: TimelineEvent[];
	risk_score: number;
}

const STATUS_DOT: Record<string, string> = {
	normal: "bg-green-500",
	warning: "bg-amber-500",
	critical: "bg-red-500",
	high: "bg-red-500",
	low: "bg-amber-500",
};

const PRIORITY_COLORS: Record<string, string> = {
	urgent: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
	high: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
	medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
	low: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

/* ─── Mock data for operational sections ─── */
const CARE_TEAM = [
	{ name: "Dr Smith", role: "GP", initials: "DS", color: "bg-blue-500" },
	{
		name: "Dr Eshun",
		role: "Cardiologist",
		initials: "DE",
		color: "bg-emerald-500",
	},
	{
		name: "Dr Tommy",
		role: "Resp. Therapy",
		initials: "DT",
		color: "bg-purple-500",
	},
];

const UPCOMING_APPOINTMENT = {
	day: 23,
	month: "September",
	year: 2026,
	reason: "Chest Pain",
	location: "Mayo Clinic",
};

interface HospitalIssue {
	label: string;
	status: "active" | "resolved" | "inactive";
}
const HOSPITAL_ISSUES: HospitalIssue[] = [
	{ label: "DVT prophylaxis", status: "active" },
	{ label: "Septic shock", status: "resolved" },
	{ label: "Urinary retention", status: "resolved" },
	{ label: "Osteoporosis", status: "inactive" },
	{ label: "Depression", status: "inactive" },
];

interface ClinicalNote {
	title: string;
	author: string;
	date: string;
	snippet: string;
}
const CLINICAL_NOTES: ClinicalNote[] = [
	{
		title: "Shortness of Breath",
		author: "Dr Smith (GP)",
		date: "1 Today, 07:18",
		snippet:
			"Quite sick overnight but has responded well to IV antibiotics and continued ventolin.",
	},
	{
		title: "Post-op Follow-up",
		author: "Dr Eshun",
		date: "Yesterday, 14:30",
		snippet:
			"Surgical site healing well. Continue current wound care protocol.",
	},
];

interface Recommendation {
	text: string;
	from: string;
}
const RECOMMENDATIONS: Recommendation[] = [
	{
		text: "Respond to the text message from Patient Frederick Johnson",
		from: "System",
	},
	{ text: "Review lab results — Potassium flagged high", from: "Lab" },
	{ text: "Schedule follow-up pulmonary function test", from: "Dr Tommy" },
];

/* ─── Body condition hotspot map ─── */
const BODY_HOTSPOTS: { x: number; y: number; label: string; region: string }[] =
	[
		{ x: 50, y: 12, label: "Migraine", region: "Head" },
		{ x: 45, y: 32, label: "Chest Pain", region: "Chest" },
		{ x: 55, y: 45, label: "Abdominal Pain", region: "Abdomen" },
		{ x: 35, y: 62, label: "Joint Inflammation", region: "Hip" },
		{ x: 58, y: 78, label: "DVT Risk", region: "Lower Leg" },
	];

/* ─── Sub-components ─── */

function SectionHead({
	icon: Icon,
	title,
	count,
	className = "",
}: {
	icon: typeof HeartPulseIcon;
	title: string;
	count?: number;
	className?: string;
}) {
	return (
		<div className={`flex items-center gap-2 mb-3 ${className}`}>
			<Icon className="size-4 text-primary" />
			<h3 className="text-xs font-bold uppercase tracking-wider">{title}</h3>
			{count !== undefined && (
				<span className="ml-auto text-[10px] font-mono font-bold bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
					{count}
				</span>
			)}
		</div>
	);
}

function AdherenceBar({ pct }: { pct: number }) {
	const color =
		pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500";
	return (
		<div className="flex items-center gap-2">
			<div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
				<div
					className={`h-full rounded-full ${color} transition-all duration-500`}
					style={{ width: `${pct}%` }}
				/>
			</div>
			<span className="text-[10px] font-mono text-muted-foreground w-8 text-right">
				{pct}%
			</span>
		</div>
	);
}

function MiniSparkline({
	value,
	max = 200,
	status,
}: {
	value: number;
	max?: number;
	status: string;
}) {
	const pct = Math.min((value / max) * 100, 100);
	const barColor =
		status === "critical" || status === "high"
			? "bg-red-500"
			: status === "warning" || status === "low"
				? "bg-amber-500"
				: "bg-emerald-500";
	// Generate 5 pseudo-random bars for a sparkline effect
	const bars = [0.4, 0.7, 0.55, 0.85, pct / 100];
	return (
		<div className="flex items-end gap-px h-4">
			{bars.map((b, i) => (
				<div
					key={i}
					className={`w-1 rounded-sm ${i === bars.length - 1 ? barColor : "bg-muted-foreground/20"} transition-all`}
					style={{ height: `${Math.max(b * 100, 15)}%` }}
				/>
			))}
		</div>
	);
}

function BodySilhouette({ conditions }: { conditions: Condition[] }) {
	const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

	// Map real conditions to hotspots when available
	const hotspots =
		conditions.length > 0
			? BODY_HOTSPOTS.slice(0, Math.max(conditions.length, 3))
			: BODY_HOTSPOTS;

	return (
		<div
			className="relative w-full"
			style={{ maxWidth: 220, margin: "0 auto" }}
		>
			{/* SVG body silhouette */}
			<svg
				role="img"
				aria-label="Human body silhouette"
				viewBox="0 0 100 200"
				className="w-full h-auto text-muted-foreground/20"
				fill="currentColor"
			>
				{/* Head */}
				<ellipse cx="50" cy="20" rx="12" ry="14" />
				{/* Neck */}
				<rect x="46" y="34" width="8" height="8" rx="2" />
				{/* Torso */}
				<path d="M32 42 C32 42 28 44 28 50 L28 90 C28 96 34 100 40 100 L60 100 C66 100 72 96 72 90 L72 50 C72 44 68 42 68 42 Z" />
				{/* Left arm */}
				<path
					d="M28 46 C22 48 18 56 16 70 C14 80 16 90 18 92 C20 94 22 92 24 88 L28 70 Z"
					opacity="0.8"
				/>
				{/* Right arm */}
				<path
					d="M72 46 C78 48 82 56 84 70 C86 80 84 90 82 92 C80 94 78 92 76 88 L72 70 Z"
					opacity="0.8"
				/>
				{/* Left leg */}
				<path
					d="M38 100 L34 140 L32 170 C32 174 34 178 38 178 L42 178 C44 178 44 174 44 172 L44 140 L46 100 Z"
					opacity="0.8"
				/>
				{/* Right leg */}
				<path
					d="M54 100 L56 140 L56 172 C56 174 56 178 58 178 L62 178 C66 178 68 174 68 170 L66 140 L62 100 Z"
					opacity="0.8"
				/>
			</svg>

			{/* Animated hotspot dots */}
			{hotspots.map((spot, i) => (
				<button
					type="button"
					key={i}
					className="absolute group cursor-pointer"
					style={{
						left: `${spot.x}%`,
						top: `${spot.y}%`,
						transform: "translate(-50%, -50%)",
					}}
					onMouseEnter={() => setHoveredIdx(i)}
					onMouseLeave={() => setHoveredIdx(null)}
				>
					{/* Pulse ring */}
					<span className="absolute inset-0 size-4 -m-1 rounded-full bg-red-500/30 animate-ping" />
					{/* Dot */}
					<span className="relative block size-2.5 rounded-full bg-red-500 ring-2 ring-red-500/40" />
					{/* Tooltip */}
					{hoveredIdx === i && (
						<div className="absolute left-4 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-lg border bg-popover px-2.5 py-1.5 text-[11px] font-medium shadow-lg">
							<span className="text-red-500 font-bold">{spot.region}</span>
							<span className="text-muted-foreground"> — {spot.label}</span>
						</div>
					)}
				</button>
			))}
		</div>
	);
}

function _RiskGauge({ score }: { score: number }) {
	const color =
		score >= 80
			? "#ef4444"
			: score >= 60
				? "#f59e0b"
				: score >= 40
					? "#3b82f6"
					: "#22c55e";
	const circumference = 2 * Math.PI * 36;
	const offset = circumference - (score / 100) * circumference;
	return (
		<div className="relative w-20 h-20">
			<svg
				viewBox="0 0 80 80"
				className="w-full h-full -rotate-90"
				role="img"
				aria-label={`Risk score ${score}`}
			>
				<circle
					cx="40"
					cy="40"
					r="36"
					fill="none"
					stroke="currentColor"
					strokeWidth="6"
					className="text-muted/20"
				/>
				<circle
					cx="40"
					cy="40"
					r="36"
					fill="none"
					stroke={color}
					strokeWidth="6"
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					className="transition-all duration-1000"
				/>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<span className="text-lg font-bold" style={{ color }}>
					{Math.round(score)}
				</span>
				<span className="text-[9px] text-muted-foreground uppercase">Risk</span>
			</div>
		</div>
	);
}

function SkeletonCard({ className = "" }: { className?: string }) {
	return (
		<div className={`rounded-xl border bg-card animate-pulse ${className}`}>
			<div className="p-4 space-y-3">
				<div className="h-3 bg-muted rounded w-1/3" />
				<div className="h-2 bg-muted rounded w-2/3" />
				<div className="h-2 bg-muted rounded w-1/2" />
			</div>
		</div>
	);
}

/* ─── Tab type ─── */
type TabId = "overview" | "notes" | "investigations";

export default function HealthcareDashboardPage() {
	const [patientId, setPatientId] = useState("1");
	const [data, setData] = useState<TwinData | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [activeTab, setActiveTab] = useState<TabId>("overview");
	const [topologyOpen, setTopologyOpen] = useState(false);

	const loadPatient = useCallback(
		async (pid?: string) => {
			const id = pid || patientId;
			setIsLoading(true);
			try {
				const url = `${TWIN_BASE}/${id}`;
				const headers = await getAuthHeaders(url);
				const resp = await fetch(url, { headers });
				if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
				setData(await resp.json());
				toast.success("Patient data loaded");
			} catch (err) {
				toast.error(err instanceof Error ? err.message : "Failed to load");
			} finally {
				setIsLoading(false);
			}
		},
		[patientId]
	);

	useEffect(() => {
		loadPatient("1");
	}, [loadPatient]);

	const tabs: { id: TabId; label: string }[] = [
		{ id: "overview", label: "Overview" },
		{ id: "notes", label: "Notes & Graphs" },
		{ id: "investigations", label: "Investigations" },
	];

	const urgentTasks =
		data?.tasks.filter(
			(t) => !t.completed && (t.priority === "urgent" || t.priority === "high")
		) || [];
	const activeIssues = HOSPITAL_ISSUES.filter((i) => i.status === "active");
	const resolvedIssues = HOSPITAL_ISSUES.filter((i) => i.status === "resolved");
	const inactiveIssues = HOSPITAL_ISSUES.filter((i) => i.status === "inactive");

	return (
		<DashboardLayout pageTitle="Healthcare Dashboard">
			<div className="space-y-4 pb-8">
				{/* ─── Top bar ─── */}
				<div className="flex items-center justify-between gap-3 flex-wrap">
					<div className="flex items-center gap-2">
						<input
							value={patientId}
							onChange={(e) => setPatientId(e.target.value)}
							placeholder="Patient ID"
							className="w-24 rounded-md border bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
						/>
						<Button
							size="sm"
							className="h-8"
							onClick={() => loadPatient()}
							disabled={isLoading}
						>
							{isLoading ? (
								<span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
							) : (
								"Load Patient"
							)}
						</Button>
					</div>
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<SparklesIcon className="size-3.5 text-primary" />
						<span>
							Powered by <strong>Venera API Hub</strong>
						</span>
						{data && <span className="text-[10px]">· Synced just now</span>}
					</div>
				</div>

				{isLoading && (
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
						{Array.from({ length: 8 }).map((_, i) => (
							<SkeletonCard key={i} className="h-48" />
						))}
					</div>
				)}

				{data && !isLoading && (
					<>
						{/* ─── Tab navigation ─── */}
						<div className="flex items-center gap-0 border-b">
							{tabs.map((tab) => (
								<button
									type="button"
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
										activeTab === tab.id
											? "text-foreground"
											: "text-muted-foreground hover:text-foreground"
									}`}
								>
									{tab.label}
									{activeTab === tab.id && (
										<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />
									)}
								</button>
							))}
						</div>

						{/* ─── Clinical Alerts Bar ─── */}
						{urgentTasks.length > 0 && (
							<div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-3">
								<div className="flex items-center gap-2 mb-2">
									<BellIcon className="size-4 text-red-500" />
									<span className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-300">
										Action Required
									</span>
									<span className="text-[10px] font-mono font-bold bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded-full">
										{urgentTasks.length}
									</span>
								</div>
								<div className="flex flex-wrap gap-2">
									{urgentTasks.map((t, i) => (
										<div
											key={i}
											className="flex items-center gap-2 rounded-lg bg-white/60 dark:bg-white/5 border border-red-200 dark:border-red-900/30 px-3 py-1.5 text-xs"
										>
											<AlertTriangleIcon className="size-3 text-red-500 shrink-0" />
											<span className="font-medium">{t.title}</span>
											<span
												className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${PRIORITY_COLORS[t.priority]}`}
											>
												{t.priority}
											</span>
										</div>
									))}
								</div>
							</div>
						)}

						{/* ─── OVERVIEW TAB ─── */}
						{activeTab === "overview" && (
							<div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
								{/* ── Column 1: Patient + Vitals ── */}
								<div className="space-y-4">
									{/* Patient card */}
									<div className="rounded-xl border bg-card p-4 hover:bg-muted/30 transition-colors">
										<div className="flex items-center gap-3 mb-3">
											<div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
												{data.profile.first_name[0]}
												{data.profile.last_name[0]}
											</div>
											<div className="flex-1 min-w-0">
												<h2 className="text-base font-bold truncate">
													{data.profile.first_name} {data.profile.last_name}
												</h2>
												<div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
													<span>
														{data.profile.gender === "M" ? "Male" : "Female"}
													</span>
													<span>·</span>
													<span>DOB {data.profile.dob}</span>
												</div>
											</div>
										</div>
										<div className="grid grid-cols-2 gap-2 text-[11px]">
											<div className="rounded-lg bg-muted/40 px-2 py-1.5">
												<span className="text-muted-foreground">MRN</span>
												<p className="font-mono font-bold">
													{data.profile.mrn}
												</p>
											</div>
											<div className="rounded-lg bg-muted/40 px-2 py-1.5">
												<span className="text-muted-foreground">Age</span>
												<p className="font-mono font-bold">
													{data.profile.age}
												</p>
											</div>
											<div className="rounded-lg bg-muted/40 px-2 py-1.5">
												<span className="text-muted-foreground">Blood</span>
												<p className="font-mono font-bold flex items-center gap-1">
													<DropletIcon className="size-3 text-red-500" />
													{data.profile.blood_type}
												</p>
											</div>
											<div className="rounded-lg bg-muted/40 px-2 py-1.5">
												<span className="text-muted-foreground">Risk</span>
												<p
													className="font-mono font-bold"
													style={{
														color:
															data.risk_score >= 60
																? "#ef4444"
																: data.risk_score >= 40
																	? "#f59e0b"
																	: "#22c55e",
													}}
												>
													{data.risk_score}/100
												</p>
											</div>
										</div>
										{data.profile.allergies.length > 0 && (
											<div className="mt-3">
												<span className="text-[10px] font-bold uppercase text-red-500 tracking-wider">
													Allergies
												</span>
												<div className="flex flex-wrap gap-1 mt-1">
													{data.profile.allergies.map((a) => (
														<span
															key={a}
															className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
														>
															<AlertTriangleIcon className="size-2.5" />
															{a}
														</span>
													))}
												</div>
											</div>
										)}
									</div>

									{/* Vitals */}
									<div className="rounded-xl border bg-card p-4 hover:bg-muted/30 transition-colors">
										<SectionHead
											icon={HeartPulseIcon}
											title="Vitals"
											count={data.vitals.length}
										/>
										<div className="space-y-2">
											{data.vitals.map((v) => (
												<div
													key={v.name}
													className="rounded-lg border p-2.5 hover:bg-muted/20 transition-colors"
												>
													<div className="flex items-center justify-between mb-1">
														<span className="text-[10px] text-muted-foreground truncate">
															{v.name}
														</span>
														<span
															className={`size-2 rounded-full ${STATUS_DOT[v.status] || "bg-gray-400"}`}
														/>
													</div>
													<div className="flex items-center justify-between">
														<div className="flex items-baseline gap-1">
															<span className="text-base font-bold font-mono">
																{v.value}
															</span>
															<span className="text-[10px] text-muted-foreground">
																{v.unit}
															</span>
														</div>
														<MiniSparkline value={v.value} status={v.status} />
													</div>
												</div>
											))}
										</div>
									</div>
								</div>

								{/* ── Column 2: Body Silhouette + Problems + Medications ── */}
								<div className="space-y-4">
									{/* Body Silhouette */}
									<div className="rounded-xl border bg-card p-4 hover:bg-muted/30 transition-colors">
										<SectionHead
											icon={UserIcon}
											title="Body Map"
											count={BODY_HOTSPOTS.length}
										/>
										<BodySilhouette conditions={data.conditions} />
									</div>

									{/* Conditions / Problems */}
									<div className="rounded-xl border bg-card p-4 hover:bg-muted/30 transition-colors">
										<SectionHead
											icon={AlertTriangleIcon}
											title="Problems"
											count={data.conditions.length}
										/>
										<div className="space-y-1.5">
											{data.conditions.map((c, i) => (
												<div
													key={i}
													className="flex items-start gap-2 text-xs py-1.5 border-b border-muted/50 last:border-0"
												>
													<CircleDotIcon
														className={`size-3 shrink-0 mt-0.5 ${c.status === "active" ? "text-red-500" : "text-muted-foreground"}`}
													/>
													<div className="flex-1 min-w-0">
														<span className="font-medium">{c.name}</span>
														{c.icd10 && (
															<span className="ml-1.5 text-[10px] font-mono text-muted-foreground bg-muted px-1 py-0.5 rounded">
																{c.icd10}
															</span>
														)}
													</div>
												</div>
											))}
										</div>
									</div>

									{/* Medications */}
									<div className="rounded-xl border bg-card p-4 hover:bg-muted/30 transition-colors">
										<SectionHead
											icon={PillIcon}
											title="Medications"
											count={data.medications.length}
										/>
										<div className="space-y-2">
											{data.medications.map((m, i) => (
												<div key={i} className="rounded-lg border p-2.5">
													<div className="flex items-center justify-between mb-0.5">
														<span className="text-xs font-semibold">
															{m.name}
														</span>
														<span
															className={`text-[10px] px-1.5 py-0.5 rounded ${m.active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}
														>
															{m.active ? "Active" : "Stopped"}
														</span>
													</div>
													<p className="text-[10px] text-muted-foreground font-mono">
														{m.dosage} · {m.frequency}
													</p>
													<div className="mt-1.5">
														<AdherenceBar pct={m.adherence_pct} />
													</div>
												</div>
											))}
										</div>
									</div>
								</div>

								{/* ── Column 3: Tasks + Labs ── */}
								<div className="space-y-4">
									{/* Tasks */}
									<div className="rounded-xl border bg-card p-4 hover:bg-muted/30 transition-colors">
										<SectionHead
											icon={ClipboardListIcon}
											title="Tasks"
											count={data.tasks.length}
										/>
										<div className="space-y-1.5">
											{data.tasks.map((t, i) => (
												<div
													key={i}
													className="flex items-center gap-2 text-xs py-1 border-b border-muted/50 last:border-0"
												>
													{t.completed ? (
														<CheckCircle2Icon className="size-3.5 text-emerald-500 shrink-0" />
													) : (
														<div className="size-3.5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
													)}
													<span
														className={`flex-1 ${t.completed ? "line-through text-muted-foreground" : ""}`}
													>
														{t.title}
													</span>
													<span
														className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${PRIORITY_COLORS[t.priority] || ""}`}
													>
														{t.priority}
													</span>
												</div>
											))}
										</div>
									</div>

									{/* Lab Results */}
									<div className="rounded-xl border bg-card p-4 hover:bg-muted/30 transition-colors">
										<SectionHead
											icon={ActivityIcon}
											title="Labs"
											count={data.labs.length}
										/>
										<div className="overflow-auto">
											<table className="w-full text-[11px]">
												<thead>
													<tr className="text-left text-[10px] uppercase text-muted-foreground border-b">
														<th className="pb-1.5 font-bold">Test</th>
														<th className="pb-1.5 font-bold text-right">
															Value
														</th>
														<th className="pb-1.5 font-bold text-right">Ref</th>
													</tr>
												</thead>
												<tbody>
													{data.labs.map((l, i) => (
														<tr
															key={i}
															className="border-b border-muted/50 last:border-0"
														>
															<td className="py-1.5 font-medium">{l.name}</td>
															<td
																className={`py-1.5 font-bold font-mono text-right ${l.status === "high" ? "text-red-600 dark:text-red-400" : l.status === "low" ? "text-amber-600 dark:text-amber-400" : ""}`}
															>
																{l.value}
																<span className="text-[9px] text-muted-foreground ml-0.5">
																	{l.unit}
																</span>
															</td>
															<td className="py-1.5 text-muted-foreground font-mono text-right">
																{l.reference_range}
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>

									{/* Imaging */}
									<div className="rounded-xl border bg-card p-4 hover:bg-muted/30 transition-colors">
										<SectionHead
											icon={ScanIcon}
											title="Imaging"
											count={data.imaging.length}
										/>
										<div className="space-y-2">
											{data.imaging.map((img, i) => (
												<div key={i} className="rounded-lg border p-2.5">
													<div className="flex items-center justify-between mb-1">
														<span className="text-xs font-semibold">
															{img.modality}
														</span>
														<span className="text-[10px] text-muted-foreground font-mono">
															{img.date}
														</span>
													</div>
													<p className="text-[10px] text-muted-foreground">
														{img.body_region}
													</p>
													{img.findings && (
														<p className="text-[11px] mt-1 text-foreground/80 leading-snug">
															{img.findings}
														</p>
													)}
												</div>
											))}
										</div>
									</div>
								</div>

								{/* ── Column 4: Sidebar — Appointments, Care Team, Issues, Notes, Recommendations ── */}
								<div className="space-y-4">
									{/* Upcoming Appointment */}
									<div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 p-4 hover:bg-amber-50/60 dark:hover:bg-amber-950/30 transition-colors">
										<SectionHead
											icon={CalendarIcon}
											title="Upcoming Appointment"
										/>
										<div className="flex items-center gap-3">
											<div className="text-center bg-white dark:bg-card rounded-xl border px-3 py-2 shadow-sm">
												<span className="block text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
													{UPCOMING_APPOINTMENT.day}
												</span>
												<span className="text-[10px] text-muted-foreground uppercase tracking-wider">
													{UPCOMING_APPOINTMENT.month.slice(0, 3)}
												</span>
											</div>
											<div>
												<p className="text-xs font-bold">
													{UPCOMING_APPOINTMENT.reason}
												</p>
												<p className="text-[10px] text-muted-foreground">
													{UPCOMING_APPOINTMENT.location}
												</p>
												<p className="text-[10px] text-muted-foreground font-mono">
													{UPCOMING_APPOINTMENT.month}{" "}
													{UPCOMING_APPOINTMENT.year}
												</p>
											</div>
										</div>
									</div>

									{/* Care Team */}
									<div className="rounded-xl border bg-card p-4 hover:bg-muted/30 transition-colors">
										<SectionHead
											icon={UsersIcon}
											title="Care Team"
											count={CARE_TEAM.length}
										/>
										<div className="flex flex-wrap gap-2">
											{CARE_TEAM.map((doc) => (
												<div
													key={doc.name}
													className="flex items-center gap-2 rounded-lg border px-2.5 py-2 hover:bg-muted/20 transition-colors flex-1 min-w-[120px]"
												>
													<div
														className={`size-8 rounded-full ${doc.color} flex items-center justify-center text-white text-[10px] font-bold`}
													>
														{doc.initials}
													</div>
													<div>
														<p className="text-xs font-semibold">{doc.name}</p>
														<p className="text-[10px] text-muted-foreground">
															{doc.role}
														</p>
													</div>
												</div>
											))}
										</div>
									</div>

									{/* Issues */}
									<div className="rounded-xl border bg-card p-4 hover:bg-muted/30 transition-colors">
										<SectionHead icon={ShieldCheckIcon} title="Issues" />

										{activeIssues.length > 0 && (
											<div className="mb-3">
												<p className="text-[10px] font-bold uppercase text-red-500 tracking-wider mb-1.5">
													Active Hospital Issues
												</p>
												{activeIssues.map((iss, i) => (
													<div
														key={i}
														className="flex items-center gap-2 text-xs py-1"
													>
														<span className="size-1.5 rounded-full bg-red-500" />
														<span>{iss.label}</span>
													</div>
												))}
											</div>
										)}
										{resolvedIssues.length > 0 && (
											<div className="mb-3">
												<p className="text-[10px] font-bold uppercase text-emerald-500 tracking-wider mb-1.5">
													Resolved Hospital Issues
												</p>
												{resolvedIssues.map((iss, i) => (
													<div
														key={i}
														className="flex items-center gap-2 text-xs py-1"
													>
														<CheckCircle2Icon className="size-3 text-emerald-500" />
														<span className="text-muted-foreground">
															{iss.label}
														</span>
													</div>
												))}
											</div>
										)}
										{inactiveIssues.length > 0 && (
											<div>
												<p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1.5">
													Inactive Chronic Issues
												</p>
												{inactiveIssues.map((iss, i) => (
													<div
														key={i}
														className="flex items-center gap-2 text-xs py-1"
													>
														<XCircleIcon className="size-3 text-muted-foreground/50" />
														<span className="text-muted-foreground">
															{iss.label}
														</span>
													</div>
												))}
											</div>
										)}
									</div>

									{/* Notes */}
									<div className="rounded-xl border bg-card p-4 hover:bg-muted/30 transition-colors">
										<SectionHead
											icon={FileTextIcon}
											title="Notes"
											count={CLINICAL_NOTES.length}
										/>
										<div className="space-y-3">
											{CLINICAL_NOTES.map((note, i) => (
												<div
													key={i}
													className="border-b border-muted/50 last:border-0 pb-2.5 last:pb-0"
												>
													<p className="text-xs font-bold">{note.title}</p>
													<div className="flex items-center gap-1.5 mt-0.5">
														<StethoscopeIcon className="size-2.5 text-muted-foreground" />
														<span className="text-[10px] text-muted-foreground">
															{note.author}
														</span>
														<span className="text-[10px] text-muted-foreground">
															· {note.date}
														</span>
													</div>
													<p className="text-[11px] text-foreground/70 mt-1 leading-snug">
														{note.snippet}
													</p>
												</div>
											))}
										</div>
									</div>

									{/* Recommendations */}
									<div className="rounded-xl border bg-card p-4 hover:bg-muted/30 transition-colors">
										<SectionHead
											icon={LinkIcon}
											title="Recommendations"
											count={RECOMMENDATIONS.length}
										/>
										<div className="space-y-2">
											{RECOMMENDATIONS.map((rec, i) => (
												<button
													type="button"
													key={i}
													className="w-full text-left rounded-lg border px-3 py-2 text-xs text-primary hover:bg-primary/5 transition-colors group"
												>
													<span className="group-hover:underline">
														{rec.text}
													</span>
													<p className="text-[10px] text-muted-foreground mt-0.5">
														From: {rec.from}
													</p>
												</button>
											))}
										</div>
									</div>
								</div>
							</div>
						)}

						{/* ─── NOTES & GRAPHS TAB ─── */}
						{activeTab === "notes" && (
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
								{/* Clinical Notes expanded */}
								<div className="rounded-xl border bg-card p-5 hover:bg-muted/30 transition-colors">
									<SectionHead
										icon={MessageSquareIcon}
										title="Clinical Notes"
										count={CLINICAL_NOTES.length}
									/>
									<div className="space-y-4">
										{CLINICAL_NOTES.map((note, i) => (
											<div key={i} className="rounded-lg border p-4">
												<div className="flex items-center justify-between mb-2">
													<h4 className="text-sm font-bold">{note.title}</h4>
													<span className="text-[10px] text-muted-foreground font-mono">
														{note.date}
													</span>
												</div>
												<div className="flex items-center gap-1.5 mb-2">
													<StethoscopeIcon className="size-3 text-primary" />
													<span className="text-xs text-muted-foreground">
														{note.author}
													</span>
												</div>
												<p className="text-xs text-foreground/80 leading-relaxed">
													{note.snippet}
												</p>
											</div>
										))}
									</div>
								</div>

								{/* Vitals trend graphs */}
								<div className="rounded-xl border bg-card p-5 hover:bg-muted/30 transition-colors">
									<SectionHead
										icon={ActivityIcon}
										title="Vitals Trends"
										count={data.vitals.length}
									/>
									<div className="space-y-4">
										{data.vitals.map((v) => {
											const barColor =
												v.status === "critical" || v.status === "high"
													? "bg-red-500"
													: v.status === "warning" || v.status === "low"
														? "bg-amber-500"
														: "bg-emerald-500";
											// Generate pseudo trend data
											const trendBars = Array.from({ length: 12 }, (_, i) => {
												const variance =
													Math.sin(i * 1.3) * 0.15 + Math.cos(i * 0.7) * 0.1;
												return Math.max(0.2, Math.min(1, 0.6 + variance));
											});
											return (
												<div key={v.name} className="rounded-lg border p-3">
													<div className="flex items-center justify-between mb-2">
														<span className="text-xs font-semibold">
															{v.name}
														</span>
														<span className="text-sm font-bold font-mono">
															{v.value}{" "}
															<span className="text-[10px] text-muted-foreground font-normal">
																{v.unit}
															</span>
														</span>
													</div>
													<div className="flex items-end gap-1 h-10">
														{trendBars.map((b, i) => (
															<div
																key={i}
																className={`flex-1 rounded-sm ${i === trendBars.length - 1 ? barColor : "bg-muted-foreground/15"} transition-all`}
																style={{ height: `${b * 100}%` }}
															/>
														))}
													</div>
													<div className="flex justify-between mt-1 text-[9px] text-muted-foreground font-mono">
														<span>12 wks ago</span>
														<span>Now</span>
													</div>
												</div>
											);
										})}
									</div>
								</div>

								{/* Medication adherence overview */}
								<div className="rounded-xl border bg-card p-5 hover:bg-muted/30 transition-colors">
									<SectionHead
										icon={PillIcon}
										title="Medication Adherence"
										count={data.medications.length}
									/>
									<div className="space-y-3">
										{data.medications.map((m, i) => (
											<div key={i} className="rounded-lg border p-3">
												<div className="flex items-center justify-between mb-1">
													<span className="text-xs font-semibold">
														{m.name}
													</span>
													<span
														className={`text-[10px] px-1.5 py-0.5 rounded ${m.active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}
													>
														{m.active ? "Active" : "Stopped"}
													</span>
												</div>
												<p className="text-[10px] text-muted-foreground font-mono mb-2">
													{m.dosage} · {m.frequency}
												</p>
												<AdherenceBar pct={m.adherence_pct} />
											</div>
										))}
									</div>
								</div>

								{/* Timeline */}
								<div className="rounded-xl border bg-card p-5 hover:bg-muted/30 transition-colors">
									<SectionHead
										icon={ClockIcon}
										title="Medical Timeline"
										count={data.timeline.length}
									/>
									<div className="space-y-0 overflow-auto max-h-96">
										{data.timeline.map((ev, i) => (
											<div key={i} className="flex gap-3 pb-4 last:pb-0">
												<div className="flex flex-col items-center">
													<div className="size-6 rounded-full border-2 border-primary/30 bg-primary/10 flex items-center justify-center shrink-0">
														<CalendarIcon className="size-3 text-primary" />
													</div>
													{i < data.timeline.length - 1 && (
														<div className="w-px flex-1 bg-border mt-1" />
													)}
												</div>
												<div className="pb-2 min-w-0">
													<div className="flex items-center gap-2 flex-wrap">
														<span className="text-xs font-semibold">
															{ev.title}
														</span>
														<span className="text-[10px] text-muted-foreground font-mono">
															{ev.date}
														</span>
													</div>
													{ev.description && (
														<p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
															{ev.description}
														</p>
													)}
													{ev.facility && (
														<p className="text-[10px] text-muted-foreground/60 mt-0.5">
															{ev.facility}
														</p>
													)}
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						)}

						{/* ─── INVESTIGATIONS TAB ─── */}
						{activeTab === "investigations" && (
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
								{/* Full Lab Table */}
								<div className="rounded-xl border bg-card p-5 hover:bg-muted/30 transition-colors lg:col-span-2">
									<SectionHead
										icon={ActivityIcon}
										title="Laboratory Results"
										count={data.labs.length}
									/>
									<div className="overflow-auto">
										<table className="w-full text-xs">
											<thead>
												<tr className="text-left text-[10px] uppercase text-muted-foreground border-b">
													<th className="pb-2 font-bold">Test</th>
													<th className="pb-2 font-bold">Value</th>
													<th className="pb-2 font-bold">Unit</th>
													<th className="pb-2 font-bold">Reference</th>
													<th className="pb-2 font-bold">Status</th>
												</tr>
											</thead>
											<tbody>
												{data.labs.map((l, i) => (
													<tr
														key={i}
														className="border-b border-muted/50 last:border-0 hover:bg-muted/20 transition-colors"
													>
														<td className="py-2.5 font-medium">{l.name}</td>
														<td
															className={`py-2.5 font-bold font-mono ${l.status === "high" ? "text-red-600 dark:text-red-400" : l.status === "low" ? "text-amber-600 dark:text-amber-400" : ""}`}
														>
															{l.value}
														</td>
														<td className="py-2.5 text-muted-foreground font-mono">
															{l.unit}
														</td>
														<td className="py-2.5 text-muted-foreground font-mono">
															{l.reference_range}
														</td>
														<td className="py-2.5">
															<span
																className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${l.status === "normal" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300" : l.status === "high" ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"}`}
															>
																<span
																	className={`size-1.5 rounded-full ${STATUS_DOT[l.status] || "bg-gray-400"}`}
																/>
																{l.status}
															</span>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>

								{/* Imaging Studies */}
								<div className="rounded-xl border bg-card p-5 hover:bg-muted/30 transition-colors">
									<SectionHead
										icon={ScanIcon}
										title="Imaging Studies"
										count={data.imaging.length}
									/>
									<div className="space-y-3">
										{data.imaging.map((img, i) => (
											<div key={i} className="rounded-lg border p-3">
												<div className="flex items-center justify-between mb-1">
													<span className="text-xs font-bold">
														{img.modality}
													</span>
													<span className="text-[10px] text-muted-foreground font-mono">
														{img.date}
													</span>
												</div>
												<p className="text-[10px] text-muted-foreground">
													{img.body_region}
												</p>
												{img.findings && (
													<p className="text-xs mt-1.5 text-foreground/80 leading-snug bg-muted/30 rounded-lg p-2">
														{img.findings}
													</p>
												)}
											</div>
										))}
									</div>
								</div>

								{/* Conditions detailed */}
								<div className="rounded-xl border bg-card p-5 hover:bg-muted/30 transition-colors">
									<SectionHead
										icon={AlertTriangleIcon}
										title="Conditions"
										count={data.conditions.length}
									/>
									<div className="space-y-2">
										{data.conditions.map((c, i) => (
											<div key={i} className="rounded-lg border p-3">
												<div className="flex items-center justify-between mb-1">
													<span className="text-xs font-semibold">
														{c.name}
													</span>
													{c.icd10 && (
														<span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
															{c.icd10}
														</span>
													)}
												</div>
												{c.onset_date && (
													<p className="text-[10px] text-muted-foreground">
														Since {c.onset_date}
													</p>
												)}
												{c.symptoms.length > 0 && (
													<div className="flex flex-wrap gap-1 mt-1.5">
														{c.symptoms.map((s) => (
															<span
																key={s}
																className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground"
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
							</div>
						)}

						{/* ─── Bottom CTA ─── */}
						<div className="rounded-xl border bg-linear-to-r from-primary/5 to-primary/10 p-5 hover:from-primary/8 hover:to-primary/15 transition-colors">
							<div className="flex items-center justify-between flex-wrap gap-3">
								<div className="flex items-center gap-3">
									<SparklesIcon className="size-5 text-primary" />
									<div>
										<p className="text-sm font-semibold">
											Clinical Command Center powered by 1 API call
										</p>
										<p className="text-xs text-muted-foreground">
											Digital Twin endpoint returns all patient data in a single
											request. Build yours with the Flow Builder.
										</p>
									</div>
								</div>
								<NavLink
									to="/dashboard/api-flow-builder"
									className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
								>
									Open Flow Builder <ArrowRightIcon className="size-4" />
								</NavLink>
							</div>
						</div>

						{/* ─── Collapsible API Topology ─── */}
						<div className="rounded-xl border bg-card overflow-hidden">
							<button
								type="button"
								onClick={() => setTopologyOpen(!topologyOpen)}
								className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
							>
								<div className="flex items-center gap-2">
									<ActivityIcon className="size-4 text-primary" />
									<span className="text-xs font-bold uppercase tracking-wider">
										API Topology
									</span>
								</div>
								{topologyOpen ? (
									<ChevronUpIcon className="size-4 text-muted-foreground" />
								) : (
									<ChevronDownIcon className="size-4 text-muted-foreground" />
								)}
							</button>
							{topologyOpen && (
								<div className="px-4 py-2 border-t">
									<ApiTopology {...TOPOLOGIES.healthcare_dashboard} />
								</div>
							)}
						</div>
					</>
				)}

				{!data && !isLoading && (
					<div className="flex items-center justify-center py-20">
						<div className="text-center space-y-3 max-w-md">
							<UserIcon className="size-12 mx-auto text-muted-foreground/20" />
							<p className="text-sm text-muted-foreground">
								Enter a patient ID and click <strong>Load Patient</strong> to
								see the clinical command center.
							</p>
							<p className="text-[11px] text-muted-foreground/60">
								This operational dashboard demonstrates how Venera API Hub can
								power a complete clinical view with a single Digital Twin API
								call.
							</p>
						</div>
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}
