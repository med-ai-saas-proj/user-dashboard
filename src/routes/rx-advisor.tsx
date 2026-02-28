import { useState, useRef } from "react";
import { API_ROUTES } from "@/config/api-routes";
import { ApiKeyRequiredDialog } from "@/features/api-keys/components/api-key-required-dialog";
import { useServiceApiKeyStore } from "@/features/api-keys/store/service-api-key.store";
import { Button } from "@/components/shadcn/button";
import { MarkdownCustom } from "@/features/pg-chat/components/MarkdownCustom";
import { ViewCodeDialog } from "@/components/view-code-dialog";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";
import { ApiTopology, TOPOLOGIES } from "@/components/api-topology";
import { toast } from "sonner";

const RX_EXAMPLES = [
	{
		label: "Diabetes + Hypertension",
		ehr: JSON.stringify(
			{
				patient: { name: "Nguyen Van Minh", age: 45, gender: "Male" },
				diagnoses: [
					{ code: "E11.9", display: "Type 2 Diabetes", status: "active" },
					{ code: "I10", display: "Essential Hypertension", status: "active" },
				],
				lab_results: [
					{ test: "HbA1c", value: "7.2%", reference: "< 7.0%" },
					{ test: "eGFR", value: "58 mL/min", reference: "> 60", flag: "L" },
					{ test: "Blood Pressure", value: "145/92 mmHg" },
				],
				allergies: [
					{
						substance: "Penicillin",
						reaction: "Anaphylaxis",
						severity: "severe",
					},
				],
			},
			null,
			2
		),
		prescription:
			"Metformin 500mg twice daily\nLisinopril 10mg once daily\nAmlodipine 5mg once daily\nAspirin 81mg once daily",
	},
	{
		label: "Elderly Polypharmacy",
		ehr: JSON.stringify(
			{
				patient: {
					name: "Tran Thi Lan",
					age: 78,
					gender: "Female",
					weight: "52 kg",
				},
				diagnoses: [
					{ code: "I48", display: "Atrial Fibrillation", status: "active" },
					{ code: "M81.0", display: "Osteoporosis", status: "active" },
					{
						code: "F32.1",
						display: "Major Depressive Disorder",
						status: "active",
					},
					{ code: "N18.3", display: "CKD Stage 3", status: "active" },
				],
				lab_results: [
					{ test: "eGFR", value: "42 mL/min", reference: "> 60", flag: "L" },
					{ test: "INR", value: "2.8", reference: "2.0-3.0" },
					{ test: "TSH", value: "1.2 mIU/L", reference: "0.4-4.0" },
				],
			},
			null,
			2
		),
		prescription:
			"Warfarin 5mg once daily\nSertraline 50mg once daily\nAlendronate 70mg once weekly\nCalcium + Vitamin D 600mg/400IU twice daily\nFurosemide 40mg once daily",
	},
	{
		label: "Pregnancy Risk Check",
		ehr: JSON.stringify(
			{
				patient: {
					name: "Le Thi Mai",
					age: 28,
					gender: "Female",
					pregnancy_status: "pregnant",
					gestational_age: "12 weeks",
				},
				diagnoses: [
					{ code: "O24.1", display: "Gestational Diabetes", status: "active" },
					{
						code: "O13",
						display: "Gestational Hypertension",
						status: "active",
					},
				],
				lab_results: [
					{ test: "Fasting Glucose", value: "126 mg/dL", reference: "< 95" },
					{ test: "Blood Pressure", value: "148/95 mmHg" },
				],
			},
			null,
			2
		),
		prescription:
			"Insulin Glargine 10 units at bedtime\nMethyldopa 250mg three times daily\nFolic Acid 5mg once daily\nIron 65mg once daily",
	},
];

