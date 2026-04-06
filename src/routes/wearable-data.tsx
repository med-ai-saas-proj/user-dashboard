import { useState, useMemo } from "react";
import { BASE_API_URL } from "@/config/api-routes";
import { Button } from "@/components/shadcn/button";
import { ViewCodeDialog } from "@/components/view-code-dialog";
import { ApiTopology, TOPOLOGIES } from "@/components/api-topology";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";
import { toast } from "sonner";
import {
	HeartPulseIcon,
	ActivityIcon,
	MoonIcon,
	DropletIcon,
	WindIcon,
	ZapIcon,
	FlameIcon,
	FootprintsIcon,
	WatchIcon,
	SmartphoneIcon,
	SearchIcon,
	LayersIcon,
	TableIcon,
	ChevronDownIcon,
	ChevronRightIcon,
	BarChart3Icon,
	SparklesIcon,
} from "lucide-react";

/* ─── Example Data ─── */
const EXAMPLE_APPLE_HEALTH = [
	{
		date: "2025-02-18",
		steps: 6210,
		heart_rate_avg: 68,
		heart_rate_min: 55,
		heart_rate_max: 130,
		sleep_hours: 7.8,
		active_energy_kcal: 410,
		blood_oxygen_pct: 99,
		respiratory_rate: 14,
		hrv_ms: 48,
	},
	{
		date: "2025-02-19",
		steps: 9840,
		heart_rate_avg: 71,
		heart_rate_min: 54,
		heart_rate_max: 148,
		sleep_hours: 6.5,
		active_energy_kcal: 590,
		blood_oxygen_pct: 97,
		respiratory_rate: 15,
		hrv_ms: 40,
	},
	{
		date: "2025-02-20",
		steps: 8423,
		heart_rate_avg: 72,
		heart_rate_min: 58,
		heart_rate_max: 142,
		sleep_hours: 7.2,
		active_energy_kcal: 520,
		blood_oxygen_pct: 98,
		respiratory_rate: 15,
		hrv_ms: 42,
	},
	{
		date: "2025-02-21",
		steps: 11204,
		heart_rate_avg: 74,
		heart_rate_min: 56,
		heart_rate_max: 155,
		sleep_hours: 6.8,
		active_energy_kcal: 680,
		blood_oxygen_pct: 97,
		respiratory_rate: 16,
		hrv_ms: 38,
	},
	{
		date: "2025-02-22",
		steps: 5102,
		heart_rate_avg: 70,
		heart_rate_min: 60,
		heart_rate_max: 118,
		sleep_hours: 8.1,
		active_energy_kcal: 350,
		blood_oxygen_pct: 99,
		respiratory_rate: 14,
		hrv_ms: 45,
	},
	{
		date: "2025-02-23",
		steps: 12530,
		heart_rate_avg: 76,
		heart_rate_min: 52,
		heart_rate_max: 162,
		sleep_hours: 7.0,
		active_energy_kcal: 720,
		blood_oxygen_pct: 98,
		respiratory_rate: 15,
		hrv_ms: 36,
	},
	{
		date: "2025-02-24",
		steps: 7350,
		heart_rate_avg: 69,
		heart_rate_min: 57,
		heart_rate_max: 128,
		sleep_hours: 8.4,
		active_energy_kcal: 460,
		blood_oxygen_pct: 99,
		respiratory_rate: 13,
		hrv_ms: 50,
	},
];

const EXAMPLE_JSON_STRING = JSON.stringify(EXAMPLE_APPLE_HEALTH, null, 2);

/* ─── Interfaces ─── */
interface DayRecord {
	date: string;
	steps?: number;
	heart_rate_avg?: number;
	heart_rate_min?: number;
	heart_rate_max?: number;
	sleep_hours?: number;
	active_energy_kcal?: number;
	blood_oxygen_pct?: number;
	respiratory_rate?: number;
	hrv_ms?: number;
}

