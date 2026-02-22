import { useState } from "react";
import { Button } from "@/components/shadcn/button";
import type {
	ConvertResponse,
	ReverseConvertResponse,
	ValidateResponse,
	FhirEntry,
} from "../services/ehr-converter.dto";

type ResultTab = "resources" | "bundle" | "validation";

const RESOURCE_COLORS: Record<string, string> = {
	Patient: "bg-blue-500",
	Encounter: "bg-emerald-500",
	Observation: "bg-amber-500",
	Condition: "bg-rose-500",
	AllergyIntolerance: "bg-pink-500",
	MedicationStatement: "bg-violet-500",
	MedicationRequest: "bg-violet-400",
	Procedure: "bg-indigo-500",
	DiagnosticReport: "bg-orange-500",
	Immunization: "bg-teal-500",
	Coverage: "bg-cyan-500",
	Claim: "bg-amber-600",
	RelatedPerson: "bg-sky-500",
	ServiceRequest: "bg-lime-600",
	Specimen: "bg-emerald-600",
	Provenance: "bg-gray-500",
	DocumentReference: "bg-slate-500",
	Bundle: "bg-slate-600",
};

const ICON_MAP: Record<string, string> = {
	Patient: "Pa",
	Encounter: "En",
	Observation: "Ob",
	Condition: "Cn",
	DiagnosticReport: "DR",
	AllergyIntolerance: "Al",
	MedicationStatement: "Rx",
	Procedure: "Pr",
	Immunization: "Im",
	RelatedPerson: "RP",
	Bundle: "Bd",
	ServiceRequest: "SR",
	Coverage: "Cv",
	Specimen: "Sp",
	Provenance: "Pv",
	MedicationRequest: "Rx",
	Claim: "Cl",
	DocumentReference: "Do",
};

function getResourceSummary(r: FhirEntry["resource"]): string {
	if (!r) return "";
	switch (r.resourceType) {
		case "Patient": {
			const n = (r.name || [])[0] || {};
			return (
				[n.family, ...(n.given || [])].filter(Boolean).join(" ") +
				(r.gender ? ` (${r.gender})` : "")
			);
		}
		case "Encounter":
			return (r.status || "") + (r.class?.code ? ` — ${r.class.code}` : "");
		case "Observation":
		case "Condition":
		case "DiagnosticReport":
		case "AllergyIntolerance":
		case "Procedure":
			return r.code?.text || r.code?.coding?.[0]?.display || r.id || "";
		case "MedicationStatement":
			return (
				r.medicationCodeableConcept?.text ||
				r.medicationCodeableConcept?.coding?.[0]?.display ||
				r.id ||
				""
			);
		case "Immunization":
			return (
				r.vaccineCode?.text || r.vaccineCode?.coding?.[0]?.display || r.id || ""
			);
		case "RelatedPerson": {
			const rn = (r.name || [])[0] || {};
			return [rn.family, ...(rn.given || [])].filter(Boolean).join(" ");
		}
		default:
			return r.id || "";
	}
}

type ConvertResultPanelProps = {
	result: ConvertResponse | null;
	reverseResult: ReverseConvertResponse | null;
	validateResult: ValidateResponse | null;
	conversionTime: number | null;
};

