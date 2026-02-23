import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/shadcn/dialog";
import { Button } from "@/components/shadcn/button";
import { CodeIcon, CopyIcon, CheckIcon } from "lucide-react";
import { toast } from "sonner";

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

function buildSingleSnippets({
	endpoint,
	method = "POST",
	body,
	contentType,
}: {
	endpoint: string;
	method?: string;
	body?: Record<string, unknown>;
	contentType?: string;
}): CodeSnippet[] {
	const isMultipart = contentType === "multipart/form-data";
	const bodyJson = body ? JSON.stringify(body, null, 2) : "{}";
	const bodyJsonInline = body ? JSON.stringify(body) : "{}";

	if (isMultipart) {
		return [
			{
				label: "cURL",
				language: "bash",
				code: `curl -X ${method} "${endpoint}" \\
  -H "X-Api-Key: YOUR_API_KEY" \\
  -F "file=@/path/to/your/file"`,
			},
			{
				label: "Python (requests)",
				language: "python",
				code: `import requests

with open("your_file", "rb") as f:
    response = requests.${method.toLowerCase()}(
        "${endpoint}",
        headers={"X-Api-Key": "YOUR_API_KEY"},
        files={"file": f},
    )

print(response.json())`,
			},
			{
				label: "Python (Venera SDK)",
				language: "python",
				code: `# pip install venera-sdk  (coming soon)
from venera import VeneraClient

client = VeneraClient(api_key="YOUR_API_KEY")
result = client.${endpoint.split("/").pop()?.replace(/-/g, "_") || "call"}(
    file="your_file"
)

print(result)`,
			},
		];
	}

	return [
		{
			label: "cURL",
			language: "bash",
			code: `curl -X ${method} "${endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "X-Api-Key: YOUR_API_KEY" \\
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
        "X-Api-Key": "YOUR_API_KEY",
    },
    json=${bodyJson.replace(/null/g, "None").replace(/true/g, "True").replace(/false/g, "False")},
)

print(response.json())`,
		},
		{
			label: "Python (Venera SDK)",
			language: "python",
			code: `# pip install venera-sdk  (coming soon)
from venera import VeneraClient

client = VeneraClient(api_key="YOUR_API_KEY")
result = client.${endpoint.split("/").pop()?.replace(/-/g, "_") || "call"}(${bodyJson.replace(/null/g, "None").replace(/true/g, "True").replace(/false/g, "False")})

print(result)`,
		},
	];
}

function buildPipelineSnippets(
	steps: ApiStep[],
	description?: string
): CodeSnippet[] {
	const curlParts = steps.map(
		(s, i) =>
			`# Step ${i + 1}: ${s.label}\ncurl -X ${s.method || "POST"} "${s.endpoint}" \\\n  -H "Content-Type: application/json" \\\n  -H "X-Api-Key: YOUR_API_KEY" \\\n  -d '${s.body ? JSON.stringify(s.body) : "{}"}'`
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
		const bodyJson = s.body
			? JSON.stringify(s.body, null, 4)
					.replace(/null/g, "None")
					.replace(/true/g, "True")
					.replace(/false/g, "False")
			: "{}";
		const methodName =
			s.endpoint.split("/").pop()?.replace(/-/g, "_") || "call";
		return `# Step ${i + 1}: ${s.label}\nresult_${i + 1} = client.${methodName}(${bodyJson})`;
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
			code: `import requests\n\nheaders = {\n    "Content-Type": "application/json",\n    "X-Api-Key": "YOUR_API_KEY",\n}\n\n${pyParts.join("\n\n")}`,
		},
		{
			label: "Python (Venera SDK)",
			language: "python",
			code: `# pip install venera-sdk  (coming soon)\nfrom venera import VeneraClient\n\nclient = VeneraClient(api_key="YOUR_API_KEY")\n\n${sdkParts.join("\n\n")}`,
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

export function ViewCodeDialog(props: ViewCodeDialogProps) {
	const [activeTab, setActiveTab] = useState(0);
	const snippets =
		props.steps && props.steps.length > 0
			? buildPipelineSnippets(props.steps, props.description)
			: buildSingleSnippets(props);

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
