import { useState } from "react";
import { API_ROUTES, BASE_API_URL } from "@/config/api-routes";
import { ApiKeyRequiredDialog } from "@/features/api-keys/components/api-key-required-dialog";
import { useServiceApiKeyStore } from "@/features/api-keys/store/service-api-key.store";
import { Button } from "@/components/shadcn/button";
import { ViewCodeDialog } from "@/components/view-code-dialog";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";
import { toast } from "sonner";

const EXAMPLE_RECORDS = [
	{
		label: "Visit 1 — Hospital Admission (Jan 2025)",
		facility: "City General Hospital",
		data: {
			resourceType: "Bundle",
			type: "collection",
			entry: [
				{
					resource: {
						resourceType: "Patient",
						id: "p-001",
						name: [{ family: "Nguyen", given: ["Van", "Minh"] }],
						gender: "male",
						birthDate: "1985-03-15",
					},
				},
				{
					resource: {
						resourceType: "Encounter",
						id: "enc-001",
						status: "finished",
						class: { code: "IMP", display: "inpatient" },
						subject: { reference: "Patient/p-001" },
						period: { start: "2025-01-10", end: "2025-01-15" },
					},
				},
				{
					resource: {
						resourceType: "Condition",
						subject: { reference: "Patient/p-001" },
						code: {
							coding: [
								{
									system: "http://hl7.org/fhir/sid/icd-10",
									code: "J18.9",
									display: "Pneumonia, unspecified",
								},
							],
						},
						clinicalStatus: { coding: [{ code: "active" }] },
						onsetDateTime: "2025-01-10",
					},
				},
				{
					resource: {
						resourceType: "Condition",
						subject: { reference: "Patient/p-001" },
						code: {
							coding: [
								{
									system: "http://hl7.org/fhir/sid/icd-10",
									code: "E11.9",
									display: "Type 2 diabetes mellitus",
								},
							],
						},
						clinicalStatus: { coding: [{ code: "active" }] },
					},
				},
			],
		},
	},
	{
		label: "Visit 2 — Lab Results (Feb 2025)",
		facility: "MedLab Diagnostics",
		data: {
			resourceType: "Bundle",
			type: "collection",
			entry: [
				{
					resource: {
						resourceType: "Observation",
						status: "final",
						subject: { reference: "Patient/p-001" },
						code: {
							coding: [
								{ system: "http://loinc.org", code: "6690-2", display: "WBC" },
							],
						},
						valueQuantity: { value: 7.5, unit: "10^3/uL" },
						effectiveDateTime: "2025-02-01",
					},
				},
				{
					resource: {
						resourceType: "Observation",
						status: "final",
						subject: { reference: "Patient/p-001" },
						code: {
							coding: [
								{
									system: "http://loinc.org",
									code: "4548-4",
									display: "HbA1c",
								},
							],
						},
						valueQuantity: { value: 7.2, unit: "%" },
						effectiveDateTime: "2025-02-01",
					},
				},
				{
					resource: {
						resourceType: "Observation",
						status: "final",
						subject: { reference: "Patient/p-001" },
						code: {
							coding: [
								{
									system: "http://loinc.org",
									code: "718-7",
									display: "Hemoglobin",
								},
							],
						},
						valueQuantity: { value: 14.1, unit: "g/dL" },
						effectiveDateTime: "2025-02-01",
					},
				},
			],
		},
	},
	{
		label: "Visit 3 — Follow-up (Feb 2025)",
		facility: "District Health Center",
		data: {
			resourceType: "Bundle",
			type: "collection",
			entry: [
				{
					resource: {
						resourceType: "Encounter",
						id: "enc-003",
						status: "finished",
						class: { code: "AMB", display: "outpatient" },
						subject: { reference: "Patient/p-001" },
						period: { start: "2025-02-15", end: "2025-02-15" },
					},
				},
				{
					resource: {
						resourceType: "MedicationStatement",
						subject: { reference: "Patient/p-001" },
						status: "active",
						medicationCodeableConcept: {
							coding: [
								{
									system: "http://www.nlm.nih.gov/research/umls/rxnorm",
									code: "860975",
									display: "Metformin 500 MG",
								},
							],
						},
						dosage: [{ text: "500mg twice daily" }],
					},
				},
				{
					resource: {
						resourceType: "Condition",
						subject: { reference: "Patient/p-001" },
						code: {
							coding: [
								{
									system: "http://hl7.org/fhir/sid/icd-10",
									code: "J18.9",
									display: "Pneumonia — resolving",
								},
							],
						},
						clinicalStatus: { coding: [{ code: "resolved" }] },
					},
				},
			],
		},
	},
];

