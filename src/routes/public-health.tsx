import { useState } from "react";
import { BASE_API_URL } from "@/config/api-routes";
import { ApiKeyRequiredDialog } from "@/features/api-keys/components/api-key-required-dialog";
import { useServiceApiKeyStore } from "@/features/api-keys/store/service-api-key.store";
import { Button } from "@/components/shadcn/button";
import { ViewCodeDialog } from "@/components/view-code-dialog";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";
import { toast } from "sonner";

const METRICS = [
	{ id: "overview", label: "Full Overview" },
	{ id: "demographics", label: "Demographics" },
	{ id: "conditions", label: "Conditions" },
	{ id: "medications", label: "Medications" },
	{ id: "trends", label: "Visit Trends" },
	{ id: "wearable_summary", label: "Wearable Summary" },
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

const PublicHealthPage = () => {
	const [metric, setMetric] = useState("overview");
	const [region, setRegion] = useState("");
	const [dateFrom, setDateFrom] = useState("");
	const [dateTo, setDateTo] = useState("");
	const [groupBy, setGroupBy] = useState("");
	const [topN, setTopN] = useState(10);
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<Record<string, unknown> | null>(null);
	const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
	const { selectedApiKey } = useServiceApiKeyStore();

	const handleCompute = async () => {
		if (!selectedApiKey) {
			setShowApiKeyDialog(true);
			return;
		}
		setIsLoading(true);
		setResult(null);
		try {
			const headers = await getAuthHeaders(ENDPOINT);
			const body: Record<string, unknown> = {
				metric,
				top_n: topN,
			};
			if (region) body.region = region;
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
			const json = await resp.json();
			setResult(json);
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
				<div className="flex-1 flex flex-col lg:grid lg:grid-cols-3 overflow-hidden">
					{/* Left: Controls */}
					<div className="border-b lg:border-b-0 lg:border-r flex flex-col overflow-auto p-4 space-y-4">
						<div className="flex items-center justify-between">
							<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
								Public Health Statistics
							</h2>
							<ViewCodeDialog
								endpoint={ENDPOINT}
								method="POST"
								body={{
									metric: "overview",
									region: "Hanoi",
									date_from: "2024-01-01",
									date_to: "2025-12-31",
									top_n: 10,
								}}
								description="Compute population-level health statistics"
							/>
						</div>

						<div className="space-y-3">
							<div>
								<span className="text-[11px] text-muted-foreground block mb-1">
									Metric
								</span>
								<div className="flex flex-wrap gap-1.5">
									{METRICS.map((m) => (
										<button
											key={m.id}
											type="button"
											onClick={() => setMetric(m.id)}
											className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
												metric === m.id
													? "bg-primary text-primary-foreground border-primary"
													: "hover:bg-muted"
											}`}
										>
											{m.label}
										</button>
									))}
								</div>
							</div>

							<div className="grid grid-cols-2 gap-2">
								<div>
									<span className="text-[11px] text-muted-foreground block mb-1">
										Region
									</span>
									<input
										value={region}
										onChange={(e) => setRegion(e.target.value)}
										placeholder="e.g. Hanoi"
										className="w-full rounded-md border bg-transparent px-2 py-1.5 text-xs"
									/>
								</div>
								<div>
									<span className="text-[11px] text-muted-foreground block mb-1">
										Group By
									</span>
									<select
										value={groupBy}
										onChange={(e) => setGroupBy(e.target.value)}
										className="w-full rounded-md border bg-transparent px-2 py-1.5 text-xs"
									>
										{GROUP_BY.map((g) => (
											<option key={g.id} value={g.id}>
												{g.label}
											</option>
										))}
									</select>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-2">
								<div>
									<span className="text-[11px] text-muted-foreground block mb-1">
										From
									</span>
									<input
										type="date"
										value={dateFrom}
										onChange={(e) => setDateFrom(e.target.value)}
										className="w-full rounded-md border bg-transparent px-2 py-1.5 text-xs"
									/>
								</div>
								<div>
									<span className="text-[11px] text-muted-foreground block mb-1">
										To
									</span>
									<input
										type="date"
										value={dateTo}
										onChange={(e) => setDateTo(e.target.value)}
										className="w-full rounded-md border bg-transparent px-2 py-1.5 text-xs"
									/>
								</div>
							</div>

							<div>
								<span className="text-[11px] text-muted-foreground block mb-1">
									Top N: {topN}
								</span>
								<input
									type="range"
									min={3}
									max={50}
									value={topN}
									onChange={(e) => setTopN(Number(e.target.value))}
									className="w-full"
								/>
							</div>

							<Button
								size="sm"
								className="w-full"
								onClick={handleCompute}
								disabled={isLoading}
							>
								{isLoading ? "Computing..." : "Compute Statistics"}
							</Button>
						</div>
					</div>

					{/* Right: Results */}
					<div className="lg:col-span-2 flex flex-col overflow-auto">
						{result ? (
							<div className="p-4 space-y-6">
								{/* Demographics */}
								{demographics && (
									<div className="space-y-2">
										<h3 className="text-sm font-semibold">Demographics</h3>
										<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
											<StatCard
												label="Total Patients"
												value={String(demographics.total_patients ?? 0)}
											/>
											{Object.entries(
												(demographics.gender_distribution ?? {}) as Record<
													string,
													number
												>
											).map(([g, count]) => (
												<StatCard
													key={g}
													label={
														g === "male"
															? "Male"
															: g === "female"
																? "Female"
																: g
													}
													value={String(count)}
												/>
											))}
										</div>
										{demographics.age_groups && (
											<div className="flex flex-wrap gap-2 mt-2">
												{Object.entries(
													demographics.age_groups as Record<string, number>
												).map(([group, count]) => (
													<div
														key={group}
														className="px-3 py-1.5 rounded-md border text-xs"
													>
														<span className="font-medium">{group}:</span>{" "}
														{count}
													</div>
												))}
											</div>
										)}
									</div>
								)}

								{/* Conditions */}
								{conditions && (
									<div className="space-y-2">
										<h3 className="text-sm font-semibold">Conditions</h3>
										<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
											<StatCard
												label="Total"
												value={String(conditions.total_conditions ?? 0)}
											/>
											<StatCard
												label="Chronic Rate"
												value={`${conditions.chronic_rate_pct ?? 0}%`}
											/>
											<StatCard
												label="Avg Comorbidities"
												value={String(conditions.comorbidity_avg ?? 0)}
											/>
										</div>
										{(
											conditions.top_conditions as
												| { name: string; count: number }[]
												| undefined
										)?.length ? (
											<div className="space-y-1 mt-2">
												{(
													conditions.top_conditions as {
														name: string;
														count: number;
													}[]
												).map((c, i) => (
													<div
														key={c.name}
														className="flex items-center gap-2 text-xs py-1 px-2 rounded border"
													>
														<span className="text-muted-foreground w-4 text-right">
															{i + 1}
														</span>
														<span className="flex-1">{c.name}</span>
														<span className="font-mono">{c.count}</span>
													</div>
												))}
											</div>
										) : null}
									</div>
								)}

								{/* Medications */}
								{medications && (
									<div className="space-y-2">
										<h3 className="text-sm font-semibold">Medications</h3>
										<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
											<StatCard
												label="Total Rxs"
												value={String(medications.total_prescriptions ?? 0)}
											/>
											<StatCard
												label="Polypharmacy"
												value={`${medications.polypharmacy_rate_pct ?? 0}%`}
											/>
										</div>
									</div>
								)}

								{/* Trends */}
								{trends.length > 0 && (
									<div className="space-y-2">
										<h3 className="text-sm font-semibold">Visit Trends</h3>
										<div className="flex items-end gap-1 h-24 px-1">
											{trends.map((t) => {
												const maxCount = Math.max(
													...trends.map((x) => x.count),
													1
												);
												const height = Math.max((t.count / maxCount) * 100, 4);
												return (
													<div
														key={t.period}
														className="flex-1 flex flex-col items-center gap-0.5"
													>
														<span className="text-[9px] text-muted-foreground">
															{t.count}
														</span>
														<div
															className="w-full rounded-t bg-primary/60"
															style={{ height: `${height}%` }}
														/>
														<span className="text-[8px] text-muted-foreground truncate max-w-full">
															{t.period}
														</span>
													</div>
												);
											})}
										</div>
									</div>
								)}

								{/* Wearable */}
								{wearable && (
									<div className="space-y-2">
										<h3 className="text-sm font-semibold">Wearable Summary</h3>
										<div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
											<StatCard
												label="Patients w/ Wearable"
												value={String(
													wearable.total_patients_with_wearable ?? 0
												)}
											/>
											<StatCard
												label="Avg Steps"
												value={
													wearable.avg_daily_steps != null
														? String(wearable.avg_daily_steps)
														: "—"
												}
											/>
											<StatCard
												label="Avg HR"
												value={
													wearable.avg_heart_rate != null
														? `${wearable.avg_heart_rate} bpm`
														: "—"
												}
											/>
											<StatCard
												label="Avg Sleep"
												value={
													wearable.avg_sleep_hours != null
														? `${wearable.avg_sleep_hours}h`
														: "—"
												}
											/>
											<StatCard
												label="Avg SpO2"
												value={
													wearable.avg_blood_oxygen != null
														? `${wearable.avg_blood_oxygen}%`
														: "—"
												}
											/>
										</div>
									</div>
								)}

								{/* Raw JSON */}
								<details className="mt-4">
									<summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
										Raw JSON response
									</summary>
									<pre className="mt-2 text-[11px] font-mono whitespace-pre-wrap bg-muted/30 p-3 rounded-md border">
										{JSON.stringify(result, null, 2)}
									</pre>
								</details>
							</div>
						) : (
							<div className="flex-1 flex items-center justify-center p-8">
								<div className="text-center space-y-3 max-w-md">
									<p className="text-sm text-muted-foreground">
										Compute population-level statistics from aggregated patient
										data. Select a metric and click Compute.
									</p>
									<p className="text-[11px] text-muted-foreground/60">
										Demographics · Disease Prevalence · Medication Patterns ·
										Visit Trends · Wearable Health
									</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
			<ApiKeyRequiredDialog
				open={showApiKeyDialog}
				onOpenChange={setShowApiKeyDialog}
			/>
		</DashboardLayout>
	);
};

function StatCard({ label, value }: { label: string; value: string }) {
	return (
		<div className="px-3 py-2 rounded-lg border bg-muted/20">
			<div className="text-[10px] text-muted-foreground">{label}</div>
			<div className="text-lg font-bold mt-0.5">{value}</div>
		</div>
	);
}

export default PublicHealthPage;
