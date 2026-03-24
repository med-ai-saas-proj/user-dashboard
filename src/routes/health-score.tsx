import { useState } from "react";
import { API_ROUTES } from "@/config/api-routes";
import { ApiKeyRequiredDialog } from "@/features/api-keys/components/api-key-required-dialog";
import { useServiceApiKeyStore } from "@/features/api-keys/store/service-api-key.store";
import { ViewCodeDialog } from "@/components/view-code-dialog";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";
import { ApiTopology, TOPOLOGIES } from "@/components/api-topology";
import { toast } from "sonner";
import { Button } from "@/components/shadcn/button";

interface Factor {
	name: string;
	value: string | number;
	impact: "positive" | "negative" | "neutral";
	description?: string;
}

interface HealthScoreResponse {
	score: number;
	category: string;
	summary: string;
	factors: Factor[];
}

const EHR_EXAMPLE = `{
  "resourceType": "Bundle",
  "type": "collection",
  "entry": [
    {
      "resource": {
        "resourceType": "Patient",
        "name": [{"family": "Nguyen", "given": ["Van", "A"]}],
        "gender": "male",
        "birthDate": "1985-03-15"
      }
    },
    {
      "resource": {
        "resourceType": "Condition",
        "code": {"coding": [{"system": "http://hl7.org/fhir/sid/icd-10", "code": "E11.9", "display": "Type 2 diabetes mellitus"}]},
        "clinicalStatus": {"coding": [{"code": "active"}]}
      }
    },
    {
      "resource": {
        "resourceType": "Condition",
        "code": {"coding": [{"system": "http://hl7.org/fhir/sid/icd-10", "code": "I10", "display": "Essential hypertension"}]},
        "clinicalStatus": {"coding": [{"code": "active"}]}
      }
    },
    {
      "resource": {
        "resourceType": "Observation",
        "code": {"coding": [{"system": "http://loinc.org", "code": "4548-4", "display": "HbA1c"}]},
        "valueQuantity": {"value": 7.2, "unit": "%"}
      }
    },
    {
      "resource": {
        "resourceType": "Observation",
        "code": {"coding": [{"system": "http://loinc.org", "code": "55284-4", "display": "Blood pressure"}]},
        "component": [
          {"code": {"coding": [{"code": "8480-6", "display": "Systolic"}]}, "valueQuantity": {"value": 142, "unit": "mmHg"}},
          {"code": {"coding": [{"code": "8462-4", "display": "Diastolic"}]}, "valueQuantity": {"value": 88, "unit": "mmHg"}}
        ]
      }
    }
  ]
}`;

const _scoreColor = (score: number) => {
	if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
	if (score >= 60) return "text-amber-600 dark:text-amber-400";
	if (score >= 40) return "text-orange-600 dark:text-orange-400";
	return "text-red-600 dark:text-red-400";
};

const scoreColorHex = (score: number) => {
	if (score >= 80) return "#10b981";
	if (score >= 60) return "#f59e0b";
	if (score >= 40) return "#f97316";
	return "#ef4444";
};

const scoreBgClass = (score: number) => {
	if (score >= 80)
		return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
	if (score >= 60)
		return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
	if (score >= 40)
		return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800";
	return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
};

const impactIcon = (impact: string) => {
	if (impact === "positive") return "\u2191";
	if (impact === "negative") return "\u2193";
	return "\u2013";
};

const impactColor = (impact: string) => {
	if (impact === "positive") return "text-emerald-600 dark:text-emerald-400";
	if (impact === "negative") return "text-red-600 dark:text-red-400";
	return "text-muted-foreground";
};

const impactBorderColor = (impact: string) => {
	if (impact === "positive") return "border-l-emerald-500";
	if (impact === "negative") return "border-l-red-500";
	return "border-l-gray-300 dark:border-l-gray-600";
};

const impactBarColor = (impact: string) => {
	if (impact === "positive") return "bg-emerald-500";
	if (impact === "negative") return "bg-red-400";
	return "bg-gray-300 dark:bg-gray-600";
};