/* ─── Sources ─── */
const SOURCES = [
	{
		id: "apple_health",
		label: "Apple Health",
		icon: <WatchIcon className="w-4 h-4" />,
		color: "bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900",
	},
	{
		id: "google_health",
		label: "Google Health Connect",
		icon: <HeartPulseIcon className="w-4 h-4" />,
		color: "bg-green-600 text-white",
	},
	{
		id: "fitbit",
		label: "Fitbit",
		icon: <ActivityIcon className="w-4 h-4" />,
		color: "bg-teal-500 text-white",
	},
	{
		id: "samsung_health",
		label: "Samsung Health",
		icon: <SmartphoneIcon className="w-4 h-4" />,
		color: "bg-blue-600 text-white",
	},
	{
		id: "garmin",
		label: "Garmin Connect",
		icon: <WatchIcon className="w-4 h-4" />,
		color: "bg-yellow-500 text-black",
	},
	{
		id: "withings",
		label: "Withings",
		icon: <HeartPulseIcon className="w-4 h-4" />,
		color: "bg-emerald-600 text-white",
	},
	{
		id: "oura",
		label: "Oura Ring",
		icon: <SparklesIcon className="w-4 h-4" />,
		color: "bg-purple-600 text-white",
	},
];

/* ─── Helpers ─── */
const statusColor = (metric: string, value: number): string => {
	switch (metric) {
		case "steps":
			return value >= 10000
				? "text-emerald-500"
				: value >= 7000
					? "text-emerald-400"
					: value >= 4000
						? "text-amber-500"
						: "text-red-500";
		case "heart_rate_avg":
			return value >= 60 && value <= 80
				? "text-emerald-500"
				: value >= 50 && value <= 100
					? "text-amber-500"
					: "text-red-500";
		case "sleep_hours":
			return value >= 7 && value <= 9
				? "text-emerald-500"
				: value >= 6
					? "text-amber-500"
					: "text-red-500";
		case "blood_oxygen_pct":
			return value >= 95
				? "text-emerald-500"
				: value >= 90
					? "text-amber-500"
					: "text-red-500";
		case "hrv_ms":
			return value >= 40
				? "text-emerald-500"
				: value >= 20
					? "text-amber-500"
					: "text-red-500";
		case "respiratory_rate":
			return value >= 12 && value <= 20
				? "text-emerald-500"
				: value >= 10 && value <= 24
					? "text-amber-500"
					: "text-red-500";
		case "active_energy_kcal":
			return value >= 500
				? "text-emerald-500"
				: value >= 300
					? "text-amber-500"
					: "text-red-500";
		default:
			return "text-foreground";
	}
};

const statusBgColor = (metric: string, value: number): string => {
	switch (metric) {
		case "steps":
			return value >= 10000
				? "bg-emerald-500"
				: value >= 7000
					? "bg-emerald-400"
					: value >= 4000
						? "bg-amber-500"
						: "bg-red-500";
		case "heart_rate_avg":
			return value >= 60 && value <= 80
				? "bg-emerald-500"
				: value >= 50 && value <= 100
					? "bg-amber-500"
					: "bg-red-500";
		case "sleep_hours":
			return value >= 7 && value <= 9
				? "bg-emerald-500"
				: value >= 6
					? "bg-amber-500"
					: "bg-red-500";
		case "blood_oxygen_pct":
			return value >= 95
				? "bg-emerald-500"
				: value >= 90
					? "bg-amber-500"
					: "bg-red-500";
		case "hrv_ms":
			return value >= 40
				? "bg-emerald-500"
				: value >= 20
					? "bg-amber-500"
					: "bg-red-500";
		case "respiratory_rate":
			return value >= 12 && value <= 20
				? "bg-emerald-500"
				: value >= 10 && value <= 24
					? "bg-amber-500"
					: "bg-red-500";
		case "active_energy_kcal":
			return value >= 500
				? "bg-emerald-500"
				: value >= 300
					? "bg-amber-500"
					: "bg-red-500";
		default:
			return "bg-muted-foreground";
	}
};

