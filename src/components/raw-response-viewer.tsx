import { useState } from "react";

interface RawResponseViewerProps {
	data: unknown;
	className?: string;
}

export function RawResponseViewer({ data, className }: RawResponseViewerProps) {
	const [open, setOpen] = useState(false);
	const [copied, setCopied] = useState(false);

	if (data === null || data === undefined) return null;

	const json = JSON.stringify(data, null, 2);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(json);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {
			/* ignore */
		}
	};

	return (
		<div className={`rounded-md border ${className ?? ""}`}>
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium hover:bg-muted/40 transition-colors"
			>
				<span className="flex items-center gap-2">
					<span
						className={`inline-block transition-transform ${open ? "rotate-90" : ""}`}
					>
						▸
					</span>
					Raw response
				</span>
				<span className="text-muted-foreground">
					{open ? "Hide" : "Show"} JSON
				</span>
			</button>
			{open && (
				<div className="border-t">
					<div className="flex items-center justify-end px-3 py-1.5 border-b bg-muted/20">
						<button
							type="button"
							onClick={handleCopy}
							className="text-xs px-2 py-0.5 rounded border hover:bg-background transition-colors"
						>
							{copied ? "Copied!" : "Copy"}
						</button>
					</div>
					<pre className="text-xs font-mono p-3 overflow-x-auto max-h-[400px] overflow-y-auto bg-muted/10">
						{json}
					</pre>
				</div>
			)}
		</div>
	);
}
