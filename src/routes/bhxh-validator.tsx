import { useState } from "react";
import { API_ROUTES } from "@/config/api-routes";
import { ApiKeyRequiredDialog } from "@/features/api-keys/components/api-key-required-dialog";
import { useServiceApiKeyStore } from "@/features/api-keys/store/service-api-key.store";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";
import { toast } from "sonner";
import { Button } from "@/components/shadcn/button";

interface ValidationIssue {
	field?: string;
	message: string;
	severity: "error" | "warning" | "info";
	code?: string;
	value?: string | null;
}

interface ValidateResponse {
	valid: boolean;
	error_count: number;
	warning_count: number;
	issues: ValidationIssue[];
	parsed_data?: Record<string, unknown>;
}

const BHXH_4210_EXAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<MedicalRecord xmlns="urn:bhxh:4210">
  <Header>
    <FacilityCode>01001</FacilityCode>
    <FacilityName>Bệnh viện Bạch Mai</FacilityName>
    <RecordID>BM-2024-001234</RecordID>
  </Header>
  <Patient>
    <FullName>NGUYEN VAN A</FullName>
    <DOB>1985-03-15</DOB>
    <Gender>1</Gender>
    <InsuranceNumber>HS4010100123456</InsuranceNumber>
    <Address>123 Đường Giải Phóng, Hà Nội</Address>
  </Patient>
  <Diagnosis>
    <Primary>
      <ICD10>J18.9</ICD10>
      <Description>Viêm phổi, không xác định</Description>
    </Primary>
    <AdmissionDate>2024-01-15</AdmissionDate>
    <DischargeDate>2024-01-22</DischargeDate>
  </Diagnosis>
  <Treatment>
    <Medication>
      <Name>Amoxicillin</Name>
      <Dosage>500mg</Dosage>
      <Frequency>3 lần/ngày</Frequency>
      <Duration>7 ngày</Duration>
    </Medication>
  </Treatment>
</MedicalRecord>`;

const BhxhValidatorPage = () => {
	const [xmlInput, setXmlInput] = useState("");
	const [strictMode, setStrictMode] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<ValidateResponse | null>(null);
	const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
	const { selectedApiKey } = useServiceApiKeyStore();

	const requireApiKey = (): boolean => {
		if (!selectedApiKey) {
			setShowApiKeyDialog(true);
			return false;
		}
		return true;
	};

	const handleValidate = async () => {
		if (!requireApiKey() || !xmlInput.trim()) return;
		setIsLoading(true);
		setResult(null);

		try {
			const headers = await getAuthHeaders(API_ROUTES.SERVICES.BHXH_VALIDATE);
			const resp = await fetch(API_ROUTES.SERVICES.BHXH_VALIDATE, {
				method: "POST",
				headers,
				body: JSON.stringify({ xml_data: xmlInput, strict: strictMode }),
			});
			if (!resp.ok)
				throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
			const json: ValidateResponse = await resp.json();
			setResult(json);
			if (json.valid) {
				toast.success("BHXH 4210 document is valid");
			} else {
				toast.warning(
					`${json.error_count} error(s), ${json.warning_count} warning(s)`
				);
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Validation failed");
		} finally {
			setIsLoading(false);
		}
	};

	const severityColor = (s: string) => {
		if (s === "error")
			return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
		if (s === "warning")
			return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
		return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
	};

	const allIssues = result?.issues ?? [];

	return (
		<DashboardLayout pageTitle="BHXH 4210 Validator">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				<div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden border-b">
					{/* Left: Input */}
					<div className="border-r flex flex-col overflow-hidden">
						<div className="p-4 border-b flex items-center justify-between gap-2 flex-wrap">
							<span className="text-sm font-medium">BHXH 4210 XML Input</span>
							<div className="flex items-center gap-3">
								<button
									type="button"
									className="flex items-center gap-2 text-xs"
									onClick={() => setStrictMode(!strictMode)}
								>
									<span
										className={`w-8 h-4 rounded-full relative transition-colors ${strictMode ? "bg-primary" : "bg-muted-foreground/30"}`}
									>
										<span
											className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${strictMode ? "translate-x-4" : "translate-x-0.5"}`}
										/>
									</span>
									<span>Strict mode</span>
								</button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => setXmlInput(BHXH_4210_EXAMPLE)}
								>
									Load Example
								</Button>
							</div>
						</div>
						<div className="flex-1 p-4 overflow-hidden flex flex-col">
							<textarea
								value={xmlInput}
								onChange={(e) => setXmlInput(e.target.value)}
								placeholder="Paste BHXH 4210 XML here..."
								className="flex-1 w-full rounded-md border px-3 py-2 text-xs font-mono bg-background resize-none"
							/>
							<div className="mt-3">
								<Button
									type="button"
									onClick={handleValidate}
									disabled={isLoading || !xmlInput.trim()}
								>
									{isLoading ? "Validating..." : "Validate"}
								</Button>
							</div>
						</div>
					</div>

					{/* Right: Results */}
					<div className="flex flex-col overflow-hidden">
						{result ? (
							<div className="flex-1 overflow-y-auto p-4 space-y-4">
								<div className="flex items-center gap-3">
									<span
										className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
											result.valid
												? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
												: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
										}`}
									>
										{result.valid ? "Valid" : "Invalid"}
									</span>
									<span className="text-sm text-muted-foreground">
										{result.error_count} error(s), {result.warning_count}{" "}
										warning(s)
									</span>
								</div>
								{result.summary && (
									<p className="text-sm text-muted-foreground">
										{result.summary}
									</p>
								)}
								{allIssues.length > 0 && (
									<div className="space-y-2">
										{allIssues.map((issue, i) => (
											<div
												key={`${issue.field}-${issue.message}-${i}`}
												className="p-3 rounded-md border text-sm space-y-1"
											>
												<div className="flex items-center gap-2">
													<span
														className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${severityColor(issue.severity)}`}
													>
														{issue.severity}
													</span>
													{issue.code && (
														<span className="text-xs text-muted-foreground font-mono">
															{issue.code}
														</span>
													)}
												</div>
												<p>{issue.message}</p>
												{issue.field && (
													<p className="text-xs text-muted-foreground font-mono">
														{issue.field}
														{issue.value ? `: ${issue.value}` : ""}
													</p>
												)}
											</div>
										))}
									</div>
								)}
								{allIssues.length === 0 && result.valid && (
									<p className="text-sm text-green-600 dark:text-green-400">
										No issues found. The document is valid BHXH 4210.
									</p>
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
											<title>Validate</title>
											<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
									</div>
									<p className="text-sm text-muted-foreground">
										Paste BHXH 4210 XML on the left and click{" "}
										<strong>Validate</strong> to check for errors.
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

export default BhxhValidatorPage;
