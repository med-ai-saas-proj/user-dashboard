import { useMemo, useState } from "react";
import { Button } from "@/components/shadcn/button";
import {
	type BhxhTable,
	decodeBhxhEnvelope,
	wrapBareBhxhTables,
} from "../services/bhxh-envelope";

// Side-by-side BHXH envelope inspector. Paste a <GIAMDINHHS> envelope and
// see each <NOIDUNGFILE> decoded — useful for comparing what the FHIR
// Converter Worker actually parses against bare per-record dump files.
export function BhxhEnvelopeInspector() {
	const [input, setInput] = useState("");
	const [activeTab, setActiveTab] = useState<string | null>(null);

	const isEnvelope = input.trim().toLowerCase().includes("<giamdinhhs");

	const decoded: BhxhTable[] = useMemo(() => {
		if (!input.trim()) return [];
		if (isEnvelope) return decodeBhxhEnvelope(input);
		// If the user pasted bare tables instead, mirror what the converter
		// will see by running the same wrapping pass and decoding it back.
		const { envelope } = wrapBareBhxhTables(splitBlocks(input));
		return decodeBhxhEnvelope(envelope);
	}, [input, isEnvelope]);

	if (decoded.length > 0 && activeTab === null) {
		setActiveTab(decoded[0].loaiHoSo);
	}
	const active = decoded.find((t) => t.loaiHoSo === activeTab) ?? decoded[0];

	const copyTable = async (xml: string) => {
		try {
			await navigator.clipboard.writeText(xml);
		} catch {
			/* ignore */
		}
	};

	return (
		<div className="rounded-lg border bg-background">
			<div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
				<div>
					<h3 className="text-sm font-semibold">BHXH Envelope Inspector</h3>
					<p className="text-xs text-muted-foreground">
						Paste a <code>&lt;GIAMDINHHS&gt;</code> envelope or a stack of bare
						BHXH tables to view each decoded table.
					</p>
				</div>
				{input && (
					<Button
						variant="ghost"
						size="sm"
						className="h-7 text-xs"
						onClick={() => {
							setInput("");
							setActiveTab(null);
						}}
					>
						Clear
					</Button>
				)}
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-x">
				<div>
					<div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/20 border-b">
						Input ({isEnvelope ? "envelope" : "bare tables"})
					</div>
					<textarea
						value={input}
						onChange={(e) => {
							setInput(e.target.value);
							setActiveTab(null);
						}}
						placeholder={
							"Paste a <GIAMDINHHS> envelope, OR one or more bare tables\n(TONG_HOP, CHITIEU_CHITIET_THUOC, …) separated by blank lines."
						}
						className="w-full h-[420px] p-3 font-mono text-[12px] bg-transparent focus:outline-none resize-none"
						spellCheck={false}
					/>
				</div>
				<div>
					<div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/20 border-b flex items-center justify-between">
						<span>Decoded tables ({decoded.length})</span>
						{active && (
							<button
								type="button"
								onClick={() => copyTable(active.innerXml)}
								className="text-xs underline-offset-2 hover:underline"
							>
								Copy {active.loaiHoSo}
							</button>
						)}
					</div>
					{decoded.length === 0 ? (
						<div className="h-[420px] flex items-center justify-center text-xs text-muted-foreground p-6 text-center">
							{input.trim()
								? "Nothing decoded yet. Make sure your input is a valid BHXH envelope or bare table XML."
								: "Decoded tables will appear here."}
						</div>
					) : (
						<div className="flex flex-col h-[420px]">
							<div className="flex flex-wrap gap-1 px-3 pt-2 pb-1.5 border-b bg-muted/10">
								{decoded.map((t) => (
									<button
										key={`${t.loaiHoSo}-${t.rootTag}`}
										type="button"
										onClick={() => setActiveTab(t.loaiHoSo)}
										className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors ${
											active?.loaiHoSo === t.loaiHoSo
												? "bg-primary text-primary-foreground border-primary"
												: "bg-background hover:bg-muted"
										}`}
										title={t.rootTag}
									>
										{t.loaiHoSo}
										<span className="ml-1 text-[10px] opacity-70">
											{t.rootTag}
										</span>
									</button>
								))}
							</div>
							<pre className="flex-1 overflow-auto p-3 text-[12px] font-mono leading-relaxed whitespace-pre-wrap break-all">
								{active?.innerXml ?? ""}
							</pre>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

function splitBlocks(raw: string): string[] {
	const trimmed = raw.trim().replace(/^<\?xml[^?]*\?>\s*/i, "");
	const blocks = trimmed
		.split(/\n\s*\n+/)
		.map((s) => s.trim())
		.filter((s) => s.startsWith("<"));
	return blocks.length > 0 ? blocks : [trimmed];
}
