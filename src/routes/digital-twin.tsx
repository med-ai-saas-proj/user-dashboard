import { useState, useEffect, useCallback } from "react";
import { BASE_API_URL } from "@/config/api-routes";
import { ApiKeyRequiredDialog } from "@/features/api-keys/components/api-key-required-dialog";
import { useServiceApiKeyStore } from "@/features/api-keys/store/service-api-key.store";
import { Button } from "@/components/shadcn/button";
import { ViewCodeDialog } from "@/components/view-code-dialog";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";
import { ApiTopology, TOPOLOGIES } from "@/components/api-topology";
import { toast } from "sonner";
import {
	HeartPulseIcon,
	ActivityIcon,
	PillIcon,
	ScanIcon,
	ClipboardListIcon,
	CalendarIcon,
	BrainIcon,
	AlertTriangleIcon,
	CheckCircleIcon,
	UserIcon,
	ShieldIcon,
} from "lucide-react";

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

const twinUrl = (pid: string) =>
	`${BASE_API_URL}service/api/v1/digital_twin/${pid}`;
const predictUrl = (pid: string) =>
	`${BASE_API_URL}service/api/v1/digital_twin/${pid}/predict`;

const statusColor = (s: string) => {
	switch (s) {
		case "normal":
			return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
		case "warning":
		case "low":
		case "high":
			return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";
		case "critical":
			return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
		default:
			return "bg-muted text-muted-foreground";
	}
};

const statusDot = (s: string) => {
	switch (s) {
		case "normal":
			return "bg-green-500";
		case "warning":
			return "bg-yellow-500";
		case "critical":
			return "bg-red-500";
		default:
			return "bg-muted-foreground";
	}
};

const riskColor = (score: number) => {
	if (score < 30)
		return {
			ring: "stroke-green-500",
			text: "text-green-600 dark:text-green-400",
			label: "Low",
		};
	if (score < 60)
		return {
			ring: "stroke-yellow-500",
			text: "text-yellow-600 dark:text-yellow-400",
			label: "Moderate",
		};
	if (score < 80)
		return {
			ring: "stroke-orange-500",
			text: "text-orange-600 dark:text-orange-400",
			label: "High",
		};
	return {
		ring: "stroke-red-500",
		text: "text-red-600 dark:text-red-400",
		label: "Critical",
	};
};

const adherenceColor = (pct: number) => {
	if (pct >= 80) return "bg-green-500";
	if (pct >= 50) return "bg-yellow-500";
	return "bg-red-500";
};

const priorityBadge = (p: string) => {
	switch (p.toLowerCase()) {
		case "high":
		case "urgent":
			return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
		case "medium":
			return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";
		default:
			return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
	}
};

const eventIcon = (type: string) => {
	switch (type.toLowerCase()) {
		case "lab":
		case "laboratory":
			return <ActivityIcon className="w-3.5 h-3.5" />;
		case "imaging":
		case "radiology":
			return <ScanIcon className="w-3.5 h-3.5" />;
		case "medication":
			return <PillIcon className="w-3.5 h-3.5" />;
		case "visit":
		case "encounter":
			return <CalendarIcon className="w-3.5 h-3.5" />;
		case "diagnosis":
		case "condition":
			return <AlertTriangleIcon className="w-3.5 h-3.5" />;
		default:
			return <ClipboardListIcon className="w-3.5 h-3.5" />;
	}
};

function RiskGauge({ score }: { score: number }) {
	const rc = riskColor(score);
	const circumference = 2 * Math.PI * 40;
	const filled = (score / 100) * circumference;

	return (
		<div className="flex flex-col items-center">
			<svg
				width="96"
				height="96"
				viewBox="0 0 96 96"
				role="img"
				aria-label={`Risk score ${score}`}
			>
				<circle
					cx="48"
					cy="48"
					r="40"
					fill="none"
					stroke="currentColor"
					strokeWidth="6"
					className="text-muted/30"
				/>
				<circle
					cx="48"
					cy="48"
					r="40"
					fill="none"
					strokeWidth="6"
					className={rc.ring}
					strokeDasharray={circumference}
					strokeDashoffset={circumference - filled}
					strokeLinecap="round"
					transform="rotate(-90 48 48)"
				/>
				<text
					x="48"
					y="44"
					textAnchor="middle"
					className={`text-xl font-bold fill-current ${rc.text}`}
				>
					{score.toFixed(0)}
				</text>
				<text
					x="48"
					y="60"
					textAnchor="middle"
					className="text-[9px] fill-muted-foreground"
				>
					{rc.label} Risk
				</text>
			</svg>
		</div>
	);
}

