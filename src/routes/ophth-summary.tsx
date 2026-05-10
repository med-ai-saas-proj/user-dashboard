import { useRef, useState } from "react";
import { toast } from "sonner";
import { ApiTopology, TOPOLOGIES } from "@/components/api-topology";
import { DemoEmptyState, DemoPageDescription } from "@/components/demo";
import { RawResponseViewer } from "@/components/raw-response-viewer";
import { Button } from "@/components/shadcn/button";
import { ViewCodeDialog } from "@/components/view-code-dialog";
import { API_ROUTES } from "@/config/api-routes";
import { MarkdownCustom } from "@/features/pg-chat/components/MarkdownCustom";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";

// ---------------- Types mirroring backend OphthSummary schema ----------------

interface OphthEyeFinding {
	field: string;
	current: string;
	last_changed?: string | null;
}

interface OphthRefractionSnapshot {
	sphere?: string | null;
	cylinder?: string | null;
	axis?: string | null;
	measured_at?: string | null;
}

interface OphthEye {
	summary: string;
	findings: OphthEyeFinding[];
	refraction?: OphthRefractionSnapshot | null;
}

interface OphthDiagnosis {
	code: string;
	text: string;
	laterality?: "right" | "left" | "both" | "" | null;
	code_system?: string;
	first_seen?: string | null;
	last_seen?: string | null;
	status: "active" | "resolved";
}

interface OphthMedication {
	name: string;
	ingredient?: string | null;
	strength?: string | null;
	dose_text?: string | null;
	started_at?: string | null;
	last_prescribed_at?: string | null;
	discontinued_at?: string | null;
	status: "active" | "discontinued";
}

type TimelineType =
	| "new_dx"
	| "med_started"
	| "med_stopped"
	| "test_ordered"
	| "test_result"
	| "status_change"
	| "first_visit"
	| "post_op_followup"
	| "stable_summary";

interface OphthTimelineItem {
	date: string;
	encounter_id?: string | null;
	type: TimelineType;
	description: string;
	laterality?: "right" | "left" | "both" | "" | null;
}

interface OphthFollowUp {
	next_due?: string | null;
	pending_tests: string[];
	red_flags: string[];
	notes?: string | null;
}

type ComparisonTrend =
	| "improved"
	| "worsened"
	| "stable"
	| "up"
	| "down"
	| "unknown";

interface OphthComparisonRow {
	// Free-text on purpose — backend used to be a Literal, but the LLM
	// occasionally emits clinically valid metrics outside the canonical
	// list (corneal_health, fundus, anterior_segment, ...). The label is
	// what we render; metric is just a stable key for grouping.
	metric: string;
	label: string;
	laterality?: "right" | "left" | "both" | "" | null;
	baseline?: string | null;
	baseline_date?: string | null;
	latest?: string | null;
	latest_date?: string | null;
	unit?: string | null;
	trend: ComparisonTrend;
	note?: string | null;
}

interface OphthPatient {
	patient_id: string;
	name: string;
	gender: string;
	birth_date?: string | null;
	age_years?: number | null;
	address_summary?: string | null;
	occupation?: string | null;
	ethnicity?: string | null;
	source_system?: string | null;
}

interface OphthOverview {
	headline: string;
	primary_concern: string;
	encounter_count: number;
	span: { first_visit?: string; last_visit?: string };
	narrative_md: string;
}

interface OphthSummary {
	patient: OphthPatient;
	overview: OphthOverview;
	eyes: { right: OphthEye; left: OphthEye };
	diagnoses: { active: OphthDiagnosis[]; resolved: OphthDiagnosis[] };
	medications: {
		active: OphthMedication[];
		discontinued: OphthMedication[];
	};
	comparison?: OphthComparisonRow[];
	timeline: OphthTimelineItem[];
	follow_up: OphthFollowUp;
}

// ---------------- Timeline visual config ----------------

const TIMELINE_TYPE_LABEL: Record<TimelineType, string> = {
	first_visit: "First visit",
	new_dx: "New diagnosis",
	med_started: "Med started",
	med_stopped: "Med stopped",
	test_ordered: "Test ordered",
	test_result: "Test result",
	status_change: "Status change",
	post_op_followup: "Post-op follow-up",
	stable_summary: "Stable interval",
};

const TIMELINE_TYPE_COLOR: Record<TimelineType, string> = {
	first_visit: "bg-slate-500",
	new_dx: "bg-red-500",
	med_started: "bg-emerald-500",
	med_stopped: "bg-amber-500",
	test_ordered: "bg-blue-500",
	test_result: "bg-indigo-500",
	status_change: "bg-rose-500",
	post_op_followup: "bg-purple-500",
	stable_summary: "bg-zinc-400",
};

// ---------------- Sample loader ----------------

const SAMPLE_FILES = [
	"2500037860",
	"2500015395",
	"2200033690",
	"2400038200",
	"2300030718",
	"2100017650",
];

const fmtDate = (iso?: string | null) => {
	if (!iso) return "—";
	try {
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return iso;
		return d.toLocaleDateString("en-GB", {
			year: "numeric",
			month: "short",
			day: "2-digit",
		});
	} catch {
		return iso;
	}
};

const stripBom = (s: string) => s.replace(/^﻿/, "");

