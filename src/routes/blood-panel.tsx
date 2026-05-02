import { useState } from "react";
import { toast } from "sonner";
import { ApiTopology, TOPOLOGIES } from "@/components/api-topology";
import { RawResponseViewer } from "@/components/raw-response-viewer";
import { Button } from "@/components/shadcn/button";
import { ViewCodeDialog } from "@/components/view-code-dialog";
import { API_ROUTES } from "@/config/api-routes";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";

interface MarkerInput {
	id: string;
	name: string;
	value: string;
	unit: string;
}

interface MarkerAnalysis {
	name: string;
	value: number;
	unit: string;
	status: string;
	reference_range: string;
	interpretation: string;
	clinical_significance: string;
}

interface AnalysisResult {
	success: boolean;
	panel_type: string;
	markers_analyzed: number;
	results: MarkerAnalysis[];
	summary: string;
	flags: string[];
	recommendations: string[];
}

const statusColor = (s: string) => {
	const upper = s.toUpperCase();
	// Severe / critical
	if (
		upper === "CRITICAL_HIGH" ||
		upper === "CRITICAL_LOW" ||
		upper === "CRITICAL" ||
		upper === "SEVERE_HIGH" ||
		upper === "SEVERE_LOW"
	) {
		return "text-white bg-red-600 border border-red-700 font-bold";
	}
	// Standard high/low — strong red
	if (upper === "HIGH" || upper === "LOW") {
		return "text-red-700 bg-red-100 border border-red-300 dark:text-red-300 dark:bg-red-900/40 dark:border-red-800";
	}
	// Borderline — amber
	if (
		upper === "BORDERLINE" ||
		upper === "BORDERLINE_HIGH" ||
		upper === "BORDERLINE_LOW" ||
		upper === "ELEVATED"
	) {
		return "text-amber-800 bg-amber-100 border border-amber-300 dark:text-amber-300 dark:bg-amber-900/30 dark:border-amber-800";
	}
	// Normal — green
	if (upper === "NORMAL" || upper === "OPTIMAL") {
		return "text-green-700 bg-green-100 border border-green-300 dark:text-green-300 dark:bg-green-900/30 dark:border-green-800";
	}
	return "text-muted-foreground bg-muted border";
};

const rowAccent = (s: string) => {
	const upper = s.toUpperCase();
	if (upper.startsWith("CRITICAL") || upper.startsWith("SEVERE")) {
		return "border-l-4 border-l-red-600 bg-red-50/50 dark:bg-red-950/20";
	}
	if (upper === "HIGH" || upper === "LOW") {
		return "border-l-4 border-l-red-400";
	}
	if (upper.startsWith("BORDERLINE") || upper === "ELEVATED") {
		return "border-l-4 border-l-amber-400";
	}
	if (upper === "NORMAL" || upper === "OPTIMAL") {
		return "border-l-4 border-l-green-400";
	}
	return "";
};

const CBC_PRESET: MarkerInput[] = [
	{ id: "1", name: "Hemoglobin", value: "14.2", unit: "g/dL" },
	{ id: "2", name: "WBC", value: "7200", unit: "cells/uL" },
	{ id: "3", name: "RBC", value: "4.9", unit: "M/uL" },
	{ id: "4", name: "Platelets", value: "245", unit: "K/uL" },
	{ id: "5", name: "Hematocrit", value: "42.1", unit: "%" },
	{ id: "6", name: "MCV", value: "86", unit: "fL" },
];

const CMP_PRESET: MarkerInput[] = [
	{ id: "1", name: "Glucose", value: "105", unit: "mg/dL" },
	{ id: "2", name: "BUN", value: "18", unit: "mg/dL" },
	{ id: "3", name: "Creatinine", value: "1.1", unit: "mg/dL" },
	{ id: "4", name: "Sodium", value: "140", unit: "mEq/L" },
	{ id: "5", name: "Potassium", value: "4.2", unit: "mEq/L" },
	{ id: "6", name: "Calcium", value: "9.5", unit: "mg/dL" },
	{ id: "7", name: "ALT", value: "35", unit: "U/L" },
	{ id: "8", name: "AST", value: "28", unit: "U/L" },
	{ id: "9", name: "Albumin", value: "4.2", unit: "g/dL" },
	{ id: "10", name: "Bilirubin_Total", value: "0.8", unit: "mg/dL" },
];

