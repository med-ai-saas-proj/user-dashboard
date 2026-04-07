import {
	CheckIcon,
	ChevronDownIcon,
	CodeIcon,
	CopyIcon,
	KeyRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/shadcn/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/shadcn/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import { useGetApiKeys } from "@/features/api-keys/hooks/use-get-api-keys";
import { useServiceApiKeyStore } from "@/features/api-keys/store/service-api-key.store";

interface CodeSnippet {
	label: string;
	language: string;
	code: string;
}

interface ApiStep {
	label: string;
	endpoint: string;
	method?: string;
	body?: Record<string, unknown>;
	contentType?: string;
}

interface ViewCodeDialogProps {
	endpoint: string;
	method?: string;
	body?: Record<string, unknown>;
	description?: string;
	contentType?: string;
	steps?: ApiStep[];
}

function getSDKMethodInfo(endpoint: string): {
	property: string;
	method: string;
	fileArg?: boolean;
} {
	const path = endpoint.split("/api/v1/")[1] || "";
	const mapping: Record<
		string,
		{ property: string; method: string; fileArg?: boolean }
	> = {
		voice_transcribe: {
			property: "voice_transcribe",
			method: "transcribe",
			fileArg: true,
		},
		"medical_image/describe": {
			property: "medical_image",
			method: "describe",
			fileArg: true,
		},
		ocr: { property: "ocr", method: "extract", fileArg: true },
		ehr_summarize: { property: "ehr_summarize", method: "summarize" },
		rx_advisor: { property: "rx_advisor", method: "advise" },
		"ai_search/search": { property: "ai_search", method: "search" },
		ai_search: { property: "ai_search", method: "search" },
		chat: { property: "chat", method: "create_chat_completion" },
		"blood_panel/analyze": { property: "blood_panel", method: "analyze" },
		"symptom_checker/check": { property: "symptom_checker", method: "check" },
		"health_score/evaluate": { property: "health_score", method: "evaluate" },
		"gene_decoder/decode": { property: "gene_decoder", method: "decode" },
		"gene_decoder/analyze": { property: "gene_decoder", method: "analyze" },
		"bhxh_validator/validate": {
			property: "bhxh_validator",
			method: "validate",
		},
		"data_masking/mask": { property: "data_masking", method: "mask" },
		knowledge_base: { property: "knowledge_base", method: "list" },
		"knowledge_base/search": { property: "knowledge_base", method: "search" },
		"cross_search/search": {
			property: "cross_provider_search",
			method: "search",
		},
		"public_health/statistics": {
			property: "public_health",
			method: "statistics",
		},
		"clinic_search/search": { property: "clinic_search", method: "search" },
		"ehr_converter/convert": { property: "ehr_converter", method: "convert" },
		"ehr_converter/convert/document": {
			property: "ehr_converter",
			method: "convert",
		},
		"playground/seed": { property: "playground", method: "seed" },
		"playground/status": { property: "playground", method: "status" },
		"a2ui/generate": { property: "a2ui", method: "generate" },
	};
	return (
		mapping[path] || {
			property: path.split("/")[0]?.replace(/-/g, "_") || "api",
			method: path.split("/")[1]?.replace(/-/g, "_") || "call",
		}
	);
}

function buildSingleSnippets({
	endpoint,
	method = "POST",
	body,
	contentType,
	apiKey,
}: {
	endpoint: string;
	method?: string;
	body?: Record<string, unknown>;
	contentType?: string;
	apiKey: string;
}): CodeSnippet[] {
	const isMultipart = contentType === "multipart/form-data";
	const bodyJson = body ? JSON.stringify(body, null, 2) : "{}";
	const bodyJsonInline = body ? JSON.stringify(body) : "{}";
	const sdkInfo = getSDKMethodInfo(endpoint);

	if (isMultipart) {
		return [
			{
				label: "cURL",
				language: "bash",
				code: `curl -X ${method} "${endpoint}" \\
  -H "X-Api-Key: ${apiKey}" \\
  -F "file=@/path/to/your/file"`,
			},
			{
				label: "Python (requests)",
				language: "python",
				code: `import requests

with open("your_file", "rb") as f:
    response = requests.${method.toLowerCase()}(
        "${endpoint}",
        headers={"X-Api-Key": "${apiKey}"},
        files={"file": f},
    )

print(response.json())`,
			},
			{
				label: "Python (Venera SDK)",
				language: "python",
				code: `# pip install venera-sdk
from venera_sdk import VeneraClient

client = VeneraClient(api_key="${apiKey}")
result = client.${sdkInfo.property}.${sdkInfo.method}(file_path="/path/to/your/file")

print(result)`,
			},
		];
	}

	const bodyPython = bodyJson
		.replace(/null/g, "None")
		.replace(/true/g, "True")
		.replace(/false/g, "False");

	const sdkArgs = body ? formatSDKArgs(body) : "";

	return [
		{
			label: "cURL",
			language: "bash",
			code: `curl -X ${method} "${endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "X-Api-Key: ${apiKey}" \\
  -d '${bodyJsonInline}'`,
		},
		{
			label: "Python (requests)",
			language: "python",
			code: `import requests

response = requests.${method.toLowerCase()}(
    "${endpoint}",
    headers={
        "Content-Type": "application/json",
        "X-Api-Key": "${apiKey}",
    },
    json=${bodyPython},
)

print(response.json())`,
		},
		{
			label: "Python (Venera SDK)",
			language: "python",
			code: `# pip install venera-sdk
from venera_sdk import VeneraClient

client = VeneraClient(api_key="${apiKey}")
result = client.${sdkInfo.property}.${sdkInfo.method}(${sdkArgs ? `\n${sdkArgs}\n` : ""})

print(result)`,
		},
	];
}

function formatSDKArgs(body: Record<string, unknown>): string {
	const entries = Object.entries(body);
	if (entries.length === 0) return "";

	return entries
		.map(([key, value]) => {
			const pyValue = toPythonValue(value);
			return `    ${key}=${pyValue},`;
		})
		.join("\n");
}

function toPythonValue(value: unknown): string {
	if (value === null || value === undefined) return "None";
	if (value === true) return "True";
	if (value === false) return "False";
	if (typeof value === "string") return `"${value}"`;
	if (typeof value === "number") return String(value);
	if (Array.isArray(value)) {
		const items = value.map(toPythonValue).join(", ");
		return `[${items}]`;
	}
	if (typeof value === "object") {
		const entries = Object.entries(value as Record<string, unknown>)
			.map(([k, v]) => `"${k}": ${toPythonValue(v)}`)
			.join(", ");
		return `{${entries}}`;
	}
	return String(value);
}

function buildPipelineSnippets(
	steps: ApiStep[],
	description: string | undefined,
	apiKey: string
): CodeSnippet[] {
	const curlParts = steps.map(
		(s, i) =>
			`# Step ${i + 1}: ${s.label}\ncurl -X ${s.method || "POST"} "${s.endpoint}" \\\n  -H "Content-Type: application/json" \\\n  -H "X-Api-Key: ${apiKey}" \\\n  -d '${s.body ? JSON.stringify(s.body) : "{}"}'`
	);
	const pyParts = steps.map((s, i) => {
		const bodyJson = s.body
			? JSON.stringify(s.body, null, 4)
					.replace(/null/g, "None")
					.replace(/true/g, "True")
					.replace(/false/g, "False")
			: "{}";
		return `# Step ${i + 1}: ${s.label}\nresp_${i + 1} = requests.${(s.method || "POST").toLowerCase()}(\n    "${s.endpoint}",\n    headers=headers,\n    json=${bodyJson},\n)\nresult_${i + 1} = resp_${i + 1}.json()`;
	});
	const sdkParts = steps.map((s, i) => {
		const sdkInfo = getSDKMethodInfo(s.endpoint);
		const sdkArgs = s.body ? formatSDKArgs(s.body) : "";
		return `# Step ${i + 1}: ${s.label}\nresult_${i + 1} = client.${sdkInfo.property}.${sdkInfo.method}(${sdkArgs ? `\n${sdkArgs}\n` : ""})`;
	});

	return [
		{
			label: "cURL",
			language: "bash",
			code: `# Pipeline: ${description || "Multi-step workflow"}\n\n${curlParts.join("\n\n")}`,
		},
		{
			label: "Python (requests)",
			language: "python",
			code: `import requests\n\nheaders = {\n    "Content-Type": "application/json",\n    "X-Api-Key": "${apiKey}",\n}\n\n${pyParts.join("\n\n")}`,
		},
		{
			label: "Python (Venera SDK)",
			language: "python",
			code: `# pip install venera-sdk\nfrom venera_sdk import VeneraClient\n\nclient = VeneraClient(api_key="${apiKey}")\n\n${sdkParts.join("\n\n")}`,
		},
	];
}

function CopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(text);
		setCopied(true);
		toast.success("Copied to clipboard");
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<button
			type="button"
			onClick={handleCopy}
			className="absolute top-2 right-2 p-1.5 rounded-md bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
		>
			{copied ? (
				<CheckIcon className="size-3.5" />
			) : (
				<CopyIcon className="size-3.5" />
			)}
		</button>
	);
}

