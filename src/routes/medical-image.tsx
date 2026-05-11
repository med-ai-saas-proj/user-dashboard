import { ImageIcon } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { ViewCodeDialog } from "@/components/view-code-dialog";
import { API_ROUTES } from "@/config/api-routes";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";

// Backwards-compatible shape — older API returned objects, current API returns
// strings. Render either form gracefully.
type Finding =
	| string
	| { description: string; location?: string; severity?: string };

interface ImageDescribeResponse {
	success?: boolean;
	description: string;
	findings: Finding[];
	suggested_diagnoses?: string[];
	confidence?: string;
	modality?: string;
	body_part?: string;
	errors?: string[];
}

const findingText = (f: Finding): string =>
	typeof f === "string" ? f : f.description;
const findingLocation = (f: Finding): string | undefined =>
	typeof f === "string" ? undefined : f.location;
const findingSeverity = (f: Finding): string | undefined =>
	typeof f === "string" ? undefined : f.severity;

type Language = "en" | "vi";

const T = {
	en: {
		description:
			"AI-powered image analysis using Qwen3.5-4B (self-hosted GGUF on Cloud Run L4 GPU). Extract findings, body parts, and differential diagnoses from radiology, dermatology, and ophthalmology images.",
		uploadTitle: "Upload Medical Image",
		clickToSelect: "Click to select a medical image",
		acceptedFormats: "JPEG, PNG, DICOM",
		changeImage: "Change image",
		analyze: "Analyze Image",
		analyzing: "Analyzing...",
		analysisErrors: "Analysis errors",
		descriptionLabel: "Description",
		emptyDescription:
			"(No description returned. The model may have returned an unexpected JSON shape — try a different image.)",
		findings: "Findings",
		location: "Location",
		severity: "Severity",
		confidence: "Confidence",
		suggestedDiagnoses: "Suggested Diagnoses",
		emptyHint: (
			<>
				Upload a medical image on the left and click{" "}
				<strong>Analyze Image</strong> to see findings here.
			</>
		),
		analysisComplete: "Image analysis complete",
		analysisFailed: "Analysis failed",
		sampleHeader: "Or try a sample",
		samples: {
			"Chest X-ray": { label: "Chest X-ray", modality: "X-Ray" },
			"Skin lesion": { label: "Skin lesion", modality: "Dermatology" },
			"Retinal scan": { label: "Retinal scan", modality: "Fundus" },
		},
		loadSampleError: (label: string) => `Could not load sample: ${label}`,
	},
	vi: {
		description:
			"Phân tích hình ảnh bằng AI dùng Qwen3.5-4B (GGUF tự lưu trữ trên Cloud Run L4 GPU). Trích xuất phát hiện, vùng cơ thể và chẩn đoán phân biệt từ ảnh X-quang, da liễu và nhãn khoa.",
		uploadTitle: "Tải lên hình ảnh y khoa",
		clickToSelect: "Nhấn để chọn hình ảnh y khoa",
		acceptedFormats: "JPEG, PNG, DICOM",
		changeImage: "Đổi hình",
		analyze: "Phân tích hình ảnh",
		analyzing: "Đang phân tích...",
		analysisErrors: "Lỗi phân tích",
		descriptionLabel: "Mô tả",
		emptyDescription:
			"(Không có mô tả. Mô hình có thể trả về định dạng JSON không mong đợi — hãy thử ảnh khác.)",
		findings: "Phát hiện",
		location: "Vị trí",
		severity: "Mức độ",
		confidence: "Độ tin cậy",
		suggestedDiagnoses: "Chẩn đoán đề xuất",
		emptyHint: (
			<>
				Tải lên hình ảnh y khoa ở bên trái và nhấn{" "}
				<strong>Phân tích hình ảnh</strong> để xem kết quả ở đây.
			</>
		),
		analysisComplete: "Phân tích hình ảnh hoàn tất",
		analysisFailed: "Phân tích thất bại",
		sampleHeader: "Hoặc thử ảnh mẫu",
		samples: {
			"Chest X-ray": { label: "X-quang ngực", modality: "X-Quang" },
			"Skin lesion": { label: "Tổn thương da", modality: "Da liễu" },
			"Retinal scan": { label: "Soi đáy mắt", modality: "Nhãn khoa" },
		},
		loadSampleError: (label: string) => `Không thể tải mẫu: ${label}`,
	},
} as const;