/** SVG arc gauge -- semicircle from 180deg to 0deg */
const ArcGauge = ({ score }: { score: number }) => {
	const size = 200;
	const strokeWidth = 16;
	const radius = (size - strokeWidth) / 2;
	const cx = size / 2;
	const cy = size / 2 + 10;

	// Arc runs from 180deg (left) to 0deg (right) -- a semicircle
	const normalised = Math.min(Math.max((score - 20) / 80, 0), 1); // 20-100 range
	const arcLength = Math.PI * radius;
	const dashOffset = arcLength * (1 - normalised);

	// Describe a semicircular arc (left to right, curving upward)
	const d = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`;

	return (
		<svg
			width={size}
			height={size / 2 + 30}
			viewBox={`0 0 ${size} ${size / 2 + 30}`}
			className="mx-auto"
		>
			<title>Health Score Gauge</title>
			{/* Gradient definition */}
			<defs>
				<linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
					<stop offset="0%" stopColor="#ef4444" />
					<stop offset="35%" stopColor="#f97316" />
					<stop offset="60%" stopColor="#f59e0b" />
					<stop offset="100%" stopColor="#10b981" />
				</linearGradient>
			</defs>

			{/* Track */}
			<path
				d={d}
				fill="none"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				className="text-muted/30"
				strokeLinecap="round"
			/>

			{/* Filled arc */}
			<path
				d={d}
				fill="none"
				stroke="url(#gaugeGrad)"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeDasharray={arcLength}
				strokeDashoffset={dashOffset}
				style={{
					transition: "stroke-dashoffset 1s ease-out",
				}}
			/>

			{/* Score text */}
			<text
				x={cx}
				y={cy - 18}
				textAnchor="middle"
				className="fill-foreground"
				style={{
					fontSize: "42px",
					fontFamily: "ui-monospace, monospace",
					fontWeight: 700,
				}}
			>
				{score}
			</text>
			<text
				x={cx}
				y={cy + 4}
				textAnchor="middle"
				className="fill-muted-foreground"
				style={{ fontSize: "12px" }}
			>
				out of 100
			</text>

			{/* Min / Max labels */}
			<text
				x={cx - radius}
				y={cy + 20}
				textAnchor="middle"
				className="fill-muted-foreground"
				style={{ fontSize: "10px" }}
			>
				20
			</text>
			<text
				x={cx + radius}
				y={cy + 20}
				textAnchor="middle"
				className="fill-muted-foreground"
				style={{ fontSize: "10px" }}
			>
				100
			</text>
		</svg>
	);
};

const HealthScorePage = () => {
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<HealthScoreResponse | null>(null);
	const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
	const { selectedApiKey } = useServiceApiKeyStore();

	const requireApiKey = (): boolean => {
		if (!selectedApiKey) {
			setShowApiKeyDialog(true);
			return false;
		}
		return true;
	};

	const handleEvaluate = async () => {
		if (!requireApiKey() || !input.trim()) return;
		setIsLoading(true);
		setResult(null);

		try {
			let data: unknown;
			try {
				data = JSON.parse(input);
			} catch {
				toast.error("Invalid JSON \u2014 please paste valid EHR data");
				setIsLoading(false);
				return;
			}

			const headers = await getAuthHeaders(API_ROUTES.SERVICES.HEALTH_SCORE);
			const resp = await fetch(API_ROUTES.SERVICES.HEALTH_SCORE, {
				method: "POST",
				headers,
				body: JSON.stringify({ ehr_data: data }),
			});
			if (!resp.ok)
				throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
			const json: HealthScoreResponse = await resp.json();
			setResult(json);
			toast.success(`Health score: ${json.score} (${json.category})`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Evaluation failed");
		} finally {
			setIsLoading(false);
		}
	};

	const _totalFactorWeight = result ? result.factors.length || 1 : 1;

	return (
		<DashboardLayout pageTitle="Health Score">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				{/* ---- Top bar ---- */}
				<div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setInput(EHR_EXAMPLE)}
						>
							Load Example
						</Button>
						<ViewCodeDialog
							endpoint={API_ROUTES.SERVICES.HEALTH_SCORE}
							method="POST"
							body={{
								ehr_data: {
									resourceType: "Bundle",
									type: "collection",
									entry: [],
								},
							}}
							description="Evaluate health score from EHR data (FHIR Bundle)"
						/>
					</div>
					<Button
						type="button"
						onClick={handleEvaluate}
						disabled={isLoading || !input.trim()}
						className="min-w-[140px]"
					>
						{isLoading ? (
							<span className="flex items-center gap-2">
								<svg
									className="animate-spin h-4 w-4"
									viewBox="0 0 24 24"
									fill="none"
								>
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
								Evaluating...
							</span>
						) : (
							"Evaluate"
						)}
					</Button>
				</div>

				{/* ---- Main content: Left input + Right dashboard ---- */}
				<div className="flex-1 grid grid-cols-1 lg:grid-cols-[2fr_3fr] overflow-hidden">
					{/* Left: EHR Input (40%) */}
					<div className="border-r flex flex-col overflow-hidden">
						<div className="px-4 py-3 border-b">
							<span className="text-sm font-semibold tracking-tight">
								EHR Data Input
							</span>
							<p className="text-xs text-muted-foreground mt-0.5">
								Paste a FHIR Bundle or EHR JSON document
							</p>
						</div>
						<div className="flex-1 p-4 overflow-hidden flex flex-col">
							<textarea
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder='{\n  "resourceType": "Bundle",\n  "type": "collection",\n  "entry": [ ... ]\n}'
								className="flex-1 w-full rounded-xl border px-4 py-3 text-xs font-mono bg-background resize-none focus:ring-2 focus:ring-ring focus:outline-none transition-shadow"
							/>
						</div>
					</div>

					{/* Right: Score Dashboard (60%) */}
					<div className="flex flex-col overflow-hidden">
						{result ? (
							<div className="flex-1 overflow-y-auto p-6 space-y-6">
								{/* ---- Gauge + Category ---- */}
								<div className="flex flex-col items-center">
									<ArcGauge score={result.score} />

									<span
										className={`mt-3 inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold border ${scoreBgClass(result.score)}`}
									>
										{result.category}
									</span>
								</div>

								{/* ---- Summary card ---- */}
								<div className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
									<h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
										<svg
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="text-muted-foreground"
										>
											<title>Summary</title>
											<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
											<polyline points="14 2 14 8 20 8" />
											<line x1="16" y1="13" x2="8" y2="13" />
											<line x1="16" y1="17" x2="8" y2="17" />
										</svg>
										Summary
									</h3>
									<p className="text-sm leading-relaxed text-muted-foreground">
										{result.summary}
									</p>
								</div>

								{/* ---- Score breakdown bar ---- */}
								{result.factors.length > 0 && (
									<div className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
										<h3 className="text-sm font-semibold mb-3">
											Score Breakdown
										</h3>
										<div className="flex h-4 rounded-full overflow-hidden gap-0.5">
											{result.factors.map((f, i) => (
												<div
													key={`bar-${i}`}
													className={`${impactBarColor(f.impact)} first:rounded-l-full last:rounded-r-full transition-all`}
													style={{ flex: 1 }}
													title={`${f.name}: ${f.value}`}
												/>
											))}
										</div>
										<div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
											{result.factors.map((f, i) => (
												<span
													key={`lbl-${i}`}
													className="truncate px-0.5 text-center"
													style={{ flex: 1 }}
												>
													{f.name}
												</span>
											))}
										</div>
									</div>
								)}

								{/* ---- Factors grid ---- */}
								{result.factors.length > 0 && (
									<div>
										<h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
											<svg
												width="16"
												height="16"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
												className="text-muted-foreground"
											>
												<title>Factors</title>
												<rect x="3" y="3" width="7" height="7" />
												<rect x="14" y="3" width="7" height="7" />
												<rect x="3" y="14" width="7" height="7" />
												<rect x="14" y="14" width="7" height="7" />
											</svg>
											Contributing Factors
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
											{result.factors.map((f, i) => (
												<div
													key={`factor-${i}`}
													className={`rounded-xl border border-l-4 ${impactBorderColor(f.impact)} bg-card p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5`}
												>
													<div className="flex items-start gap-3">
														<span
															className={`text-xl font-bold shrink-0 mt-0.5 ${impactColor(f.impact)}`}
														>
															{impactIcon(f.impact)}
														</span>
														<div className="flex-1 min-w-0">
															<div className="flex items-center justify-between gap-2">
																<span className="font-semibold text-sm">
																	{f.name}
																</span>
																<span
																	className="text-xs font-mono px-2 py-0.5 rounded-md bg-muted shrink-0"
																	style={{
																		color: scoreColorHex(
																			typeof f.value === "number" ? f.value : 50
																		),
																	}}
																>
																	{f.value}
																</span>
															</div>
															{f.description && (
																<p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
																	{f.description}
																</p>
															)}
														</div>
													</div>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						) : (
							/* ---- Empty state ---- */
							<div className="flex-1 flex items-center justify-center p-8">
								<div className="text-center space-y-4 max-w-sm">
									<div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-rose-100 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/20 flex items-center justify-center shadow-sm">
										<svg
											width="32"
											height="32"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											className="text-rose-500 dark:text-rose-400"
											aria-hidden="true"
										>
											<title>Health</title>
											<path d="M16 28.45l-1.93-1.76C7.2 20.48 3 16.84 3 12.5 3 8.56 5.9 5.5 10 5.5c2.32 0 4.55 1.08 6 2.79 1.45-1.71 3.68-2.79 6-2.79 4.1 0 7 3.06 7 7 0 4.34-4.2 7.98-11.07 14.2L16 28.45z" />
										</svg>
									</div>
									<div>
										<p className="text-base font-semibold">No evaluation yet</p>
										<p className="text-sm text-muted-foreground mt-1">
											Paste EHR data on the left and click{" "}
											<strong className="text-foreground">Evaluate</strong> to
											generate a comprehensive health score dashboard.
										</p>
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setInput(EHR_EXAMPLE)}
										className="mt-2"
									>
										Load Example Data
									</Button>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* ---- Collapsible API Topology ---- */}
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
							<ApiTopology {...TOPOLOGIES.health_score} />
						</div>
					</details>
				</div>
			</div>

			<ApiKeyRequiredDialog
				open={showApiKeyDialog}
				onOpenChange={setShowApiKeyDialog}
			/>
		</DashboardLayout>
	);
};

export default HealthScorePage;