function ApiKeyPicker({
	currentKey,
	onSelect,
}: {
	currentKey: string;
	onSelect: (key: string) => void;
}) {
	const { data: apiKeys } = useGetApiKeys();
	const storeKey = useServiceApiKeyStore((s) => s.selectedApiKey);

	const hasKeys = apiKeys && apiKeys.length > 0;
	const isPlaceholder = currentKey === "YOUR_API_KEY";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="h-6 text-[11px] gap-1 px-2 shrink-0"
				>
					<KeyRound className="size-3" />
					{isPlaceholder ? "Select Key" : "Change Key"}
					<ChevronDownIcon className="size-3" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-64">
				<DropdownMenuLabel className="text-xs">API Keys</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{storeKey && (
					<>
						<DropdownMenuItem
							onClick={() => onSelect(storeKey)}
							className="flex flex-col items-start gap-0.5"
						>
							<span className="text-xs font-medium">Current session key</span>
							<code className="text-[10px] text-muted-foreground font-mono">
								{storeKey.slice(0, 12)}...{storeKey.slice(-4)}
							</code>
						</DropdownMenuItem>
						{hasKeys && <DropdownMenuSeparator />}
					</>
				)}
				{hasKeys ? (
					apiKeys.map((key) => (
						<DropdownMenuItem
							key={key.id}
							onClick={() =>
								onSelect(
									storeKey && key.hint === storeKey.slice(0, key.hint.length)
										? storeKey
										: key.hint
								)
							}
							className="flex flex-col items-start gap-0.5"
						>
							<span className="text-xs font-medium">{key.name}</span>
							<code className="text-[10px] text-muted-foreground font-mono">
								{key.hint}
							</code>
						</DropdownMenuItem>
					))
				) : (
					<DropdownMenuItem disabled>
						<span className="text-xs text-muted-foreground">
							No API keys found
						</span>
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function ViewCodeDialog(props: ViewCodeDialogProps) {
	const [activeTab, setActiveTab] = useState(0);
	const storeKey = useServiceApiKeyStore((s) => s.selectedApiKey);
	const [apiKey, setApiKey] = useState<string>(storeKey || "YOUR_API_KEY");

	useEffect(() => {
		if (storeKey && apiKey === "YOUR_API_KEY") {
			setApiKey(storeKey);
		}
	}, [storeKey, apiKey]);

	const snippets =
		props.steps && props.steps.length > 0
			? buildPipelineSnippets(props.steps, props.description, apiKey)
			: buildSingleSnippets({ ...props, apiKey });

	const hasPipeline = props.steps && props.steps.length > 1;

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
					<CodeIcon className="size-3" />
					View Code
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>API Code Snippets</DialogTitle>
					<DialogDescription>
						{props.description || `${props.method || "POST"} ${props.endpoint}`}
						{hasPipeline && (
							<span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
								{props.steps?.length} steps
							</span>
						)}
					</DialogDescription>
				</DialogHeader>
				<div className="flex items-center gap-2 px-2 py-1.5 bg-muted/30 rounded-lg border border-border/50">
					<KeyRound className="size-3.5 text-muted-foreground shrink-0" />
					<code className="flex-1 truncate font-mono text-[11px] text-muted-foreground">
						{apiKey === "YOUR_API_KEY" ? (
							<span className="italic">No API key selected</span>
						) : (
							<>
								{apiKey.slice(0, 16)}...{apiKey.slice(-4)}
							</>
						)}
					</code>
					<ApiKeyPicker
						currentKey={apiKey}
						onSelect={(key) => setApiKey(key)}
					/>
				</div>
				{hasPipeline && (
					<div className="flex gap-1.5 flex-wrap mb-1">
						{props.steps?.map((s, i) => (
							<span
								key={s.endpoint}
								className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground"
							>
								<span className="font-bold text-foreground">{i + 1}</span>
								{s.label}
							</span>
						))}
					</div>
				)}
				<div className="flex gap-1 border-b pb-0">
					{snippets.map((s, i) => (
						<button
							key={s.label}
							type="button"
							onClick={() => setActiveTab(i)}
							className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors -mb-px ${
								activeTab === i
									? "border-primary text-primary"
									: "border-transparent text-muted-foreground hover:text-foreground"
							}`}
						>
							{s.label}
						</button>
					))}
				</div>
				<div className="flex-1 overflow-auto">
					<div className="relative">
						<pre className="p-4 bg-muted/50 rounded-lg text-[12px] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
							{snippets[activeTab].code}
						</pre>
						<CopyButton text={snippets[activeTab].code} />
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