const LIPID_PRESET: MarkerInput[] = [
	{ id: "1", name: "Cholesterol_Total", value: "220", unit: "mg/dL" },
	{ id: "2", name: "LDL", value: "140", unit: "mg/dL" },
	{ id: "3", name: "HDL", value: "45", unit: "mg/dL" },
	{ id: "4", name: "Triglycerides", value: "180", unit: "mg/dL" },
];

const BloodPanelPage = () => {
	const [markers, setMarkers] = useState<MarkerInput[]>([...CBC_PRESET]);
	const [panelType, setPanelType] = useState("CBC");
	const [age, setAge] = useState("45");
	const [gender, setGender] = useState("male");
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<AnalysisResult | null>(null);

	const loadPreset = (preset: MarkerInput[], type: string) => {
		setMarkers([...preset]);
		setPanelType(type);
		setResult(null);
	};

	const addMarker = () => {
		setMarkers((prev) => [
			...prev,
			{ id: String(Date.now()), name: "", value: "", unit: "" },
		]);
	};

	const removeMarker = (id: string) => {
		setMarkers((prev) => prev.filter((m) => m.id !== id));
	};

	const updateMarker = (id: string, field: keyof MarkerInput, val: string) => {
		setMarkers((prev) =>
			prev.map((m) => (m.id === id ? { ...m, [field]: val } : m))
		);
	};

	const handleAnalyze = async () => {
		const valid = markers.filter((m) => m.name && m.value);
		if (valid.length === 0) {
			toast.error("Add at least one marker");
			return;
		}
		setIsLoading(true);
		setResult(null);
		try {
			const headers = await getAuthHeaders(
				API_ROUTES.SERVICES.BLOOD_PANEL_ANALYZE
			);
			const resp = await fetch(API_ROUTES.SERVICES.BLOOD_PANEL_ANALYZE, {
				method: "POST",
				headers,
				body: JSON.stringify({
					markers: valid.map((m) => ({
						name: m.name,
						value: Number.parseFloat(m.value),
						unit: m.unit,
					})),
					patient_age: age ? Number.parseInt(age, 10) : null,
					patient_gender: gender || null,
					panel_type: panelType,
				}),
			});
			if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
			const data: AnalysisResult = await resp.json();
			setResult(data);
			toast.success(`Analyzed ${data.markers_analyzed} markers`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Analysis failed");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<DashboardLayout pageTitle="Blood Panel Analyzer">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				<div className="px-4 py-2 border-b bg-muted/10">
					<p className="text-xs text-muted-foreground">
						CBC/BMP/CMP/Lipid panel analysis with critical-value flagging,
						age/sex-adjusted reference ranges, and clinical interpretation
						guidelines.
					</p>
				</div>
				<div className="flex items-center justify-between px-4 py-1.5 border-b">
					<div className="flex items-center gap-1.5">
						{[
							["CBC", CBC_PRESET],
							["CMP", CMP_PRESET],
							["Lipid", LIPID_PRESET],
						].map(([label, preset]) => (
							<Button
								key={label as string}
								variant={panelType === label ? "default" : "outline"}
								size="sm"
								onClick={() =>
									loadPreset(preset as MarkerInput[], label as string)
								}
							>
								{label as string}
							</Button>
						))}
					</div>
					<ViewCodeDialog
						endpoint={API_ROUTES.SERVICES.BLOOD_PANEL_ANALYZE}
						method="POST"
						body={{
							markers: [{ name: "Hemoglobin", value: 14.2, unit: "g/dL" }],
							panel_type: "CBC",
						}}
						description="Analyze blood panel markers with AI-powered interpretation"
					/>
				</div>

				<div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden border-b">
					{/* Left: Input */}
					<div className="border-r flex flex-col overflow-hidden">
						<div className="p-4 border-b">
							<div className="grid grid-cols-2 gap-2 mb-3">
								<div>
									<label
										className="text-xs text-muted-foreground"
										htmlFor="bp-age"
									>
										Age
									</label>
									<input
										id="bp-age"
										value={age}
										onChange={(e) => setAge(e.target.value)}
										type="number"
										className="w-full rounded-md border px-3 py-1.5 text-sm bg-background"
									/>
								</div>
								<div>
									<label
										className="text-xs text-muted-foreground"
										htmlFor="bp-gender"
									>
										Gender
									</label>
									<select
										id="bp-gender"
										value={gender}
										onChange={(e) => setGender(e.target.value)}
										className="w-full rounded-md border px-3 py-1.5 text-sm bg-background"
									>
										<option value="male">Male</option>
										<option value="female">Female</option>
									</select>
								</div>
							</div>
						</div>

						<div className="flex-1 overflow-y-auto p-4 space-y-2">
							{markers.map((m) => (
								<div
									key={m.id}
									className="grid grid-cols-[1fr_80px_80px_32px] gap-1.5 items-center"
								>
									<input
										value={m.name}
										onChange={(e) => updateMarker(m.id, "name", e.target.value)}
										placeholder="Marker"
										className="rounded-md border px-2 py-1.5 text-sm bg-background"
									/>
									<input
										value={m.value}
										onChange={(e) =>
											updateMarker(m.id, "value", e.target.value)
										}
										placeholder="Value"
										className="rounded-md border px-2 py-1.5 text-sm bg-background text-right"
									/>
									<input
										value={m.unit}
										onChange={(e) => updateMarker(m.id, "unit", e.target.value)}
										placeholder="Unit"
										className="rounded-md border px-2 py-1.5 text-sm bg-background"
									/>
									<button
										type="button"
										onClick={() => removeMarker(m.id)}
										className="text-muted-foreground hover:text-destructive text-lg"
									>
										&times;
									</button>
								</div>
							))}
							<Button
								variant="outline"
								size="sm"
								onClick={addMarker}
								className="w-full"
							>
								+ Add Marker
							</Button>
						</div>

						<div className="p-4 border-t">
							<Button
								onClick={handleAnalyze}
								disabled={isLoading}
								className="w-full"
							>
								{isLoading ? "Analyzing..." : "Analyze Blood Panel"}
							</Button>
						</div>
					</div>

					{/* Right: Results */}
					<div className="flex flex-col overflow-hidden">
						{result ? (
							<div className="flex-1 overflow-y-auto p-4 space-y-4">
								{/* Summary */}
								<div className="rounded-md border p-4">
									<span className="text-sm font-medium">Summary</span>
									<p className="text-sm mt-1 text-muted-foreground leading-relaxed">
										{result.summary}
									</p>
								</div>

								{/* Flags */}
								{result.flags.length > 0 && (
									<div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-4">
										<span className="text-sm font-medium text-amber-500">
											Flags ({result.flags.length})
										</span>
										<ul className="mt-1 space-y-1">
											{result.flags.map((f, i) => (
												<li key={i} className="text-xs text-muted-foreground">
													{f}
												</li>
											))}
										</ul>
									</div>
								)}

								{/* Marker results */}
								<div className="space-y-2">
									<span className="text-sm font-medium">Marker Details</span>
									{result.results.map((r, i) => (
										<div
											key={i}
											className={`rounded-md border p-3 ${rowAccent(r.status)}`}
										>
											<div className="flex items-center justify-between">
												<span className="text-sm font-medium">{r.name}</span>
												<div className="flex items-center gap-2">
													<span className="text-sm font-mono">
														{r.value} {r.unit}
													</span>
													<span
														className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(r.status)}`}
													>
														{r.status}
													</span>
												</div>
											</div>
											<div className="text-xs text-muted-foreground mt-1">
												Ref: {r.reference_range}
											</div>
											<div className="text-xs mt-1">{r.interpretation}</div>
											{r.status !== "NORMAL" && (
												<div className="text-xs text-muted-foreground mt-0.5 italic">
													{r.clinical_significance}
												</div>
											)}
										</div>
									))}
								</div>

								{/* Recommendations */}
								{result.recommendations.length > 0 && (
									<div className="rounded-md border p-4">
										<span className="text-sm font-medium">Recommendations</span>
										<ul className="mt-2 space-y-1">
											{result.recommendations.map((r, i) => (
												<li key={i} className="text-xs text-muted-foreground">
													{r}
												</li>
											))}
										</ul>
									</div>
								)}
								<RawResponseViewer data={result} />
							</div>
						) : (
							<div className="flex-1 flex items-center justify-center p-8">
								<div className="text-center space-y-3 max-w-sm">
									<div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
										<svg
											width="24"
											height="24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											className="text-muted-foreground"
										>
											<title>Blood Panel</title>
											<path d="M12 2C12 2 5 9 5 13a7 7 0 0 0 14 0c0-4-7-11-7-11z" />
										</svg>
									</div>
									<p className="text-sm text-muted-foreground">
										Select a panel preset or enter markers manually, then click{" "}
										<strong>Analyze</strong>.
									</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="px-4 py-1.5 border-t bg-muted/10 text-[10px] text-muted-foreground text-center">
				Reference ranges from Tietz / Quest Diagnostics standards
			</div>
			<div className="px-4 py-2 border-t">
				<ApiTopology {...TOPOLOGIES.blood_panel} />
			</div>
		</DashboardLayout>
	);
};

export default BloodPanelPage;
