import { useState } from "react";
import { BASE_API_URL } from "@/config/api-routes";
import { Button } from "@/components/shadcn/button";
import { ViewCodeDialog } from "@/components/view-code-dialog";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";
import { ApiTopology, TOPOLOGIES } from "@/components/api-topology";
import { toast } from "sonner";
import {
	PlusIcon,
	XIcon,
	AlertTriangleIcon,
	ShieldAlertIcon,
	ActivityIcon,
	ClipboardListIcon,
} from "lucide-react";

const SYMPTOM_ENDPOINT = `${BASE_API_URL}service/api/v1/symptom_checker/check`;

const COMMON_SYMPTOMS = [
	"headache",
	"fever",
	"cough",
	"fatigue",
	"nausea",
	"chest pain",
	"shortness of breath",
	"dizziness",
	"abdominal pain",
	"back pain",
	"sore throat",
	"diarrhea",
	"vomiting",
	"rash",
	"joint pain",
	"muscle aches",
];

interface PossibleCondition {
	name: string;
	probability: string;
	icd10: string;
	explanation: string;
}

interface CheckResult {
	success: boolean;
	conditions: PossibleCondition[];
	triage_level: string;
	recommended_actions: string[];
	red_flags: string[];
	errors: string[];
}

const TRIAGE_COLORS: Record<string, string> = {
	emergency:
		"bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-300",
	urgent:
		"bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 border-orange-300",
	routine:
		"bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-300",
	"self-care":
		"bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300",
};

const PROB_COLORS: Record<string, string> = {
	high: "text-red-600 dark:text-red-400",
	moderate: "text-orange-600 dark:text-orange-400",
	low: "text-blue-600 dark:text-blue-400",
};

