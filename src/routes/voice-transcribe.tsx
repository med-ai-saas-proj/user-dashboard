import { useState, useRef } from "react";
import { API_ROUTES } from "@/config/api-routes";
import { ApiKeyRequiredDialog } from "@/features/api-keys/components/api-key-required-dialog";
import { useServiceApiKeyStore } from "@/features/api-keys/store/service-api-key.store";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";
import { toast } from "sonner";
import { Button } from "@/components/shadcn/button";

interface TranscribeResponse {
	text: string;
	language?: string;
	duration?: number;
	segments?: { start: number; end: number; text: string }[];
}

const VoiceTranscribePage = () => {
	const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
	const { selectedApiKey } = useServiceApiKeyStore();
	const [isLoading, setIsLoading] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const [result, setResult] = useState<TranscribeResponse | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const requireApiKey = (): boolean => {
		if (!selectedApiKey) {
			setShowApiKeyDialog(true);
			return false;
		}
		return true;
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const f = e.target.files?.[0] ?? null;
		setFile(f);
		setResult(null);
	};

	const handleTranscribe = async () => {
		if (!requireApiKey() || !file) return;
		setIsLoading(true);
		setResult(null);

		try {
			const formData = new FormData();
			formData.append("file", file);

			const headers = await getAuthHeaders(
				API_ROUTES.SERVICES.VOICE_TRANSCRIBE
			);
			delete headers["Content-Type"];
			const resp = await fetch(API_ROUTES.SERVICES.VOICE_TRANSCRIBE, {
				method: "POST",
				headers,
				body: formData,
			});
			if (!resp.ok)
				throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
			const json: TranscribeResponse = await resp.json();
			setResult(json);
			toast.success("Transcription complete");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Transcription failed");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<DashboardLayout pageTitle="Voice Transcribe">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				<div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden border-b">
					{/* Left: Upload */}
					<div className="border-r flex flex-col overflow-hidden p-4 space-y-4">
						<span className="text-sm font-medium">Upload Audio File</span>
						<button
							type="button"
							className="w-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
							onClick={() => fileInputRef.current?.click()}
						>
							<input
								ref={fileInputRef}
								type="file"
								accept="audio/*"
								onChange={handleFileChange}
								className="hidden"
							/>
							<svg
								width="40"
								height="40"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className="mx-auto text-muted-foreground mb-3"
								aria-hidden="true"
							>
								<title>Upload audio</title>
								<path d="M20 6v20M12 14l8-8 8 8" />
								<path d="M6 30h28" />
							</svg>
							{file ? (
								<p className="text-sm font-medium">{file.name}</p>
							) : (
								<p className="text-sm text-muted-foreground">
									Click to select an audio file
								</p>
							)}
							<p className="text-xs text-muted-foreground mt-1">
								Supports WAV, MP3, M4A, FLAC, OGG
							</p>
						</button>
						{file && (
							<div className="text-xs text-muted-foreground">
								Size: {(file.size / 1024 / 1024).toFixed(2)} MB
							</div>
						)}
						<Button
							type="button"
							onClick={handleTranscribe}
							disabled={isLoading || !file}
						>
							{isLoading ? "Transcribing..." : "Transcribe"}
						</Button>
					</div>

					{/* Right: Result */}
					<div className="flex flex-col overflow-hidden">
						{result ? (
							<div className="flex-1 overflow-y-auto p-4 space-y-4">
								<div className="flex items-center gap-3 text-sm text-muted-foreground">
									{result.language && <span>Language: {result.language}</span>}
									{result.duration != null && (
										<span>Duration: {result.duration.toFixed(1)}s</span>
									)}
								</div>
								<div className="p-4 rounded-md border bg-muted/30">
									<span className="text-xs font-medium text-muted-foreground block mb-2">
										Transcription
									</span>
									<p className="text-sm whitespace-pre-wrap leading-relaxed">
										{result.text}
									</p>
								</div>
								{result.segments && result.segments.length > 0 && (
									<div className="space-y-1">
										<span className="text-xs font-medium text-muted-foreground">
											Segments
										</span>
										{result.segments.map((seg, i) => (
											<div
												key={`${seg.start}-${i}`}
												className="flex gap-3 text-xs p-2 rounded border"
											>
												<span className="text-muted-foreground font-mono shrink-0">
													{seg.start.toFixed(1)}s – {seg.end.toFixed(1)}s
												</span>
												<span>{seg.text}</span>
											</div>
										))}
									</div>
								)}
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => {
										navigator.clipboard.writeText(result.text);
										toast.success("Copied to clipboard");
									}}
								>
									Copy Text
								</Button>
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
											<title>Microphone</title>
											<rect x="9" y="2" width="6" height="12" rx="3" />
											<path d="M5 10a7 7 0 0014 0M12 18v4m-4 0h8" />
										</svg>
									</div>
									<p className="text-sm text-muted-foreground">
										Upload an audio file on the left and click{" "}
										<strong>Transcribe</strong> to see the text here.
									</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			<ApiKeyRequiredDialog
				open={showApiKeyDialog}
				onOpenChange={setShowApiKeyDialog}
			/>
		</DashboardLayout>
	);
};

export default VoiceTranscribePage;
