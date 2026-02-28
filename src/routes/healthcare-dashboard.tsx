import { useState, useEffect, useCallback } from "react";
import { BASE_API_URL } from "@/config/api-routes";
import { ApiKeyRequiredDialog } from "@/features/api-keys/components/api-key-required-dialog";
import { useServiceApiKeyStore } from "@/features/api-keys/store/service-api-key.store";
import { Button } from "@/components/shadcn/button";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";
import { ApiTopology, TOPOLOGIES } from "@/components/api-topology";
import { toast } from "sonner";
import { NavLink } from "react-router-dom";
import {
	HeartPulseIcon,
	ActivityIcon,
	PillIcon,
	ScanIcon,
	ClipboardListIcon,
	CalendarIcon,
	UserIcon,
	AlertTriangleIcon,
	CheckCircle2Icon,
	ArrowRightIcon,
	SparklesIcon,
	DropletIcon,
} from "lucide-react";

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

const EVENT_ICONS: Record<
	string,
	{ icon: typeof HeartPulseIcon; color: string }
> = {
	diagnosis: { icon: AlertTriangleIcon, color: "text-red-500" },
	medication: { icon: PillIcon, color: "text-blue-500" },
	imaging: { icon: ScanIcon, color: "text-purple-500" },
	lab: { icon: DropletIcon, color: "text-green-500" },
	visit: { icon: UserIcon, color: "text-gray-500" },
	procedure: { icon: ActivityIcon, color: "text-indigo-500" },
};

