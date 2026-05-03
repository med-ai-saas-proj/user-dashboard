import { Mic as MicIcon, StopCircle as StopCircleIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
import { useServiceApiKeyStore } from "@/features/api-keys/store/service-api-key.store";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";

interface TranscribeResponse {
	text: string;
	transcript?: string;
	language?: string;
	duration_seconds?: number;
	duration?: number;
	enhanced?: boolean;
	translation?: string | null;
	segments?: { start: number; end: number; text: string }[];
}

const formatDuration = (seconds: number) => {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${s.toString().padStart(2, "0")}`;
};

const VoiceTranscribePage = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const [language, setLanguage] = useState<"auto" | "vi" | "en">("auto");
	const [denoise, setDenoise] = useState(false);
	const [enhance, setEnhance] = useState(true);
	const [translateToEnglish, setTranslateToEnglish] = useState(false);
	const [showSegments, setShowSegments] = useState(false);
	const [result, setResult] = useState<TranscribeResponse | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Real-time state
	const [isRecording, setIsRecording] = useState(false);
	const [liveText, setLiveText] = useState("");
	const [recordingDuration, setRecordingDuration] = useState(0);
	const [micPermissionDenied, setMicPermissionDenied] = useState(false);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const wsRef = useRef<WebSocket | null>(null);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
			if (
				mediaRecorderRef.current &&
				mediaRecorderRef.current.state !== "inactive"
			) {
				mediaRecorderRef.current.stop();
				mediaRecorderRef.current.stream.getTracks().forEach((t) => {
					t.stop();
				});
			}
			if (wsRef.current) {
				wsRef.current.close();
			}
		};
	}, []);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const f = e.target.files?.[0] ?? null;
		setFile(f);
		setResult(null);
	};

	const handleTranscribe = async () => {
		if (!file) return;
		setIsLoading(true);
		setResult(null);

		try {
			const formData = new FormData();
			formData.append("file", file);
			if (language !== "auto") {
				formData.append("language", language);
			}
			formData.append("denoise", denoise ? "true" : "false");
			formData.append("enhance", enhance ? "true" : "false");
			if (translateToEnglish) {
				formData.append("translate_to", "en");
			}

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

	const startRecording = async () => {
		if (!navigator.mediaDevices?.getUserMedia) {
			toast.error(
				"Your browser does not support microphone access. Please use a modern browser."
			);
			return;
		}

		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
			});

			// Determine a supported mimeType
			const preferredTypes = [
				"audio/webm;codecs=opus",
				"audio/webm",
				"audio/ogg;codecs=opus",
				"audio/mp4",
			];
			let mimeType = "";
			for (const t of preferredTypes) {
				if (MediaRecorder.isTypeSupported(t)) {
					mimeType = t;
					break;
				}
			}
			if (!mimeType) {
				toast.error(
					"No supported audio recording format found in this browser."
				);
				stream.getTracks().forEach((t) => {
					t.stop();
				});
				return;
			}

			const mediaRecorder = new MediaRecorder(stream, { mimeType });
			mediaRecorderRef.current = mediaRecorder;

			// Open WebSocket — browsers cannot set headers on `new WebSocket(...)`,
			// so we pass the API key and language as query parameters.
			const apiKey = useServiceApiKeyStore.getState().selectedApiKey;
			const params = new URLSearchParams();
			if (apiKey) params.set("api_key", apiKey);
			if (language !== "auto") params.set("language", language);
			const wsUrl =
				API_ROUTES.SERVICES.VOICE_TRANSCRIBE_WS +
				(params.toString() ? `?${params.toString()}` : "");
			const ws = new WebSocket(wsUrl);
			wsRef.current = ws;

			ws.onmessage = (event) => {
				try {
					const msg = JSON.parse(event.data);
					if (msg.type === "partial" || msg.type === "final") {
						setLiveText(msg.text);
					}
					if (msg.type === "final") {
						setResult({
							text: msg.text,
							language: msg.language,
							duration: msg.duration,
						});
						stopRecording();
					}
					if (msg.type === "error") {
						toast.error(msg.text || "Transcription error");
					}
				} catch {
					// Non-JSON message, ignore
				}
			};

			ws.onerror = () => {
				toast.error("WebSocket connection error");
				stopRecording();
			};

			ws.onclose = () => {
				// If still recording when ws closes unexpectedly, stop
				if (mediaRecorderRef.current?.state === "recording") {
					stopRecording();
				}
			};

			ws.onopen = () => {
				mediaRecorder.start(2000); // Get chunks every 2 seconds
				setIsRecording(true);
				setLiveText("");
				setRecordingDuration(0);
				setResult(null);

				// Duration timer
				timerRef.current = setInterval(() => {
					setRecordingDuration((d) => d + 1);
				}, 1000);
			};

			mediaRecorder.ondataavailable = async (event) => {
				if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
					const arrayBuffer = await event.data.arrayBuffer();
					const bytes = new Uint8Array(arrayBuffer);
					let binary = "";
					for (let i = 0; i < bytes.length; i++) {
						binary += String.fromCharCode(bytes[i]);
					}
					const base64 = btoa(binary);
					ws.send(
						JSON.stringify({
							audio: base64,
							format: mimeType.split(";")[0],
							final: false,
						})
					);
				}
			};
		} catch (err) {
			if (err instanceof DOMException && err.name === "NotAllowedError") {
				const isChrome = /Chrome\//.test(navigator.userAgent);
				const isFirefox = /Firefox\//.test(navigator.userAgent);
				const browserHint = isChrome
					? "Click the 🎤 icon in the address bar → Always allow"
					: isFirefox
						? "Click the 🎤 icon in the address bar → Allow → Remember"
						: "Open site settings and allow microphone access";
				toast.error("Microphone access denied", {
					description: browserHint,
					duration: 8000,
				});
				setMicPermissionDenied(true);
			} else if (err instanceof DOMException && err.name === "NotFoundError") {
				toast.error("No microphone detected", {
					description:
						"Connect a microphone or check your system audio settings.",
					duration: 6000,
				});
			} else {
				toast.error(
					err instanceof Error ? err.message : "Failed to start recording"
				);
			}
		}
	};

	const stopRecording = () => {
		if (
			mediaRecorderRef.current &&
			mediaRecorderRef.current.state !== "inactive"
		) {
			mediaRecorderRef.current.stop();
			mediaRecorderRef.current.stream.getTracks().forEach((t) => {
				t.stop();
			});
		}

		// Send final signal
		if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
			wsRef.current.send(JSON.stringify({ audio: "", final: true }));
			// Don't close immediately - wait for final response
			const currentWs = wsRef.current;
			setTimeout(() => {
				if (currentWs.readyState === WebSocket.OPEN) {
					currentWs.close();
				}
			}, 5000);
		}

		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
		setIsRecording(false);
	};

	return (
		<DashboardLayout pageTitle="Voice Transcribe">
			<DemoPageShell>
				<DemoPageDescription>
					VAD-based speech-to-text with automatic punctuation/case enhancement
					via local Qwen LLM. Upload audio files or record live from microphone.
					Supports Vietnamese & English.
				</DemoPageDescription>
				<DemoToolbar
					start={
						<div className="flex items-center gap-4 flex-wrap">
							<div className="flex items-center gap-2">
								<label
									htmlFor="vt-lang"
									className="text-xs text-muted-foreground"
								>
									Language
								</label>
								<select
									id="vt-lang"
									value={language}
									onChange={(e) =>
										setLanguage(e.target.value as "auto" | "vi" | "en")
									}
									className="rounded-md border px-2 py-1 text-xs bg-background"
								>
									<option value="auto">Auto-detect</option>
									<option value="vi">Vietnamese</option>
									<option value="en">English</option>
								</select>
							</div>
							<label
								htmlFor="vt-denoise"
								className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer"
							>
								<input
									id="vt-denoise"
									type="checkbox"
									checked={denoise}
									onChange={(e) => setDenoise(e.target.checked)}
								/>
								Denoise
							</label>
							<label
								htmlFor="vt-enhance"
								className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer"
							>
								<input
									id="vt-enhance"
									type="checkbox"
									checked={enhance}
									onChange={(e) => setEnhance(e.target.checked)}
								/>
								Enhance with LLM
							</label>
							<label
								htmlFor="vt-translate"
								className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer"
							>
								<input
									id="vt-translate"
									type="checkbox"
									checked={translateToEnglish}
									onChange={(e) => setTranslateToEnglish(e.target.checked)}
								/>
								Translate to English
							</label>
						</div>
					}
					end={
						<ViewCodeDialog
							endpoint={API_ROUTES.SERVICES.VOICE_TRANSCRIBE}
							method="POST"
							contentType="multipart/form-data"
							description="Transcribe audio file to text"
						/>
					}
				/>
				<DemoSplitLayout
					left={
						<div className="flex flex-col overflow-hidden p-4 space-y-4 overflow-y-auto h-full">
							{/* File Upload Section */}
							<span className="text-sm font-medium">Upload Audio File</span>
							<button
								type="button"
								className="w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
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
									width="32"
									height="32"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									className="mx-auto text-muted-foreground mb-2"
									aria-hidden="true"
								>
									<title>Upload audio</title>
									<path d="M16 4v16M10 12l6-6 6 6" />
									<path d="M4 24h24" />
								</svg>
								{file ? (
									<p className="text-sm font-medium">{file.name}</p>
								) : (
									<p className="text-sm text-muted-foreground">
										Click to select an audio file
									</p>
								)}
								<p className="text-xs text-muted-foreground mt-1">
									WAV, MP3, M4A, FLAC, OGG
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

							{/* OR Divider */}
							<div className="flex items-center gap-3 py-1">
								<div className="flex-1 h-px bg-border" />
								<span className="text-xs text-muted-foreground font-medium">
									OR
								</span>
								<div className="flex-1 h-px bg-border" />
							</div>

							{/* Real-time Recording Section */}
							<span className="text-sm font-medium">Real-Time Transcribe</span>
							{micPermissionDenied && (
								<div className="text-xs rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700/50 px-3 py-2 text-amber-900 dark:text-amber-200">
									<p className="font-medium">Microphone access blocked</p>
									<p className="mt-0.5">
										Click the 🎤 icon in your browser's address bar and choose
										<strong> Always allow</strong>. Then click record again.
										Audio file upload above still works without microphone
										permission.
									</p>
								</div>
							)}
							<div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/20">
								<button
									type="button"
									onClick={isRecording ? stopRecording : startRecording}
									disabled={isLoading}
									className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center transition-all ${
										isRecording
											? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
											: "bg-primary hover:bg-primary/90 text-primary-foreground"
									}`}
								>
									{isRecording ? (
										<StopCircleIcon className="w-6 h-6" />
									) : (
										<MicIcon className="w-6 h-6" />
									)}
								</button>
								<div className="flex-1 min-w-0">
									{isRecording ? (
										<>
											<div className="flex items-center gap-2 text-sm text-red-500 font-medium">
												<span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
												Recording — {formatDuration(recordingDuration)}
											</div>
											<p className="text-xs text-muted-foreground mt-1">
												Click the stop button when done
											</p>
										</>
									) : (
										<>
											<p className="text-sm text-foreground">
												Click to start recording
											</p>
											<p className="text-xs text-muted-foreground mt-0.5">
												Transcribes speech in real-time via microphone
											</p>
										</>
									)}
								</div>
							</div>

							{/* Live transcript (shown inline when recording) */}
							{liveText && (
								<div className="p-3 rounded-lg border bg-muted/30">
									<span className="text-xs font-medium text-muted-foreground block mb-1">
										{isRecording ? "Live Transcript" : "Final Transcript"}
									</span>
									<p className="text-sm whitespace-pre-wrap leading-relaxed">
										{liveText}
									</p>
								</div>
							)}
						</div>
					}
					right={
						result ? (
							<div className="flex-1 overflow-y-auto p-4 space-y-4">
								<div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
									{result.language && <span>Language: {result.language}</span>}
									{(() => {
										const dur = result.duration_seconds ?? result.duration;
										return dur != null ? (
											<span>Duration: {dur.toFixed(1)}s</span>
										) : null;
									})()}
									{result.enhanced && (
										<span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
											LLM-enhanced
										</span>
									)}
									{result.segments && result.segments.length > 0 && (
										<span className="text-xs">
											{result.segments.length} segment
											{result.segments.length === 1 ? "" : "s"}
										</span>
									)}
								</div>
								<div className="p-4 rounded-md border bg-muted/30">
									<span className="text-xs font-medium text-muted-foreground block mb-2">
										Transcription
									</span>
									<p className="text-sm whitespace-pre-wrap leading-relaxed">
										{result.transcript || result.text}
									</p>
								</div>
								{result.translation && (
									<div className="p-4 rounded-md border bg-muted/20">
										<span className="text-xs font-medium text-muted-foreground block mb-2">
											Translation (English)
										</span>
										<p className="text-sm whitespace-pre-wrap leading-relaxed">
											{result.translation}
										</p>
									</div>
								)}
								{result.segments && result.segments.length > 0 && (
									<div className="space-y-1">
										<button
											type="button"
											onClick={() => setShowSegments((s) => !s)}
											className="text-xs font-medium text-muted-foreground hover:text-foreground"
										>
											{showSegments ? "▼" : "▶"} Segments (
											{result.segments.length})
										</button>
										{showSegments &&
											result.segments.map((seg, i) => (
												<div
													key={`${seg.start}-${i}`}
													className="flex gap-3 text-xs p-2 rounded border"
												>
													<span className="text-muted-foreground font-mono shrink-0">
														{seg.start.toFixed(1)}s{" – "}
														{seg.end.toFixed(1)}s
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
										navigator.clipboard.writeText(
											result.transcript || result.text
										);
										toast.success("Copied to clipboard");
									}}
								>
									Copy Text
								</Button>
								<div className="mt-4">
									<RawResponseViewer data={result} />
								</div>
							</div>
						) : (
							<DemoEmptyState
								icon={MicIcon}
								description={
									<>
										Upload an audio file or use the microphone on the left, then
										click <strong>Transcribe</strong> to see the text here.
									</>
								}
							/>
						)
					}
				/>
			</DemoPageShell>

			<div className="px-4 py-1.5 border-t bg-muted/10 text-[10px] text-muted-foreground text-center">
				Powered by Cohere Aya / Whisper-Large
			</div>
			<div className="px-4 py-2 border-t">
				<ApiTopology {...TOPOLOGIES.voice_transcribe} />
			</div>
		</DashboardLayout>
	);
};

export default VoiceTranscribePage;