const RxAdvisorPage = () => {
	const [ehrData, setEhrData] = useState("");
	const [prescriptionData, setPrescriptionData] = useState("");
	const [showExamples, setShowExamples] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [analysis, setAnalysis] = useState("");
	const [conversionTime, setConversionTime] = useState<number | null>(null);
	const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
	const { selectedApiKey } = useServiceApiKeyStore();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const loadExample = (ex: (typeof RX_EXAMPLES)[0]) => {
		setEhrData(ex.ehr);
		setPrescriptionData(ex.prescription);
		setShowExamples(false);
	};

	const handleAnalyze = async () => {
		if (!ehrData.trim() || !prescriptionData.trim()) return;
		if (!selectedApiKey) {
			setShowApiKeyDialog(true);
			return;
		}

		setIsLoading(true);
		setAnalysis("");
		setConversionTime(null);

		const t0 = performance.now();

		try {
			let ehrPayload: Record<string, unknown>;
			const trimmed = ehrData.trim();
			try {
				const parsed = JSON.parse(trimmed);
				ehrPayload = { type: "custom_json", custom_json: parsed };
			} catch {
				ehrPayload = {
					type: "custom_json",
					custom_json: { raw_text: trimmed },
				};
			}

			const prescriptionItems = prescriptionData
				.trim()
				.split("\n")
				.filter(Boolean)
				.map((line) => {
					const parts = line.trim().match(/^(.+?)\s+(\d+\s*\w+)\s+(.+)$/);
					if (parts) {
						return { name: parts[1], dose: parts[2], frequency: parts[3] };
					}
					return { name: line.trim(), dose: "", frequency: "" };
				});

			const headers = await getAuthHeaders(API_ROUTES.SERVICES.RX_ADVISOR);
			const resp = await fetch(API_ROUTES.SERVICES.RX_ADVISOR, {
				method: "POST",
				headers,
				body: JSON.stringify({
					ehr: ehrPayload,
					prescription: { type: "custom_json", custom_json: prescriptionItems },
					model: "gpt-4o-2",
					stream: false,
				}),
			});

			if (!resp.ok) {
				const errText = await resp.text();
				throw new Error(`HTTP ${resp.status}: ${errText}`);
			}

			const json = await resp.json();
			const elapsed = Math.round(performance.now() - t0);
			setConversionTime(elapsed);

			const textParts = (json.output || []).filter(
				(p: { type: string }) => p.type === "text"
			);
			const analysisText = textParts
				.map((p: { content: string }) => p.content)
				.join("\n");
			setAnalysis(analysisText);

			toast.success(`Analysis complete in ${elapsed}ms`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Request failed");
		} finally {
			setIsLoading(false);
		}
	};

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => setEhrData(reader.result as string);
		reader.readAsText(file);
		e.target.value = "";
	};

	return (
		<DashboardLayout pageTitle="RX Advisor">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				<div className="flex-1 flex flex-col lg:grid lg:grid-cols-2 overflow-hidden">
					{/* Left: Input */}
					<div className="border-b lg:border-b-0 lg:border-r flex flex-col overflow-hidden min-h-0 lg:min-h-full">
						<div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30 gap-2 flex-wrap">
							<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
								Patient & Prescription
							</h2>
							<div className="flex items-center gap-1.5 flex-wrap">
								<Button
									variant="ghost"
									size="sm"
									className="h-7 text-xs"
									onClick={() => setShowExamples(!showExamples)}
								>
									{showExamples ? "Hide" : "Examples"}
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="h-7 text-xs"
									onClick={() => fileInputRef.current?.click()}
								>
									Upload EHR
								</Button>
								{(ehrData || prescriptionData) && (
									<Button
										variant="ghost"
										size="sm"
										className="h-7 text-xs text-muted-foreground"
										onClick={() => {
											setEhrData("");
											setPrescriptionData("");
										}}
									>
										Clear
									</Button>
								)}
							</div>
							<input
								ref={fileInputRef}
								type="file"
								accept=".json,.txt,.hl7,.xml"
								className="hidden"
								onChange={handleFileUpload}
							/>
						</div>

						{showExamples && (
							<div className="px-4 py-2 border-b bg-muted/20">
								<div className="flex flex-wrap gap-1.5">
									{RX_EXAMPLES.map((ex) => (
										<button
											key={ex.label}
											type="button"
											onClick={() => loadExample(ex)}
											className="px-2.5 py-1 text-[11px] font-medium rounded-md border bg-background hover:bg-muted transition-colors"
										>
											{ex.label}
										</button>
									))}
								</div>
							</div>
						)}

						<div className="flex-1 flex flex-col overflow-hidden">
							<div className="flex-1 flex flex-col min-h-0">
								<div className="px-4 pt-3 pb-1">
									<span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
										Medical History / EHR
									</span>
								</div>
								<div className="flex-1 px-4 pb-2 min-h-0">
									<textarea
										value={ehrData}
										onChange={(e) => setEhrData(e.target.value)}
										placeholder="Paste patient EHR data (JSON with diagnoses, lab results, allergies, etc.)"
										className="w-full h-full min-h-[120px] p-3 font-mono text-[12px] leading-relaxed bg-muted/20 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
										spellCheck={false}
									/>
								</div>
							</div>

							<div className="flex-1 flex flex-col min-h-0">
								<div className="px-4 pt-2 pb-1">
									<span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
										Prescription
									</span>
								</div>
								<div className="flex-1 px-4 pb-3 min-h-0">
									<textarea
										value={prescriptionData}
										onChange={(e) => setPrescriptionData(e.target.value)}
										placeholder={
											"One drug per line, e.g.:\nMetformin 500mg twice daily\nLisinopril 10mg once daily\nAspirin 81mg once daily"
										}
										className="w-full h-full min-h-[100px] p-3 font-mono text-[12px] leading-relaxed bg-muted/20 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
										spellCheck={false}
									/>
								</div>
							</div>
						</div>

						<div className="flex items-center justify-between px-4 py-2.5 border-t bg-muted/30 gap-2 flex-wrap">
							<span className="text-[11px] text-muted-foreground/60 hidden sm:inline">
								Uses OpenFDA drug database + GPT-4o analysis
							</span>
							<Button
								size="sm"
								className="h-8 text-xs ml-auto"
								onClick={handleAnalyze}
								disabled={
									!ehrData.trim() || !prescriptionData.trim() || isLoading
								}
							>
								{isLoading ? (
									<span className="flex items-center gap-1.5">
										<span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
										Analyzing...
									</span>
								) : (
									"Analyze Risk"
								)}
							</Button>
						</div>
					</div>

					{/* Right: Output */}
					<div className="flex flex-col overflow-hidden min-h-0 lg:min-h-full">
						<div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
							<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
								Risk Analysis
							</h2>
							<ViewCodeDialog
								endpoint={API_ROUTES.SERVICES.RX_ADVISOR}
								method="POST"
								body={{
									ehr: { type: "custom_json", custom_json: {} },
									prescription: {
										type: "custom_json",
										custom_json: [
											{
												name: "Metformin",
												dose: "500mg",
												frequency: "twice daily",
											},
										],
									},
									model: "gpt-4o-2",
									stream: false,
								}}
								description="Analyze prescription risk using patient EHR + OpenFDA"
							/>
						</div>
						{analysis ? (
							<>
								{conversionTime && (
									<div className="px-4 py-1 text-right">
										<span className="text-[11px] text-muted-foreground">
											{conversionTime}ms
										</span>
									</div>
								)}
								<div className="flex-1 overflow-auto p-4">
									<MarkdownCustom content={analysis} />
								</div>
								<div className="flex justify-end gap-2 px-4 py-2.5 border-t bg-muted/30">
									<Button
										variant="outline"
										size="sm"
										className="h-7 text-xs"
										onClick={() => navigator.clipboard.writeText(analysis)}
									>
										Copy Analysis
									</Button>
								</div>
							</>
						) : (
							<div className="flex-1 flex items-center justify-center p-8">
								<div className="text-center space-y-3 max-w-sm">
									<p className="text-sm text-muted-foreground">
										Enter patient medical history and prescription, then click{" "}
										<strong>Analyze Risk</strong> to evaluate potential drug
										interactions and adverse effects.
									</p>
									<p className="text-[11px] text-muted-foreground/60">
										Checks OpenFDA drug database for interactions,
										contraindications, and Black Box warnings
									</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="px-4 py-2 border-t">
				<ApiTopology {...TOPOLOGIES.rx_advisor} />
			</div>

			<ApiKeyRequiredDialog
				open={showApiKeyDialog}
				onOpenChange={setShowApiKeyDialog}
			/>
		</DashboardLayout>
	);
};

export default RxAdvisorPage;
