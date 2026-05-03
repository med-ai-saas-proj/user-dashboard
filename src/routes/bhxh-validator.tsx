import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ApiTopology, TOPOLOGIES } from "@/components/api-topology";
import { RawResponseViewer } from "@/components/raw-response-viewer";
import { Button } from "@/components/shadcn/button";
import { ViewCodeDialog } from "@/components/view-code-dialog";
import { API_ROUTES } from "@/config/api-routes";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";

interface ValidationIssue {
	field?: string;
	message: string;
	severity: "error" | "warning" | "info";
	code?: string;
	value?: string | null;
}

interface ValidateResponse {
	valid: boolean;
	error_count: number;
	warning_count: number;
	issues: ValidationIssue[];
	parsed_data?: Record<string, unknown>;
	summary?: string;
}

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
];

const BhxhValidatorPage = () => {
	const [xmlInput, setXmlInput] = useState("");
	const [strictMode, setStrictMode] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<ValidateResponse | null>(null);
	const [uploadedName, setUploadedName] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const f = e.target.files?.[0];
		if (!f) return;
		if (f.size > 20 * 1024 * 1024) {
			toast.error("File too large (max 20 MB)");
			return;
		}
		try {
			const text = await f.text();
			setXmlInput(text);
			setUploadedName(f.name);
			setResult(null);
			toast.success(`Loaded ${f.name} (${(f.size / 1024).toFixed(1)} KB)`);
		} catch {
			toast.error("Could not read file");
		} finally {
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	const handleValidate = async () => {
		if (!xmlInput.trim()) return;
		setIsLoading(true);
		setResult(null);

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
			setResult(json);
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
			setIsLoading(false);
		}
	};

	const severityColor = (s: string) => {
		if (s === "error")
			return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
		if (s === "warning")
			return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
		return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
	};

	const allIssues = result?.issues ?? [];

	return (
		<DashboardLayout pageTitle="BHXH 4210 Validator">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				<div className="px-4 py-2 border-b bg-muted/10">
					<p className="text-xs text-muted-foreground">
						BHXH 4210 XML validation with ~100+ official error codes from TT
						4210 rule catalog. Returns error severity, remediation hints, and
						diagnostic reports.
					</p>
				</div>
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
							Validates against <strong>745 official BHXH error codes</strong>{" "}
							from TT 4210.{" "}
							<Link
								to="/bhxh-error-codes"
								className="underline font-medium hover:text-blue-700 dark:hover:text-blue-100"
							>
								View error code reference →
							</Link>
						</span>
					</div>
				</div>
				<div className="flex items-center justify-end px-4 py-1.5 border-b">
					<ViewCodeDialog
						endpoint={API_ROUTES.SERVICES.BHXH_VALIDATE}
						method="POST"
						body={{
							xml_data: "<MedicalRecord>...</MedicalRecord>",
							strict: false,
						}}
						description="Validate BHXH 4210 XML document"
					/>
				</div>
				<div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden border-b">
					{/* Left: Input */}
					<div className="border-r flex flex-col overflow-hidden">
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
							<textarea
								value={xmlInput}
								onChange={(e) => {
									setXmlInput(e.target.value);
									if (uploadedName) setUploadedName(null);
								}}
								placeholder="Paste BHXH 4210 XML, or click Upload XML / Load Example..."
								className="flex-1 w-full rounded-md border px-3 py-2 text-xs font-mono bg-background resize-none"
							/>
							<div className="mt-3">
								<Button
									type="button"
									onClick={handleValidate}
									disabled={isLoading || !xmlInput.trim()}
								>
									{isLoading ? "Validating..." : "Validate"}
								</Button>
							</div>
						</div>
					</div>

					{/* Right: Results */}
					<div className="flex flex-col overflow-hidden relative">
						{result ? (
							<div className="flex-1 overflow-y-auto p-4 space-y-4">
								<div className="flex items-center gap-3">
									<span
										className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
											result.valid
												? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
												: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
										}`}
									>
										{result.valid ? "Valid" : "Invalid"}
									</span>
									<span className="text-sm text-muted-foreground">
										{result.error_count} error(s), {result.warning_count}{" "}
										warning(s)
									</span>
								</div>
								{result.summary && (
									<p className="text-sm text-muted-foreground">
										{result.summary}
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
														<span className="text-xs text-muted-foreground font-mono">
															{issue.code}
														</span>
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
								{allIssues.length === 0 && result.valid && (
									<p className="text-sm text-green-600 dark:text-green-400">
										No issues found. The document is valid BHXH 4210.
									</p>
								)}
								<RawResponseViewer data={result} />
							</div>
						) : (
							<div className="flex-1 flex items-center justify-center p-8">
								<div className="text-center space-y-3 max-w-sm">
									<div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
										<svg
											width="24"
											height="24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											className="text-muted-foreground"
											aria-hidden="true"
										>
											<title>Validate</title>
											<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
									</div>
									<p className="text-sm text-muted-foreground">
										Paste BHXH 4210 XML on the left and click{" "}
										<strong>Validate</strong> to check for errors.
									</p>
								</div>
							</div>
						)}
						<div className="border-t bg-muted/10 px-4 py-2">
							<div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
								Errors are grouped by source XML file
							</div>
							<div className="flex flex-wrap gap-x-3 gap-y-1">
								{XML_LEGEND.map((x) => (
									<div
										key={x.code}
										className="flex items-center gap-1.5 text-[11px]"
									>
										<span
											className={`inline-block w-2 h-2 rounded-full ${x.color}`}
										/>
										<span className="font-mono font-semibold text-foreground">
											{x.code}
										</span>
										<span className="text-muted-foreground">{x.label}</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="px-4 py-2 border-t">
				<ApiTopology {...TOPOLOGIES.bhxh_validator} />
			</div>
		</DashboardLayout>
	);
};

export default BhxhValidatorPage;