function RiskGauge({ score }: { score: number }) {
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

export default function HealthcareDashboardPage() {
	const [patientId, setPatientId] = useState("1");
	const [data, setData] = useState<TwinData | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
	const { selectedApiKey } = useServiceApiKeyStore();

	const loadPatient = useCallback(
		async (pid?: string) => {
			const id = pid || patientId;
			if (!selectedApiKey) {
				setShowApiKeyDialog(true);
				return;
			}
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
		[patientId, selectedApiKey]
	);

	useEffect(() => {
		if (selectedApiKey) loadPatient("1");
	}, [selectedApiKey, loadPatient]);

	return (
		<DashboardLayout pageTitle="Healthcare Dashboard">
			<div className="space-y-4 pb-8">
				{/* Top bar */}
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
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
						{Array.from({ length: 6 }).map((_, i) => (
							<SkeletonCard key={i} className="h-48" />
						))}
					</div>
				)}

				{data && !isLoading && (
					<>
						{/* Row 1: Patient + Vitals + Tasks */}
						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
							{/* Patient Card */}
							<div className="rounded-xl border bg-card p-5">
								<div className="flex items-start justify-between mb-3">
									<div>
										<h2 className="text-xl font-bold">
											{data.profile.first_name} {data.profile.last_name}
										</h2>
										<div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
											<span className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">
												ID {data.profile.mrn}
											</span>
											<span>Age {data.profile.age}</span>
											<span>
												{data.profile.gender === "M" ? "Male" : "Female"}
											</span>
											{data.profile.blood_type && (
												<span className="flex items-center gap-0.5">
													<DropletIcon className="size-3 text-red-500" />
													{data.profile.blood_type}
												</span>
											)}
										</div>
									</div>
									<RiskGauge score={data.risk_score} />
								</div>
								{data.profile.allergies.length > 0 && (
									<div className="flex flex-wrap gap-1 mt-2">
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
								)}
							</div>

							{/* Vitals */}
							<div className="rounded-xl border bg-card p-5">
								<div className="flex items-center gap-2 mb-3">
									<HeartPulseIcon className="size-4 text-primary" />
									<h3 className="text-sm font-bold uppercase tracking-wider">
										Vitals
									</h3>
								</div>
								<div className="grid grid-cols-2 gap-2">
									{data.vitals.map((v) => (
										<div key={v.name} className="rounded-lg border p-2.5">
											<div className="flex items-center justify-between mb-1">
												<span className="text-[10px] text-muted-foreground truncate">
													{v.name}
												</span>
												<span
													className={`size-2 rounded-full ${STATUS_DOT[v.status] || "bg-gray-400"}`}
												/>
											</div>
											<div className="flex items-baseline gap-1">
												<span className="text-lg font-bold">{v.value}</span>
												<span className="text-[10px] text-muted-foreground">
													{v.unit}
												</span>
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Tasks + Timeline mini */}
							<div className="rounded-xl border bg-card p-5 flex flex-col">
								<div className="flex items-center gap-2 mb-3">
									<ClipboardListIcon className="size-4 text-primary" />
									<h3 className="text-sm font-bold uppercase tracking-wider">
										Tasks
									</h3>
								</div>
								<div className="flex-1 space-y-1.5 overflow-auto">
									{data.tasks.map((t, i) => (
										<div key={i} className="flex items-center gap-2 text-xs">
											{t.completed ? (
												<CheckCircle2Icon className="size-3.5 text-green-500 shrink-0" />
											) : (
												<div className="size-3.5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
											)}
											<span
												className={
													t.completed
														? "line-through text-muted-foreground"
														: ""
												}
											>
												{t.title}
											</span>
											<span
												className={`ml-auto text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${PRIORITY_COLORS[t.priority] || ""}`}
											>
												{t.priority}
											</span>
										</div>
									))}
								</div>
							</div>
						</div>

						{/* Row 2: Labs + Timeline */}
						<div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
							{/* Lab Results */}
							<div className="rounded-xl border bg-card p-5">
								<div className="flex items-center gap-2 mb-3">
									<ActivityIcon className="size-4 text-primary" />
									<h3 className="text-sm font-bold uppercase tracking-wider">
										Lab Results
									</h3>
								</div>
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
													className="border-b border-muted/50 last:border-0"
												>
													<td className="py-2 font-medium">{l.name}</td>
													<td
														className={`py-2 font-bold font-mono ${l.status === "high" ? "text-red-600 dark:text-red-400" : l.status === "low" ? "text-amber-600 dark:text-amber-400" : ""}`}
													>
														{l.value}
													</td>
													<td className="py-2 text-muted-foreground">
														{l.unit}
													</td>
													<td className="py-2 text-muted-foreground">
														{l.reference_range}
													</td>
													<td className="py-2">
														<span
															className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${l.status === "normal" ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" : l.status === "high" ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"}`}
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

							{/* Medical Timeline */}
							<div className="rounded-xl border bg-card p-5">
								<div className="flex items-center gap-2 mb-3">
									<CalendarIcon className="size-4 text-primary" />
									<h3 className="text-sm font-bold uppercase tracking-wider">
										Medical History
									</h3>
								</div>
								<div className="space-y-0 overflow-auto max-h-80">
									{data.timeline.map((ev, i) => {
										const iconData =
											EVENT_ICONS[ev.event_type] || EVENT_ICONS.visit;
										const Icon = iconData.icon;
										return (
											<div key={i} className="flex gap-3 pb-4 last:pb-0">
												<div className="flex flex-col items-center">
													<div
														className={`size-7 rounded-full border-2 flex items-center justify-center shrink-0 ${iconData.color} border-current/20 bg-current/10`}
													>
														<Icon className={`size-3.5 ${iconData.color}`} />
													</div>
													{i < data.timeline.length - 1 && (
														<div className="w-px flex-1 bg-border mt-1" />
													)}
												</div>
												<div className="pb-2">
													<div className="flex items-center gap-2">
														<span className="text-xs font-semibold">
															{ev.title}
														</span>
														<span className="text-[10px] text-muted-foreground">
															{ev.date}
														</span>
													</div>
													{ev.description && (
														<p className="text-[11px] text-muted-foreground mt-0.5">
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
										);
									})}
								</div>
							</div>
						</div>

						{/* Row 3: Conditions + Medications + Imaging */}
						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
							{/* Conditions */}
							<div className="rounded-xl border bg-card p-5">
								<div className="flex items-center gap-2 mb-3">
									<AlertTriangleIcon className="size-4 text-primary" />
									<h3 className="text-sm font-bold uppercase tracking-wider">
										Conditions
									</h3>
								</div>
								<div className="space-y-2">
									{data.conditions.map((c, i) => (
										<div key={i} className="rounded-lg border p-3">
											<div className="flex items-center justify-between mb-1">
												<span className="text-xs font-semibold">{c.name}</span>
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

							{/* Medications */}
							<div className="rounded-xl border bg-card p-5">
								<div className="flex items-center gap-2 mb-3">
									<PillIcon className="size-4 text-primary" />
									<h3 className="text-sm font-bold uppercase tracking-wider">
										Medications
									</h3>
								</div>
								<div className="space-y-2">
									{data.medications.map((m, i) => {
										const adherenceColor =
											m.adherence_pct >= 80
												? "bg-green-500"
												: m.adherence_pct >= 60
													? "bg-amber-500"
													: "bg-red-500";
										return (
											<div key={i} className="rounded-lg border p-3">
												<div className="flex items-center justify-between mb-1">
													<span className="text-xs font-semibold">
														{m.name}
													</span>
													<span
														className={`text-[10px] px-1.5 py-0.5 rounded ${m.active ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" : "bg-gray-100 text-gray-500"}`}
													>
														{m.active ? "Active" : "Stopped"}
													</span>
												</div>
												<p className="text-[10px] text-muted-foreground">
													{m.dosage} · {m.frequency}
												</p>
												<div className="mt-2 flex items-center gap-2">
													<div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
														<div
															className={`h-full rounded-full ${adherenceColor} transition-all`}
															style={{ width: `${m.adherence_pct}%` }}
														/>
													</div>
													<span className="text-[10px] font-mono text-muted-foreground">
														{m.adherence_pct}%
													</span>
												</div>
											</div>
										);
									})}
								</div>
							</div>

							{/* Imaging */}
							<div className="rounded-xl border bg-card p-5">
								<div className="flex items-center gap-2 mb-3">
									<ScanIcon className="size-4 text-primary" />
									<h3 className="text-sm font-bold uppercase tracking-wider">
										Imaging
									</h3>
								</div>
								<div className="space-y-2">
									{data.imaging.map((img, i) => (
										<div key={i} className="rounded-lg border p-3">
											<div className="flex items-center justify-between mb-1">
												<span className="text-xs font-semibold">
													{img.modality}
												</span>
												<span className="text-[10px] text-muted-foreground">
													{img.date}
												</span>
											</div>
											<p className="text-[10px] text-muted-foreground">
												{img.body_region}
											</p>
											{img.findings && (
												<p className="text-[11px] mt-1 text-foreground/80">
													{img.findings}
												</p>
											)}
										</div>
									))}
								</div>
							</div>
						</div>

						{/* Bottom CTA */}
						<div className="rounded-xl border bg-gradient-to-r from-primary/5 to-primary/10 p-5">
							<div className="flex items-center justify-between flex-wrap gap-3">
								<div className="flex items-center gap-3">
									<SparklesIcon className="size-5 text-primary" />
									<div>
										<p className="text-sm font-semibold">
											This dashboard was built using 1 API call to Venera API
											Hub
										</p>
										<p className="text-xs text-muted-foreground">
											Digital Twin endpoint returns all patient data in a single
											request. Build yours with the Flow Builder.
										</p>
									</div>
								</div>
								<NavLink
									to="/api-flow-builder"
									className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
								>
									Open Flow Builder <ArrowRightIcon className="size-4" />
								</NavLink>
							</div>
						</div>
					</>
				)}

				{!data && !isLoading && (
					<div className="flex items-center justify-center py-20">
						<div className="text-center space-y-3 max-w-md">
							<UserIcon className="size-12 mx-auto text-muted-foreground/20" />
							<p className="text-sm text-muted-foreground">
								Enter a patient ID and click <strong>Load Patient</strong> to
								see the unified healthcare dashboard.
							</p>
							<p className="text-[11px] text-muted-foreground/60">
								This showcase demonstrates how Venera API Hub can power a
								complete patient view with a single Digital Twin API call.
							</p>
						</div>
					</div>
				)}
			</div>

			<div className="px-4 py-2 border-t">
				<ApiTopology {...TOPOLOGIES.healthcare_dashboard} />
			</div>

			<ApiKeyRequiredDialog
				open={showApiKeyDialog}
				onOpenChange={setShowApiKeyDialog}
			/>
		</DashboardLayout>
	);
}
