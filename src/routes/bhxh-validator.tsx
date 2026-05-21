import { ExternalLinkIcon, PackageIcon, ShieldCheckIcon } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ApiTopology, TOPOLOGIES } from "@/components/api-topology";
import {
	DemoEmptyState,
	DemoPageDescription,
	DemoPageShell,
	DemoSplitLayout,
	DemoToolbar,
} from "@/components/demo";
import { RawResponseViewer } from "@/components/raw-response-viewer";
import { Button } from "@/components/shadcn/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/shadcn/tooltip";
import { ViewCodeDialog } from "@/components/view-code-dialog";
import { API_ROUTES } from "@/config/api-routes";
import errorCodeReference from "@/features/bhxh-validator/data/error-codes.json";
import { decodeBhxhEnvelopeToReadable } from "@/features/pg-ehr-converter/services/bhxh-envelope";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";

type ValidatorMode = "single" | "bundle";

interface ValidationIssue {
	field?: string;
	message: string;
	severity: "error" | "warning" | "info";
	code?: string;
	value?: string | null;
	file_type?: string | null;
}

interface ValidateResponse {
	valid: boolean;
	error_count: number;
	warning_count: number;
	issues: ValidationIssue[];
	parsed_data?: Record<string, unknown>;
	summary?: string;
}

interface BundleRecord {
	ma_lk: string;
	file_types: string[];
	issue_count: number;
	error_count: number;
	warning_count: number;
	issues: ValidationIssue[];
}

interface BundleValidateResponse {
	valid: boolean;
	total_records: number;
	valid_records: number;
	invalid_records: number;
	total_errors: number;
	total_warnings: number;
	records: BundleRecord[];
	summary_by_xml_type: Record<string, { records: number; errors: number }>;
}

const SINGLE_MAX_BYTES = 20 * 1024 * 1024;
const BUNDLE_MAX_BYTES = 50 * 1024 * 1024;

// Real-world TONG_HOP record adapted from a hospital BHXH 4210 submission.
// Several fields are intentionally empty (LY_DO_VNT, MA_LY_DO_VNT, etc.) so
// the validator surfaces concrete Mã lỗi diagnostics from the official rule
// catalog (e.g. 40, 2018, 2019).
const BHXH_4210_EXAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<TONG_HOP>
  <MA_LK>2012230010</MA_LK>
  <STT>2001</STT>
  <MA_BN>BN20040558</MA_BN>
  <HO_TEN><![CDATA[LY THIEN PHU]]></HO_TEN>
  <SO_CCCD />
  <NGAY_SINH>201803040000</NGAY_SINH>
  <GIOI_TINH>1</GIOI_TINH>
  <MA_QUOCTICH>000</MA_QUOCTICH>
  <MA_DANTOC>04</MA_DANTOC>
  <MA_NGHE_NGHIEP>21310</MA_NGHE_NGHIEP>
  <DIA_CHI><![CDATA[Nam Quan, TT Đồng Đăng, Cao Lộc, Lạng Sơn]]></DIA_CHI>
  <MATINH_CU_TRU>20</MATINH_CU_TRU>
  <MAHUYEN_CU_TRU>183</MAHUYEN_CU_TRU>
  <MAXA_CU_TRU>06184</MAXA_CU_TRU>
  <MA_THE_BHYT>TE1202020893987</MA_THE_BHYT>
  <MA_DKBD>20253</MA_DKBD>
  <GT_THE_TU>20180304</GT_THE_TU>
  <GT_THE_DEN>20240930</GT_THE_DEN>
  <LY_DO_VV><![CDATA[ho, sốt]]></LY_DO_VV>
  <LY_DO_VNT><![CDATA[]]></LY_DO_VNT>
  <MA_LY_DO_VNT />
  <CHAN_DOAN_VAO><![CDATA[Theo dõi viêm họng VA cấp]]></CHAN_DOAN_VAO>
  <CHAN_DOAN_RV><![CDATA[Viêm họng VA cấp]]></CHAN_DOAN_RV>
  <MA_BENH_CHINH>J03</MA_BENH_CHINH>
  <MA_BENH_KT>J30</MA_BENH_KT>
  <MA_DOITUONG_KCB>1.2</MA_DOITUONG_KCB>
  <MA_TAI_NAN>0</MA_TAI_NAN>
  <NGAY_VAO>202012230842</NGAY_VAO>
  <NGAY_RA>202012230919</NGAY_RA>
  <SO_NGAY_DTRI>0</SO_NGAY_DTRI>
  <KET_QUA_DTRI>1</KET_QUA_DTRI>
  <MA_LOAI_RV>1</MA_LOAI_RV>
  <NGAY_TTOAN>202012230934</NGAY_TTOAN>
  <T_THUOC>0</T_THUOC>
  <T_VTYT>0</T_VTYT>
  <T_TONGCHI_BV>237300</T_TONGCHI_BV>
  <T_TONGCHI_BH>237300</T_TONGCHI_BH>
  <T_BNTT>0</T_BNTT>
  <T_BNCCT>0</T_BNCCT>
  <T_BHTT>237300</T_BHTT>
  <T_NGUONKHAC>0</T_NGUONKHAC>
  <NAM_QT>2020</NAM_QT>
  <THANG_QT>12</THANG_QT>
  <MA_LOAI_KCB>01</MA_LOAI_KCB>
  <MA_KHOA>K01</MA_KHOA>
  <MA_CSKCB>20288</MA_CSKCB>
  <MA_HSBA>2012230010</MA_HSBA>
  <MA_TTDV>1596010454</MA_TTDV>
