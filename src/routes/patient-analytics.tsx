import {
	ActivityIcon,
	AlertTriangleIcon,
	BrainIcon,
	GitBranchIcon,
	InfoIcon,
	LayersIcon,
	LightbulbIcon,
	MinusIcon,
	TrendingDownIcon,
	TrendingUpIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/shadcn/button";
import { API_ROUTES } from "@/config/api-routes";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";

/* ─── Types (mirror PatientAnalyticsResponse) ─── */
type Severity = "critical" | "high" | "moderate" | "low" | "info";
type Direction = "rising" | "falling" | "stable" | "unknown";

interface TrendPoint {
	date: string;
	value: number;
	unit: string;
	flag: string;
}
interface Forecast {
	series: string;
	code: string;
	unit: string;
	n: number;
	method: string;
	latest_value: number | null;
	latest_date: string;
	slope_per_year: number | null;
	projected_value: number | null;
	horizon_days: number;
	ci_low: number | null;
	ci_high: number | null;
	direction: Direction;
	anomaly: boolean;
	anomaly_note: string;
	reference_range: string;
	crosses_reference: boolean;
	points?: TrendPoint[];
}
interface Recurrence {
	problem: string;
	icd10: string;
	occurrences: number;
	span_years: number;
	mean_interval_days: number | null;
	cadence: string;
	chronic: boolean;
	years: string[];
}
interface Comorbidity {
	problem_a: string;
	problem_b: string;
	co_occurrences: number;
	lift: number;
	note: string;
}
interface Cluster {
	period: string;
	problem_count: number;
	problems: string[];
	intensity: number;
}
interface Association {
	antecedent: string;
	consequent: string;
	kind: string;
	direction: string;
	strength: number;
	n: number;
	lag_days: number | null;
	confidence: "high" | "moderate" | "low";
	note: string;
}
interface Evidence {
	kind: string;
	detail: string;
	value: string;
	severity: Severity;
	source: string;
}
interface Recommendation {
	title: string;
	rationale: string;
	priority: Severity;
	category: string;
	evidence: Evidence[];
	advisory: boolean;
}
interface AnalyticsData {
	success: boolean;
	patient_id: number;
	demographics: {
		name?: { text?: string }[];
		gender?: string;
		birthDate?: string;
	};
	span_years: string[];
	generated_at: string;
	patterns: {
		recurrences: Recurrence[];
		comorbidities: Comorbidity[];
		clusters: Cluster[];
		chronic_burden: number;
		most_active_year: string;
	};
	causal: { associations: Association[]; method: string };
	forecasts: { forecasts: Forecast[]; horizon_days: number; method: string };
	recommendations: {
		recommendations: Recommendation[];
		evidence_count: number;
		narrative_generated: boolean;
	};
	disclaimer: string;
	errors: string[];
}

/* ─── Style helpers ─── */
const SEV_COLOR: Record<Severity, string> = {
	critical: "#b4402f",
	high: "#c2502f",
	moderate: "#9a7a2a",
	low: "#5a8a6a",
	info: "#5a6a72",
};
const dirIcon = (d: Direction) =>
	d === "rising" ? (
		<TrendingUpIcon className="size-3.5" />
	) : d === "falling" ? (
		<TrendingDownIcon className="size-3.5" />
	) : (
		<MinusIcon className="size-3.5" />
	);
const dirColor = (d: Direction) =>
	d === "rising" ? "#b4402f" : d === "falling" ? "#2e7d5b" : "#8a8479";

/* ─── Forecast sparkline (inline SVG; history solid, projection dashed) ─── */
function ForecastChart({ f }: { f: Forecast }) {
	const pts = f.points ?? [];
	const W = 220;
	const H = 56;
	const vals = pts.map((p) => p.value);
	const all = [
		...vals,
		f.projected_value ?? Number.NaN,
		f.ci_low ?? Number.NaN,
		f.ci_high ?? Number.NaN,
	].filter((v) => !Number.isNaN(v));
	if (!all.length) return null;
	const lo = Math.min(...all);
	const hi = Math.max(...all);
	const rng = hi - lo || 1;
	// reference band
	const ref = f.reference_range.match(/(-?\d+\.?\d*)\s*-\s*(-?\d+\.?\d*)/);
	const refLo = ref ? Number.parseFloat(ref[1]) : null;
	const refHi = ref ? Number.parseFloat(ref[2]) : null;
	const sx = (i: number, total: number) =>
		(i / Math.max(1, total - 1)) * (W * 0.74);
	const sy = (v: number) => H - 6 - ((v - lo) / rng) * (H - 12);
	const histPath = pts
		.map(
			(p, i) =>
				`${i === 0 ? "M" : "L"}${sx(i, pts.length).toFixed(1)},${sy(p.value).toFixed(1)}`
		)
		.join(" ");
	const lastX = sx(pts.length - 1, pts.length);
	const lastY = pts.length ? sy(pts[pts.length - 1].value) : H / 2;
	const projX = W - 6;
	const projY = f.projected_value != null ? sy(f.projected_value) : lastY;
	const c = dirColor(f.direction);
	return (
		<svg
			viewBox={`0 0 ${W} ${H}`}
			className="w-full"
			style={{ height: H }}
			preserveAspectRatio="none"
			role="img"
			aria-label={`${f.series} trend`}
		>
			{refLo != null && refHi != null && (
				<rect
					x={0}
					y={Math.min(sy(refHi), sy(refLo))}
					width={W}
					height={Math.abs(sy(refLo) - sy(refHi))}
					fill="#10b98115"
				/>
			)}
			<path
				d={histPath}
				fill="none"
				stroke={c}
				strokeWidth={1.6}
				vectorEffect="non-scaling-stroke"
			/>
			{f.projected_value != null && (
				<line
					x1={lastX}
					y1={lastY}
					x2={projX}
					y2={projY}
					stroke={c}
					strokeWidth={1.4}
					strokeDasharray="3 2"
					vectorEffect="non-scaling-stroke"
				/>
			)}
			{pts.map((p, i) =>
				p.flag === "H" || p.flag === "L" ? (
					<circle
						key={`${p.date}-${i}`}
						cx={sx(i, pts.length)}
						cy={sy(p.value)}
						r={2.4}
						fill="#b4402f"
						stroke="#fff"
						strokeWidth={1}
					/>
				) : null
			)}
			<circle cx={lastX} cy={lastY} r={2.6} fill={c} />
			{f.projected_value != null && (
				<circle
					cx={projX}
					cy={projY}
					r={2.8}
					fill="#1d6a6e"
					stroke="#fff"
					strokeWidth={1}
				/>
			)}
		</svg>
	);
}

// Showcase patients (real ingested longitudinal records). Ordered richest-first
// so the default demo lands on the 8-year grandfather record.
const SHOWCASE_PATIENTS = [
	{ id: 6, name: "Ông", sub: "grandfather · 2016–2024" },
	{ id: 5, name: "Bố", sub: "father · 2022–2025" },
	{ id: 4, name: "Con", sub: "child · 2025" },
];

export default function PatientAnalyticsPage() {
	const [data, setData] = useState<AnalyticsData | null>(null);
	const [patientIdInput, setPatientIdInput] = useState(
		String(SHOWCASE_PATIENTS[0].id)
	);
	const [isLoading, setIsLoading] = useState(false);
	const [horizon, setHorizon] = useState(180);

	const fetchAnalytics = async (pid: number) => {
		setIsLoading(true);
		setData(null);
		try {
			const url = `${API_ROUTES.SERVICES.PATIENT_ANALYTICS}/${pid}?horizon_days=${horizon}&use_llm=true`;
			const headers = await getAuthHeaders(url);
			const resp = await fetch(url, { headers });
			if (!resp.ok)
				throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
			const d: AnalyticsData = await resp.json();
			if (!d.success) throw new Error(d.errors?.join("; ") || "No data");
			setData(d);
			toast.success(`Analytics ready for patient ${pid}`);
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to load analytics"
			);
		} finally {
			setIsLoading(false);
		}
	};

	const load = () => {
		const pid = Number.parseInt(patientIdInput, 10);
		if (Number.isNaN(pid) || pid <= 0)
			return toast.error("Enter a valid patient ID");
		fetchAnalytics(pid);
	};

	const name = data?.demographics?.name?.[0]?.text ?? "";

	return (
		<DashboardLayout pageTitle="Patient Analytics">
			<div className="px-5 py-4 max-w-[1180px] mx-auto">
				{/* ── control bar ── */}
				<div className="flex flex-wrap items-end gap-3 pb-4 border-b">
					<div>
						<div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
							Patient ID
						</div>
						<input
							value={patientIdInput}
							onChange={(e) => setPatientIdInput(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && load()}
							className="w-24 px-3 py-1.5 rounded-md border bg-background text-sm"
							placeholder="6"
						/>
					</div>
					<div>
						<div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
							Forecast horizon
						</div>
						<select
							value={horizon}
							onChange={(e) => setHorizon(Number(e.target.value))}
							className="px-3 py-1.5 rounded-md border bg-background text-sm"
						>
							<option value={90}>90 days</option>
							<option value={180}>180 days</option>
							<option value={365}>1 year</option>
						</select>
					</div>
					<Button onClick={load} disabled={isLoading} className="gap-2">
						<ActivityIcon className="size-4" />
						{isLoading ? "Analyzing…" : "Analyze"}
					</Button>
					<div className="flex items-end gap-1.5 ml-auto">
						<span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 mr-1">
							Showcase
						</span>
						{SHOWCASE_PATIENTS.map((p) => (
							<button
								type="button"
								key={p.id}
								onClick={() => {
									setPatientIdInput(String(p.id));
									fetchAnalytics(p.id);
								}}
								title={`${p.name} — ${p.sub}`}
								className={`px-3 py-1 text-xs rounded-md border hover:bg-muted transition-colors ${
									patientIdInput === String(p.id)
										? "border-foreground bg-muted"
										: ""
								}`}
							>
								<span className="font-medium">{p.name}</span>
								<span className="text-[10px] text-muted-foreground ml-1.5 hidden sm:inline">
									{p.sub}
								</span>
							</button>
						))}
					</div>
				</div>

				{!data && !isLoading && (
					<div className="text-center py-24 text-muted-foreground">
						<BrainIcon className="size-10 mx-auto mb-3 opacity-40" />
						<p>
							Load a patient to compute pattern, association, forecast, and
							recommendation analytics.
						</p>
						<p className="text-xs mt-1">
							Try a showcase patient — Ông, Bố, or Con — above.
						</p>
					</div>
				)}

				{isLoading && (
					<div className="text-center py-24 text-muted-foreground animate-pulse">
						Computing longitudinal analytics + LLM narrative…
					</div>
				)}

				{data && (
					<div className="space-y-8 pt-5">
						{/* header */}
						<div className="flex items-baseline justify-between gap-4 flex-wrap">
							<div>
								<h2 className="text-2xl font-semibold">
									{name || `Patient ${data.patient_id}`}
								</h2>
								<p className="text-sm text-muted-foreground">
									{data.demographics?.gender} · b.{data.demographics?.birthDate}{" "}
									· {data.span_years[0]}–
									{data.span_years[data.span_years.length - 1]} ·{" "}
									{data.patterns.chronic_burden} chronic problems
								</p>
							</div>
							<div className="text-right text-xs text-muted-foreground">
								<div>most active year</div>
								<div className="text-xl font-semibold text-foreground">
									{data.patterns.most_active_year}
								</div>
							</div>
						</div>

						{/* ── RECOMMENDATIONS (lead — most actionable) ── */}
						<section>
							<SectionHead
								icon={<LightbulbIcon className="size-4" />}
								title="Recommendations"
								meta={`${data.recommendations.recommendations.length} actions · ${data.recommendations.evidence_count} evidence items · ${data.recommendations.narrative_generated ? "AI rationale" : "deterministic"}`}
							/>
							<div className="grid gap-3 md:grid-cols-2">
								{data.recommendations.recommendations.map((r) => (
									<div
										key={r.title}
										className="rounded-lg border p-4 bg-card"
										style={{
											borderLeftWidth: 3,
											borderLeftColor: SEV_COLOR[r.priority],
										}}
									>
										<div className="flex items-center gap-2 mb-1">
											<span
												className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
												style={{
													color: SEV_COLOR[r.priority],
													background: `${SEV_COLOR[r.priority]}18`,
												}}
											>
												{r.priority}
											</span>
											<span className="text-[11px] text-muted-foreground">
												{r.category}
											</span>
										</div>
										<div className="font-medium text-sm">{r.title}</div>
										{r.rationale && (
											<p className="text-[13px] text-muted-foreground mt-1.5 leading-snug">
												{r.rationale}
											</p>
										)}
										<div className="mt-2 flex flex-wrap gap-1">
											{r.evidence.slice(0, 4).map((e) => (
												<span
													key={`${e.kind}-${e.detail}`}
													className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
													title={`${e.source}: ${e.detail}`}
												>
													{e.detail.length > 36
														? `${e.detail.slice(0, 36)}…`
														: e.detail}
												</span>
											))}
										</div>
									</div>
								))}
							</div>
						</section>

						{/* ── FORECASTS ── */}
						<section>
							<SectionHead
								icon={<TrendingUpIcon className="size-4" />}
								title="Biomarker forecasts"
								meta={`${data.forecasts.forecasts.length} series · ${data.forecasts.horizon_days}-day projection · ● abnormal · ◆ projected`}
							/>
							<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
								{data.forecasts.forecasts
									.filter((f) => f.method !== "insufficient")
									.slice(0, 12)
									.map((f) => (
										<div
											key={f.series + f.code}
											className={`rounded-lg border p-3 bg-card ${f.anomaly ? "ring-1 ring-[#b4402f]/40" : ""}`}
										>
											<div className="flex items-center justify-between gap-2 mb-1">
												<span
													className="text-[13px] font-medium truncate"
													title={f.series}
												>
													{f.series}
												</span>
												<span
													className="flex items-center gap-0.5 text-xs font-semibold shrink-0"
													style={{ color: dirColor(f.direction) }}
												>
													{dirIcon(f.direction)}
												</span>
											</div>
											<ForecastChart f={f} />
											<div className="flex items-center justify-between text-[11px] font-mono mt-1">
												<span className="text-foreground font-medium">
													{f.latest_value}
													<span className="text-muted-foreground ml-0.5">
														{f.unit}
													</span>
													{f.projected_value != null && (
														<span className="text-[#1d6a6e]">
															{" "}
															→ {f.projected_value}
														</span>
													)}
												</span>
												<span className="text-muted-foreground">{f.n} pts</span>
											</div>
											{(f.anomaly || f.crosses_reference) && (
												<div className="flex items-center gap-1 text-[10px] text-[#b4402f] mt-1">
													<AlertTriangleIcon className="size-3" />
													{f.crosses_reference
														? "projection crosses reference range"
														: f.anomaly_note || "anomaly"}
												</div>
											)}
										</div>
									))}
							</div>
						</section>

						{/* ── PATTERNS ── */}
						<section className="grid gap-6 lg:grid-cols-2">
							<div>
								<SectionHead
									icon={<LayersIcon className="size-4" />}
									title="Problem recurrence"
									meta={`${data.patterns.recurrences.length} threads`}
								/>
								<div className="space-y-1.5">
									{data.patterns.recurrences.slice(0, 10).map((r) => (
										<div
											key={r.problem}
											className="flex items-center justify-between gap-2 text-sm py-1.5 border-b border-dotted"
										>
											<span className="flex items-center gap-2 min-w-0">
												{r.chronic && (
													<span className="text-[10px] text-[#b4402f] font-bold shrink-0">
														⚕
													</span>
												)}
												<span className="truncate">{r.problem}</span>
												{r.icd10 && (
													<span className="text-[10px] font-mono text-muted-foreground shrink-0">
														{r.icd10}
													</span>
												)}
											</span>
											<span className="text-[11px] text-muted-foreground font-mono shrink-0">
												{r.occurrences}× · {r.cadence}
											</span>
										</div>
									))}
								</div>
							</div>
							<div>
								<SectionHead
									icon={<GitBranchIcon className="size-4" />}
									title="Comorbidity & associations"
									meta="co-occurrence lift · association ≠ causation"
								/>
								<div className="space-y-1.5">
									{data.patterns.comorbidities.slice(0, 8).map((c) => (
										<div
											key={`${c.problem_a}-${c.problem_b}`}
											className="flex items-center justify-between gap-2 text-sm py-1.5 border-b border-dotted"
										>
											<span className="truncate">
												{c.problem_a}{" "}
												<span className="text-muted-foreground">+</span>{" "}
												{c.problem_b}
											</span>
											<span className="text-[11px] font-mono text-muted-foreground shrink-0">
												lift {c.lift.toFixed(2)} · n{c.co_occurrences}
											</span>
										</div>
									))}
									{data.causal.associations
										.filter((a) => a.kind !== "condition_to_condition")
										.slice(0, 4)
										.map((a) => (
											<div
												key={`${a.antecedent}-${a.consequent}`}
												className="flex items-center justify-between gap-2 text-sm py-1.5 border-b border-dotted"
											>
												<span className="truncate">
													{a.antecedent}{" "}
													<span className="text-muted-foreground">→</span>{" "}
													{a.consequent}
												</span>
												<span className="text-[11px] font-mono text-muted-foreground shrink-0">
													{a.confidence} · {a.strength.toFixed(2)}
												</span>
											</div>
										))}
								</div>
							</div>
						</section>

						{/* disclaimer */}
						<div className="flex items-start gap-2 text-[11px] text-muted-foreground border-t pt-4">
							<InfoIcon className="size-3.5 mt-0.5 shrink-0" />
							<span>{data.disclaimer}</span>
						</div>
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}

function SectionHead({
	icon,
	title,
	meta,
}: {
	icon: React.ReactNode;
	title: string;
	meta: string;
}) {
	return (
		<div className="flex items-baseline gap-3 mb-3">
			<h3 className="flex items-center gap-1.5 text-base font-semibold">
				{icon}
				{title}
			</h3>
			<span className="text-[11px] text-muted-foreground font-mono">
				{meta}
			</span>
			<div className="flex-1 h-px bg-border" />
		</div>
	);
}
