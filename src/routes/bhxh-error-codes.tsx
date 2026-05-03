import { useMemo, useState } from "react";
import errorCodes from "@/features/bhxh-validator/data/error-codes.json";
import DashboardLayout from "@/layouts/dashboard-layout";

interface ErrorEntry {
	stt: number;
	code: string;
	source: string;
	description: string;
	subcode?: string;
}

const SOURCE_COLORS: Record<string, string> = {
	XML1: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
	XML2: "bg-purple-500/15 text-purple-700 dark:text-purple-300",
	XML3: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
	XML4: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
	XML5: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

const SOURCE_LABELS: Record<string, string> = {
	XML1: "Patient summary",
	XML2: "Medications",
	XML3: "Services",
	XML4: "Lab results",
	XML5: "Progress notes",
};

const BhxhErrorCodesPage = () => {
	const [query, setQuery] = useState("");
	const [activeSource, setActiveSource] = useState<string>("ALL");

	const entries = errorCodes as ErrorEntry[];

	const sources = useMemo(() => {
		const set = new Set<string>();
		for (const e of entries) {
			set.add(e.source);
		}
		return Array.from(set).sort();
	}, [entries]);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return entries.filter((e) => {
			if (activeSource !== "ALL" && e.source !== activeSource) return false;
			if (!q) return true;
			return (
				e.code.toLowerCase().includes(q) ||
				e.description.toLowerCase().includes(q) ||
				(e.subcode ?? "").toLowerCase().includes(q)
			);
		});
	}, [entries, query, activeSource]);

	const counts = useMemo(() => {
		const map: Record<string, number> = { ALL: entries.length };
		for (const e of entries) {
			map[e.source] = (map[e.source] ?? 0) + 1;
		}
		return map;
	}, [entries]);

	return (
		<DashboardLayout pageTitle="BHXH Error Code Reference">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				<div className="px-4 py-3 border-b bg-muted/10">
					<p className="text-xs text-muted-foreground">
						Reference of {entries.length} error codes from{" "}
						<strong>Tổng Hợp_check_BH</strong> (Bệnh viện Quân Y 354 / TT 4210
						implementation). Codes are grouped by source XML file (XML1–XML5).
					</p>
				</div>

				{/* Filter bar */}
				<div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b bg-background">
					<input
						type="search"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search by code or description (Vietnamese OK)…"
						className="flex-1 min-w-[260px] h-9 px-3 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
					/>
					<div className="flex items-center gap-1 flex-wrap">
						<button
							type="button"
							onClick={() => setActiveSource("ALL")}
							className={`text-xs px-2.5 py-1 rounded border ${
								activeSource === "ALL"
									? "bg-foreground text-background border-foreground"
									: "bg-background hover:bg-muted"
							}`}
						>
							All ({counts.ALL ?? 0})
						</button>
						{sources.map((s) => (
							<button
								type="button"
								key={s}
								onClick={() => setActiveSource(s)}
								className={`text-xs px-2.5 py-1 rounded border ${
									activeSource === s
										? "bg-foreground text-background border-foreground"
										: "bg-background hover:bg-muted"
								}`}
								title={SOURCE_LABELS[s] ?? s}
							>
								{s} ({counts[s] ?? 0})
							</button>
						))}
					</div>
				</div>

				{/* Table */}
				<div className="flex-1 overflow-auto">
					<table className="w-full text-sm">
						<thead className="sticky top-0 bg-muted/40 backdrop-blur z-10">
							<tr className="text-xs uppercase tracking-wider text-muted-foreground">
								<th className="text-left px-4 py-2 font-semibold w-16">#</th>
								<th className="text-left px-4 py-2 font-semibold w-24">Code</th>
								<th className="text-left px-4 py-2 font-semibold w-24">
									Source
								</th>
								<th className="text-left px-4 py-2 font-semibold">
									Description
								</th>
							</tr>
						</thead>
						<tbody>
							{filtered.length === 0 ? (
								<tr>
									<td
										colSpan={4}
										className="text-center text-muted-foreground py-12"
									>
										No matching error codes.
									</td>
								</tr>
							) : (
								filtered.map((e) => (
									<tr
										key={`${e.stt}-${e.code}-${e.source}`}
										className="border-b hover:bg-muted/30"
									>
										<td className="px-4 py-2 text-muted-foreground tabular-nums">
											{e.stt}
										</td>
										<td className="px-4 py-2 font-mono font-semibold">
											{e.code}
											{e.subcode ? (
												<span className="ml-1 text-[10px] text-muted-foreground">
													[{e.subcode}]
												</span>
											) : null}
										</td>
										<td className="px-4 py-2">
											<span
												className={`text-[11px] px-2 py-0.5 rounded font-medium ${
													SOURCE_COLORS[e.source] ?? "bg-muted"
												}`}
												title={SOURCE_LABELS[e.source] ?? e.source}
											>
												{e.source}
											</span>
										</td>
										<td className="px-4 py-2 leading-relaxed">
											{e.description}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				<div className="px-4 py-2 border-t text-[11px] text-muted-foreground">
					Showing <strong>{filtered.length}</strong> of {entries.length} codes.
					Source: Tổng Hợp_check_BH.docx (BV Quân Y 354, TT 4210).
				</div>
			</div>
		</DashboardLayout>
	);
};

export default BhxhErrorCodesPage;