</TONG_HOP>`;

// All 14 XML types defined by TT 4210. XML12 is reserved/unused in the
// catalogue. Colours come from existing token-friendly Tailwind palettes;
// each must remain visually distinct in light + dark mode.
const XML_LEGEND: { code: string; label: string; color: string }[] = [
	{ code: "XML1", label: "Patient summary (TONG_HOP)", color: "bg-blue-500" },
	{
		code: "XML2",
		label: "Medications (CHI_TIET_THUOC)",
		color: "bg-purple-500",
	},
	{ code: "XML3", label: "Services (CHI_TIET_DVKT)", color: "bg-amber-500" },
	{
		code: "XML4",
		label: "Lab results (CHI_TIET_CLS)",
		color: "bg-emerald-500",
	},
	{
		code: "XML5",
		label: "Progress notes (CHI_TIET_DIEN_BIEN)",
		color: "bg-rose-500",
	},
	{ code: "XML6", label: "Hospital fee summary", color: "bg-cyan-500" },
	{ code: "XML7", label: "Discharge summary", color: "bg-indigo-500" },
	{ code: "XML8", label: "Anesthesia / surgery", color: "bg-fuchsia-500" },
	{ code: "XML9", label: "Mother / newborn", color: "bg-pink-500" },
	{ code: "XML10", label: "Care plan / nursing", color: "bg-teal-500" },
	{ code: "XML11", label: "Drug response monitoring", color: "bg-orange-500" },
	{ code: "XML13", label: "Catastrophic / VIP cases", color: "bg-lime-500" },
	{ code: "XML14", label: "Antibiotic stewardship", color: "bg-sky-500" },
	{ code: "XML15", label: "Imaging / radiology", color: "bg-violet-500" },
];

interface ErrorCodeReferenceEntry {
	stt: number;
	code: string;
	source: string;
	description: string;
	subcode?: string;
}

// Build the code -> entry lookup once at module load. The reference file ships
// 745 entries; rebuilding this on every issue render would be wasteful.
const ERROR_CODE_LOOKUP: Map<string, ErrorCodeReferenceEntry> = (() => {
	const map = new Map<string, ErrorCodeReferenceEntry>();
	for (const e of errorCodeReference as ErrorCodeReferenceEntry[]) {
		// First entry wins if the same code appears more than once across XMLs.
		if (!map.has(e.code)) map.set(e.code, e);
	}
	return map;
})();

// Pydantic / framework-generated codes that won't be in the BHXH reference.
const isSchemaValidationCode = (code: string): boolean =>
	code.startsWith("PYDANTIC_") || code === "SCHEMA_VALIDATION";

interface ErrorCodeChipProps {
	code: string;
	subcode?: string | null;
	size?: "sm" | "md";
}

/**
 * Renders an error code as either a tooltip-backed link to the reference
 * page (when the code exists in the BHXH catalogue) or as plain text
 * (Pydantic / schema-only codes that have no canonical row to link to).
 */
const ErrorCodeChip = ({ code, subcode, size = "md" }: ErrorCodeChipProps) => {
	const entry = ERROR_CODE_LOOKUP.get(code);
	const baseFont = size === "sm" ? "text-[10px]" : "text-xs";
	const padding = size === "sm" ? "px-1.5 py-px" : "px-2 py-0.5";
	const iconSize = size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3";
	const subcodeMarkup = subcode ? (
		<span className="ml-1 text-[10px] text-muted-foreground/80">
			[{subcode}]
		</span>
	) : null;

	if (!entry) {
		// Pydantic / schema codes: render as plain text with a generic tooltip
		// so users still get context, but no broken link.
		const tooltipText = isSchemaValidationCode(code)
			? "Schema validation (no BHXH catalogue entry)"
			: "No reference entry for this code";
		return (
			<TooltipProvider delayDuration={150}>
				<Tooltip>
					<TooltipTrigger asChild>
						<span
							className={`font-mono ${baseFont} ${padding} rounded border border-dashed border-muted-foreground/30 text-muted-foreground bg-muted/30 cursor-help`}
						>
							{code}
							{subcodeMarkup}
						</span>
					</TooltipTrigger>
					<TooltipContent className="max-w-xs">
						<p className="text-xs">{tooltipText}</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	return (
		<TooltipProvider delayDuration={150}>
			<Tooltip>
				<TooltipTrigger asChild>
					<Link
						to={`/bhxh-error-codes#code-${encodeURIComponent(code)}`}
						className={`font-mono ${baseFont} ${padding} rounded border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary inline-flex items-center gap-1 transition-colors no-underline`}
					>
						<span className="font-semibold">{code}</span>
						{subcodeMarkup}
						<ExternalLinkIcon className={iconSize} aria-hidden="true" />
					</Link>
				</TooltipTrigger>
				<TooltipContent className="max-w-sm">
					<div className="space-y-1">
						<p className="text-xs font-semibold">
							[{code}] · {entry.source}
						</p>
						<p className="text-xs leading-relaxed">{entry.description}</p>
						<p className="text-[10px] opacity-80">
							Click to open the official reference entry
						</p>
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};