export default function SymptomCheckerPage() {
	const [symptoms, setSymptoms] = useState<string[]>([]);
	const [customSymptom, setCustomSymptom] = useState("");
	const [age, setAge] = useState("");
	const [gender, setGender] = useState("");
	const [medicalHistory, setMedicalHistory] = useState("");
	const [duration, setDuration] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<CheckResult | null>(null);

	const addSymptom = (s: string) => {
		const trimmed = s.trim().toLowerCase();
		if (trimmed && !symptoms.includes(trimmed)) {
			setSymptoms((prev) => [...prev, trimmed]);
		}
	};

	const removeSymptom = (s: string) => {
		setSymptoms((prev) => prev.filter((x) => x !== s));
	};

	const handleAddCustom = () => {
		if (customSymptom.trim()) {
			addSymptom(customSymptom);
			setCustomSymptom("");
		}
	};

	const handleCheck = async () => {
		if (symptoms.length === 0) {
			toast.error("Add at least one symptom");
			return;
		}

		setIsLoading(true);
		setResult(null);

		try {
			const headers = await getAuthHeaders(SYMPTOM_ENDPOINT);
			const body: Record<string, unknown> = { symptoms };
			if (age) body.age = parseInt(age, 10);
			if (gender) body.gender = gender;
			if (medicalHistory.trim())
				body.medical_history = medicalHistory
					.split(",")
					.map((s) => s.trim())
					.filter(Boolean);
			if (duration) body.duration = duration;

			const resp = await fetch(SYMPTOM_ENDPOINT, {
				method: "POST",
				headers,
				body: JSON.stringify(body),
			});

			if (!resp.ok)
				throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);

			const json: CheckResult = await resp.json();
			setResult(json);
			toast.success(`Assessment complete — ${json.triage_level} triage`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Request failed");
		} finally {
			setIsLoading(false);
		}
	};

	const loadExample = () => {
		setSymptoms([
			"severe headache",
			"fever",
			"stiff neck",
			"sensitivity to light",
		]);
		setAge("35");
		setGender("female");
		setMedicalHistory("");
		setDuration("2 days");
	};

	return (
		<DashboardLayout pageTitle="Symptom Checker">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				<div className="flex-1 flex flex-col lg:grid lg:grid-cols-2 overflow-hidden">
					{/* Left: Input */}
					<div className="border-b lg:border-b-0 lg:border-r flex flex-col overflow-hidden">
						<div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
							<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
								Symptoms
							</h2>
							<Button
								variant="ghost"
								size="sm"
								className="h-7 text-xs"
								onClick={loadExample}
							>
								Load Example
							</Button>
						</div>

						<div className="flex-1 overflow-auto p-4 space-y-4">
							{/* Selected symptoms */}
							<div>
								<span className="text-xs font-medium text-muted-foreground mb-2 block">
									Selected Symptoms ({symptoms.length})
								</span>
								<div className="flex flex-wrap gap-1.5 min-h-[2.5rem]">
									{symptoms.length === 0 ? (
										<span className="text-xs text-muted-foreground/50 py-1">
											Click symptoms below or type your own
										</span>
									) : (
										symptoms.map((s) => (
											<span
												key={s}
												className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
											>
												{s}
												<button
													type="button"
													onClick={() => removeSymptom(s)}
													className="hover:text-destructive"
												>
													<XIcon className="size-3" />
												</button>
											</span>
										))
									)}
								</div>
							</div>

							{/* Custom symptom input */}
							<div className="flex gap-2">
								<input
									value={customSymptom}
									onChange={(e) => setCustomSymptom(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") handleAddCustom();
									}}
									placeholder="Type a symptom and press Enter..."
									className="flex-1 rounded-md border bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
								/>
								<Button variant="outline" size="sm" onClick={handleAddCustom}>
									<PlusIcon className="size-4" />
								</Button>
							</div>

							{/* Common symptoms palette */}
							<div>
								<span className="text-xs font-medium text-muted-foreground mb-2 block">
									Common Symptoms
								</span>
								<div className="flex flex-wrap gap-1.5">
									{COMMON_SYMPTOMS.map((s) => (
										<button
											key={s}
											type="button"
											onClick={() => addSymptom(s)}
											disabled={symptoms.includes(s)}
											className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${symptoms.includes(s) ? "bg-primary/10 text-primary border-primary/20 opacity-50" : "hover:bg-muted text-muted-foreground"}`}
										>
											{s}
										</button>
									))}
								</div>
							</div>

							{/* Demographics */}
							<div className="grid grid-cols-2 gap-3">
								<label className="block">
									<span className="text-xs font-medium text-muted-foreground block mb-1">
										Age
									</span>
									<input
										value={age}
										onChange={(e) => setAge(e.target.value)}
										type="number"
										placeholder="e.g. 35"
										className="w-full rounded-md border bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
									/>
								</label>
								<label className="block">
									<span className="text-xs font-medium text-muted-foreground block mb-1">
										Gender
									</span>
									<select
										value={gender}
										onChange={(e) => setGender(e.target.value)}
										className="w-full rounded-md border bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
									>
										<option value="">—</option>
										<option value="male">Male</option>
										<option value="female">Female</option>
										<option value="other">Other</option>
									</select>
								</label>
								<label className="block">
									<span className="text-xs font-medium text-muted-foreground block mb-1">
										Duration
									</span>
									<input
										value={duration}
										onChange={(e) => setDuration(e.target.value)}
										placeholder="e.g. 3 days"
										className="w-full rounded-md border bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
									/>
								</label>
								<label className="block">
									<span className="text-xs font-medium text-muted-foreground block mb-1">
										Medical History
									</span>
									<input
										value={medicalHistory}
										onChange={(e) => setMedicalHistory(e.target.value)}
										placeholder="e.g. diabetes, hypertension"
										className="w-full rounded-md border bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
									/>
								</label>
							</div>
						</div>

						<div className="flex items-center justify-between px-4 py-2.5 border-t bg-muted/30 gap-2">
							<ViewCodeDialog
								endpoint={SYMPTOM_ENDPOINT}
								method="POST"
								body={{
									symptoms:
										symptoms.length > 0 ? symptoms : ["headache", "fever"],
									age: age ? parseInt(age, 10) : 35,
									gender: gender || "female",
									duration: duration || "3 days",
								}}
								description="AI-powered symptom assessment with differential diagnosis"
							/>
							<Button
								size="sm"
								className="h-8 text-xs"
								onClick={handleCheck}
								disabled={symptoms.length === 0 || isLoading}
							>
								{isLoading ? (
									<span className="flex items-center gap-1.5">
										<span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
										Analyzing...
									</span>
								) : (
									`Check ${symptoms.length} Symptom(s)`
								)}
							</Button>
						</div>
					</div>

					{/* Right: Results */}
					<div className="flex flex-col overflow-hidden">
						{result ? (
							<div className="flex-1 overflow-auto p-4 space-y-4">
								{/* Triage level */}
								<div
									className={`rounded-lg border-2 p-4 ${TRIAGE_COLORS[result.triage_level] || "border-muted"}`}
								>
									<div className="flex items-center gap-2 mb-1">
										<ShieldAlertIcon className="size-5" />
										<span className="text-sm font-bold uppercase">
											Triage: {result.triage_level}
										</span>
									</div>
									{result.triage_level === "emergency" && (
										<p className="text-xs font-medium mt-1">
											Seek immediate medical attention or call emergency
											services.
										</p>
									)}
								</div>

								{/* Red flags */}
								{result.red_flags.length > 0 && (
									<div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-3">
										<div className="flex items-center gap-1.5 mb-2">
											<AlertTriangleIcon className="size-4 text-red-600 dark:text-red-400" />
											<span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase">
												Red Flags
											</span>
										</div>
										<ul className="space-y-1">
											{result.red_flags.map((rf, i) => (
												<li
													key={i}
													className="text-xs text-red-700 dark:text-red-300"
												>
													• {rf}
												</li>
											))}
										</ul>
									</div>
								)}

								{/* Possible conditions */}
								<div>
									<div className="flex items-center gap-1.5 mb-2">
										<ActivityIcon className="size-4 text-muted-foreground" />
										<span className="text-xs font-bold uppercase text-muted-foreground">
											Possible Conditions
										</span>
									</div>
									<div className="space-y-2">
										{result.conditions.map((cond, i) => (
											<div key={i} className="rounded-lg border p-3">
												<div className="flex items-center justify-between gap-2">
													<span className="text-sm font-semibold">
														{cond.name}
													</span>
													<div className="flex items-center gap-2">
														{cond.icd10 && (
															<span className="text-[11px] font-mono text-muted-foreground">
																{cond.icd10}
															</span>
														)}
														<span
															className={`text-[11px] font-bold uppercase ${PROB_COLORS[cond.probability] || ""}`}
														>
															{cond.probability}
														</span>
													</div>
												</div>
												{cond.explanation && (
													<p className="text-xs text-muted-foreground mt-1">
														{cond.explanation}
													</p>
												)}
											</div>
										))}
									</div>
								</div>

								{/* Recommended actions */}
								{result.recommended_actions.length > 0 && (
									<div>
										<div className="flex items-center gap-1.5 mb-2">
											<ClipboardListIcon className="size-4 text-muted-foreground" />
											<span className="text-xs font-bold uppercase text-muted-foreground">
												Recommended Actions
											</span>
										</div>
										<ul className="space-y-1.5">
											{result.recommended_actions.map((action, i) => (
												<li key={i} className="text-xs flex gap-2">
													<span className="text-primary font-bold">
														{i + 1}.
													</span>
													{action}
												</li>
											))}
										</ul>
									</div>
								)}

								{/* Disclaimer */}
								<div className="rounded-lg bg-muted/30 p-3 text-[11px] text-muted-foreground/70 italic">
									This is an AI-assisted screening tool and does not replace
									professional medical advice. Always consult a healthcare
									provider for diagnosis and treatment.
								</div>
							</div>
						) : (
							<div className="flex-1 flex items-center justify-center p-8">
								<div className="text-center space-y-3 max-w-sm">
									<ActivityIcon className="size-10 mx-auto text-muted-foreground/30" />
									<p className="text-sm text-muted-foreground">
										Select symptoms and click <strong>Check</strong> to get an
										AI-powered differential diagnosis.
									</p>
									<p className="text-[11px] text-muted-foreground/60">
										Pipeline: Symptoms + demographics → GPT-4o → Differential
										diagnosis + triage level
									</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="px-4 py-2 border-t">
				<ApiTopology {...TOPOLOGIES.symptom_checker} />
			</div>
		</DashboardLayout>
	);
}