const EXAMPLE_FHIR = JSON.stringify(EXAMPLE_RECORDS[0].data, null, 2);

const PatientHistoryPage = () => {
	const [patientId, setPatientId] = useState("1");
	const [fhirInput, setFhirInput] = useState("");
	const [facility, setFacility] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<Record<string, unknown> | null>(null);
	const [history, setHistory] = useState<Record<string, unknown> | null>(null);
	const [activeTab, setActiveTab] = useState<"result" | "history">("result");
	const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
	const { selectedApiKey } = useServiceApiKeyStore();

	const baseHistoryUrl = (pid: string) =>
		`${BASE_API_URL}service/api/v1/patient/${pid}/history`;

	const handleLoadMultiVisitDemo = async () => {
		if (!selectedApiKey) {
			setShowApiKeyDialog(true);
			return;
		}
		setIsLoading(true);
		setResult(null);
		setHistory(null);
		setFacility("");
		const pid = patientId || "1";

		try {
			for (const record of EXAMPLE_RECORDS) {
				toast.info(`Submitting: ${record.label}...`);
				const url = baseHistoryUrl(pid);
				const headers = await getAuthHeaders(url);
				const resp = await fetch(url, {
					method: "POST",
					headers,
					body: JSON.stringify({
						patient_id: Number(pid),
						fhir_bundle: record.data,
						facility: record.facility,
						search_facilities: false,
					}),
				});
				if (!resp.ok)
					throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
				const json = await resp.json();
				setResult(json);
			}

			const histResp = await fetch(baseHistoryUrl(pid), {
				method: "GET",
				headers: await getAuthHeaders(baseHistoryUrl(pid)),
			});
			if (histResp.ok) {
				const histJson = await histResp.json();
				setHistory(histJson.history);
			}
			setActiveTab("history");
			setFhirInput(JSON.stringify(EXAMPLE_RECORDS[0].data, null, 2));
			toast.success(
				`Loaded ${EXAMPLE_RECORDS.length} visits into nested temporal history`
			);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Request failed");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmit = async () => {
		if (!selectedApiKey) {
			setShowApiKeyDialog(true);
			return;
		}
		if (!patientId || !fhirInput.trim()) return;
		setIsLoading(true);
		setResult(null);

		try {
			let fhirBundle: Record<string, unknown>;
			try {
				fhirBundle = JSON.parse(fhirInput);
			} catch {
				toast.error("Invalid JSON");
				setIsLoading(false);
				return;
			}

			const url = baseHistoryUrl(patientId);
			const headers = await getAuthHeaders(url);
			const resp = await fetch(url, {
				method: "POST",
				headers,
				body: JSON.stringify({
					patient_id: Number(patientId),
					fhir_bundle: fhirBundle,
					facility: facility || undefined,
					search_facilities: false,
				}),
			});
			if (!resp.ok)
				throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
			const json = await resp.json();
			setResult(json);
			setActiveTab("result");
			toast.success(`History updated: ${json.visit_count} visit(s)`);

			const histResp = await fetch(url, {
				method: "GET",
				headers: await getAuthHeaders(url),
			});
			if (histResp.ok) {
				const histJson = await histResp.json();
				setHistory(histJson.history);
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Request failed");
		} finally {
			setIsLoading(false);
		}
	};

	const handleGetHistory = async () => {
		if (!selectedApiKey) {
			setShowApiKeyDialog(true);
			return;
		}
		if (!patientId) return;
		setIsLoading(true);
		try {
			const url = baseHistoryUrl(patientId);
			const headers = await getAuthHeaders(url);
			const resp = await fetch(url, { method: "GET", headers });
			if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
			const json = await resp.json();
			setHistory(json.history);
			setActiveTab("history");
			toast.success("History loaded");
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to load history"
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<DashboardLayout pageTitle="Patient History">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				<div className="flex-1 flex flex-col lg:grid lg:grid-cols-2 overflow-hidden">
					{/* Left: Input */}
					<div className="border-b lg:border-b-0 lg:border-r flex flex-col overflow-hidden min-h-0 lg:min-h-full">
						<div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30 gap-2 flex-wrap">
							<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
								Patient Medical History
							</h2>
							<div className="flex items-center gap-1.5">
								<Button
									variant="ghost"
									size="sm"
									className="h-7 text-xs"
									onClick={() => setFhirInput(EXAMPLE_FHIR)}
								>
									Load Single Visit
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="h-7 text-xs"
									onClick={handleLoadMultiVisitDemo}
								>
									Load Multi-Visit Demo
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="h-7 text-xs"
									onClick={handleGetHistory}
								>
									Get History
								</Button>
							</div>
						</div>
						<div className="px-4 py-2 border-b bg-muted/10 flex gap-2 flex-wrap">
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
									Facility:
								</span>
								<input
									value={facility}
									onChange={(e) => setFacility(e.target.value)}
									placeholder="e.g. City General Hospital"
									className="w-48 rounded-md border bg-transparent px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
								/>
							</div>
						</div>
						<div className="flex-1 overflow-hidden">
							<textarea
								value={fhirInput}
								onChange={(e) => setFhirInput(e.target.value)}
								placeholder="Paste FHIR Bundle JSON — this will be stored in the patient's nested temporal history"
								className="w-full h-full p-4 font-mono text-[12px] leading-relaxed bg-transparent focus:outline-none resize-none"
								spellCheck={false}
							/>
						</div>
						<div className="flex items-center justify-between px-4 py-2.5 border-t bg-muted/30 gap-2 flex-wrap">
							<span className="text-[11px] text-muted-foreground/60 hidden sm:inline">
								Standardize → Search → Summarize → Store (nested temporal)
							</span>
							<Button
								size="sm"
								className="h-8 text-xs ml-auto"
								onClick={handleSubmit}
								disabled={!patientId || !fhirInput.trim() || isLoading}
							>
								{isLoading ? "Processing..." : "Add to History"}
							</Button>
						</div>
					</div>

					{/* Right: Output */}
					<div className="flex flex-col overflow-hidden min-h-0 lg:min-h-full">
						{result || history ? (
							<>
								<div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
									<div className="flex gap-0">
										{(["result", "history"] as const).map((tab) => (
											<button
												key={tab}
												type="button"
												onClick={() => setActiveTab(tab)}
												className={`px-3 py-1 text-xs font-medium border-b-2 transition-colors ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
											>
												{tab === "result" ? "Last Result" : "Full History"}
											</button>
										))}
									</div>
									<ViewCodeDialog
										description="Pipeline: standardize EHR → search facilities → save nested temporal history"
										endpoint={baseHistoryUrl("{patient_id}")}
										steps={[
											{
												label: "Standardize to FHIR",
												endpoint: API_ROUTES.SERVICES.EHR_CONVERTER_CONVERT,
												body: {
													data: "<raw EHR data>",
													validate_output: false,
												},
											},
											{
												label: "Search facilities",
												endpoint:
													API_ROUTES.SERVICES.DATA_MASKING_FACILITY_SEARCH,
												body: {
													first_name: "Nguyen",
													last_name: "Van Minh",
													dob: "1985-03-15",
												},
											},
											{
												label: "Save patient history",
												endpoint: baseHistoryUrl("1"),
												body: {
													patient_id: 1,
													fhir_bundle: {
														resourceType: "Bundle",
														type: "collection",
														entry: [],
													},
													facility: "City General Hospital",
												},
											},
										]}
									/>
								</div>
								<div className="flex-1 overflow-auto p-4">
									{activeTab === "result" && result && (
										<pre className="text-[12px] font-mono whitespace-pre-wrap leading-relaxed break-all">
											{JSON.stringify(result, null, 2)}
										</pre>
									)}
									{activeTab === "history" && history && (
										<pre className="text-[12px] font-mono whitespace-pre-wrap leading-relaxed break-all">
											{JSON.stringify(history, null, 2)}
										</pre>
									)}
								</div>
							</>
						) : (
							<div className="flex-1 flex items-center justify-center p-8">
								<div className="text-center space-y-3 max-w-sm">
									<p className="text-sm text-muted-foreground">
										Submit FHIR data to build a patient's nested temporal
										history. Each submission accumulates into visits → year →
										month → week → day structure with trend prediction slots.
									</p>
									<p className="text-[11px] text-muted-foreground/60">
										Pipeline: Standardize → Search Facilities → Summarize →
										Store
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

export default PatientHistoryPage;