/* ─── Mini Sparkline (CSS-only bar chart) ─── */
function MiniSpark({ values, color }: { values: number[]; color: string }) {
	const max = Math.max(...values, 1);
	return (
		<div className="flex items-end gap-px h-5">
			{values.map((v, i) => (
				<div
					key={i}
					className="w-[3px] rounded-sm transition-all"
					style={{
						height: `${(v / max) * 100}%`,
						backgroundColor: color,
						opacity: i === values.length - 1 ? 1 : 0.45,
					}}
				/>
			))}
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

/* ─── Metric Card Config ─── */
interface MetricConfig {
	key: keyof DayRecord;
	label: string;
	unit: string;
	icon: React.ReactNode;
	maxChart: number;
}

const METRIC_CONFIGS: MetricConfig[] = [
	{
		key: "steps",
		label: "Steps",
		unit: "steps",
		icon: <FootprintsIcon className="w-5 h-5" />,
		maxChart: 15000,
	},
	{
		key: "heart_rate_avg",
		label: "Heart Rate",
		unit: "bpm",
		icon: <HeartPulseIcon className="w-5 h-5" />,
		maxChart: 120,
	},
	{
		key: "sleep_hours",
		label: "Sleep",
		unit: "hrs",
		icon: <MoonIcon className="w-5 h-5" />,
		maxChart: 12,
	},
	{
		key: "blood_oxygen_pct",
		label: "SpO2",
		unit: "%",
		icon: <DropletIcon className="w-5 h-5" />,
		maxChart: 100,
	},
	{
		key: "hrv_ms",
		label: "HRV",
		unit: "ms",
		icon: <ActivityIcon className="w-5 h-5" />,
		maxChart: 80,
	},
	{
		key: "respiratory_rate",
		label: "Resp. Rate",
		unit: "brpm",
		icon: <WindIcon className="w-5 h-5" />,
		maxChart: 30,
	},
	{
		key: "active_energy_kcal",
		label: "Calories",
		unit: "kcal",
		icon: <FlameIcon className="w-5 h-5" />,
		maxChart: 1000,
	},
	{
		key: "heart_rate_max",
		label: "Peak HR",
		unit: "bpm",
		icon: <ZapIcon className="w-5 h-5" />,
		maxChart: 200,
	},
];

/* ─── Main Page ─── */
const WearableDataPage = () => {
	const [patientId, setPatientId] = useState("1");
	const [source, setSource] = useState("apple_health");
	const [deviceName, setDeviceName] = useState("");
	const [dataInput, setDataInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<Record<string, unknown> | null>(null);
	const [ingestedData, setIngestedData] = useState<DayRecord[]>([]);
	const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

	const wearableUrl = (pid: string) =>
		`${BASE_API_URL}service/api/v1/patient/${pid}/wearable`;

	/* Parse ingested data for visualization */
	const parsedData = useMemo<DayRecord[]>(() => {
		if (ingestedData.length > 0) return ingestedData;
		return [];
	}, [ingestedData]);

	/* Latest values for metric cards */
	const latestValues = useMemo(() => {
		if (parsedData.length === 0) return null;
		const latest = parsedData[parsedData.length - 1];
		return latest;
	}, [parsedData]);

	/* Sparkline values for each metric */
	const sparklineData = useMemo(() => {
		const result: Record<string, number[]> = {};
		for (const cfg of METRIC_CONFIGS) {
			result[cfg.key] = parsedData.map((d) => (d[cfg.key] as number) ?? 0);
		}
		return result;
	}, [parsedData]);

	const handleLoadExample = () => {
		setDataInput(EXAMPLE_JSON_STRING);
	};

	const handleIngest = async () => {
		if (!patientId || !dataInput.trim()) return;
		setIsLoading(true);
		setResult(null);

		try {
			let data: unknown[];
			try {
				data = JSON.parse(dataInput);
				if (!Array.isArray(data)) throw new Error("Expected array");
			} catch {
				toast.error("Invalid JSON — expected an array of daily records");
				setIsLoading(false);
				return;
			}

			const url = wearableUrl(patientId);
			const headers = await getAuthHeaders(url);
			const resp = await fetch(url, {
				method: "POST",
				headers,
				body: JSON.stringify({
					patient_id: Number(patientId),
					source,
					device_name: deviceName || undefined,
					data,
				}),
			});
			if (!resp.ok)
				throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
			const json = await resp.json();
			setResult(json);
			setIngestedData(data as DayRecord[]);
			toast.success(`Ingested ${json.days_ingested} day(s) from ${source}`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Request failed");
		} finally {
			setIsLoading(false);
		}
	};

	const toggleRow = (date: string) => {
		setExpandedRows((prev) => {
			const next = new Set(prev);
			if (next.has(date)) next.delete(date);
			else next.add(date);
			return next;
		});
	};

	const stepsMax = useMemo(
		() => Math.max(...parsedData.map((d) => d.steps ?? 0), 1),
		[parsedData]
	);

	return (
		<DashboardLayout pageTitle="Wearable Data">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				{/* ─── Top Command Bar ─── */}
				<div className="flex items-center justify-between px-4 py-2.5 border-b bg-card gap-3 flex-wrap">
					<div className="flex items-center gap-3 flex-wrap">
						<div className="flex items-center gap-1.5 border rounded-md px-2 py-1">
							<SearchIcon className="w-3 h-3 text-muted-foreground" />
							<input
								value={patientId}
								onChange={(e) => setPatientId(e.target.value)}
								placeholder="Patient ID"
								className="w-16 bg-transparent text-xs focus:outline-none"
							/>
						</div>
						<select
							value={source}
							onChange={(e) => setSource(e.target.value)}
							className="rounded-md border bg-transparent px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
						>
							{SOURCES.map((s) => (
								<option key={s.id} value={s.id}>
									{s.label}
								</option>
							))}
						</select>
						<input
							value={deviceName}
							onChange={(e) => setDeviceName(e.target.value)}
							placeholder="Device name (optional)"
							className="w-44 rounded-md border bg-transparent px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
						/>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							className="h-7 text-xs"
							onClick={handleLoadExample}
						>
							Load Example
						</Button>
						<Button
							size="sm"
							className="h-7 text-xs"
							onClick={handleIngest}
							disabled={!patientId || !dataInput.trim() || isLoading}
						>
							{isLoading ? "Ingesting..." : "Ingest Data"}
						</Button>
						<ViewCodeDialog
							endpoint={wearableUrl("{patient_id}")}
							method="POST"
							body={{
								patient_id: 1,
								source: "apple_health",
								device_name: "Apple Watch Series 9",
								data: [
									{
										date: "2025-02-20",
										steps: 8423,
										heart_rate_avg: 72,
										sleep_hours: 7.2,
									},
								],
							}}
							description="Ingest wearable device data into patient timeline"
						/>
					</div>
				</div>

				{/* ─── Main Content ─── */}
				<div className="flex-1 overflow-y-auto">
					<div className="p-3 max-w-[1800px] mx-auto space-y-3">
						{/* ═══ METRIC CARDS ROW ═══ */}
						{parsedData.length > 0 && latestValues ? (
							<>
								{/* Success Banner */}
								{result && (
									<div className="flex items-center gap-3 rounded-xl border bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 px-4 py-2.5">
										<div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
										<span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
											Successfully ingested {String(result.days_ingested)}{" "}
											day(s) from{" "}
											<span className="font-mono">{String(result.source)}</span>
										</span>
										<span className="text-[10px] text-emerald-600/60 dark:text-emerald-400/60 ml-auto font-mono">
											Patient #{patientId}
										</span>
									</div>
								)}

								{/* Metric Cards */}
								<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
									{METRIC_CONFIGS.map((cfg) => {
										const val = latestValues[cfg.key] as number | undefined;
										if (val === undefined) return null;
										const sparkVals = sparklineData[cfg.key] || [];
										const sc = statusColor(cfg.key, val);
										return (
											<div
												key={cfg.key}
												className="rounded-xl border bg-card p-3 hover:bg-muted/30 transition-colors group"
											>
												<div className="flex items-center justify-between mb-1.5">
													<span
														className={`${sc} opacity-70 group-hover:opacity-100 transition-opacity`}
													>
														{cfg.icon}
													</span>
													{sparkVals.length > 1 && (
														<MiniSpark
															values={sparkVals}
															color={
																sc.includes("emerald")
																	? "#22c55e"
																	: sc.includes("amber")
																		? "#eab308"
																		: sc.includes("red")
																			? "#ef4444"
																			: "#94a3b8"
															}
														/>
													)}
												</div>
												<p
													className={`text-xl font-bold font-mono leading-tight ${sc}`}
												>
													{typeof val === "number" && val % 1 !== 0
														? val.toFixed(1)
														: val}
												</p>
												<p className="text-[10px] text-muted-foreground mt-0.5">
													{cfg.label}
													<span className="ml-1 opacity-60">{cfg.unit}</span>
												</p>
											</div>
										);
									})}
								</div>

								{/* ═══ CHARTS AREA ═══ */}
								<div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
									{/* Daily Steps Bar Chart */}
									<div className="rounded-xl border bg-card p-3">
										<SectionHead
											icon={<FootprintsIcon className="w-3.5 h-3.5" />}
											title="Daily Steps"
											count={parsedData.length}
										/>
										<div className="space-y-1.5 mt-1">
											{parsedData.map((d) => {
												const pct = ((d.steps ?? 0) / stepsMax) * 100;
												const col = statusBgColor("steps", d.steps ?? 0);
												return (
													<div key={d.date} className="group">
														<div className="flex items-center gap-2">
															<span className="text-[10px] font-mono text-muted-foreground w-16 shrink-0">
																{d.date.slice(5)}
															</span>
															<div className="flex-1 h-4 rounded bg-muted/50 overflow-hidden">
																<div
																	className={`h-full rounded ${col} transition-all group-hover:opacity-80`}
																	style={{ width: `${pct}%` }}
																/>
															</div>
															<span className="text-[10px] font-mono font-bold w-14 text-right tabular-nums">
																{(d.steps ?? 0).toLocaleString()}
															</span>
														</div>
													</div>
												);
											})}
										</div>
										<div className="flex items-center justify-between mt-2 pt-2 border-t">
											<span className="text-[9px] text-muted-foreground">
												Goal: 10,000 steps/day
											</span>
											<span className="text-[9px] font-mono text-muted-foreground">
												Avg:{" "}
												{Math.round(
													parsedData.reduce((s, d) => s + (d.steps ?? 0), 0) /
														parsedData.length
												).toLocaleString()}
											</span>
										</div>
									</div>

									{/* Heart Rate Range */}
									<div className="rounded-xl border bg-card p-3">
										<SectionHead
											icon={<HeartPulseIcon className="w-3.5 h-3.5" />}
											title="Heart Rate Range"
											count={parsedData.length}
										/>
										<div className="space-y-2 mt-1">
											{parsedData.map((d) => {
												const min = d.heart_rate_min ?? 50;
												const max = d.heart_rate_max ?? 150;
												const avg = d.heart_rate_avg ?? 72;
												const chartMax = 200;
												const leftPct = (min / chartMax) * 100;
												const widthPct = ((max - min) / chartMax) * 100;
												const avgPct = (avg / chartMax) * 100;
												return (
													<div key={d.date} className="group">
														<div className="flex items-center gap-2">
															<span className="text-[10px] font-mono text-muted-foreground w-16 shrink-0">
																{d.date.slice(5)}
															</span>
															<div className="flex-1 h-4 rounded bg-muted/50 relative overflow-hidden">
																{/* Range bar */}
																<div
																	className="absolute h-full rounded bg-rose-400/40 dark:bg-rose-500/30 transition-all"
																	style={{
																		left: `${leftPct}%`,
																		width: `${widthPct}%`,
																	}}
																/>
																{/* Avg marker */}
																<div
																	className="absolute top-0 h-full w-0.5 bg-rose-600 dark:bg-rose-400 transition-all"
																	style={{ left: `${avgPct}%` }}
																/>
															</div>
															<div className="flex items-center gap-1 w-28 shrink-0 justify-end">
																<span className="text-[9px] font-mono text-blue-500">
																	{min}
																</span>
																<span className="text-[9px] text-muted-foreground">
																	/
																</span>
																<span className="text-[9px] font-mono font-bold">
																	{avg}
																</span>
																<span className="text-[9px] text-muted-foreground">
																	/
																</span>
																<span className="text-[9px] font-mono text-red-500">
																	{max}
																</span>
															</div>
														</div>
													</div>
												);
											})}
										</div>
										<div className="flex items-center gap-3 mt-2 pt-2 border-t text-[9px] text-muted-foreground">
											<span className="flex items-center gap-1">
												<span className="w-2 h-2 rounded-sm bg-blue-500" /> Min
											</span>
											<span className="flex items-center gap-1">
												<span className="w-2 h-0.5 bg-rose-600 dark:bg-rose-400" />{" "}
												Avg
											</span>
											<span className="flex items-center gap-1">
												<span className="w-2 h-2 rounded-sm bg-red-500" /> Max
											</span>
										</div>
									</div>

									{/* Sleep Hours Bar Chart */}
									<div className="rounded-xl border bg-card p-3">
										<SectionHead
											icon={<MoonIcon className="w-3.5 h-3.5" />}
											title="Sleep Duration"
											count={parsedData.length}
										/>
										<div className="space-y-1.5 mt-1">
											{parsedData.map((d) => {
												const val = d.sleep_hours ?? 0;
												const pct = (val / 12) * 100;
												const col = statusBgColor("sleep_hours", val);
												return (
													<div key={d.date} className="group">
														<div className="flex items-center gap-2">
															<span className="text-[10px] font-mono text-muted-foreground w-16 shrink-0">
																{d.date.slice(5)}
															</span>
															<div className="flex-1 h-4 rounded bg-muted/50 overflow-hidden relative">
																<div
																	className={`h-full rounded ${col} opacity-60 transition-all group-hover:opacity-80`}
																	style={{ width: `${pct}%` }}
																/>
																{/* 7-9hr ideal zone indicator */}
																<div
																	className="absolute top-0 h-full border-l border-r border-dashed border-emerald-400/40"
																	style={{
																		left: `${(7 / 12) * 100}%`,
																		width: `${(2 / 12) * 100}%`,
																	}}
																/>
															</div>
															<span className="text-[10px] font-mono font-bold w-10 text-right tabular-nums">
																{val.toFixed(1)}h
															</span>
														</div>
													</div>
												);
											})}
										</div>
										<div className="flex items-center justify-between mt-2 pt-2 border-t">
											<span className="text-[9px] text-muted-foreground">
												Ideal: 7-9 hrs
											</span>
											<span className="text-[9px] font-mono text-muted-foreground">
												Avg:{" "}
												{(
													parsedData.reduce(
														(s, d) => s + (d.sleep_hours ?? 0),
														0
													) / parsedData.length
												).toFixed(1)}
												h
											</span>
										</div>
									</div>
								</div>

								{/* ═══ DATA TABLE ═══ */}
								<div className="rounded-xl border bg-card p-3">
									<SectionHead
										icon={<TableIcon className="w-3.5 h-3.5" />}
										title="Ingested Records"
										count={parsedData.length}
									/>
									<div className="overflow-x-auto">
										<table className="w-full text-[11px]">
											<thead>
												<tr className="border-b text-muted-foreground">
													<th className="text-left py-2 font-semibold w-6" />
													<th className="text-left py-2 font-semibold">Date</th>
													<th className="text-right py-2 font-semibold">
														Steps
													</th>
													<th className="text-right py-2 font-semibold">
														HR Avg
													</th>
													<th className="text-right py-2 font-semibold">
														Sleep
													</th>
													<th className="text-right py-2 font-semibold">
														SpO2
													</th>
													<th className="text-right py-2 font-semibold">HRV</th>
													<th className="text-right py-2 font-semibold">
														Resp
													</th>
													<th className="text-right py-2 font-semibold">
														Calories
													</th>
												</tr>
											</thead>
											<tbody>
												{parsedData.map((d) => {
													const isExpanded = expandedRows.has(d.date);
													return (
														<>
															<tr
																key={d.date}
																className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
																onClick={() => toggleRow(d.date)}
															>
																<td className="py-2 text-muted-foreground">
																	{isExpanded ? (
																		<ChevronDownIcon className="w-3 h-3" />
																	) : (
																		<ChevronRightIcon className="w-3 h-3" />
																	)}
																</td>
																<td className="py-2 font-mono font-medium">
																	{d.date}
																</td>
																<td
																	className={`text-right py-2 font-mono font-bold ${statusColor("steps", d.steps ?? 0)}`}
																>
																	{(d.steps ?? 0).toLocaleString()}
																</td>
																<td
																	className={`text-right py-2 font-mono font-bold ${statusColor("heart_rate_avg", d.heart_rate_avg ?? 0)}`}
																>
																	{d.heart_rate_avg ?? "-"}
																</td>
																<td
																	className={`text-right py-2 font-mono font-bold ${statusColor("sleep_hours", d.sleep_hours ?? 0)}`}
																>
																	{d.sleep_hours != null
																		? `${d.sleep_hours.toFixed(1)}h`
																		: "-"}
																</td>
																<td
																	className={`text-right py-2 font-mono font-bold ${statusColor("blood_oxygen_pct", d.blood_oxygen_pct ?? 0)}`}
																>
																	{d.blood_oxygen_pct != null
																		? `${d.blood_oxygen_pct}%`
																		: "-"}
																</td>
																<td
																	className={`text-right py-2 font-mono font-bold ${statusColor("hrv_ms", d.hrv_ms ?? 0)}`}
																>
																	{d.hrv_ms ?? "-"}
																</td>
																<td
																	className={`text-right py-2 font-mono font-bold ${statusColor("respiratory_rate", d.respiratory_rate ?? 0)}`}
																>
																	{d.respiratory_rate ?? "-"}
																</td>
																<td
																	className={`text-right py-2 font-mono font-bold ${statusColor("active_energy_kcal", d.active_energy_kcal ?? 0)}`}
																>
																	{d.active_energy_kcal ?? "-"}
																</td>
															</tr>
															{isExpanded && (
																<tr
																	key={`${d.date}-detail`}
																	className="bg-muted/20"
																>
																	<td colSpan={9} className="px-4 py-3">
																		<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px]">
																			<div className="rounded-md bg-card border px-3 py-2">
																				<span className="text-muted-foreground block">
																					HR Min
																				</span>
																				<span className="font-mono font-bold text-blue-500">
																					{d.heart_rate_min ?? "-"} bpm
																				</span>
																			</div>
																			<div className="rounded-md bg-card border px-3 py-2">
																				<span className="text-muted-foreground block">
																					HR Max
																				</span>
																				<span className="font-mono font-bold text-red-500">
																					{d.heart_rate_max ?? "-"} bpm
																				</span>
																			</div>
																			<div className="rounded-md bg-card border px-3 py-2">
																				<span className="text-muted-foreground block">
																					HR Average
																				</span>
																				<span className="font-mono font-bold">
																					{d.heart_rate_avg ?? "-"} bpm
																				</span>
																			</div>
																			<div className="rounded-md bg-card border px-3 py-2">
																				<span className="text-muted-foreground block">
																					Active Energy
																				</span>
																				<span className="font-mono font-bold text-orange-500">
																					{d.active_energy_kcal ?? "-"} kcal
																				</span>
																			</div>
																		</div>
																	</td>
																</tr>
															)}
														</>
													);
												})}
											</tbody>
										</table>
									</div>
								</div>
							</>
						) : (
							/* ─── Empty / Input State ─── */
							<div className="space-y-3">
								{/* Data Input Area */}
								<div className="rounded-xl border bg-card overflow-hidden">
									<div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
										<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
											Wearable Device Data
										</h2>
										<span className="text-[11px] text-muted-foreground/60">
											Paste JSON array of daily records
										</span>
									</div>
									<div className="h-[300px]">
										<textarea
											value={dataInput}
											onChange={(e) => setDataInput(e.target.value)}
											placeholder={
												'[\n  {\n    "date": "2025-02-20",\n    "steps": 8423,\n    "heart_rate_avg": 72,\n    "heart_rate_min": 58,\n    "heart_rate_max": 142,\n    "sleep_hours": 7.2,\n    "active_energy_kcal": 520,\n    "blood_oxygen_pct": 98,\n    "respiratory_rate": 15,\n    "hrv_ms": 42\n  }\n]'
											}
											className="w-full h-full p-4 font-mono text-[12px] leading-relaxed bg-transparent focus:outline-none resize-none"
											spellCheck={false}
										/>
									</div>
								</div>

								{/* Metrics Supported */}
								<div className="rounded-xl border bg-card p-4">
									<SectionHead
										icon={<BarChart3Icon className="w-3.5 h-3.5" />}
										title="Supported Metrics"
										count={8}
									/>
									<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
										{METRIC_CONFIGS.map((cfg) => (
											<div
												key={cfg.key}
												className="flex items-center gap-2 rounded-lg border px-3 py-2 hover:bg-muted/30 transition-colors"
											>
												<span className="text-muted-foreground">
													{cfg.icon}
												</span>
												<div>
													<p className="text-xs font-medium">{cfg.label}</p>
													<p className="text-[9px] text-muted-foreground font-mono">
														{cfg.unit}
													</p>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						)}

						{/* ═══ SUPPORTED DEVICES ═══ */}
						<div className="rounded-xl border bg-card p-3">
							<SectionHead
								icon={<WatchIcon className="w-3.5 h-3.5" />}
								title="Supported Device Sources"
								count={SOURCES.length}
							/>
							<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
								{SOURCES.map((s) => (
									<button
										type="button"
										key={s.id}
										className={`rounded-lg border px-3 py-2.5 hover:bg-muted/30 transition-colors flex items-center gap-2 ${
											source === s.id
												? "ring-2 ring-primary border-primary"
												: ""
										}`}
										onClick={() => setSource(s.id)}
									>
										<div
											className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${s.color}`}
										>
											{s.icon}
										</div>
										<span className="text-[11px] font-medium leading-tight">
											{s.label}
										</span>
									</button>
								))}
							</div>
						</div>

						{/* ═══ JSON INPUT (when data is already ingested, show as textarea for re-ingest) ═══ */}
						{parsedData.length > 0 && (
							<div className="rounded-xl border bg-card overflow-hidden">
								<div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
									<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
										Data Input
									</h2>
									<Button
										variant="ghost"
										size="sm"
										className="h-6 text-[10px]"
										onClick={handleLoadExample}
									>
										Reload Example
									</Button>
								</div>
								<div className="h-[200px]">
									<textarea
										value={dataInput}
										onChange={(e) => setDataInput(e.target.value)}
										className="w-full h-full p-4 font-mono text-[12px] leading-relaxed bg-transparent focus:outline-none resize-none"
										spellCheck={false}
									/>
								</div>
							</div>
						)}

						{/* ═══ RAW JSON TOGGLE ═══ */}
						{result && (
							<details className="rounded-xl border bg-card overflow-hidden group">
								<summary className="flex items-center gap-2 cursor-pointer px-4 py-3 text-xs text-muted-foreground hover:text-foreground transition-colors bg-muted/30">
									<LayersIcon className="w-3.5 h-3.5" />
									<span className="font-medium">Raw API Response</span>
									<span className="text-[10px] ml-auto group-open:hidden">
										Show
									</span>
									<span className="text-[10px] ml-auto hidden group-open:inline">
										Hide
									</span>
								</summary>
								<div className="p-4 border-t">
									<pre className="text-[12px] font-mono whitespace-pre-wrap leading-relaxed break-all bg-muted/30 p-3 rounded-md border">
										{JSON.stringify(result, null, 2)}
									</pre>
								</div>
							</details>
						)}

						{/* ═══ API TOPOLOGY ═══ */}
						<details className="rounded-xl border bg-card overflow-hidden group">
							<summary className="flex items-center gap-2 cursor-pointer px-4 py-3 text-xs text-muted-foreground hover:text-foreground transition-colors bg-muted/30">
								<LayersIcon className="w-3.5 h-3.5" />
								<span className="font-medium">API Topology & Architecture</span>
								<span className="text-[10px] ml-auto group-open:hidden">
									Show
								</span>
								<span className="text-[10px] ml-auto hidden group-open:inline">
									Hide
								</span>
							</summary>
							<div className="p-4 border-t space-y-2">
								<ApiTopology {...TOPOLOGIES.wearable_data} />
								<div className="rounded-lg bg-muted/30 border p-3 text-[11px] text-muted-foreground">
									<p className="font-semibold text-foreground mb-1">
										Wearable Data API
									</p>
									<div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
										{[
											"POST /patient/{id}/wearable",
											"GET /patient/{id}/wearable",
											"GET /patient/{id}/wearable/latest",
											"GET /patient/{id}/wearable/trends",
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
				</div>
			</div>
		</DashboardLayout>
	);
};

export default WearableDataPage;
