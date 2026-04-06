import { useState } from "react";
import { BASE_API_URL } from "@/config/api-routes";
import { Button } from "@/components/shadcn/button";
import { ViewCodeDialog } from "@/components/view-code-dialog";
import { ApiTopology, TOPOLOGIES } from "@/components/api-topology";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";
import { toast } from "sonner";
import {
	UsersIcon,
	HeartPulseIcon,
	PillIcon,
	TrendingUpIcon,
	WatchIcon,
	BarChart3Icon,
	FilterIcon,
	LayersIcon,
	ActivityIcon,
} from "lucide-react";

/* ─── Constants ─── */
const METRICS = [
	{
		id: "overview",
		label: "Overview",
		icon: <BarChart3Icon className="w-3 h-3" />,
	},
	{
		id: "demographics",
		label: "Demographics",
		icon: <UsersIcon className="w-3 h-3" />,
	},
	{
		id: "conditions",
		label: "Conditions",
		icon: <HeartPulseIcon className="w-3 h-3" />,
	},
	{
		id: "medications",
		label: "Medications",
		icon: <PillIcon className="w-3 h-3" />,
	},
	{
		id: "trends",
		label: "Visit Trends",
		icon: <TrendingUpIcon className="w-3 h-3" />,
	},
	{
		id: "wearable_summary",
		label: "Wearable",
		icon: <WatchIcon className="w-3 h-3" />,
	},
];

const GROUP_BY = [
	{ id: "", label: "None" },
	{ id: "age_group", label: "Age Group" },
	{ id: "gender", label: "Gender" },
	{ id: "region", label: "Region" },
	{ id: "facility", label: "Facility" },
	{ id: "month", label: "Month" },
];

const ENDPOINT = `${BASE_API_URL}service/api/v1/public_health/statistics`;

const COLORS = [
	"#0d9488",
	"#f59e0b",
	"#6366f1",
	"#ec4899",
	"#22c55e",
	"#f97316",
	"#8b5cf6",
	"#14b8a6",
];

/* ─── SVG Donut Chart ─── */
function DonutChart({
	data,
	size = 120,
}: {
	data: { label: string; value: number; color: string }[];
	size?: number;
}) {
	const total = data.reduce((s, d) => s + d.value, 0);
	if (total === 0) return null;
	const r = (size - 8) / 2;
	const circumference = 2 * Math.PI * (r * 0.7);
	let offset = 0;

	return (
		<div className="flex items-center gap-3">
			<svg
				width={size}
				height={size}
				viewBox={`0 0 ${size} ${size}`}
				role="img"
				aria-label="Donut chart"
			>
				{data.map((d) => {
					const pct = d.value / total;
					const dashLen = pct * circumference;
					const currentOffset = offset;
					offset += dashLen;
					return (
						<circle
							key={d.label}
							cx={size / 2}
							cy={size / 2}
							r={r * 0.7}
							fill="none"
							stroke={d.color}
							strokeWidth={r * 0.35}
							strokeDasharray={`${dashLen} ${circumference - dashLen}`}
							strokeDashoffset={-currentOffset}
							transform={`rotate(-90 ${size / 2} ${size / 2})`}
						/>
					);
				})}
				<text
					x={size / 2}
					y={size / 2 - 4}
					textAnchor="middle"
					className="fill-current font-bold"
					style={{ fontSize: 16 }}
				>
					{total}
				</text>
				<text
					x={size / 2}
					y={size / 2 + 12}
					textAnchor="middle"
					className="fill-muted-foreground"
					style={{ fontSize: 9 }}
				>
					total
				</text>
			</svg>
			<div className="space-y-1">
				{data.map((d) => (
					<div key={d.label} className="flex items-center gap-1.5 text-[11px]">
						<span
							className="w-2 h-2 rounded-full shrink-0"
							style={{ backgroundColor: d.color }}
						/>
						<span className="text-muted-foreground">{d.label}</span>
						<span className="font-bold font-mono ml-auto">{d.value}</span>
					</div>
				))}
			</div>
		</div>
	);
}

