import { useState, useRef } from "react";
import { Button } from "@/components/shadcn/button";
import { EXAMPLES, type ExampleData } from "../services/examples";

export type DetectedFormat =
	| "HL7v2"
	| "CDA / C-CDA"
	| "HL7v3 / RIM"
	| "FHIR JSON"
	| "BHXH 4210"
	| "Unknown";

export function detectFormat(data: string): DetectedFormat {
	const trimmed = data.trim();
	if (!trimmed) return "Unknown";
	if (
		trimmed.startsWith("MSH|") ||
		(trimmed.charCodeAt(0) === 0x0b && trimmed.substring(1).startsWith("MSH|"))
	)
		return "HL7v2";
	if (trimmed.startsWith("{")) {
		try {
			const parsed = JSON.parse(trimmed);
			if (parsed.resourceType) return "FHIR JSON";
		} catch {
			/* not JSON */
		}
	}
	if (trimmed.startsWith("<?xml") || trimmed.startsWith("<")) {
		const lower = trimmed.substring(0, 3000).toLowerCase();
		if (
			lower.includes("giamdinhhs") ||
			(lower.includes("tong_hop") && lower.includes("ma_the"))
		)
			return "BHXH 4210";
		if (
			lower.includes("clinicaldocument") &&
			!lower.match(/prpa_|qupc_|repc_|porx_/)
		)
			return "CDA / C-CDA";
		if (lower.includes("urn:hl7-org:v3")) return "HL7v3 / RIM";
		return "CDA / C-CDA";
	}
	return "Unknown";
}

const FORMAT_COLORS: Record<DetectedFormat, string> = {
	HL7v2: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
	"CDA / C-CDA":
		"bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
	"HL7v3 / RIM":
		"bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
	"FHIR JSON":
		"bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
	"BHXH 4210": "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
	Unknown: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

type ConverterFormProps = {
	onConvert: (data: string, validate: boolean) => void;
	onReverseConvert: (data: string) => void;
	onValidate: (bundle: Record<string, unknown>) => void;
	isLoading: boolean;
};

export function ConverterForm({
	onConvert,
	onReverseConvert,
	onValidate,
	isLoading,
}: ConverterFormProps) {
	const [inputData, setInputData] = useState("");
	const [validate, setValidate] = useState(true);
	const [showExamples, setShowExamples] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const detectedFormat = detectFormat(inputData);
	const isFhirInput = detectedFormat === "FHIR JSON";

	const loadExample = (example: ExampleData) => {
		setInputData(example.data);
		setShowExamples(false);
	};

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			setInputData(reader.result as string);
		};
		reader.readAsText(file);
		e.target.value = "";
	};

	const handleConvert = () => {
		if (!inputData.trim()) return;
		if (isFhirInput) {
			onReverseConvert(inputData);
		} else {
			onConvert(inputData, validate);
		}
	};

	const handleValidateFhir = () => {
		if (!inputData.trim()) return;
		try {
			const bundle = JSON.parse(inputData.trim());
			onValidate(bundle);
		} catch {
			/* ignore */
		}
	};

	return (
		<div className="flex flex-col h-full">
			<div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
				<div className="flex items-center gap-3">
					<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
						Input
					</h2>
					{inputData.trim() && (
						<span
							className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${FORMAT_COLORS[detectedFormat]}`}
						>
							{detectedFormat}
						</span>
					)}
				</div>
				<div className="flex items-center gap-1.5">
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
						Upload
					</Button>
					{inputData && (
						<Button
							variant="ghost"
							size="sm"
							className="h-7 text-xs text-muted-foreground"
							onClick={() => setInputData("")}
						>
							Clear
						</Button>
					)}
				</div>
				<input
					ref={fileInputRef}
					type="file"
					accept=".hl7,.xml,.json,.txt,.cda,.hl7v2"
					className="hidden"
					onChange={handleFileUpload}
				/>
			</div>

			{showExamples && (
				<div className="px-4 py-2 border-b bg-muted/20">
					<div className="flex flex-wrap gap-1.5">
						{EXAMPLES.map((ex) => (
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

			<div className="flex-1 relative">
				<textarea
					value={inputData}
					onChange={(e) => setInputData(e.target.value)}
					onKeyDown={(e) => {
						if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
							e.preventDefault();
							handleConvert();
						}
					}}
					placeholder={
						"Paste HL7v2, CDA/C-CDA, HL7v3, BHXH 4210, or FHIR JSON here...\n\nOr click 'Examples' to try sample data.\nOr 'Upload' to load a file."
					}
					className="w-full h-full min-h-[400px] p-4 font-mono text-[13px] leading-relaxed bg-transparent focus:outline-none resize-none"
					spellCheck={false}
				/>
			</div>

			<div className="flex items-center justify-between px-4 py-2.5 border-t bg-muted/30">
				<div className="flex items-center gap-4">
					<label className="flex items-center gap-2 text-xs cursor-pointer select-none">
						<input
							type="checkbox"
							checked={validate}
							onChange={(e) => setValidate(e.target.checked)}
							className="rounded border-muted-foreground/30"
						/>
						<span className="text-muted-foreground">Validate output</span>
					</label>
					<span className="text-[11px] text-muted-foreground/60">
						{inputData.length.toLocaleString()} chars
					</span>
				</div>
				<div className="flex items-center gap-2">
					{isFhirInput && (
						<Button
							variant="outline"
							size="sm"
							className="h-8 text-xs"
							onClick={handleValidateFhir}
							disabled={!inputData.trim() || isLoading}
						>
							Validate FHIR
						</Button>
					)}
					<Button
						size="sm"
						className="h-8 text-xs"
						onClick={handleConvert}
						disabled={!inputData.trim() || isLoading}
					>
						{isLoading ? (
							<span className="flex items-center gap-1.5">
								<span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
								Converting...
							</span>
						) : isFhirInput ? (
							"FHIR → HL7v2"
						) : (
							"Convert to FHIR"
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}
