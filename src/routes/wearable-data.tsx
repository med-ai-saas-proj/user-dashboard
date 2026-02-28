import { useState } from "react";
import { BASE_API_URL } from "@/config/api-routes";
import { ApiKeyRequiredDialog } from "@/features/api-keys/components/api-key-required-dialog";
import { useServiceApiKeyStore } from "@/features/api-keys/store/service-api-key.store";
import { Button } from "@/components/shadcn/button";
import { ViewCodeDialog } from "@/components/view-code-dialog";
import { ApiTopology, TOPOLOGIES } from "@/components/api-topology";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";
import { toast } from "sonner";

const EXAMPLE_APPLE_HEALTH = JSON.stringify(
	[
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
	],
	null,
	2
);

const SOURCES = [
	{ id: "apple_health", label: "Apple Health" },
	{ id: "google_health", label: "Google Health Connect" },
	{ id: "fitbit", label: "Fitbit" },
	{ id: "samsung_health", label: "Samsung Health" },
	{ id: "garmin", label: "Garmin Connect" },
	{ id: "withings", label: "Withings" },
	{ id: "oura", label: "Oura Ring" },
];

const WearableDataPage = () => {
	const [patientId, setPatientId] = useState("1");
	const [source, setSource] = useState("apple_health");
	const [deviceName, setDeviceName] = useState("");
	const [dataInput, setDataInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<Record<string, unknown> | null>(null);
	const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
	const { selectedApiKey } = useServiceApiKeyStore();

	const wearableUrl = (pid: string) =>
		`${BASE_API_URL}service/api/v1/patient/${pid}/wearable`;

	const handleIngest = async () => {
		if (!selectedApiKey) {
			setShowApiKeyDialog(true);
			return;
		}
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
			toast.success(`Ingested ${json.days_ingested} day(s) from ${source}`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Request failed");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<DashboardLayout pageTitle="Wearable Data">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				<div className="flex-1 flex flex-col lg:grid lg:grid-cols-2 overflow-hidden">
					{/* Left: Input */}
					<div className="border-b lg:border-b-0 lg:border-r flex flex-col overflow-hidden min-h-0 lg:min-h-full">
						<div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30 gap-2 flex-wrap">
							<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
								Wearable Device Data
							</h2>
							<Button
								variant="ghost"
								size="sm"
								className="h-7 text-xs"
								onClick={() => setDataInput(EXAMPLE_APPLE_HEALTH)}
							>
								Load Example
							</Button>
						</div>
						<div className="px-4 py-2 border-b bg-muted/10 flex gap-3 flex-wrap items-center">
							<div className="flex items-center gap-1.5">
								<span className="text-[11px] text-muted-foreground">
									Patient ID:
								</span>
								<input
									value={patientId}
									onChange={(e) => setPatientId(e.target.value)}
									className="w-20 rounded-md border bg-transparent px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
								/>
							</div>
							<div className="flex items-center gap-1.5">
								<span className="text-[11px] text-muted-foreground">
									Source:
								</span>
								<select
									value={source}
									onChange={(e) => setSource(e.target.value)}
									className="rounded-md border bg-transparent px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
								>
									{SOURCES.map((s) => (
										<option key={s.id} value={s.id}>
											{s.label}
										</option>
									))}
								</select>
							</div>
							<div className="flex items-center gap-1.5">
								<span className="text-[11px] text-muted-foreground">
									Device:
								</span>
								<input
									value={deviceName}
									onChange={(e) => setDeviceName(e.target.value)}
									placeholder="e.g. Apple Watch Series 9"
									className="w-44 rounded-md border bg-transparent px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
								/>
							</div>
						</div>
						<div className="flex-1 overflow-hidden">
							<textarea
								value={dataInput}
								onChange={(e) => setDataInput(e.target.value)}
								placeholder={
									'Array of daily records:\n[\n  {"date": "2025-02-20", "steps": 8423, "heart_rate_avg": 72, "sleep_hours": 7.2, ...}\n]'
								}
								className="w-full h-full p-4 font-mono text-[12px] leading-relaxed bg-transparent focus:outline-none resize-none"
								spellCheck={false}
							/>
						</div>
						<div className="flex items-center justify-between px-4 py-2.5 border-t bg-muted/30 gap-2 flex-wrap">
							<span className="text-[11px] text-muted-foreground/60 hidden sm:inline">
								Supports: steps, heart rate, sleep, SpO2, HRV, respiratory rate,
								calories
							</span>
							<Button
								size="sm"
								className="h-8 text-xs ml-auto"
								onClick={handleIngest}
								disabled={!patientId || !dataInput.trim() || isLoading}
							>
								{isLoading ? "Ingesting..." : "Ingest Data"}
							</Button>
						</div>
					</div>

					{/* Right: Output */}
					<div className="flex flex-col overflow-hidden min-h-0 lg:min-h-full">
						<div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
							<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
								Output
							</h2>
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
						{result ? (
							<div className="flex-1 overflow-auto p-4">
								<div className="space-y-4">
									{result.success && (
										<div className="flex items-center gap-3">
											<span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
												Success
											</span>
											<span className="text-sm text-muted-foreground">
												{String(result.days_ingested)} day(s) ingested from{" "}
												{String(result.source)}
											</span>
										</div>
									)}
									<pre className="text-[12px] font-mono whitespace-pre-wrap leading-relaxed break-all bg-muted/30 p-3 rounded-md border">
										{JSON.stringify(result, null, 2)}
									</pre>
								</div>
							</div>
						) : (
							<div className="flex-1 flex items-center justify-center p-8">
								<div className="text-center space-y-3 max-w-sm">
									<p className="text-sm text-muted-foreground">
										Import daily health data from wearable devices. Data is
										stored per-day and merged into the patient&apos;s temporal
										timeline for trend analysis.
									</p>
									<div className="flex flex-wrap justify-center gap-1.5">
										{SOURCES.slice(0, 4).map((s) => (
											<span
												key={s.id}
												className="px-2 py-0.5 text-[11px] font-medium rounded-full border"
											>
												{s.label}
											</span>
										))}
									</div>
									<p className="text-[11px] text-muted-foreground/60">
										Metrics: steps, heart rate, sleep, SpO2, HRV, respiratory
										rate, active energy
									</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
			<div className="px-4 py-2 border-t">
				<ApiTopology {...TOPOLOGIES.wearable_data} />
			</div>
			<ApiKeyRequiredDialog
				open={showApiKeyDialog}
				onOpenChange={setShowApiKeyDialog}
			/>
		</DashboardLayout>
	);
};

export default WearableDataPage;