/* ─── Horizontal Bar Chart ─── */
function HBarChart({ data }: { data: { label: string; value: number }[] }) {
	const maxVal = Math.max(...data.map((d) => d.value), 1);
	return (
		<div className="space-y-1.5">
			{data.map((d, i) => (
				<div key={d.label} className="flex items-center gap-2">
					<span className="text-[10px] text-muted-foreground w-4 text-right font-mono shrink-0">
						{i + 1}
					</span>
					<div className="flex-1 min-w-0">
						<div className="flex items-center justify-between mb-0.5">
							<span className="text-[11px] font-medium truncate">
								{d.label}
							</span>
							<span className="text-[10px] font-mono font-bold shrink-0 ml-2">
								{d.value}
							</span>
						</div>
						<div className="h-2 rounded-full bg-muted overflow-hidden">
							<div
								className="h-full rounded-full transition-all duration-700"
								style={{
									width: `${(d.value / maxVal) * 100}%`,
									backgroundColor: COLORS[i % COLORS.length],
								}}
							/>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

/* ─── Vertical Bar Chart ─── */
function VBarChart({ data }: { data: { period: string; count: number }[] }) {
	const maxCount = Math.max(...data.map((d) => d.count), 1);
	return (
		<div className="flex items-end gap-1 h-32 px-1">
			{data.map((t, i) => {
				const height = Math.max((t.count / maxCount) * 100, 4);
				return (
					<div
						key={t.period}
						className="flex-1 flex flex-col items-center gap-0.5 group relative"
					>
						<div className="opacity-0 group-hover:opacity-100 absolute -top-6 bg-popover border rounded px-1.5 py-0.5 text-[10px] font-mono font-bold shadow-sm transition-opacity pointer-events-none z-10">
							{t.count}
						</div>
						<div
							className="w-full rounded-t transition-all duration-500 hover:opacity-80"
							style={{
								height: `${height}%`,
								backgroundColor: COLORS[i % COLORS.length],
								opacity: 0.75,
							}}
						/>
						<span className="text-[9px] text-muted-foreground truncate max-w-full leading-tight">
							{t.period.slice(-5)}
						</span>
					</div>
				);
			})}
		</div>
	);
}

/* ─── Stat Card ─── */
function StatCard({
	label,
	value,
	icon,
	color,
	suffix,
}: {
	label: string;
	value: string | number;
	icon?: React.ReactNode;
	color?: string;
	suffix?: string;
}) {
	return (
		<div className="rounded-xl border bg-card p-3 hover:shadow-sm transition-shadow">
			<div className="flex items-center gap-1.5 mb-1">
				{icon && <span className="text-muted-foreground">{icon}</span>}
				<span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
					{label}
				</span>
			</div>
			<p
				className="text-2xl font-bold font-mono leading-tight"
				style={color ? { color } : undefined}
			>
				{value}
				{suffix && (
					<span className="text-sm font-normal text-muted-foreground ml-0.5">
						{suffix}
					</span>
				)}
			</p>
		</div>
	);
}

/* ─── Main Page ─── */
const PublicHealthPage = () => {
	const [metric, setMetric] = useState("overview");
	const [region, setRegion] = useState("");
	const [facility, setFacility] = useState("");
	const [patientIds, setPatientIds] = useState("");
	const [dateFrom, setDateFrom] = useState("");
	const [dateTo, setDateTo] = useState("");
	const [groupBy, setGroupBy] = useState("");
	const [topN, setTopN] = useState(10);
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<Record<string, unknown> | null>(null);
	const [showFilters, setShowFilters] = useState(false);

	const handleCompute = async () => {
		setIsLoading(true);
		setResult(null);
		try {
			const headers = await getAuthHeaders(ENDPOINT);
			const body: Record<string, unknown> = { metric, top_n: topN };
			if (region) body.region = region;
			if (facility) body.facility = facility;
			if (patientIds.trim())
				body.patient_ids = patientIds
					.split(",")
					.map((id) => id.trim())
					.filter(Boolean);
			if (dateFrom) body.date_from = dateFrom;
			if (dateTo) body.date_to = dateTo;
			if (groupBy) body.group_by = groupBy;

			const resp = await fetch(ENDPOINT, {
				method: "POST",
				headers,
				body: JSON.stringify(body),
			});
			if (!resp.ok)
				throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
			setResult(await resp.json());
			toast.success("Statistics computed");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed");
		} finally {
			setIsLoading(false);
		}
	};

	const demographics = result?.demographics as
		| Record<string, unknown>
		| undefined;
	const conditions = result?.conditions as Record<string, unknown> | undefined;
	const medications = result?.medications as
		| Record<string, unknown>
		| undefined;
	const trends = (result?.trends ?? []) as { period: string; count: number }[];
	const wearable = result?.wearable_summary as
		| Record<string, unknown>
		| undefined;

	return (
		<DashboardLayout pageTitle="Public Health">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				{/* ─── Top Command Bar ─── */}
				<div className="flex items-center justify-between px-4 py-2 border-b bg-card gap-2 flex-wrap">
					<div className="flex items-center gap-1.5">
						{METRICS.map((m) => (
							<button
								type="button"
								key={m.id}
								onClick={() => setMetric(m.id)}
								className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
									metric === m.id
										? "bg-primary text-primary-foreground shadow-sm"
										: "hover:bg-muted text-muted-foreground"
								}`}
							>
								{m.icon}
								<span className="hidden sm:inline">{m.label}</span>
							</button>
						))}
					</div>
					<div className="flex items-center gap-2">
						<Button
							size="sm"
							variant="outline"
							className="text-xs h-7 gap-1"
							onClick={() => setShowFilters(!showFilters)}
						>
							<FilterIcon className="w-3 h-3" />
							Filters
						</Button>
						<Button
							size="sm"
							className="h-7 text-xs"
							onClick={handleCompute}
							disabled={isLoading}
						>
							{isLoading ? "Computing..." : "Compute"}
						</Button>
						<ViewCodeDialog
							endpoint={ENDPOINT}
							method="POST"
							body={{ metric: "overview", region: "Hanoi", top_n: 10 }}
							description="Compute population-level health statistics"
						/>
					</div>
				</div>

				{/* ─── Collapsible Filter Panel ─── */}
				{showFilters && (
					<div className="px-4 py-3 border-b bg-muted/20 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
						<div>
							<span className="text-[10px] text-muted-foreground block mb-0.5">
								Patient IDs
							</span>
							<input
								value={patientIds}
								onChange={(e) => setPatientIds(e.target.value)}
								placeholder="1, 2, 5"
								className="w-full rounded-md border bg-transparent px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
							/>
						</div>
						<div>
							<span className="text-[10px] text-muted-foreground block mb-0.5">
								Region
							</span>
							<input
								value={region}
								onChange={(e) => setRegion(e.target.value)}
								placeholder="Hanoi"
								className="w-full rounded-md border bg-transparent px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
							/>
						</div>
						<div>
							<span className="text-[10px] text-muted-foreground block mb-0.5">
								Facility
							</span>
							<input
								value={facility}
								onChange={(e) => setFacility(e.target.value)}
								placeholder="City General"
								className="w-full rounded-md border bg-transparent px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
							/>
						</div>
						<div>
							<span className="text-[10px] text-muted-foreground block mb-0.5">
								Group By
							</span>
							<select
								aria-label="Group By"
								value={groupBy}
								onChange={(e) => setGroupBy(e.target.value)}
								className="w-full rounded-md border bg-transparent px-2 py-1 text-xs"
							>
								{GROUP_BY.map((g) => (
									<option key={g.id} value={g.id}>
										{g.label}
									</option>
								))}
							</select>
						</div>
						<div>
							<span className="text-[10px] text-muted-foreground block mb-0.5">
								From
							</span>
							<input
								type="date"
								aria-label="Date from"
								value={dateFrom}
								onChange={(e) => setDateFrom(e.target.value)}
								className="w-full rounded-md border bg-transparent px-2 py-1 text-xs"
							/>
						</div>
						<div>
							<span className="text-[10px] text-muted-foreground block mb-0.5">
								To
							</span>
							<input
								type="date"
								aria-label="Date to"
								value={dateTo}
								onChange={(e) => setDateTo(e.target.value)}
								className="w-full rounded-md border bg-transparent px-2 py-1 text-xs"
							/>
						</div>
						<div>
							<span className="text-[10px] text-muted-foreground block mb-0.5">
								Top N: {topN}
							</span>
							<input
								type="range"
								aria-label="Top N"
								min={3}
								max={50}
								value={topN}
								onChange={(e) => setTopN(Number(e.target.value))}
								className="w-full mt-1"
							/>
						</div>
					</div>
				)}

				{/* ─── Dashboard Content ─── */}
				<div className="flex-1 overflow-y-auto">
					{result ? (
						<div className="p-4 space-y-4 max-w-[1600px] mx-auto">
							{/* ── Demographics ── */}
							{demographics && (
								<div className="space-y-3">
									<h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
										<UsersIcon className="w-3.5 h-3.5" /> Demographics
									</h3>
									<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
										<StatCard
											label="Total Patients"
											value={String(demographics.total_patients ?? 0)}
											icon={<UsersIcon className="w-3.5 h-3.5" />}
											color="#0d9488"
										/>
										{Object.entries(
											(demographics.gender_distribution ?? {}) as Record<
												string,
												number
											>
										).map(([g, count], i) => (
											<StatCard
												key={g}
												label={
													g === "male" ? "Male" : g === "female" ? "Female" : g
												}
												value={String(count)}
												color={COLORS[i + 1]}
											/>
										))}
									</div>

									<div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
										{/* Gender donut */}
										{demographics.gender_distribution && (
											<div className="rounded-xl border bg-card p-4">
												<p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
													Gender Distribution
												</p>
												<DonutChart
													data={Object.entries(
														demographics.gender_distribution as Record<
															string,
															number
														>
													).map(([label, value], i) => ({
														label:
															label.charAt(0).toUpperCase() + label.slice(1),
														value,
														color: COLORS[i],
													}))}
												/>
											</div>
										)}

										{/* Age groups */}
										{demographics.age_groups && (
											<div className="rounded-xl border bg-card p-4">
												<p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
													Age Groups
												</p>
												<HBarChart
													data={Object.entries(
														demographics.age_groups as Record<string, number>
													).map(([label, value]) => ({ label, value }))}
												/>
											</div>
										)}
									</div>
								</div>
							)}

							{/* ── Conditions ── */}
							{conditions && (
								<div className="space-y-3">
									<h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
										<HeartPulseIcon className="w-3.5 h-3.5" /> Conditions
									</h3>
									<div className="grid grid-cols-3 gap-3">
										<StatCard
											label="Total"
											value={String(conditions.total_conditions ?? 0)}
											color="#6366f1"
										/>
										<StatCard
											label="Chronic Rate"
											value={String(conditions.chronic_rate_pct ?? 0)}
											suffix="%"
											color="#ec4899"
										/>
										<StatCard
											label="Avg Comorbidities"
											value={String(conditions.comorbidity_avg ?? 0)}
											color="#f59e0b"
										/>
									</div>
									{(
										conditions.top_conditions as
											| { name: string; count: number }[]
											| undefined
									)?.length ? (
										<div className="rounded-xl border bg-card p-4">
											<p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
												Top Conditions
											</p>
											<HBarChart
												data={(
													conditions.top_conditions as {
														name: string;
														count: number;
													}[]
												).map((c) => ({
													label: c.name,
													value: c.count,
												}))}
											/>
										</div>
									) : null}
								</div>
							)}

							{/* ── Medications ── */}
							{medications && (
								<div className="space-y-3">
									<h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
										<PillIcon className="w-3.5 h-3.5" /> Medications
									</h3>
									<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
										<StatCard
											label="Total Rxs"
											value={String(medications.total_prescriptions ?? 0)}
											color="#8b5cf6"
										/>
										<StatCard
											label="Polypharmacy Rate"
											value={String(medications.polypharmacy_rate_pct ?? 0)}
											suffix="%"
											color="#f97316"
										/>
									</div>
								</div>
							)}

							{/* ── Trends ── */}
							{trends.length > 0 && (
								<div className="space-y-3">
									<h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
										<TrendingUpIcon className="w-3.5 h-3.5" /> Visit Trends
									</h3>
									<div className="rounded-xl border bg-card p-4">
										<VBarChart data={trends} />
									</div>
								</div>
							)}

							{/* ── Wearable ── */}
							{wearable && (
								<div className="space-y-3">
									<h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
										<WatchIcon className="w-3.5 h-3.5" /> Wearable Summary
									</h3>
									<div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
										<StatCard
											label="Patients"
											value={String(wearable.total_patients_with_wearable ?? 0)}
											icon={<WatchIcon className="w-3.5 h-3.5" />}
											color="#14b8a6"
										/>
										<StatCard
											label="Avg Steps"
											value={
												wearable.avg_daily_steps != null
													? String(wearable.avg_daily_steps)
													: "—"
											}
											icon={<ActivityIcon className="w-3.5 h-3.5" />}
											color="#22c55e"
										/>
										<StatCard
											label="Avg HR"
											value={
												wearable.avg_heart_rate != null
													? String(wearable.avg_heart_rate)
													: "—"
											}
											suffix="bpm"
											icon={<HeartPulseIcon className="w-3.5 h-3.5" />}
											color="#ef4444"
										/>
										<StatCard
											label="Avg Sleep"
											value={
												wearable.avg_sleep_hours != null
													? String(wearable.avg_sleep_hours)
													: "—"
											}
											suffix="h"
											color="#6366f1"
										/>
										<StatCard
											label="Avg SpO2"
											value={
												wearable.avg_blood_oxygen != null
													? String(wearable.avg_blood_oxygen)
													: "—"
											}
											suffix="%"
											color="#0d9488"
										/>
									</div>
								</div>
							)}

							{/* ── Raw JSON ── */}
							<details>
								<summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
									Raw JSON response
								</summary>
								<pre className="mt-2 text-[11px] font-mono whitespace-pre-wrap bg-muted/30 p-3 rounded-xl border max-h-64 overflow-auto">
									{JSON.stringify(result, null, 2)}
								</pre>
							</details>
						</div>
					) : (
						/* ─── Empty State ─── */
						<div className="flex-1 flex items-center justify-center p-8 h-full">
							<div className="text-center space-y-4 max-w-md">
								<div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border flex items-center justify-center">
									<BarChart3Icon className="w-10 h-10 text-primary/50" />
								</div>
								<div>
									<h3 className="text-lg font-bold">
										Population Health Dashboard
									</h3>
									<p className="text-sm text-muted-foreground mt-1">
										Compute population-level epidemiological statistics from
										aggregated patient data.
									</p>
									<p className="text-[11px] text-muted-foreground/60 mt-2">
										Demographics · Disease Prevalence · Medication Patterns ·
										Visit Trends · Wearable Health
									</p>
								</div>
								<Button size="sm" className="text-xs" onClick={handleCompute}>
									Compute Statistics
								</Button>
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
						<span className="font-medium">API Topology</span>
					</summary>
					<div className="mt-2 pb-2">
						<ApiTopology {...TOPOLOGIES.public_health} />
					</div>
				</details>
			</div>
		</DashboardLayout>
	);
};

export default PublicHealthPage;