const SAMPLE_IMAGES: { key: keyof (typeof T)["en"]["samples"]; src: string }[] =
	[
		{ key: "Chest X-ray", src: "/sample-images/chest-xray.jpg" },
		{ key: "Skin lesion", src: "/sample-images/skin-lesion.jpg" },
		{ key: "Retinal scan", src: "/sample-images/retinal-scan.jpg" },
	];

const MedicalImagePage = () => {
	const { i18n } = useTranslation();
	const language: Language = i18n.language?.startsWith("vi") ? "vi" : "en";
	const [isLoading, setIsLoading] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [result, setResult] = useState<ImageDescribeResponse | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const t = T[language];

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const f = e.target.files?.[0] ?? null;
		setFile(f);
		setResult(null);
		if (f) {
			const reader = new FileReader();
			reader.onload = (ev) => setPreview(ev.target?.result as string);
			reader.readAsDataURL(f);
		} else {
			setPreview(null);
		}
	};

	const loadSample = async (sample: (typeof SAMPLE_IMAGES)[number]) => {
		try {
			const resp = await fetch(sample.src);
			if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
			const blob = await resp.blob();
			const filename = sample.src.split("/").pop() || "sample.jpg";
			const sampleFile = new File([blob], filename, {
				type: blob.type || "image/jpeg",
			});
			setFile(sampleFile);
			setResult(null);
			const reader = new FileReader();
			reader.onload = (ev) => setPreview(ev.target?.result as string);
			reader.readAsDataURL(sampleFile);
		} catch {
			toast.error(t.loadSampleError(t.samples[sample.key].label));
		}
	};

	const handleDescribe = async () => {
		if (!file) return;
		setIsLoading(true);
		setResult(null);

		try {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("language", language);

			const headers = await getAuthHeaders(API_ROUTES.SERVICES.MEDICAL_IMAGE);
			delete headers["Content-Type"];
			const resp = await fetch(API_ROUTES.SERVICES.MEDICAL_IMAGE, {
				method: "POST",
				headers,
				body: formData,
			});
			if (!resp.ok)
				throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
			const json: ImageDescribeResponse = await resp.json();
			setResult(json);
			toast.success(t.analysisComplete);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t.analysisFailed);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<DashboardLayout pageTitle="Medical Image">
			<DemoPageShell>
				<DemoPageDescription>{t.description}</DemoPageDescription>
				<DemoToolbar
					end={
						<ViewCodeDialog
							endpoint={API_ROUTES.SERVICES.MEDICAL_IMAGE}
							method="POST"
							contentType="multipart/form-data"
							description="Analyze medical image and extract findings"
						/>
					}
				/>
				<DemoSplitLayout
					left={
						<div className="flex flex-col overflow-hidden p-4 space-y-4 h-full">
							<span className="text-sm font-medium">{t.uploadTitle}</span>
							<button
								type="button"
								className="w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
								onClick={() => fileInputRef.current?.click()}
							>
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									onChange={handleFileChange}
									className="hidden"
								/>
								{preview ? (
									<img
										src={preview}
										alt="Uploaded preview"
										className="max-h-64 mx-auto rounded"
									/>
								) : (
									<>
										<svg
											width="40"
											height="40"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											className="mx-auto text-muted-foreground mb-3"
											aria-hidden="true"
										>
											<title>Upload image</title>
											<rect x="4" y="4" width="32" height="32" rx="4" />
											<circle cx="14" cy="14" r="3" />
											<path d="M36 28l-8-8-16 16" />
										</svg>
										<p className="text-sm text-muted-foreground">
											{t.clickToSelect}
										</p>
										<p className="text-xs text-muted-foreground mt-1">
											{t.acceptedFormats}
										</p>
									</>
								)}
							</button>
							{file && (
								<div className="flex items-center justify-between gap-2">
									<p className="text-xs text-muted-foreground">
										{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
									</p>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="h-7 text-xs"
										onClick={() => {
											setFile(null);
											setPreview(null);
											setResult(null);
											fileInputRef.current?.click();
										}}
									>
										<ImageIcon className="h-3 w-3 mr-1" />
										{t.changeImage}
									</Button>
								</div>
							)}
							<Button
								type="button"
								onClick={handleDescribe}
								disabled={isLoading || !file}
							>
								{isLoading ? t.analyzing : t.analyze}
							</Button>
							<div>
								<div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
									{t.sampleHeader}
								</div>
								<div className="grid grid-cols-3 gap-2">
									{SAMPLE_IMAGES.map((s) => {
										const sampleT = t.samples[s.key];
										return (
											<button
												key={s.key}
												type="button"
												onClick={() => loadSample(s)}
												className="group relative aspect-square rounded-md border overflow-hidden hover:border-primary transition-colors bg-muted"
												title={sampleT.label}
											>
												<img
													src={s.src}
													alt={sampleT.label}
													className="w-full h-full object-cover"
													onError={(e) => {
														(
															e.currentTarget as HTMLImageElement
														).style.display = "none";
													}}
												/>
												<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
													<div className="text-[10px] font-medium text-white leading-tight">
														{sampleT.label}
													</div>
													<div className="text-[9px] text-white/70 leading-tight">
														{sampleT.modality}
													</div>
												</div>
											</button>
										);
									})}
								</div>
							</div>
						</div>
					}
					right={
						result ? (
							<div className="flex-1 overflow-y-auto p-4 space-y-4">
								{(result.modality || result.body_part) && (
									<div className="flex gap-2 text-xs">
										{result.modality && (
											<span className="px-2 py-0.5 rounded bg-muted font-medium">
												{result.modality}
											</span>
										)}
										{result.body_part && (
											<span className="px-2 py-0.5 rounded bg-muted font-medium">
												{result.body_part}
											</span>
										)}
									</div>
								)}

								{result.errors && result.errors.length > 0 && (
									<div className="rounded-md border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800/50 p-3 text-sm">
										<p className="font-medium text-red-900 dark:text-red-200">
											{t.analysisErrors}
										</p>
										<ul className="mt-1 text-xs text-red-800 dark:text-red-300 list-disc list-inside">
											{result.errors.map((e, i) => (
												<li key={`err-${i}`}>{e}</li>
											))}
										</ul>
									</div>
								)}

								<div>
									<span className="text-sm font-medium">
										{t.descriptionLabel}
									</span>
									<p className="text-sm mt-1 leading-relaxed whitespace-pre-wrap">
										{result.description?.trim() || t.emptyDescription}
									</p>
								</div>

								{result.findings && result.findings.length > 0 && (
									<div>
										<span className="text-sm font-medium">{t.findings}</span>
										<div className="mt-2 space-y-2">
											{result.findings.map((f, i) => {
												const text = findingText(f);
												const loc = findingLocation(f);
												const sev = findingSeverity(f);
												return (
													<div
														key={`finding-${i}`}
														className="p-3 rounded-md border text-sm"
													>
														<p>{text}</p>
														{(loc || sev) && (
															<div className="flex gap-2 mt-1 text-xs text-muted-foreground">
																{loc && (
																	<span>
																		{t.location}: {loc}
																	</span>
																)}
																{sev && (
																	<span>
																		{t.severity}: {sev}
																	</span>
																)}
															</div>
														)}
													</div>
												);
											})}
										</div>
									</div>
								)}

								{result.confidence && (
									<div className="text-xs text-muted-foreground">
										{t.confidence}:{" "}
										<span className="font-medium">{result.confidence}</span>
									</div>
								)}

								{result.suggested_diagnoses &&
									result.suggested_diagnoses.length > 0 && (
										<div>
											<span className="text-sm font-medium">
												{t.suggestedDiagnoses}
											</span>
											<ul className="mt-2 space-y-1">
												{result.suggested_diagnoses.map((d, i) => (
													<li
														key={`diag-${i}`}
														className="text-sm flex items-start gap-2"
													>
														<span className="text-muted-foreground">•</span>
														{d}
													</li>
												))}
											</ul>
										</div>
									)}

								<RawResponseViewer data={result} />
							</div>
						) : (
							<DemoEmptyState icon={ImageIcon} description={t.emptyHint} />
						)
					}
				/>
			</DemoPageShell>

			<div className="px-4 py-1.5 border-t bg-muted/10 text-[10px] text-muted-foreground text-center">
				Powered by Qwen3.5-4B Vision (Cloud Run L4 GPU)
			</div>
			<div className="px-4 py-2 border-t">
				<ApiTopology {...TOPOLOGIES.medical_image} />
			</div>
		</DashboardLayout>
	);
};

export default MedicalImagePage;
