import { EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ApiTopology, TOPOLOGIES } from "@/components/api-topology";
import {
	DemoEmptyState,
	DemoPageShell,
	DemoSplitLayout,
	DemoToolbar,
} from "@/components/demo";
import { Button } from "@/components/shadcn/button";
import { ViewCodeDialog } from "@/components/view-code-dialog";
import { API_ROUTES } from "@/config/api-routes";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";

interface MaskResponse {
	success: boolean;
	masked_bundle: Record<string, unknown>;
	id_mapping: Record<string, string>;
	removed_fields: string[];
	errors: string[];
}

const FHIR_BUNDLE_EXAMPLE = `{
  "resourceType": "Bundle",
  "type": "collection",
  "entry": [
    {
      "resource": {
        "resourceType": "Patient",
        "id": "patient-001",
        "name": [{"family": "Nguyen", "given": ["Van", "A"]}],
        "birthDate": "1985-03-15",
        "gender": "male",
        "address": [{"line": ["123 Đường Giải Phóng"], "city": "Hà Nội"}],
        "telecom": [{"system": "phone", "value": "0912345678"}],
        "identifier": [{"system": "urn:bhxh", "value": "HS4010100123456"}]
      }
    },
    {
      "resource": {
        "resourceType": "Condition",
        "id": "condition-001",
        "subject": {"reference": "Patient/patient-001"},
        "code": {"coding": [{"system": "http://hl7.org/fhir/sid/icd-10", "code": "E11.9", "display": "Type 2 diabetes mellitus"}]},
        "clinicalStatus": {"coding": [{"code": "active"}]}
      }
    }
  ]
}`;

const DataMaskingPage = () => {
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<MaskResponse | null>(null);
	const [activeTab, setActiveTab] = useState<"masked" | "mapping" | "removed">(
		"masked"
	);

	const handleMask = async () => {
		if (!input.trim()) return;
		setIsLoading(true);
		setResult(null);

		try {
			let bundle: unknown;
			try {
				bundle = JSON.parse(input);
			} catch {
				toast.error("Invalid JSON — please paste a valid FHIR Bundle");
				setIsLoading(false);
				return;
			}

			const headers = await getAuthHeaders(
				API_ROUTES.SERVICES.DATA_MASKING_MASK
			);
			const resp = await fetch(API_ROUTES.SERVICES.DATA_MASKING_MASK, {
				method: "POST",
				headers,
				body: JSON.stringify({ bundle }),
			});
			if (!resp.ok)
				throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
			const json: MaskResponse = await resp.json();
			setResult(json);
			toast.success(
				`Masked ${json.removed_fields?.length ?? "?"} field types, ${Object.keys(json.id_mapping ?? {}).length} ID(s) hashed`
			);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Masking failed");
		} finally {
			setIsLoading(false);
		}
	};

	const mappingEntries = result ? Object.entries(result.id_mapping) : [];

	return (
		<DashboardLayout pageTitle="Data Masking">
			<DemoPageShell>
				<DemoToolbar
					end={
						<ViewCodeDialog
							endpoint={API_ROUTES.SERVICES.DATA_MASKING_MASK}
							method="POST"
							body={{
								bundle: {
									resourceType: "Bundle",
									type: "collection",
									entry: [],
								},
							}}
							description="De-identify patient data in FHIR Bundle"
						/>
					}
				/>
				<DemoSplitLayout
					left={
						<>
							<div className="p-4 border-b flex items-center justify-between">
								<span className="text-sm font-medium">FHIR Bundle Input</span>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => setInput(FHIR_BUNDLE_EXAMPLE)}
								>
									Load Example
								</Button>
							</div>
							<div className="flex-1 p-4 overflow-hidden flex flex-col">
								<textarea
									value={input}
									onChange={(e) => setInput(e.target.value)}
									placeholder="Paste FHIR Bundle JSON here..."
									className="flex-1 w-full rounded-md border px-3 py-2 text-xs font-mono bg-background resize-none"
								/>
								<div className="mt-3">
									<Button
										type="button"
										onClick={handleMask}
										disabled={isLoading || !input.trim()}
									>
										{isLoading ? "Masking..." : "Mask Data"}
									</Button>
								</div>
							</div>
						</>
					}
					right={
						result ? (
							<div className="flex flex-col h-full overflow-hidden">
								<div className="flex border-b">
									{(
										[
											["masked", "Masked Bundle"],
											["mapping", "ID Mapping"],
											["removed", "Removed Fields"],
										] as const
									).map(([key, label]) => (
										<button
											key={key}
											type="button"
											className={`px-4 py-2 text-xs font-medium transition-colors ${
												activeTab === key
													? "border-b-2 border-primary text-foreground"
													: "text-muted-foreground hover:text-foreground"
											}`}
											onClick={() => setActiveTab(key)}
										>
											{label}
											{key === "mapping" && mappingEntries.length > 0 && (
												<span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-muted text-[11px]">
													{mappingEntries.length}
												</span>
											)}
											{key === "removed" &&
												result.removed_fields.length > 0 && (
													<span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-muted text-[11px]">
														{result.removed_fields.length}
													</span>
												)}
										</button>
									))}
								</div>

								<div className="flex-1 overflow-y-auto p-4">
									{activeTab === "masked" && (
										<div className="space-y-2">
											<pre className="text-xs font-mono whitespace-pre-wrap bg-muted/30 p-3 rounded-md border overflow-x-auto">
												{JSON.stringify(result.masked_bundle, null, 2)}
											</pre>
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => {
													navigator.clipboard.writeText(
														JSON.stringify(result.masked_bundle, null, 2)
													);
													toast.success("Copied to clipboard");
												}}
											>
												Copy Masked Bundle
											</Button>
										</div>
									)}

									{activeTab === "mapping" && (
										<div>
											{mappingEntries.length > 0 ? (
												<table className="w-full text-xs">
													<thead>
														<tr className="border-b">
															<th className="text-left py-2 pr-4 font-medium">
																Original ID
															</th>
															<th className="text-left py-2 font-medium">
																Masked ID
															</th>
														</tr>
													</thead>
													<tbody>
														{mappingEntries.map(([original, masked]) => (
															<tr key={original} className="border-b">
																<td className="py-2 pr-4 font-mono">
																	{original}
																</td>
																<td className="py-2 font-mono">{masked}</td>
															</tr>
														))}
													</tbody>
												</table>
											) : (
												<p className="text-sm text-muted-foreground">
													No ID mappings generated.
												</p>
											)}
										</div>
									)}

									{activeTab === "removed" && (
										<div>
											{result.removed_fields.length > 0 ? (
												<ul className="space-y-1">
													{result.removed_fields.map((field) => (
														<li
															key={field}
															className="text-xs font-mono p-2 rounded border bg-muted/30"
														>
															{field}
														</li>
													))}
												</ul>
											) : (
												<p className="text-sm text-muted-foreground">
													No fields were removed.
												</p>
											)}
										</div>
									)}
								</div>
							</div>
						) : (
							<DemoEmptyState
								icon={EyeOffIcon}
								description={
									<>
										Paste a FHIR Bundle on the left and click{" "}
										<strong>Mask Data</strong> to de-identify patient data.
									</>
								}
							/>
						)
					}
				/>
			</DemoPageShell>

			<div className="px-4 py-2 border-t">
				<ApiTopology {...TOPOLOGIES.data_masking} />
			</div>
		</DashboardLayout>
	);
};

export default DataMaskingPage;