function SectionCard({
	title,
	icon,
	children,
}: {
	title: string;
	icon: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<div className="rounded-lg border bg-card shadow-sm">
			<div className="flex items-center gap-2 px-4 py-2.5 border-b bg-muted/30">
				<span className="text-muted-foreground">{icon}</span>
				<h3 className="text-sm font-semibold">{title}</h3>
			</div>
			<div className="p-4">{children}</div>
		</div>
	);
}

export default function DigitalTwinPage() {
	const [patientId, setPatientId] = useState("1");
	const [isLoading, setIsLoading] = useState(false);
	const [twin, setTwin] = useState<DigitalTwinFull | null>(null);
	const [prediction, setPrediction] = useState<PredictionResult | null>(null);
	const [isPredicting, setIsPredicting] = useState(false);
	const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
	const { selectedApiKey } = useServiceApiKeyStore();

	const requireApiKey = useCallback((): boolean => {
		if (!selectedApiKey) {
			setShowApiKeyDialog(true);
			return false;
		}
		return true;
	}, [selectedApiKey]);

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
		if (selectedApiKey) handleLoad("1");
	}, [selectedApiKey, handleLoad]);

	return (
		<DashboardLayout pageTitle="Digital Twin">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				{/* Toolbar */}
				<div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30 gap-2 flex-wrap">
					<div className="flex items-center gap-2">
						<span className="text-xs text-muted-foreground">Patient ID:</span>
						<input
							value={patientId}
							onChange={(e) => setPatientId(e.target.value)}
							className="w-20 rounded-md border bg-transparent px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
						/>
						<Button
							size="sm"
							className="h-7 text-xs"
							onClick={() => handleLoad()}
							disabled={isLoading}
						>
							{isLoading ? "Loading..." : "Load Twin"}
						</Button>
					</div>
					<ViewCodeDialog
						endpoint={twinUrl("{patient_id}")}
						method="GET"
						description="Fetch full digital twin for a patient"
					/>
				</div>

				{/* Main content */}
				<div className="flex-1 overflow-y-auto">
					{twin ? (
						<div className="p-4 space-y-4 max-w-[1600px] mx-auto">
							{/* Patient Header */}
							<div className="rounded-lg border bg-card shadow-sm p-5">
								<div className="flex flex-col md:flex-row md:items-center gap-5">
									<div className="flex items-center gap-4 flex-1 min-w-0">
										<div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
											<UserIcon className="w-7 h-7 text-primary" />
										</div>
										<div className="min-w-0">
											<h2 className="text-lg font-bold truncate">
												{twin.profile.first_name} {twin.profile.last_name}
											</h2>
											<div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
												<span>
													{twin.profile.age}y, {twin.profile.gender}
												</span>
												<span>DOB: {twin.profile.dob}</span>
												<span>MRN: {twin.profile.mrn}</span>
												<span className="flex items-center gap-1">
													<ShieldIcon className="w-3 h-3" />
													{twin.profile.blood_type}
												</span>
											</div>
											{twin.profile.allergies.length > 0 && (
												<div className="flex flex-wrap gap-1 mt-2">
													{twin.profile.allergies.map((a) => (
														<span
															key={a}
															className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 text-[10px] font-medium text-red-700 dark:text-red-300"
														>
															<AlertTriangleIcon className="w-2.5 h-2.5" /> {a}
														</span>
													))}
												</div>
											)}
										</div>
									</div>
									<div className="shrink-0">
										<RiskGauge score={twin.risk_score} />
									</div>
									<div className="text-[10px] text-muted-foreground/60 shrink-0">
										Updated: {new Date(twin.last_updated).toLocaleString()}
									</div>
								</div>
							</div>

							{/* Dashboard grid */}
							<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
								{/* Vitals */}
								<SectionCard
									title="Vitals"
									icon={<HeartPulseIcon className="w-4 h-4" />}
								>
									<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
										{twin.vitals.map((v) => (
											<div
												key={v.name}
												className="rounded-md border p-2.5 relative"
											>
												<div
													className={`absolute top-2 right-2 w-2 h-2 rounded-full ${statusDot(v.status)}`}
												/>
												<p className="text-[10px] text-muted-foreground uppercase tracking-wider">
													{v.name}
												</p>
												<p className="text-lg font-bold mt-0.5">
													{v.value}{" "}
													<span className="text-xs font-normal text-muted-foreground">
														{v.unit}
													</span>
												</p>
												<p className="text-[9px] text-muted-foreground mt-0.5">
													{new Date(v.timestamp).toLocaleDateString()}
												</p>
											</div>
										))}
									</div>
								</SectionCard>

								{/* Lab Results */}
								<SectionCard
									title="Lab Results"
									icon={<ActivityIcon className="w-4 h-4" />}
								>
									<div className="overflow-x-auto -mx-4 px-4">
										<table className="w-full text-xs">
											<thead>
												<tr className="border-b text-muted-foreground">
													<th className="text-left py-1.5 font-medium">Test</th>
													<th className="text-right py-1.5 font-medium">
														Value
													</th>
													<th className="text-right py-1.5 font-medium">Ref</th>
													<th className="text-center py-1.5 font-medium">
														Status
													</th>
												</tr>
											</thead>
											<tbody>
												{twin.labs.map((l) => (
													<tr
														key={l.loinc_code}
														className="border-b last:border-0"
													>
														<td className="py-1.5">{l.name}</td>
														<td className="text-right py-1.5 font-mono">
															{l.value} {l.unit}
														</td>
														<td className="text-right py-1.5 text-muted-foreground">
															{l.reference_range}
														</td>
														<td className="text-center py-1.5">
															<span
																className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium ${statusColor(l.status)}`}
															>
																{l.status}
															</span>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</SectionCard>

								{/* Active Conditions */}
								<SectionCard
									title="Active Conditions"
									icon={<AlertTriangleIcon className="w-4 h-4" />}
								>
									<div className="space-y-3">
										{twin.conditions.map((c) => (
											<div
												key={c.icd10}
												className="relative pl-4 border-l-2 border-muted-foreground/20"
											>
												<div className="flex items-start justify-between gap-2">
													<div>
														<p className="text-sm font-medium">{c.name}</p>
														<p className="text-[10px] text-muted-foreground font-mono">
															{c.icd10} &middot; {c.status}
														</p>
													</div>
													<span className="text-[10px] text-muted-foreground shrink-0">
														{c.onset_date}
													</span>
												</div>
												{c.symptoms.length > 0 && (
													<div className="flex flex-wrap gap-1 mt-1">
														{c.symptoms.map((s) => (
															<span
																key={s}
																className="rounded bg-muted px-1.5 py-0.5 text-[10px]"
															>
																{s}
															</span>
														))}
													</div>
												)}
											</div>
										))}
									</div>
								</SectionCard>

								{/* Medications */}
								<SectionCard
									title="Medications"
									icon={<PillIcon className="w-4 h-4" />}
								>
									<div className="space-y-2">
										{twin.medications.map((m) => (
											<div
												key={`${m.name}-${m.dosage}`}
												className="rounded-md border p-2.5"
											>
												<div className="flex items-start justify-between gap-2">
													<div>
														<p className="text-sm font-medium">{m.name}</p>
														<p className="text-[10px] text-muted-foreground">
															{m.dosage} &middot; {m.frequency} &middot;{" "}
															{m.route}
														</p>
													</div>
													{m.active ? (
														<span className="rounded-full bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:text-green-300">
															Active
														</span>
													) : (
														<span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
															Inactive
														</span>
													)}
												</div>
												<div className="mt-2">
													<div className="flex items-center justify-between text-[10px] mb-0.5">
														<span className="text-muted-foreground">
															Adherence
														</span>
														<span className="font-medium">
															{m.adherence_pct}%
														</span>
													</div>
													<div className="h-1.5 rounded-full bg-muted overflow-hidden">
														<div
															className={`h-full rounded-full ${adherenceColor(m.adherence_pct)}`}
															style={{ width: `${m.adherence_pct}%` }}
														/>
													</div>
												</div>
											</div>
										))}
									</div>
								</SectionCard>

								{/* Imaging */}
								<SectionCard
									title="Imaging"
									icon={<ScanIcon className="w-4 h-4" />}
								>
									<div className="space-y-2">
										{twin.imaging.map((img, i) => (
											<div key={`img-${i}`} className="rounded-md border p-2.5">
												<div className="flex items-center gap-2">
													<div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
														<ScanIcon className="w-4 h-4 text-muted-foreground" />
													</div>
													<div className="min-w-0 flex-1">
														<p className="text-sm font-medium truncate">
															{img.modality} — {img.body_region}
														</p>
														<p className="text-[10px] text-muted-foreground">
															{img.date}
														</p>
													</div>
												</div>
												<p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
													{img.findings}
												</p>
												{img.ai_description && (
													<p className="text-[10px] text-primary/80 mt-1 flex items-center gap-1">
														<BrainIcon className="w-3 h-3" />{" "}
														{img.ai_description}
													</p>
												)}
											</div>
										))}
									</div>
								</SectionCard>

								{/* Tasks */}
								<SectionCard
									title="Tasks"
									icon={<ClipboardListIcon className="w-4 h-4" />}
								>
									<div className="space-y-1.5">
										{twin.tasks.map((t, i) => (
											<div
												key={`task-${i}`}
												className="flex items-center gap-2 rounded-md border px-2.5 py-2"
											>
												{t.completed ? (
													<CheckCircleIcon className="w-4 h-4 text-green-500 shrink-0" />
												) : (
													<div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
												)}
												<div className="flex-1 min-w-0">
													<p
														className={`text-xs font-medium truncate ${t.completed ? "line-through text-muted-foreground" : ""}`}
													>
														{t.title}
													</p>
													<p className="text-[10px] text-muted-foreground">
														Due: {t.due_date} &middot; {t.assigned_to}
													</p>
												</div>
												<span
													className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium shrink-0 ${priorityBadge(t.priority)}`}
												>
													{t.priority}
												</span>
											</div>
										))}
									</div>
								</SectionCard>

								{/* Timeline */}
								<SectionCard
									title="Timeline"
									icon={<CalendarIcon className="w-4 h-4" />}
								>
									<div className="relative pl-4">
										<div className="absolute left-[5px] top-1 bottom-1 w-px bg-muted-foreground/20" />
										<div className="space-y-3">
											{twin.timeline.map((ev, i) => (
												<div key={`ev-${i}`} className="relative">
													<div className="absolute -left-4 top-0.5 w-[10px] h-[10px] rounded-full bg-card border-2 border-muted-foreground/40 flex items-center justify-center">
														{eventIcon(ev.event_type)}
													</div>
													<div className="ml-2">
														<div className="flex items-center gap-2">
															<span className="text-[10px] text-muted-foreground font-mono">
																{ev.date}
															</span>
															<span className="rounded bg-muted px-1 py-0.5 text-[9px] uppercase tracking-wider">
																{ev.event_type}
															</span>
														</div>
														<p className="text-xs font-medium mt-0.5">
															{ev.title}
														</p>
														<p className="text-[10px] text-muted-foreground">
															{ev.description}
														</p>
														{(ev.facility || ev.provider) && (
															<p className="text-[9px] text-muted-foreground/60 mt-0.5">
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
								</SectionCard>

								{/* AI Risk Prediction */}
								<SectionCard
									title="AI Risk Prediction"
									icon={<BrainIcon className="w-4 h-4" />}
								>
									<div className="space-y-3">
										<Button
											size="sm"
											className="w-full text-xs"
											onClick={handlePredict}
											disabled={isPredicting}
										>
											{isPredicting
												? "Predicting..."
												: "Run 30-Day Risk Prediction"}
										</Button>
										{prediction && (
											<div className="space-y-3">
												<div className="flex items-center justify-between rounded-md border p-3">
													<div>
														<p className="text-xs text-muted-foreground">
															Predicted Score
														</p>
														<p
															className={`text-2xl font-bold ${riskColor(prediction.score).text}`}
														>
															{prediction.score.toFixed(1)}
														</p>
													</div>
													<div className="text-right">
														<p className="text-xs text-muted-foreground">
															Confidence
														</p>
														<p className="text-lg font-semibold">
															{(prediction.confidence * 100).toFixed(0)}%
														</p>
													</div>
												</div>
												{prediction.factors.length > 0 && (
													<div>
														<p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
															Risk Factors
														</p>
														<div className="space-y-1">
															{prediction.factors.map((f, i) => (
																<div
																	key={`pf-${i}`}
																	className="flex items-start gap-2 text-xs p-2 rounded border"
																>
																	<span
																		className={`shrink-0 font-bold text-sm ${f.impact > 0 ? "text-red-500" : "text-green-500"}`}
																	>
																		{f.impact > 0 ? "+" : ""}
																		{f.impact.toFixed(1)}
																	</span>
																	<div>
																		<p className="font-medium">{f.factor}</p>
																		<p className="text-[10px] text-muted-foreground">
																			{f.detail}
																		</p>
																	</div>
																</div>
															))}
														</div>
													</div>
												)}
												{prediction.recommendations.length > 0 && (
													<div>
														<p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
															Recommendations
														</p>
														<ul className="space-y-1">
															{prediction.recommendations.map((r, i) => (
																<li
																	key={`rec-${i}`}
																	className="flex items-start gap-1.5 text-xs"
																>
																	<CheckCircleIcon className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
																	<span>{r}</span>
																</li>
															))}
														</ul>
													</div>
												)}
											</div>
										)}
									</div>
								</SectionCard>
							</div>
						</div>
					) : (
						<div className="flex-1 flex items-center justify-center p-8 h-full">
							<div className="text-center space-y-3 max-w-sm">
								<div className="w-14 h-14 mx-auto rounded-full bg-muted flex items-center justify-center">
									<HeartPulseIcon className="w-7 h-7 text-muted-foreground" />
								</div>
								<p className="text-sm text-muted-foreground">
									Enter a Patient ID above and click <strong>Load Twin</strong>{" "}
									to view their comprehensive digital twin dashboard.
								</p>
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

			<div className="px-4 py-2 border-t">
				<ApiTopology {...TOPOLOGIES.digital_twin} />
			</div>

			<ApiKeyRequiredDialog
				open={showApiKeyDialog}
				onOpenChange={setShowApiKeyDialog}
			/>
		</DashboardLayout>
	);
}
