import { useRef, useState } from "react";
import { toast } from "sonner";
import { ApiTopology, TOPOLOGIES } from "@/components/api-topology";
import { Button } from "@/components/shadcn/button";
import { ViewCodeDialog } from "@/components/view-code-dialog";
import { API_ROUTES } from "@/config/api-routes";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";

interface Finding {
	description: string;
	location?: string;
	severity?: string;
}

interface ImageDescribeResponse {
	description: string;
	findings: Finding[];
	suggested_diagnoses?: string[];
	modality?: string;
	body_part?: string;
}

const MedicalImagePage = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [result, setResult] = useState<ImageDescribeResponse | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

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

	const handleDescribe = async () => {
		if (!file) return;
		setIsLoading(true);
		setResult(null);

		try {
			const formData = new FormData();
			formData.append("file", file);

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
			toast.success("Image analysis complete");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Analysis failed");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<DashboardLayout pageTitle="Medical Image">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				<div className="flex items-center justify-end px-4 py-1.5 border-b">
					<ViewCodeDialog
						endpoint={API_ROUTES.SERVICES.MEDICAL_IMAGE}
						method="POST"
						contentType="multipart/form-data"
						description="Analyze medical image and extract findings"
					/>
				</div>
				<div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden border-b">
					{/* Left: Upload + Preview */}
					<div className="border-r flex flex-col overflow-hidden p-4 space-y-4">
						<span className="text-sm font-medium">Upload Medical Image</span>
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
										Click to select a medical image
									</p>
									<p className="text-xs text-muted-foreground mt-1">
										JPEG, PNG, DICOM
									</p>
								</>
							)}
						</button>
						{file && (
							<p className="text-xs text-muted-foreground">
								{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
							</p>
						)}
						<Button
							type="button"
							onClick={handleDescribe}
							disabled={isLoading || !file}
						>
							{isLoading ? "Analyzing..." : "Analyze Image"}
						</Button>
					</div>

					{/* Right: Results */}
					<div className="flex flex-col overflow-hidden">
						{result ? (
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

								<div>
									<span className="text-sm font-medium">Description</span>
									<p className="text-sm mt-1 leading-relaxed">
										{result.description}
									</p>
								</div>

								{result.findings.length > 0 && (
									<div>
										<span className="text-sm font-medium">Findings</span>
										<div className="mt-2 space-y-2">
											{result.findings.map((f, i) => (
												<div
													key={`finding-${i}`}
													className="p-3 rounded-md border text-sm"
												>
													<p>{f.description}</p>
													{(f.location || f.severity) && (
														<div className="flex gap-2 mt-1 text-xs text-muted-foreground">
															{f.location && (
																<span>Location: {f.location}</span>
															)}
															{f.severity && (
																<span>Severity: {f.severity}</span>
															)}
														</div>
													)}
												</div>
											))}
										</div>
									</div>
								)}

								{result.suggested_diagnoses &&
									result.suggested_diagnoses.length > 0 && (
										<div>
											<span className="text-sm font-medium">
												Suggested Diagnoses
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
											<title>Image</title>
											<rect x="3" y="3" width="18" height="18" rx="2" />
											<circle cx="8.5" cy="8.5" r="1.5" />
											<path d="M21 15l-5-5L5 21" />
										</svg>
									</div>
									<p className="text-sm text-muted-foreground">
										Upload a medical image on the left and click{" "}
										<strong>Analyze Image</strong> to see findings here.
									</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="px-4 py-2 border-t">
				<ApiTopology {...TOPOLOGIES.medical_image} />
			</div>
		</DashboardLayout>
	);
};

export default MedicalImagePage;