const xmlChipClasses = (code?: string | null): string => {
	switch (code) {
		case "XML1":
			return "bg-blue-500/15 text-blue-700 dark:text-blue-300";
		case "XML2":
			return "bg-purple-500/15 text-purple-700 dark:text-purple-300";
		case "XML3":
			return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
		case "XML4":
			return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
		case "XML5":
			return "bg-rose-500/15 text-rose-700 dark:text-rose-300";
		case "XML6":
			return "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300";
		case "XML7":
			return "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300";
		case "XML8":
			return "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300";
		case "XML9":
			return "bg-pink-500/15 text-pink-700 dark:text-pink-300";
		case "XML10":
			return "bg-teal-500/15 text-teal-700 dark:text-teal-300";
		case "XML11":
			return "bg-orange-500/15 text-orange-700 dark:text-orange-300";
		case "XML13":
			return "bg-lime-500/15 text-lime-700 dark:text-lime-300";
		case "XML14":
			return "bg-sky-500/15 text-sky-700 dark:text-sky-300";
		case "XML15":
			return "bg-violet-500/15 text-violet-700 dark:text-violet-300";
		default:
			return "bg-muted text-foreground/80";
	}
};

const BhxhValidatorPage = () => {
	const [mode, setMode] = useState<ValidatorMode>("single");

	// Single-mode state
	const [xmlInput, setXmlInput] = useState("");
	const [strictMode, setStrictMode] = useState(false);
	const [isSingleLoading, setIsSingleLoading] = useState(false);
	const [singleResult, setSingleResult] = useState<ValidateResponse | null>(
		null
	);
	const [uploadedName, setUploadedName] = useState<string | null>(null);
	// "encoded" shows the user's raw text; "decoded" shows base64-decoded
	// FILEHOSO contents inline so the user can verify what the validator sees.
	// Only meaningful when the input is a GIAMDINHHS envelope.
	const [inputView, setInputView] = useState<"encoded" | "decoded">("encoded");
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Bundle-mode state
	const [bundleFile, setBundleFile] = useState<File | null>(null);
	const [bundleResult, setBundleResult] =
		useState<BundleValidateResponse | null>(null);
	const [isBundleLoading, setIsBundleLoading] = useState(false);
	const [expandedRecords, setExpandedRecords] = useState<Set<string>>(
		new Set()
	);
	const [isDragging, setIsDragging] = useState(false);
	const [showFormatHelp, setShowFormatHelp] = useState(false);
	// Cached decoded preview of the uploaded bundle (only when it's a .xml
	// envelope — RAR archives need server-side extraction first).
	const [bundleDecodedPreview, setBundleDecodedPreview] = useState<
		string | null
	>(null);
	const [showBundleDecoded, setShowBundleDecoded] = useState(false);
	const bundleFileInputRef = useRef<HTMLInputElement>(null);

	const switchMode = (next: ValidatorMode) => {
		if (next === mode) return;
		setMode(next);
		// Clear cross-mode results so the right pane never shows stale data.
		setSingleResult(null);
		setBundleResult(null);
		setExpandedRecords(new Set());
	};

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const f = e.target.files?.[0];
		if (!f) return;
		if (f.size > SINGLE_MAX_BYTES) {
			toast.error("File too large (max 20 MB)");
			return;
		}
		try {
			const text = await f.text();
			setXmlInput(text);
			setUploadedName(f.name);
			setSingleResult(null);
			toast.success(`Loaded ${f.name} (${(f.size / 1024).toFixed(1)} KB)`);
		} catch {
			toast.error("Could not read file");
		} finally {
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	const handleValidate = async () => {
		if (!xmlInput.trim()) return;
		setIsSingleLoading(true);
		setSingleResult(null);

		try {
			const headers = await getAuthHeaders(API_ROUTES.SERVICES.BHXH_VALIDATE);
			const resp = await fetch(API_ROUTES.SERVICES.BHXH_VALIDATE, {
				method: "POST",
				headers,
				body: JSON.stringify({ xml_data: xmlInput, strict: strictMode }),
			});
			if (!resp.ok)
				throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
			const json: ValidateResponse = await resp.json();
			setSingleResult(json);
			if (json.valid) {
				toast.success("BHXH 4210 document is valid");
			} else {
				toast.warning(
					`${json.error_count} error(s), ${json.warning_count} warning(s)`
				);
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Validation failed");
		} finally {
			setIsSingleLoading(false);
		}
	};

	const acceptBundleFile = (f: File): boolean => {
		const lower = f.name.toLowerCase();
		const isXml = lower.endsWith(".xml");
		const isRar = lower.endsWith(".rar");
		if (!isXml && !isRar) {
			toast.error(
				"Bundle must be a .xml (GIAMDINHHS envelope) or .rar archive"
			);
			return false;
		}
		if (f.size > BUNDLE_MAX_BYTES) {
			toast.error("File too large (max 50 MB)");
			return false;
		}
		setBundleFile(f);
		setBundleResult(null);
		setExpandedRecords(new Set());
		setBundleDecodedPreview(null);
		setShowBundleDecoded(false);
		toast.success(`Loaded ${f.name} (${(f.size / 1024).toFixed(1)} KB)`);
		// For .xml envelopes we can decode client-side immediately so the user
		// can verify what the validator will see. RAR archives are deferred
		// to the server (we don't ship a RAR decoder in the browser).
		if (isXml) {
			f.text()
				.then((text) => {
					try {
						const decoded = decodeBhxhEnvelopeToReadable(text);
						setBundleDecodedPreview(decoded);
					} catch {
						setBundleDecodedPreview(null);
					}
				})
				.catch(() => setBundleDecodedPreview(null));
		}
		return true;
	};

	const handleBundleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const f = e.target.files?.[0];
		if (f) acceptBundleFile(f);
		if (bundleFileInputRef.current) bundleFileInputRef.current.value = "";
	};

	const handleBundleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
		e.preventDefault();
		setIsDragging(false);
		const f = e.dataTransfer.files?.[0];
		if (f) acceptBundleFile(f);
	};

	const loadDemoBundle = async () => {
		try {
			const resp = await fetch("/sample-bhxh-bundle.xml");
			if (!resp.ok)
				throw new Error(`Could not load demo bundle (HTTP ${resp.status})`);
			const blob = await resp.blob();
			const file = new File([blob], "sample-bhxh-bundle.xml", {
				type: "application/xml",
			});
			acceptBundleFile(file);
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Demo bundle unavailable"
			);
		}
	};

	const handleValidateBundle = async () => {
		if (!bundleFile) return;
		setIsBundleLoading(true);
		setBundleResult(null);

		try {
			const formData = new FormData();
			formData.append("file", bundleFile);

			const headers = await getAuthHeaders(
				API_ROUTES.SERVICES.BHXH_VALIDATE_BUNDLE
			);
			delete headers["Content-Type"];

			const resp = await fetch(API_ROUTES.SERVICES.BHXH_VALIDATE_BUNDLE, {
				method: "POST",
				headers,
				body: formData,
			});
			if (!resp.ok)
				throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);

			const json: BundleValidateResponse = await resp.json();
			setBundleResult(json);
			// Auto-expand any record with errors so they're visible at a glance.
			const next = new Set<string>();
			for (const r of json.records) {
				if (r.error_count > 0) next.add(r.ma_lk);
			}
			setExpandedRecords(next);

			if (json.valid) {
				toast.success(`All ${json.total_records} records are valid`);
			} else {
				toast.warning(
					`${json.invalid_records} of ${json.total_records} records have errors`
				);
			}
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Bundle validation failed"
			);
		} finally {
			setIsBundleLoading(false);
		}
	};

	const toggleRecord = (maLk: string) => {
		setExpandedRecords((prev) => {
			const next = new Set(prev);
			if (next.has(maLk)) {
				next.delete(maLk);
			} else {
				next.add(maLk);
			}
			return next;
		});
	};

	const severityColor = (s: string) => {
		if (s === "error")
			return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
		if (s === "warning")
			return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
		return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
	};

	const allIssues = singleResult?.issues ?? [];

	// Detect whether the user's input is a GIAMDINHHS envelope so the
	// Encoded/Decoded toggle only appears when there's actually base64
	// content to decode. A bare TONG_HOP record has nothing to decode.
	const isEnvelope = useMemo(
		() =>
			/^\s*(?:<\?xml[^?]*\?>\s*)?(?:<!--[\s\S]*?-->\s*)*<GIAMDINHHS[\s>]/i.test(
				xmlInput
			),
		[xmlInput]
	);

	// Compute the decoded view lazily so we don't pay the cost on every
	// keystroke when the user is editing in encoded mode.
	const decodedView = useMemo(() => {
		if (!isEnvelope || inputView !== "decoded") return "";
		try {
			return decodeBhxhEnvelopeToReadable(xmlInput);
		} catch (err) {
			return `<!-- decode failed: ${err instanceof Error ? err.message : String(err)} -->`;
		}
	}, [isEnvelope, inputView, xmlInput]);

	const xmlTypeSummary = useMemo(() => {
		if (!bundleResult)
			return [] as { code: string; records: number; errors: number }[];
		return Object.entries(bundleResult.summary_by_xml_type)
			.map(([code, v]) => ({ code, ...v }))
			.sort((a, b) => {
				const an = Number(a.code.replace(/\D/g, "")) || 0;
				const bn = Number(b.code.replace(/\D/g, "")) || 0;
				return an - bn;
			});
	}, [bundleResult]);

	const inputPlaceholder =
		mode === "single"
			? "Paste BHXH 4210 XML, or click Upload XML / Load Example…"
			: "";

	const modeToggle = (
		<div className="inline-flex items-center rounded-md border bg-background p-0.5 text-xs">
			<button
				type="button"
				onClick={() => switchMode("single")}
				className={`px-3 py-1 rounded-sm font-medium transition-colors ${
					mode === "single" ? "bg-foreground text-background" : "hover:bg-muted"
				}`}
			>
				Single XML
			</button>
			<button
				type="button"
				onClick={() => switchMode("bundle")}
				className={`px-3 py-1 rounded-sm font-medium transition-colors ${
					mode === "bundle" ? "bg-foreground text-background" : "hover:bg-muted"
				}`}
			>
				Bundle / Hospital Archive
			</button>
		</div>
	);

	const viewCodeDialog =
		mode === "single" ? (
			<ViewCodeDialog
				endpoint={API_ROUTES.SERVICES.BHXH_VALIDATE}
				method="POST"
				body={{
					xml_data: "<MedicalRecord>...</MedicalRecord>",
					strict: false,
				}}
				description="Validate a single BHXH 4210 XML document"
			/>
		) : (
			<ViewCodeDialog
				endpoint={API_ROUTES.SERVICES.BHXH_VALIDATE_BUNDLE}
				method="POST"
				contentType="multipart/form-data"
				body={{ file: "<.xml | .rar bundle, multipart field 'file'>" }}
				description="Validate a GIAMDINHHS envelope or .rar archive of records (multipart upload; optional fields: strict, summary, max_issues_per_record)"
			/>
		);

	const xmlLegendStrip = (
		<div className="border-t bg-muted/10 px-4 py-2">
			<div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
				14 XML file types per record (TT 4210)
			</div>
			<div className="flex flex-wrap gap-x-3 gap-y-1">
				{XML_LEGEND.map((x) => (
					<div key={x.code} className="flex items-center gap-1.5 text-[11px]">
						<span className={`inline-block w-2 h-2 rounded-full ${x.color}`} />
						<span className="font-mono font-semibold text-foreground">
							{x.code}
						</span>
						<span className="text-muted-foreground">{x.label}</span>
					</div>
				))}
			</div>
		</div>
	);

	const singleLeftPane = (
		<>
			<div className="p-4 border-b flex items-center justify-between gap-2 flex-wrap">
				<span className="text-sm font-medium">BHXH 4210 XML Input</span>
				<div className="flex items-center gap-3">
					<button
						type="button"
						className="flex items-center gap-2 text-sm"
						onClick={() => setStrictMode(!strictMode)}
					>
						<span
							className={`inline-flex w-9 h-5 rounded-full relative transition-colors shrink-0 ${strictMode ? "bg-primary" : "bg-muted-foreground/30"}`}
						>
							<span
								className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${strictMode ? "translate-x-4" : "translate-x-0"}`}
							/>
						</span>
						<span>Strict mode</span>
					</button>
					<input
						ref={fileInputRef}
						type="file"
						accept=".xml,application/xml,text/xml"
						className="hidden"
						onChange={handleFileUpload}
					/>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => fileInputRef.current?.click()}
					>
						Upload XML
					</Button>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => {
							setXmlInput(BHXH_4210_EXAMPLE);
							setUploadedName(null);
							setInputView("encoded");
						}}
					>
						Load Example
					</Button>
				</div>
			</div>
			<div className="flex-1 p-4 overflow-hidden flex flex-col">
				{uploadedName && (
					<div className="mb-2 text-xs text-muted-foreground">
						Loaded from <span className="font-mono">{uploadedName}</span>
					</div>
				)}
				{isEnvelope && (
					<div className="mb-2 flex items-center justify-between gap-2 flex-wrap">
						<div className="inline-flex items-center rounded-md border bg-background p-0.5 text-[11px]">
							<button
								type="button"
								onClick={() => setInputView("encoded")}
								className={`px-2.5 py-1 rounded-sm font-medium transition-colors ${
									inputView === "encoded"
										? "bg-foreground text-background"
										: "hover:bg-muted"
								}`}
							>
								Encoded (raw)
							</button>
							<button
								type="button"
								onClick={() => setInputView("decoded")}
								className={`px-2.5 py-1 rounded-sm font-medium transition-colors ${
									inputView === "decoded"
										? "bg-foreground text-background"
										: "hover:bg-muted"
								}`}
							>
								Decoded (human-readable)
							</button>
						</div>
						<span className="text-[11px] text-muted-foreground">
							{inputView === "decoded"
								? "Read-only — switch back to Encoded to edit"
								: "GIAMDINHHS envelope — toggle to inspect base64-decoded contents"}
						</span>
					</div>
				)}
				{inputView === "decoded" && isEnvelope ? (
					<textarea
						value={decodedView}
						readOnly
						className="flex-1 w-full rounded-md border px-3 py-2 text-xs font-mono bg-muted/40 resize-none"
					/>
				) : (
					<textarea
						value={xmlInput}
						onChange={(e) => {
							setXmlInput(e.target.value);
							if (uploadedName) setUploadedName(null);
						}}
						placeholder={inputPlaceholder}
						className="flex-1 w-full rounded-md border px-3 py-2 text-xs font-mono bg-background resize-none"
					/>
				)}
				<div className="mt-3">
					<Button
						type="button"
						onClick={handleValidate}
						disabled={isSingleLoading || !xmlInput.trim()}
					>
						{isSingleLoading ? "Validating..." : "Validate"}
					</Button>
				</div>
			</div>
		</>
	);

	const bundleLeftPane = (
		<>
			<div className="p-4 border-b flex items-center justify-between gap-2 flex-wrap">
				<span className="text-sm font-medium">
					Bundle Upload (.xml or .rar)
				</span>
				<div className="flex items-center gap-3">
					<input
						ref={bundleFileInputRef}
						type="file"
						accept=".xml,.rar,application/xml,application/x-rar-compressed,application/vnd.rar"
						className="hidden"
						onChange={handleBundleFileInput}
					/>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => bundleFileInputRef.current?.click()}
					>
						Upload Bundle
					</Button>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={loadDemoBundle}
					>
						Load Demo Bundle
					</Button>
				</div>
			</div>
			<div className="flex-1 p-4 overflow-hidden flex flex-col">
				<button
					type="button"
					onClick={() => bundleFileInputRef.current?.click()}
					onDragOver={(e) => {
						e.preventDefault();
						setIsDragging(true);
					}}
					onDragLeave={() => setIsDragging(false)}
					onDrop={handleBundleDrop}
					className={`flex-1 w-full rounded-md border-2 border-dashed flex flex-col items-center justify-center text-center px-4 py-8 transition-colors ${
						isDragging
							? "border-primary bg-primary/5"
							: "border-muted-foreground/30 hover:border-muted-foreground/60 bg-background"
					}`}
				>
					<PackageIcon
						className="w-8 h-8 text-muted-foreground mb-3"
						aria-hidden={true}
					/>
					{bundleFile ? (
						<div className="space-y-1">
							<p className="text-sm font-medium">{bundleFile.name}</p>
							<p className="text-xs text-muted-foreground">
								{(bundleFile.size / 1024).toFixed(1)} KB · click to replace
							</p>
						</div>
					) : (
						<div className="space-y-1">
							<p className="text-sm font-medium">
								Drop a GIAMDINHHS .xml or .rar archive
							</p>
							<p className="text-xs text-muted-foreground">
								or click to browse · max 50 MB
							</p>
						</div>
					)}
				</button>
				{bundleDecodedPreview && (
					<div className="mt-3 border rounded-md overflow-hidden">
						<button
							type="button"
							onClick={() => setShowBundleDecoded((v) => !v)}
							className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-muted/30 hover:bg-muted/50 text-xs font-medium transition-colors"
						>
							<span className="flex items-center gap-2">
								<span
									className={`inline-block transition-transform text-muted-foreground ${
										showBundleDecoded ? "rotate-90" : ""
									}`}
								>
									▸
								</span>
								Decoded preview (verify what the validator sees)
							</span>
							<span className="text-[10px] text-muted-foreground">
								{(bundleDecodedPreview.length / 1024).toFixed(1)} KB
							</span>
						</button>
						{showBundleDecoded && (
							<textarea
								value={bundleDecodedPreview}
								readOnly
								className="block w-full max-h-64 px-3 py-2 text-[11px] font-mono bg-background resize-none border-t"
								style={{ minHeight: "200px" }}
							/>
						)}
					</div>
				)}
				<div className="mt-3">
					<Button
						type="button"
						onClick={handleValidateBundle}
						disabled={isBundleLoading || !bundleFile}
					>
						{isBundleLoading ? "Validating..." : "Validate Bundle"}
					</Button>
				</div>
			</div>
		</>
	);

	const singleRightPane = (
		<>
			{singleResult ? (
				<div className="flex-1 overflow-y-auto p-4 space-y-4">
					<div className="flex items-center gap-3">
						<span
							className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
								singleResult.valid
									? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
									: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
							}`}
						>
							{singleResult.valid ? "Valid" : "Invalid"}
						</span>
						<span className="text-sm text-muted-foreground">
							{singleResult.error_count} error(s), {singleResult.warning_count}{" "}
							warning(s)
						</span>
					</div>
					{singleResult.summary && (
						<p className="text-sm text-muted-foreground">
							{singleResult.summary}
						</p>
					)}
					{allIssues.length > 0 && (
						<div className="space-y-2">
							{allIssues.map((issue, i) => (
								<div
									key={`${issue.field}-${issue.message}-${i}`}
									className="p-3 rounded-md border text-sm space-y-1"
								>
									<div className="flex items-center gap-2">
										<span
											className={`inline-flex px-1.5 py-0.5 rounded text-[11px] font-semibold uppercase ${severityColor(issue.severity)}`}
										>
											{issue.severity}
										</span>
										{issue.code && (
											<ErrorCodeChip code={issue.code} size="md" />
										)}
									</div>
									<p>{issue.message}</p>
									{issue.field && (
										<p className="text-xs text-muted-foreground font-mono">
											{issue.field}
											{issue.value ? `: ${issue.value}` : ""}
										</p>
									)}
								</div>
							))}
						</div>
					)}
					{allIssues.length === 0 && singleResult.valid && (
						<p className="text-sm text-green-600 dark:text-green-400">
							No issues found. The document is valid BHXH 4210.
						</p>
					)}
					<RawResponseViewer data={singleResult} />
				</div>
			) : (
				<DemoEmptyState
					icon={ShieldCheckIcon}
					description={
						<>
							Paste BHXH 4210 XML on the left and click{" "}
							<strong>Validate</strong> to check for errors.
						</>
					}
				/>
			)}
			{xmlLegendStrip}
		</>
	);

	const bundleRightPane = (
		<>
			{bundleResult ? (
				<div className="flex-1 overflow-y-auto p-4 space-y-4">
					<div
						className={`p-3 rounded-md border ${
							bundleResult.valid
								? "bg-green-50 dark:bg-green-950/20 border-green-300/60 dark:border-green-900/40"
								: "bg-red-50/50 dark:bg-red-950/10 border-red-300/60 dark:border-red-900/40"
						}`}
					>
						<div className="text-sm font-medium">
							{bundleResult.valid_records} of {bundleResult.total_records}{" "}
							records valid · {bundleResult.total_errors} total error(s) across{" "}
							{xmlTypeSummary.length} XML file type
							{xmlTypeSummary.length === 1 ? "" : "s"}
						</div>
						{xmlTypeSummary.length > 0 && (
							<div className="mt-2 flex flex-wrap gap-1.5">
								{xmlTypeSummary.map((s) => (
									<span
										key={s.code}
										className={`text-[11px] px-2 py-0.5 rounded font-medium ${xmlChipClasses(s.code)}`}
										title={`${s.records} record(s), ${s.errors} error(s)`}
									>
										{s.code}: {s.errors} err / {s.records} rec
									</span>
								))}
							</div>
						)}
					</div>

					<div className="space-y-2">
						{bundleResult.records.map((rec) => {
							const isOpen = expandedRecords.has(rec.ma_lk);
							const isValid = rec.error_count === 0;
							const issuesByType = new Map<string, ValidationIssue[]>();
							for (const iss of rec.issues) {
								const key = iss.file_type ?? "OTHER";
								const arr = issuesByType.get(key) ?? [];
								arr.push(iss);
								issuesByType.set(key, arr);
							}
							return (
								<div
									key={rec.ma_lk}
									className="rounded-md border bg-background"
								>
									<button
										type="button"
										onClick={() => toggleRecord(rec.ma_lk)}
										className="w-full flex items-center justify-between gap-3 px-3 py-2 hover:bg-muted/40 transition-colors"
									>
										<div className="flex items-center gap-3 min-w-0">
											<span
												className={`inline-block transition-transform shrink-0 text-muted-foreground ${
													isOpen ? "rotate-90" : ""
												}`}
											>
												▸
											</span>
											{isValid ? (
												<span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold shrink-0">
													✓
												</span>
											) : (
												<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 shrink-0">
													{rec.error_count} err
												</span>
											)}
											<span className="font-mono font-semibold text-sm truncate">
												{rec.ma_lk}
											</span>
											<div className="hidden sm:flex flex-wrap gap-1">
												{rec.file_types.map((t) => (
													<span
														key={t}
														className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${xmlChipClasses(t)}`}
													>
														{t}
													</span>
												))}
											</div>
										</div>
										<div className="text-xs text-muted-foreground shrink-0">
											{rec.warning_count > 0 ? `${rec.warning_count} warn` : ""}
										</div>
									</button>
									{isOpen && (
										<div className="border-t bg-muted/10 p-3 space-y-3">
											{rec.issues.length === 0 ? (
												<p className="text-xs text-green-700 dark:text-green-400">
													No issues found in this record.
												</p>
											) : (
												Array.from(issuesByType.entries()).map(
													([fileType, issues]) => (
														<div key={fileType} className="space-y-1.5">
															<div className="flex items-center gap-2">
																<span
																	className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${xmlChipClasses(fileType)}`}
																>
																	{fileType}
																</span>
																<span className="text-[11px] text-muted-foreground">
																	{issues.length} issue
																	{issues.length === 1 ? "" : "s"}
																</span>
															</div>
															<div className="space-y-1.5 pl-2 border-l-2 border-muted">
																{issues.map((issue, i) => (
																	<div
																		key={`${rec.ma_lk}-${fileType}-${issue.code ?? "n"}-${i}`}
																		className="text-xs space-y-0.5"
																	>
																		<div className="flex items-center gap-2">
																			<span
																				className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${severityColor(issue.severity)}`}
																			>
																				{issue.severity}
																			</span>
																			{issue.code && (
																				<ErrorCodeChip
																					code={issue.code}
																					size="sm"
																				/>
																			)}
																		</div>
																		<p>{issue.message}</p>
																		{issue.field && (
																			<p className="font-mono text-muted-foreground">
																				{issue.field}
																				{issue.value ? `: ${issue.value}` : ""}
																			</p>
																		)}
																	</div>
																))}
															</div>
														</div>
													)
												)
											)}
										</div>
									)}
								</div>
							);
						})}
					</div>

					<RawResponseViewer data={bundleResult} />
				</div>
			) : (
				<DemoEmptyState
					icon={PackageIcon}
					description={
						<>
							Drop a GIAMDINHHS XML envelope or hospital RAR archive on the
							left, then click <strong>Validate Bundle</strong>. Results are
							grouped per <code>MA_LK</code> with errors broken down by XML file
							type.
						</>
					}
				/>
			)}
			{xmlLegendStrip}
		</>
	);

	return (
		<DashboardLayout pageTitle="BHXH 4210 Validator">
			<DemoPageShell>
				<DemoPageDescription
					infoBanner={
						<>
							<div className="flex items-start justify-between gap-3 px-4 py-2 border-b bg-blue-50/40 dark:bg-blue-950/20">
								<div className="flex items-start gap-2 text-xs text-blue-900 dark:text-blue-200">
									<svg
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										className="mt-0.5 shrink-0"
										aria-hidden="true"
									>
										<title>Info</title>
										<circle cx="12" cy="12" r="10" />
										<path d="M12 16v-4M12 8h.01" />
									</svg>
									<span>
										Validates against{" "}
										<strong>745 official BHXH error codes</strong> from TT 4210.{" "}
										<Link
											to="/bhxh-error-codes"
											className="underline font-medium hover:text-blue-700 dark:hover:text-blue-100"
										>
											View error code reference →
										</Link>
									</span>
								</div>
								<button
									type="button"
									className="text-xs underline text-blue-900 dark:text-blue-200 hover:text-blue-700 dark:hover:text-blue-100 shrink-0"
									onClick={() => setShowFormatHelp((v) => !v)}
								>
									{showFormatHelp ? "Hide format help" : "Format help"}
								</button>
							</div>
							{showFormatHelp && (
								<div className="px-4 py-2 border-b bg-muted/20 text-[11px] text-muted-foreground leading-relaxed">
									TT 4210 splits each medical record into 14 separate XML files
									(XML1=patient summary, XML2=medications, XML3=services, …,
									XML15=imaging). The <strong>GIAMDINHHS</strong> envelope wraps
									a batch of records (typically 500 hồ sơ per file) where each
									child file is base64-encoded inside{" "}
									<code>&lt;NOIDUNGFILE&gt;</code>. Hospitals usually compress
									one or more envelopes into a <strong>.rar</strong> archive
									before uploading to the BHXH portal.
								</div>
							)}
						</>
					}
				>
					BHXH 4210 XML and bundle validation. ~745 error codes across 14 XML
					file types from TT 4210. Returns severity, remediation hints, and
					per-record diagnostics.
				</DemoPageDescription>
				<DemoToolbar start={modeToggle} end={viewCodeDialog} />
				<DemoSplitLayout
					left={mode === "single" ? singleLeftPane : bundleLeftPane}
					right={mode === "single" ? singleRightPane : bundleRightPane}
				/>
			</DemoPageShell>

			<div className="px-4 py-2 border-t">
				<ApiTopology {...TOPOLOGIES.bhxh_validator} />
			</div>
		</DashboardLayout>
	);
};

export default BhxhValidatorPage;