// ---------------- Report view (test.html-style single-page layout) ----------------

const TREND_ARROW: Record<ComparisonTrend, string> = {
	improved: "↓",
	worsened: "↑",
	up: "↑",
	down: "↓",
	stable: "→",
	unknown: "—",
};

const TREND_TEXT_COLOR: Record<ComparisonTrend, string> = {
	improved: "text-emerald-600 dark:text-emerald-400",
	worsened: "text-rose-600 dark:text-rose-400",
	up: "text-amber-600 dark:text-amber-400",
	down: "text-amber-600 dark:text-amber-400",
	stable: "text-slate-500",
	unknown: "text-muted-foreground",
};

const lateralityBadge = (
	side?: "right" | "left" | "both" | "" | null
): string => {
	if (side === "right") return "OD";
	if (side === "left") return "OS";
	if (side === "both") return "OU";
	return "";
};

const ReportView = ({ summary }: { summary: OphthSummary }) => {
	const comparison = summary.comparison ?? [];
	const activeMeds = summary.medications.active;
	const redFlags = summary.follow_up.red_flags ?? [];
	const pendingTests = summary.follow_up.pending_tests ?? [];

	// Pull surgical events out of the timeline (post-op + status_change with op keywords)
	const surgicalEvents = summary.timeline.filter(
		(t) =>
			t.type === "post_op_followup" ||
			/phaco|phẫu thuật|mổ|iol|laser/i.test(t.description)
	);

	const handlePrint = () => {
		// Defer one frame so the active tab has finished painting before the
		// print dialog snapshots the DOM.
		requestAnimationFrame(() => window.print());
	};

	return (
		<div data-print-area className="space-y-4 text-[13px] text-foreground">
			{/* Export button (hidden on print) */}
			<div data-print-hide className="flex justify-end -mb-2">
				<Button
					size="sm"
					variant="outline"
					className="h-8 text-xs gap-1.5"
					onClick={handlePrint}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="w-3.5 h-3.5"
						aria-hidden="true"
					>
						<polyline points="6 9 6 2 18 2 18 9" />
						<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
						<rect x="6" y="14" width="12" height="8" />
					</svg>
					Export PDF
				</Button>
			</div>

			{/* Title bar */}
			<div className="flex items-center justify-between border-b-2 border-primary/30 pb-3">
				<div className="text-xs font-extrabold tracking-wide text-teal-600 dark:text-teal-400">
					KHOA MẮT
				</div>
				<div className="text-center flex-1">
					<div className="text-lg font-bold uppercase text-primary tracking-wide">
						Báo cáo tóm tắt bệnh án
					</div>
					<div className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-0.5">
						Chuyên khoa Mắt
					</div>
				</div>
				<div className="w-16 text-right text-[10px] text-muted-foreground">
					{fmtDate(summary.overview.span?.last_visit)}
				</div>
			</div>

			{/* Top grid: Patient + Clinical Summary */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				<section className="rounded-xl border border-primary/20 p-3">
					<div className="flex items-center gap-2 text-primary font-semibold mb-2">
						<span className="inline-flex w-6 h-6 rounded-full bg-primary text-white items-center justify-center text-[11px]">
							1
						</span>
						<span className="text-sm">THÔNG TIN BỆNH NHÂN</span>
					</div>
					<dl className="grid grid-cols-[8.5rem_1fr] gap-y-1.5 text-[12.5px]">
						<dt className="text-muted-foreground">Họ tên:</dt>
						<dd className="font-semibold">{summary.patient.name}</dd>
						<dt className="text-muted-foreground">Tuổi / Giới tính:</dt>
						<dd className="font-semibold">
							{summary.patient.age_years
								? `${summary.patient.age_years} tuổi`
								: "—"}{" "}
							/ {summary.patient.gender || "—"}
						</dd>
						<dt className="text-muted-foreground">Mã BN:</dt>
						<dd className="font-semibold font-mono">
							{summary.patient.patient_id}
						</dd>
						<dt className="text-muted-foreground">Chẩn đoán chính:</dt>
						<dd className="font-semibold">
							{summary.diagnoses.active.length === 0
								? summary.overview.primary_concern || "—"
								: summary.diagnoses.active
										.slice(0, 3)
										.map((d) => d.text)
										.join(", ")}
						</dd>
						<dt className="text-muted-foreground">Nguồn dữ liệu:</dt>
						<dd>{summary.patient.source_system || "—"}</dd>
						{summary.patient.address_summary && (
							<>
								<dt className="text-muted-foreground">Địa chỉ:</dt>
								<dd>{summary.patient.address_summary}</dd>
							</>
						)}
					</dl>
				</section>

				<section className="rounded-xl border border-primary/20 p-3">
					<div className="flex items-center gap-2 text-primary font-semibold mb-2">
						<span className="inline-flex w-6 h-6 rounded-full bg-primary text-white items-center justify-center text-[11px]">
							2
						</span>
						<span className="text-sm">TÓM TẮT LÂM SÀNG</span>
					</div>
					<div className="text-[12.5px] leading-relaxed text-foreground/90">
						<MarkdownCustom content={summary.overview.narrative_md} />
					</div>
					<div className="mt-2 text-[11px] text-muted-foreground">
						{summary.overview.encounter_count} lần khám ·{" "}
						{fmtDate(summary.overview.span?.first_visit)} →{" "}
						{fmtDate(summary.overview.span?.last_visit)}
					</div>
				</section>
			</div>

			{/* Alerts + Timeline */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				<section className="rounded-xl border border-rose-300/40 p-3">
					<div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold mb-2">
						<span className="inline-flex w-6 h-6 rounded-full bg-rose-600 text-white items-center justify-center text-[11px]">
							3
						</span>
						<span className="text-sm">CẢNH BÁO LÂM SÀNG</span>
					</div>
					{redFlags.length === 0 && pendingTests.length === 0 ? (
						<div className="text-[12px] text-muted-foreground italic">
							Không có cảnh báo nổi bật.
						</div>
					) : (
						<ul className="space-y-1.5">
							{redFlags.map((flag, i) => (
								<li
									key={`rf-${i}`}
									className="flex items-center gap-2 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 px-3 py-1.5 text-[12px] font-medium"
								>
									<span className="w-2 h-2 rounded-full bg-rose-600 flex-shrink-0" />
									<span>{flag}</span>
								</li>
							))}
							{pendingTests.map((t, i) => (
								<li
									key={`pt-${i}`}
									className="flex items-center gap-2 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 px-3 py-1.5 text-[12px] font-medium"
								>
									<span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
									<span>Đang chờ: {t}</span>
								</li>
							))}
						</ul>
					)}
				</section>

				<section className="rounded-xl border border-primary/20 p-3">
					<div className="flex items-center gap-2 text-primary font-semibold mb-2">
						<span className="inline-flex w-6 h-6 rounded-full bg-primary text-white items-center justify-center text-[11px]">
							4
						</span>
						<span className="text-sm">DIỄN BIẾN ĐIỀU TRỊ</span>
					</div>
					{summary.timeline.length === 0 ? (
						<div className="text-[12px] text-muted-foreground italic">
							Không có sự kiện điều trị nổi bật.
						</div>
					) : (
						<ol className="relative border-l-2 border-primary/40 ml-2 pl-4 space-y-2.5">
							{summary.timeline.slice(0, 6).map((item, i) => (
								<li key={`tl-${i}`} className="relative">
									<span
										className={`absolute -left-[22px] top-1 w-3 h-3 rounded-full ring-2 ring-background ${TIMELINE_TYPE_COLOR[item.type] ?? "bg-gray-400"}`}
									/>
									<div className="font-semibold text-[12px]">
										{fmtDate(item.date)}
										{item.laterality && (
											<span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
												{lateralityBadge(item.laterality)}
											</span>
										)}
									</div>
									<div className="text-[12px] text-muted-foreground leading-snug">
										{item.description}
									</div>
								</li>
							))}
						</ol>
					)}
				</section>
			</div>

			{/* Comparison table — full width */}
			<section className="rounded-xl border border-primary/20 p-3">
				<div className="flex items-center gap-2 text-primary font-semibold mb-2">
					<span className="inline-flex w-6 h-6 rounded-full bg-primary text-white items-center justify-center text-[11px]">
						5
					</span>
					<span className="text-sm">SO SÁNH CHỈ SỐ QUAN TRỌNG</span>
				</div>
				{comparison.length === 0 ? (
					<div className="text-[12px] text-muted-foreground italic">
						Không đủ dữ liệu so sánh giữa hai thời điểm.
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-[12.5px] border-collapse">
							<thead>
								<tr className="bg-primary text-primary-foreground">
									<th className="px-3 py-2 text-left font-semibold">Chỉ số</th>
									<th className="px-3 py-2 text-center font-semibold">
										Trước / Nền
									</th>
									<th className="px-3 py-2 text-center font-semibold">
										Gần nhất
									</th>
									<th className="px-3 py-2 text-center font-semibold">
										Xu hướng
									</th>
								</tr>
							</thead>
							<tbody>
								{comparison.map((row, i) => (
									<tr
										key={`cmp-${i}`}
										className="border-b border-muted/40 last:border-b-0"
									>
										<td className="px-3 py-2 font-medium">
											{row.label}
											{row.unit && (
												<span className="text-[10px] text-muted-foreground ml-1">
													({row.unit})
												</span>
											)}
										</td>
										<td className="px-3 py-2 text-center">
											<div className="font-mono">{row.baseline ?? "—"}</div>
											{row.baseline_date && (
												<div className="text-[10px] text-muted-foreground">
													{fmtDate(row.baseline_date)}
												</div>
											)}
										</td>
										<td className="px-3 py-2 text-center">
											<div className="font-mono">{row.latest ?? "—"}</div>
											{row.latest_date && (
												<div className="text-[10px] text-muted-foreground">
													{fmtDate(row.latest_date)}
												</div>
											)}
										</td>
										<td
											className={`px-3 py-2 text-center font-semibold ${TREND_TEXT_COLOR[row.trend] ?? "text-muted-foreground"}`}
										>
											<span className="mr-1">
												{TREND_ARROW[row.trend] ?? "—"}
											</span>
											{row.note ?? row.trend ?? ""}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>

			{/* Surgery + Meds split */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				<section className="rounded-xl border border-primary/20 p-3">
					<div className="flex items-center gap-2 text-primary font-semibold mb-2">
						<span className="inline-flex w-6 h-6 rounded-full bg-primary text-white items-center justify-center text-[11px]">
							6
						</span>
						<span className="text-sm">PHẪU THUẬT / THỦ THUẬT</span>
					</div>
					{surgicalEvents.length === 0 ? (
						<div className="text-[12px] text-muted-foreground italic">
							Không ghi nhận phẫu thuật trong hồ sơ.
						</div>
					) : (
						<ul className="space-y-1.5 text-[12.5px]">
							{surgicalEvents.map((e, i) => (
								<li key={`sx-${i}`}>
									<span className="font-semibold">{fmtDate(e.date)}</span>
									{e.laterality && (
										<span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
											{lateralityBadge(e.laterality)}
										</span>
									)}
									<div className="text-[12px] text-muted-foreground leading-snug">
										{e.description}
									</div>
								</li>
							))}
						</ul>
					)}
				</section>

				<section className="rounded-xl border border-primary/20 p-3">
					<div className="flex items-center gap-2 text-primary font-semibold mb-2">
						<span className="inline-flex w-6 h-6 rounded-full bg-primary text-white items-center justify-center text-[11px]">
							💊
						</span>
						<span className="text-sm">THUỐC ĐANG DÙNG</span>
					</div>
					{activeMeds.length === 0 ? (
						<div className="text-[12px] text-muted-foreground italic">
							Không có thuốc đang sử dụng.
						</div>
					) : (
						<ul className="space-y-1.5 text-[12.5px]">
							{activeMeds.map((m, i) => (
								<li key={`med-${i}`}>
									<div className="font-semibold">{m.name}</div>
									<div className="text-[11px] text-muted-foreground">
										{[m.ingredient, m.strength].filter(Boolean).join(" · ")}
									</div>
									{m.dose_text && (
										<div className="text-[12px]">{m.dose_text}</div>
									)}
								</li>
							))}
						</ul>
					)}
				</section>
			</div>

			{/* Conclusion / footer note */}
			<section className="rounded-xl bg-primary/5 border border-primary/20 p-3 text-[12.5px] leading-relaxed">
				<div className="font-bold text-primary mb-1">7. NHẬN ĐỊNH</div>
				<div>
					{summary.follow_up.notes ||
						summary.overview.primary_concern ||
						summary.overview.headline}
				</div>
				{summary.follow_up.next_due && (
					<div className="mt-1.5 text-[12px]">
						<span className="font-semibold">Hẹn tái khám:</span>{" "}
						{fmtDate(summary.follow_up.next_due)}
					</div>
				)}
			</section>

			{/* Bottom bar */}
			<div className="flex justify-between items-center text-[11px] text-muted-foreground border-t pt-2">
				<span>🛡 Chăm sóc đôi mắt — Nâng tầm cuộc sống</span>
				<span>
					📅 Ngày báo cáo: {fmtDate(summary.overview.span?.last_visit)}
				</span>
			</div>
		</div>
	);
};

const OphthSummaryPage = () => {
	const [rawJson, setRawJson] = useState<string>("");
	const [parsedPreview, setParsedPreview] = useState<{
		patientName: string;
		patientId: string;
		gender: string;
		birthDate?: string;
		encounterCount: number;
		sourceSystem: string;
	} | null>(null);
	const [parseError, setParseError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [summary, setSummary] = useState<OphthSummary | null>(null);
	const [activeTab, setActiveTab] = useState<
		"report" | "timeline" | "eyes" | "diagnoses" | "medications" | "json"
	>("report");
	const [conversionTime, setConversionTime] = useState<number | null>(null);
	const [rawResponse, setRawResponse] = useState<unknown>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const updatePreview = (text: string) => {
		setRawJson(text);
		setParseError(null);
		const cleaned = stripBom(text).trim();
		if (!cleaned) {
			setParsedPreview(null);
			return;
		}
		try {
			const parsed = JSON.parse(cleaned);
			const patient = parsed?.patient ?? {};
			const exportMetadata = parsed?.exportMetadata ?? {};
			const encounters = Array.isArray(patient?.encounters)
				? patient.encounters
				: [];
			setParsedPreview({
				patientName: patient?.name?.Full ?? "—",
				patientId: patient?.patientId ?? "—",
				gender: patient?.gender ?? "—",
				birthDate: patient?.birthDate
					? String(patient.birthDate).slice(0, 10)
					: undefined,
				encounterCount: encounters.length,
				sourceSystem: exportMetadata?.sourceSystem ?? "—",
			});
		} catch (e) {
			setParsedPreview(null);
			setParseError(e instanceof Error ? e.message : "Could not parse JSON");
		}
	};

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => updatePreview(reader.result as string);
		reader.readAsText(file);
		e.target.value = "";
	};

	const loadSample = async (id: string) => {
		try {
			const resp = await fetch(`/sample-data/ophth/${id}.json`);
			if (resp.ok) {
				updatePreview(await resp.text());
				toast.success(`Loaded sample ${id}`);
				return;
			}
		} catch {
			/* not bundled — fall back to inline tiny sample */
		}
		// Fallback minimal sample so devs can try it without bundling files
		updatePreview(
			JSON.stringify(
				{
					exportMetadata: {
						exportDate: new Date().toISOString(),
						sourceSystem: "Bệnh viện Mắt Hà Nội cơ sở 2",
						sourceSystemId: "BV_MATTASKO",
					},
					patient: {
						patientId: id,
						name: { Full: "DEMO PATIENT" },
						gender: "Nam",
						birthDate: "1980-01-01T00:00:00",
						encounters: [
							{
								encounterId: "DEMO_ENC_1",
								class: "outpatient",
								department: "Khoa Khám Bệnh",
								period: { start: "2025-01-01T00:00:00", end: "" },
								practitioner: { practitionerId: "BS_DEMO", name: "BS Demo" },
								reasonForVisit: "Khám lâm sàng chung",
								diagnoses: [
									{
										code: "H40.8",
										text: "Nhãn áp không điều chỉnh với thuốc",
										laterality: "left",
										codeSystem: "ICD-10",
									},
								],
								medicationRequests: [
									{
										medication: {
											code: "T0031",
											name: "Tafluprost (Taflotan)",
											ingredient: "Tafluprost",
											strength: "0,0015%",
										},
										dosageInstruction: {
											text: "Tra mắt trái 1 lần/ngày",
										},
									},
								],
							},
						],
					},
				},
				null,
				2
			)
		);
		toast.info(
			`Sample ${id} not bundled — loaded a tiny inline example. Upload the real file for a richer result.`
		);
	};

	const handleSummarize = async () => {
		const cleaned = stripBom(rawJson).trim();
		if (!cleaned) {
			toast.error("Upload or paste an ophthalmology EHR JSON first.");
			return;
		}
		let parsed: unknown;
		try {
			parsed = JSON.parse(cleaned);
		} catch (e) {
			toast.error(
				e instanceof Error ? `JSON error: ${e.message}` : "Invalid JSON"
			);
			return;
		}
		if (
			!parsed ||
			typeof parsed !== "object" ||
			!(parsed as { patient?: unknown }).patient
		) {
			toast.error("JSON must contain a top-level `patient` field.");
			return;
		}

		setIsLoading(true);
		setSummary(null);
		setRawResponse(null);
		setConversionTime(null);
		const t0 = performance.now();

		try {
			const headers = await getAuthHeaders(API_ROUTES.SERVICES.OPHTH_SUMMARIZE);
			const resp = await fetch(API_ROUTES.SERVICES.OPHTH_SUMMARIZE, {
				method: "POST",
				headers,
				body: JSON.stringify({
					ehr_json: parsed,
					model: "qwen-cluster",
					stream: false,
				}),
			});
			if (!resp.ok) {
				const text = await resp.text();
				throw new Error(`HTTP ${resp.status}: ${text.slice(0, 400)}`);
			}
			const data = (await resp.json()) as OphthSummary;
			setSummary(data);
			setRawResponse(data);
			const elapsed = Math.round(performance.now() - t0);
			setConversionTime(elapsed);
			toast.success(`Summary generated in ${elapsed}ms`);
		} catch (err) {
			const raw = err instanceof Error ? err.message : "Request failed";
			let friendly = raw;
			if (/^HTTP 5\d{2}/.test(raw) || raw.includes("<html>")) {
				const code = raw.match(/HTTP (\d{3})/)?.[1] ?? "5xx";
				friendly = `Upstream temporarily unavailable (HTTP ${code}). Please retry shortly.`;
			}
			toast.error(friendly);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<DashboardLayout pageTitle="Ophthalmology Summary">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				<DemoPageDescription>
					Longitudinal ophthalmology summarizer for the BV Mắt Hà Nội export
					shape. Returns structured JSON: per-eye snapshot, dedup'd meds /
					diagnoses, condensed timeline, and follow-up plan with red flags.
				</DemoPageDescription>
				<div className="px-6 pb-2 -mt-2 text-[11px] text-muted-foreground">
					Pipeline: upload patient JSON → preprocess (sort + prune) →
					ophthalmology agent (Azure OpenAI) → structured `OphthSummary`.
				</div>
				<div className="flex-1 flex flex-col lg:grid lg:grid-cols-2 overflow-hidden">
					{/* Left: Input */}
					<div className="border-b lg:border-b-0 lg:border-r flex flex-col overflow-hidden min-h-0 lg:min-h-full">
						<div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30 gap-2 flex-wrap">
							<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
								Patient JSON
							</h2>
							<div className="flex items-center gap-1.5 flex-wrap">
								<Button
									variant="ghost"
									size="sm"
									className="h-7 text-xs"
									onClick={() => fileInputRef.current?.click()}
								>
									Upload .json
								</Button>
								{rawJson && (
									<Button
										variant="ghost"
										size="sm"
										className="h-7 text-xs text-destructive hover:text-destructive"
										onClick={() => {
											setRawJson("");
											setParsedPreview(null);
											setParseError(null);
										}}
									>
										Clear
									</Button>
								)}
							</div>
							<input
								ref={fileInputRef}
								type="file"
								accept=".json,.txt"
								className="hidden"
								onChange={handleFileUpload}
							/>
						</div>

						{!rawJson && (
							<div className="px-4 py-3 border-b bg-muted/10">
								<div className="text-[11px] font-semibold text-muted-foreground mb-2">
									Quick samples (BV Mắt Hà Nội export)
								</div>
								<div className="flex flex-wrap gap-1.5">
									{SAMPLE_FILES.map((id) => (
										<button
											key={id}
											type="button"
											onClick={() => loadSample(id)}
											className="px-2.5 py-1 text-[11px] font-medium rounded-md border bg-background hover:bg-muted transition-colors"
										>
											{id}.json
										</button>
									))}
								</div>
								<div className="text-[10px] text-muted-foreground mt-2">
									Or upload your own — accepts the BV Mắt Hà Nội export verbatim
									(UTF-8 BOM tolerated).
								</div>
							</div>
						)}

						{parsedPreview && (
							<div className="px-4 py-2 border-b bg-emerald-50/40 dark:bg-emerald-950/10 text-[12px]">
								<div className="font-semibold text-emerald-900 dark:text-emerald-200">
									{parsedPreview.patientName}{" "}
									<span className="font-normal text-muted-foreground">
										· {parsedPreview.patientId}
									</span>
								</div>
								<div className="text-muted-foreground">
									{parsedPreview.gender}
									{parsedPreview.birthDate && ` · ${parsedPreview.birthDate}`} ·{" "}
									{parsedPreview.encounterCount} visit
									{parsedPreview.encounterCount === 1 ? "" : "s"} ·{" "}
									{parsedPreview.sourceSystem}
								</div>
							</div>
						)}
						{parseError && (
							<div className="px-4 py-2 border-b bg-destructive/5 text-[12px] text-destructive">
								JSON error: {parseError}
							</div>
						)}

						<textarea
							value={rawJson}
							onChange={(e) => updatePreview(e.target.value)}
							placeholder='Paste ophthalmology EHR JSON here... e.g. {"exportMetadata":{...},"patient":{...}}'
							className="flex-1 p-4 font-mono text-[12px] leading-relaxed bg-transparent focus:outline-none resize-none"
							spellCheck={false}
						/>

						<div className="flex items-center justify-between px-4 py-2.5 border-t bg-muted/30 gap-2 flex-wrap">
							<span className="text-[11px] text-muted-foreground/60 hidden sm:inline">
								JSON → preprocess → ophthalmology summarizer
							</span>
							<Button
								size="sm"
								className="h-8 text-xs ml-auto"
								onClick={handleSummarize}
								disabled={!rawJson.trim() || isLoading || !!parseError}
							>
								{isLoading ? (
									<span className="flex items-center gap-1.5">
										<span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
										Summarizing…
									</span>
								) : (
									"Summarize"
								)}
							</Button>
						</div>
					</div>

					{/* Right: Output */}
					<div className="flex flex-col overflow-hidden min-h-0 lg:min-h-full">
						<div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
							<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
								Summary
								{conversionTime != null && (
									<span className="ml-2 text-[11px] font-normal normal-case tracking-normal">
										({conversionTime}ms)
									</span>
								)}
							</h2>
							<ViewCodeDialog
								endpoint={API_ROUTES.SERVICES.OPHTH_SUMMARIZE}
								method="POST"
								body={{
									ehr_json: {
										exportMetadata: {
											sourceSystem: "Bệnh viện Mắt Hà Nội cơ sở 2",
										},
										patient: {
											patientId: "2500037860",
											name: { Full: "ĐỖ VĂN KHANG" },
											gender: "Nam",
											birthDate: "1986-06-18T00:00:00",
											encounters: [],
										},
									},
									model: "qwen-cluster",
									stream: false,
								}}
								description="Generate structured ophthalmology summary"
							/>
						</div>

						{summary ? (
							<>
								{/* Patient header card */}
								<div className="px-4 py-3 border-b bg-gradient-to-br from-primary/5 to-transparent">
									<div className="flex items-baseline gap-3 flex-wrap">
										<div className="text-base font-semibold">
											{summary.patient.name}
										</div>
										<div className="text-xs text-muted-foreground">
											{summary.patient.gender}
											{summary.patient.age_years
												? ` · ${summary.patient.age_years}T`
												: ""}
											{` · MRN ${summary.patient.patient_id}`}
										</div>
									</div>
									<div className="text-[13px] text-foreground/80 mt-1.5">
										{summary.overview.headline}
									</div>
									<div className="text-[11px] text-muted-foreground mt-1">
										{summary.overview.encounter_count} visit(s) ·{" "}
										{fmtDate(summary.overview.span?.first_visit)} →{" "}
										{fmtDate(summary.overview.span?.last_visit)}
										{summary.patient.source_system &&
											` · ${summary.patient.source_system}`}
									</div>
								</div>

								<div className="flex gap-0 border-b px-4 overflow-x-auto">
									{(
										[
											"report",
											"timeline",
											"eyes",
											"diagnoses",
											"medications",
											"json",
										] as const
									).map((tab) => (
										<button
											key={tab}
											type="button"
											onClick={() => setActiveTab(tab)}
											className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
										>
											{tab === "report" && "Report"}
											{tab === "timeline" && "Timeline"}
											{tab === "eyes" && "Eyes"}
											{tab === "diagnoses" && "Diagnoses"}
											{tab === "medications" && "Medications"}
											{tab === "json" && "Raw JSON"}
										</button>
									))}
								</div>

								<div className="flex-1 overflow-auto p-4">
									{/* Report — single-page printable view (matches test.html design) */}
									{activeTab === "report" && <ReportView summary={summary} />}

									{/* Timeline */}
									{activeTab === "timeline" && (
										<div className="space-y-4">
											<div className="rounded-lg border bg-muted/20 p-3 text-[13px]">
												<MarkdownCustom
													content={summary.overview.narrative_md}
												/>
											</div>
											{summary.timeline.length === 0 ? (
												<div className="text-sm text-muted-foreground italic">
													No notable events on the timeline.
												</div>
											) : (
												<ol className="relative border-l-2 border-muted pl-6 space-y-4">
													{summary.timeline.map((item, i) => (
														<li key={`${item.date}-${i}`} className="relative">
															<span
																className={`absolute -left-[34px] top-1 w-4 h-4 rounded-full ring-4 ring-background ${TIMELINE_TYPE_COLOR[item.type] ?? "bg-gray-400"}`}
															/>
															<div className="flex items-baseline gap-2 flex-wrap">
																<span className="text-xs font-semibold text-foreground">
																	{fmtDate(item.date)}
																</span>
																<span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
																	{TIMELINE_TYPE_LABEL[item.type] ?? item.type}
																</span>
																{item.laterality && (
																	<span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
																		{item.laterality === "right" && "OD"}
																		{item.laterality === "left" && "OS"}
																		{item.laterality === "both" && "OU"}
																	</span>
																)}
															</div>
															<div className="text-[13px] mt-0.5">
																{item.description}
															</div>
															{item.encounter_id && (
																<div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
																	{item.encounter_id}
																</div>
															)}
														</li>
													))}
												</ol>
											)}
										</div>
									)}

									{/* Eyes side-by-side */}
									{activeTab === "eyes" && (
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											{(["right", "left"] as const).map((side) => {
												const eye = summary.eyes[side];
												return (
													<div
														key={side}
														className="rounded-lg border bg-card p-3"
													>
														<div className="flex items-center gap-2 mb-2">
															<div className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
																{side === "right"
																	? "Right Eye (OD)"
																	: "Left Eye (OS)"}
															</div>
														</div>
														<div className="text-[13px] mb-3 leading-relaxed">
															{eye.summary}
														</div>
														{eye.refraction && (
															<div className="rounded-md bg-muted/40 px-2 py-1.5 mb-3 text-[11px] grid grid-cols-3 gap-2">
																<div>
																	<div className="text-muted-foreground">
																		Sphere
																	</div>
																	<div className="font-mono">
																		{eye.refraction.sphere ?? "—"}
																	</div>
																</div>
																<div>
																	<div className="text-muted-foreground">
																		Cylinder
																	</div>
																	<div className="font-mono">
																		{eye.refraction.cylinder ?? "—"}
																	</div>
																</div>
																<div>
																	<div className="text-muted-foreground">
																		Axis
																	</div>
																	<div className="font-mono">
																		{eye.refraction.axis ?? "—"}
																	</div>
																</div>
															</div>
														)}
														{eye.findings.length === 0 ? (
															<div className="text-[12px] text-muted-foreground italic">
																No abnormal findings.
															</div>
														) : (
															<dl className="space-y-1.5 text-[12px]">
																{eye.findings.map((f) => (
																	<div
																		key={`${side}-${f.field}`}
																		className="grid grid-cols-[8rem_1fr] gap-2 border-b border-muted/40 pb-1.5"
																	>
																		<dt className="text-muted-foreground capitalize">
																			{f.field}
																		</dt>
																		<dd>
																			{f.current}
																			{f.last_changed && (
																				<span className="ml-1 text-[10px] text-muted-foreground">
																					(updated {fmtDate(f.last_changed)})
																				</span>
																			)}
																		</dd>
																	</div>
																))}
															</dl>
														)}
													</div>
												);
											})}
										</div>
									)}

									{/* Diagnoses */}
									{activeTab === "diagnoses" && (
										<div className="space-y-4">
											{(["active", "resolved"] as const).map((status) => {
												const list = summary.diagnoses[status];
												return (
													<div key={status}>
														<div className="text-[11px] uppercase font-semibold tracking-wider text-muted-foreground mb-2">
															{status === "active" ? "Active" : "Resolved"} (
															{list.length})
														</div>
														{list.length === 0 ? (
															<div className="text-[12px] text-muted-foreground italic">
																None
															</div>
														) : (
															<ul className="space-y-1.5">
																{list.map((d, i) => (
																	<li
																		key={`${d.code}-${d.laterality}-${i}`}
																		className="rounded-md border bg-card px-3 py-2 text-[13px]"
																	>
																		<div className="flex items-baseline gap-2 flex-wrap">
																			<span className="font-mono text-[12px] font-semibold">
																				{d.code || "—"}
																			</span>
																			<span>{d.text}</span>
																			{d.laterality && (
																				<span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
																					{d.laterality === "right" && "OD"}
																					{d.laterality === "left" && "OS"}
																					{d.laterality === "both" && "OU"}
																				</span>
																			)}
																		</div>
																		{(d.first_seen || d.last_seen) && (
																			<div className="text-[10px] text-muted-foreground mt-0.5">
																				{d.first_seen &&
																					`since ${fmtDate(d.first_seen)}`}
																				{d.first_seen && d.last_seen && " · "}
																				{d.last_seen &&
																					`last ${fmtDate(d.last_seen)}`}
																			</div>
																		)}
																	</li>
																))}
															</ul>
														)}
													</div>
												);
											})}
										</div>
									)}

									{/* Medications */}
									{activeTab === "medications" && (
										<div className="space-y-4">
											{(["active", "discontinued"] as const).map((status) => {
												const list = summary.medications[status];
												return (
													<div key={status}>
														<div className="text-[11px] uppercase font-semibold tracking-wider text-muted-foreground mb-2">
															{status === "active" ? "Active" : "Discontinued"}{" "}
															({list.length})
														</div>
														{list.length === 0 ? (
															<div className="text-[12px] text-muted-foreground italic">
																None
															</div>
														) : (
															<ul className="space-y-2">
																{list.map((m, i) => (
																	<li
																		key={`${m.name}-${i}`}
																		className="rounded-md border bg-card px-3 py-2 text-[13px]"
																	>
																		<div className="font-semibold">
																			{m.name}
																		</div>
																		<div className="text-[11px] text-muted-foreground">
																			{[m.ingredient, m.strength]
																				.filter(Boolean)
																				.join(" · ")}
																		</div>
																		{m.dose_text && (
																			<div className="text-[12px] mt-1">
																				{m.dose_text}
																			</div>
																		)}
																		{(m.started_at ||
																			m.last_prescribed_at ||
																			m.discontinued_at) && (
																			<div className="text-[10px] text-muted-foreground mt-1">
																				{m.started_at &&
																					`started ${fmtDate(m.started_at)}`}
																				{m.started_at &&
																					m.last_prescribed_at &&
																					" · "}
																				{m.last_prescribed_at &&
																					`last ${fmtDate(m.last_prescribed_at)}`}
																				{m.discontinued_at &&
																					` · stopped ${fmtDate(m.discontinued_at)}`}
																			</div>
																		)}
																	</li>
																))}
															</ul>
														)}
													</div>
												);
											})}

											{/* Follow-up box */}
											{(summary.follow_up.next_due ||
												summary.follow_up.pending_tests.length > 0 ||
												summary.follow_up.red_flags.length > 0 ||
												summary.follow_up.notes) && (
												<div className="mt-6 rounded-lg border-2 border-amber-300/50 bg-amber-50/40 dark:bg-amber-950/10 p-3 text-[13px]">
													<div className="text-[11px] uppercase font-semibold tracking-wider text-amber-700 dark:text-amber-300 mb-2">
														Follow-up
													</div>
													{summary.follow_up.next_due && (
														<div>
															<span className="font-semibold">Next visit:</span>{" "}
															{fmtDate(summary.follow_up.next_due)}
														</div>
													)}
													{summary.follow_up.pending_tests.length > 0 && (
														<div className="mt-1">
															<div className="font-semibold">
																Pending tests:
															</div>
															<ul className="list-disc list-inside text-[12px]">
																{summary.follow_up.pending_tests.map((t, i) => (
																	<li key={i}>{t}</li>
																))}
															</ul>
														</div>
													)}
													{summary.follow_up.red_flags.length > 0 && (
														<div className="mt-2">
															<div className="font-semibold text-red-700 dark:text-red-300">
																Red flags:
															</div>
															<ul className="list-disc list-inside text-[12px]">
																{summary.follow_up.red_flags.map((f, i) => (
																	<li key={i}>{f}</li>
																))}
															</ul>
														</div>
													)}
													{summary.follow_up.notes && (
														<div className="mt-2 text-[12px]">
															{summary.follow_up.notes}
														</div>
													)}
												</div>
											)}
										</div>
									)}

									{/* Raw JSON */}
									{activeTab === "json" && rawResponse !== null && (
										<RawResponseViewer data={rawResponse} />
									)}
								</div>

								<div className="flex justify-end gap-2 px-4 py-2.5 border-t bg-muted/30">
									<Button
										variant="outline"
										size="sm"
										className="h-7 text-xs"
										onClick={() =>
											navigator.clipboard.writeText(
												JSON.stringify(summary, null, 2)
											)
										}
									>
										Copy JSON
									</Button>
									<Button
										variant="outline"
										size="sm"
										className="h-7 text-xs"
										onClick={() => {
											const blob = new Blob(
												[JSON.stringify(summary, null, 2)],
												{ type: "application/json" }
											);
											const a = document.createElement("a");
											a.href = URL.createObjectURL(blob);
											a.download = `ophth-summary-${summary.patient.patient_id}.json`;
											a.click();
										}}
									>
										Download
									</Button>
								</div>
							</>
						) : (
							<DemoEmptyState
								description={
									<>
										Upload or paste an ophthalmology EHR JSON, then click{" "}
										<strong>Summarize</strong> to see a structured per-eye
										snapshot, timeline, meds, and diagnoses.
									</>
								}
								hint="Pipeline: JSON → sort encounters → ophthalmology agent → OphthSummary JSON"
							/>
						)}
					</div>
				</div>
			</div>

			<div className="px-4 py-2 border-t">
				<ApiTopology {...TOPOLOGIES.ophth_summary} />
			</div>
		</DashboardLayout>
	);
};

export default OphthSummaryPage;