export function ConvertResultPanel({
	result,
	reverseResult,
	validateResult,
	conversionTime,
}: ConvertResultPanelProps) {
	const [activeTab, setActiveTab] = useState<ResultTab>("resources");
	const [selectedResource, setSelectedResource] = useState<number | null>(null);

	const timeStr = conversionTime != null ? `${conversionTime}ms` : "";

	if (validateResult) {
		return (
			<div className="flex flex-col h-full">
				<div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
					<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
						Validation Result
					</h2>
					<span
						className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${validateResult.valid ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"}`}
					>
						{validateResult.valid
							? "Valid"
							: `${validateResult.errors.length} Error(s)`}
					</span>
				</div>
				<div className="flex-1 overflow-auto p-4">
					{validateResult.valid ? (
						<div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
							<div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
								<svg
									width="16"
									height="16"
									fill="none"
									stroke="currentColor"
									strokeWidth="2.5"
									aria-hidden="true"
								>
									<title>Valid</title>
									<path d="M4 8l3 3 5-5" />
								</svg>
							</div>
							<p className="text-sm font-medium text-green-800 dark:text-green-200">
								Bundle passes FHIR R4 validation
							</p>
						</div>
					) : (
						<div className="space-y-2">
							{validateResult.errors.map((err, i) => (
								<div
									key={i}
									className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg"
								>
									<p className="text-xs font-mono text-red-700 dark:text-red-300">
										{JSON.stringify(err, null, 2)}
									</p>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		);
	}

	if (reverseResult) {
		return (
			<div className="flex flex-col h-full">
				<div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
					<div className="flex items-center gap-2">
						<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
							Output
						</h2>
						<span
							className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${reverseResult.success ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"}`}
						>
							{reverseResult.success ? "Success" : "Failed"}
						</span>
					</div>
					<span className="text-[11px] text-muted-foreground">
						FHIR → {reverseResult.output_format} {reverseResult.message_type}{" "}
						{timeStr && `— ${timeStr}`}
					</span>
				</div>
				{reverseResult.errors.length > 0 && (
					<div className="mx-4 mt-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
						{reverseResult.errors.map((err, i) => (
							<p key={i} className="text-xs text-red-700 dark:text-red-300">
								{err}
							</p>
						))}
					</div>
				)}
				<div className="flex-1 overflow-auto p-4">
					<pre className="p-4 bg-muted/30 rounded-lg text-[13px] font-mono whitespace-pre-wrap border text-emerald-700 dark:text-emerald-400">
						{reverseResult.output}
					</pre>
				</div>
				<div className="flex justify-end gap-2 px-4 py-2.5 border-t bg-muted/30">
					<Button
						variant="outline"
						size="sm"
						className="h-7 text-xs"
						onClick={() => navigator.clipboard.writeText(reverseResult.output)}
					>
						Copy HL7v2
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="h-7 text-xs"
						onClick={() => {
							const blob = new Blob([reverseResult.output], {
								type: "text/plain",
							});
							const a = document.createElement("a");
							a.href = URL.createObjectURL(blob);
							a.download = "output.hl7";
							a.click();
							URL.revokeObjectURL(a.href);
						}}
					>
						Download
					</Button>
				</div>
			</div>
		);
	}

	if (!result) return null;

	const entries: FhirEntry[] =
		(result.bundle as { entry?: FhirEntry[] })?.entry || [];
	const validationCount = result.validation_errors?.length || 0;

	const tabs: { id: ResultTab; label: string; count?: number }[] = [
		{ id: "resources", label: "Resources", count: entries.length },
		{ id: "bundle", label: "Bundle JSON" },
		{ id: "validation", label: "Validation", count: validationCount },
	];

	return (
		<div className="flex flex-col h-full">
			<div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
				<div className="flex items-center gap-2">
					<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
						Output
					</h2>
					<span
						className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${result.success ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"}`}
					>
						{result.success ? "Success" : "Failed"}
					</span>
				</div>
				<span className="text-[11px] text-muted-foreground">
					{result.source_format?.toUpperCase()} {result.message_type} —{" "}
					{entries.length} resources {timeStr && `— ${timeStr}`}
				</span>
			</div>

			{result.errors.length > 0 && (
				<div className="mx-4 mt-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
					{result.errors.map((err, i) => (
						<p key={i} className="text-xs text-red-700 dark:text-red-300">
							{err}
						</p>
					))}
				</div>
			)}

			<div className="flex gap-0 border-b px-4">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						type="button"
						onClick={() => {
							setActiveTab(tab.id);
							setSelectedResource(null);
						}}
						className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
					>
						{tab.label}
						{tab.count != null && (
							<span
								className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? "bg-primary/10" : "bg-muted"}`}
							>
								{tab.count}
							</span>
						)}
					</button>
				))}
			</div>

			<div className="flex-1 overflow-auto">
				{activeTab === "resources" &&
					(selectedResource !== null ? (
						<div className="p-4 space-y-3">
							<button
								type="button"
								onClick={() => setSelectedResource(null)}
								className="text-xs text-muted-foreground hover:text-foreground transition-colors"
							>
								← Back to list
							</button>
							<div className="text-sm font-medium mb-2">
								{entries[selectedResource]?.resource?.resourceType} /{" "}
								{entries[selectedResource]?.resource?.id || ""}
							</div>
							<pre className="p-4 bg-muted/30 rounded-lg text-[12px] font-mono whitespace-pre-wrap border leading-relaxed">
								{JSON.stringify(entries[selectedResource]?.resource, null, 2)}
							</pre>
							<div className="flex justify-end">
								<Button
									variant="outline"
									size="sm"
									className="h-7 text-xs"
									onClick={() =>
										navigator.clipboard.writeText(
											JSON.stringify(
												entries[selectedResource]?.resource,
												null,
												2
											)
										)
									}
								>
									Copy Resource
								</Button>
							</div>
						</div>
					) : (
						<div className="divide-y">
							{entries.map((entry, idx) => {
								const r = entry.resource;
								const type = r?.resourceType || "Unknown";
								const summary = getResourceSummary(r);
								return (
									<button
										type="button"
										key={idx}
										onClick={() => setSelectedResource(idx)}
										className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-left"
									>
										<span
											className={`flex items-center justify-center w-7 h-7 rounded text-white text-[10px] font-bold flex-shrink-0 ${RESOURCE_COLORS[type] || "bg-gray-400"}`}
										>
											{ICON_MAP[type] || type.slice(0, 2)}
										</span>
										<div className="min-w-0 flex-1">
											<p className="text-sm font-medium leading-tight">
												{type}
											</p>
											<p className="text-[11px] text-muted-foreground truncate">
												{summary || `id: ${r?.id || `entry-${idx}`}`}
											</p>
										</div>
									</button>
								);
							})}
						</div>
					))}

				{activeTab === "bundle" && (
					<div className="p-4 space-y-3">
						<pre className="p-4 bg-muted/30 rounded-lg text-[12px] font-mono whitespace-pre-wrap border leading-relaxed max-h-[600px] overflow-auto">
							{JSON.stringify(result.bundle, null, 2)}
						</pre>
					</div>
				)}

				{activeTab === "validation" && (
					<div className="p-4 space-y-2">
						{validationCount === 0 ? (
							<div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
								<div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white flex-shrink-0">
									<svg
										width="14"
										height="14"
										fill="none"
										stroke="currentColor"
										strokeWidth="2.5"
										aria-hidden="true"
									>
										<title>Valid</title>
										<path d="M3.5 7l2.5 2.5 4.5-4.5" />
									</svg>
								</div>
								<p className="text-sm font-medium text-green-800 dark:text-green-200">
									All {entries.length} resources pass FHIR R4 validation
								</p>
							</div>
						) : (
							result.validation_errors.map((err, i) => (
								<div
									key={i}
									className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg"
								>
									<div className="flex items-baseline gap-2 mb-1">
										<span className="text-[11px] font-semibold text-red-800 dark:text-red-300">
											{err.resource_type || ""}
											{err.entry_index != null ? ` #${err.entry_index}` : ""}
											{err.field ? ` — ${err.field}` : ""}
										</span>
									</div>
									<p className="text-xs text-red-700 dark:text-red-400">
										{err.message || JSON.stringify(err)}
									</p>
								</div>
							))
						)}
					</div>
				)}
			</div>

			{activeTab === "bundle" && (
				<div className="flex justify-end gap-2 px-4 py-2.5 border-t bg-muted/30">
					<Button
						variant="outline"
						size="sm"
						className="h-7 text-xs"
						onClick={() =>
							navigator.clipboard.writeText(
								JSON.stringify(result.bundle, null, 2)
							)
						}
					>
						Copy Bundle
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="h-7 text-xs"
						onClick={() => {
							const blob = new Blob([JSON.stringify(result.bundle, null, 2)], {
								type: "application/json",
							});
							const a = document.createElement("a");
							a.href = URL.createObjectURL(blob);
							a.download = "fhir-bundle.json";
							a.click();
							URL.revokeObjectURL(a.href);
						}}
					>
						Download JSON
					</Button>
				</div>
			)}
		</div>
	);
}
