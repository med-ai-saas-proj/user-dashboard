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

interface ViewCodeDialogProps {
	endpoint: string;
	method?: string;
	body?: Record<string, unknown>;
	description?: string;
}

function buildSnippets({
	endpoint,
	method = "POST",
	body,
}: ViewCodeDialogProps): CodeSnippet[] {
	const bodyJson = body ? JSON.stringify(body, null, 2) : "{}";
	const bodyJsonInline = body ? JSON.stringify(body) : "{}";

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
    json=${bodyJson.replace(/"/g, '"').replace(/null/g, "None").replace(/true/g, "True").replace(/false/g, "False")},
)

print(response.json())`,
		},
		{
			label: "Python (Venera SDK)",
			language: "python",
			code: `# pip install venera-sdk  (coming soon)
from venera import VeneraClient

client = VeneraClient(api_key="YOUR_API_KEY")
result = client.${endpoint.split("/").pop()?.replace(/-/g, "_") || "call"}(${bodyJson.replace(/"/g, '"').replace(/null/g, "None").replace(/true/g, "True").replace(/false/g, "False")})

print(result)`,
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
	const snippets = buildSnippets(props);

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
					</DialogDescription>
				</DialogHeader>
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
