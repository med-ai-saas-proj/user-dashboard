import { useState } from "react";
import { API_ROUTES } from "@/config/api-routes";
import { ApiKeyRequiredDialog } from "@/features/api-keys/components/api-key-required-dialog";
import { useServiceApiKeyStore } from "@/features/api-keys/store/service-api-key.store";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";
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

const scoreColor = (score: number) => {
	if (score >= 80) return "text-green-600 dark:text-green-400";
	if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
	if (score >= 40) return "text-orange-600 dark:text-orange-400";
	return "text-red-600 dark:text-red-400";
};

const scoreBg = (score: number) => {
	if (score >= 80) return "bg-green-100 dark:bg-green-900/30";
	if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/30";
	if (score >= 40) return "bg-orange-100 dark:bg-orange-900/30";
	return "bg-red-100 dark:bg-red-900/30";
};

const impactIcon = (impact: string) => {
	if (impact === "positive") return "↑";
	if (impact === "negative") return "↓";
	return "–";
};

const impactColor = (impact: string) => {
	if (impact === "positive") return "text-green-600 dark:text-green-400";
	if (impact === "negative") return "text-red-600 dark:text-red-400";
	return "text-muted-foreground";
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
				toast.error("Invalid JSON — please paste valid EHR data");
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

	return (
		<DashboardLayout pageTitle="Health Score">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				<div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden border-b">
					{/* Left: Input */}
					<div className="border-r flex flex-col overflow-hidden">
						<div className="p-4 border-b flex items-center justify-between">
							<span className="text-sm font-medium">EHR Data Input</span>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setInput(EHR_EXAMPLE)}
							>
								Load Example
							</Button>
						</div>
						<div className="flex-1 p-4 overflow-hidden flex flex-col">
							<textarea
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder="Paste FHIR Bundle or EHR JSON here..."
								className="flex-1 w-full rounded-md border px-3 py-2 text-xs font-mono bg-background resize-none"
							/>
							<div className="mt-3">
								<Button
									type="button"
									onClick={handleEvaluate}
									disabled={isLoading || !input.trim()}
								>
									{isLoading ? "Evaluating..." : "Evaluate Health Score"}
								</Button>
							</div>
						</div>
					</div>

					{/* Right: Score Display */}
					<div className="flex flex-col overflow-hidden">
						{result ? (
							<div className="flex-1 overflow-y-auto p-4 space-y-6">
								<div className="text-center py-4">
									<div
										className={`inline-flex items-center justify-center w-28 h-28 rounded-full ${scoreBg(result.score)}`}
									>
										<span
											className={`text-4xl font-bold ${scoreColor(result.score)}`}
										>
											{result.score}
										</span>
									</div>
									<p className="mt-3 text-lg font-medium">{result.category}</p>
								</div>

								<div>
									<span className="text-sm font-medium">Summary</span>
									<p className="text-sm mt-1 leading-relaxed text-muted-foreground">
										{result.summary}
									</p>
								</div>

								{result.factors.length > 0 && (
									<div>
										<span className="text-sm font-medium">Factors</span>
										<div className="mt-2 space-y-2">
											{result.factors.map((f, i) => (
												<div
													key={`factor-${i}`}
													className="flex items-start gap-3 p-3 rounded-md border text-sm"
												>
													<span
														className={`text-lg font-bold shrink-0 ${impactColor(f.impact)}`}
													>
														{impactIcon(f.impact)}
													</span>
													<div className="flex-1 min-w-0">
														<div className="flex items-center justify-between gap-2">
															<span className="font-medium">{f.name}</span>
															<span className="text-muted-foreground text-xs shrink-0">
																{f.value}
															</span>
														</div>
														{f.description && (
															<p className="text-xs text-muted-foreground mt-1">
																{f.description}
															</p>
														)}
													</div>
												</div>
											))}
										</div>
									</div>
								)}
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
											aria-hidden="true"
										>
											<title>Health</title>
											<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
										</svg>
									</div>
									<p className="text-sm text-muted-foreground">
										Paste EHR data on the left and click{" "}
										<strong>Evaluate Health Score</strong> to see the result.
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

export default HealthScorePage;
