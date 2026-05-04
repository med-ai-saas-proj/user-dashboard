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
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";

interface TranscribeSegment {
	start: number;
	end: number;
	text: string;
	speaker?: string | null;
}

interface TranscribeResponse {
	text: string;
	transcript?: string;
	language?: string;
	duration_seconds?: number;
	duration?: number;
	enhanced?: boolean;
	translation?: string | null;
	segments?: TranscribeSegment[];
}

type StreamEvent =
	| { type: "delta"; text: string }
	| {
			type: "segment";
			start: number;
			end: number;
			text: string;
			speaker?: string | null;
	  }
	| {
			type: "done";
			text: string;
			segments: TranscribeSegment[];
			language: string;
			duration_seconds: number | null;
			model_used: string;
	  }
	| { type: "error"; message: string };

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
	const [recordingDuration, setRecordingDuration] = useState(0);
	const [micPermissionDenied, setMicPermissionDenied] = useState(false);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const recordedChunksRef = useRef<Blob[]>([]);
	const recordedMimeTypeRef = useRef<string>("");
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
		};
	}, []);

	// Only auto-clear the banner when the browser flips permission to
	// granted/prompt (e.g. user allows mic in site settings). We deliberately
	// DO NOT set the banner from the passive Permissions API — its "denied"
	// state can lag behind the actual site setting (esp. after a previous
	// dismissed prompt) which produced false-positive banners. The banner is
	// raised only after a real getUserMedia rejection in handleStartRecording.
	useEffect(() => {
		const perms = (
			navigator as Navigator & {
				permissions?: {
					query: (d: { name: string }) => Promise<{
						state: "granted" | "denied" | "prompt";
						addEventListener?: (t: string, f: () => void) => void;
						removeEventListener?: (t: string, f: () => void) => void;
					}>;
				};
			}
		).permissions;
		if (!perms?.query) return;

		let status: {
			state: string;
			removeEventListener?: (t: string, f: () => void) => void;
		} | null = null;
		let cancelled = false;
		const handler = () => {
			// Clear the banner if the permission becomes granted or prompt.
			// Never raise it here — only handleStartRecording does that.
			if (status && status.state !== "denied") {
				setMicPermissionDenied(false);
			}
		};
		perms
			.query({ name: "microphone" })
			.then((s) => {
				if (cancelled) return;
				status = s;
				if (s.state !== "denied") {
					setMicPermissionDenied(false);
				}
				s.addEventListener?.("change", handler);
			})
			.catch(() => {
				/* Permissions API not supported for "microphone" — fall back
				   to the post-click error path. */
			});
		return () => {
			cancelled = true;
			status?.removeEventListener?.("change", handler);
		};
	}, []);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const f = e.target.files?.[0] ?? null;
		setFile(f);
		setResult(null);
	};

	// Upload an audio blob to the backend and consume its SSE stream.
	// Used by both the file-upload path and the in-browser recording path —
	// recording captures the whole clip and posts it the same way as a file.
	const transcribeBlob = async (blob: Blob, filename: string) => {
		setIsLoading(true);
		setShowSegments(false); // collapse segment list by default — long audio can have 100s
		setResult({
			text: "",
			transcript: "",
			language: language === "auto" ? "" : language,
			segments: [],
		});

		// Coalesce setState across many segment events into one render per
		// animation frame. Without this, an 80-segment file fires ~80 React
		// rerenders within ~100ms and the page goes Unresponsive.
		let accumulatedText = "";
		const accumulatedSegments: TranscribeSegment[] = [];
		let pendingFlush = false;
		let lastTextSnapshot = "";
		let lastSegLen = 0;

		const scheduleFlush = () => {
			if (pendingFlush) return;
			pendingFlush = true;
			requestAnimationFrame(() => {
				pendingFlush = false;
				const textChanged = accumulatedText !== lastTextSnapshot;
				const segChanged = accumulatedSegments.length !== lastSegLen;
				if (!textChanged && !segChanged) return;
				lastTextSnapshot = accumulatedText;
				lastSegLen = accumulatedSegments.length;
				setResult((prev) => ({
					...(prev ?? { text: "", segments: [] }),
					text: accumulatedText,
					transcript: accumulatedText,
					segments: accumulatedSegments.slice(),
				}));
			});
		};

		try {
			const formData = new FormData();
			formData.append("file", blob, filename);
			if (language !== "auto") {
				formData.append("language", language);
			}

			const headers = await getAuthHeaders(
				API_ROUTES.SERVICES.VOICE_TRANSCRIBE_STREAM
			);
			delete headers["Content-Type"];
			const resp = await fetch(API_ROUTES.SERVICES.VOICE_TRANSCRIBE_STREAM, {
				method: "POST",
				headers,
				body: formData,
			});
			if (!resp.ok || !resp.body)
				throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);

			const reader = resp.body.getReader();
			const decoder = new TextDecoder();
			let buffer = "";

			// Parse SSE: events separated by \r\n\r\n or \n\n, each has `data: <payload>`.
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				buffer += decoder.decode(value, { stream: true });

				while (true) {
					const idxRn = buffer.indexOf("\r\n\r\n");
					const idxN = buffer.indexOf("\n\n");
					let sepIdx = -1;
					let sepLen = 0;
					if (idxRn !== -1 && (idxN === -1 || idxRn <= idxN)) {
						sepIdx = idxRn;
						sepLen = 4;
					} else if (idxN !== -1) {
						sepIdx = idxN;
						sepLen = 2;
					} else {
						break;
					}
					const raw = buffer.slice(0, sepIdx);
					buffer = buffer.slice(sepIdx + sepLen);
					const dataLine = raw
						.replace(/\r\n/g, "\n")
						.split("\n")
						.find((l) => l.startsWith("data:"));
					if (!dataLine) continue;
					const payload = dataLine.slice(5).trim();
					if (!payload || payload === "[DONE]") continue;

					let evt: StreamEvent;
					try {
						evt = JSON.parse(payload);
					} catch {
						continue;
					}

					if (evt.type === "delta") {
						accumulatedText += evt.text;
						scheduleFlush();
					} else if (evt.type === "segment") {
						accumulatedSegments.push({
							start: evt.start,
							end: evt.end,
							text: evt.text,
							speaker: evt.speaker,
						});
						// Build accumulatedText from segments when the backend
						// emits segments without per-token deltas (the diarize
						// path does this — segments arrive every few seconds).
						if (!accumulatedText || accumulatedSegments.length === 1) {
							accumulatedText = accumulatedSegments
								.map((s) => s.text)
								.join(" ");
						} else {
							accumulatedText = `${accumulatedText} ${evt.text}`.trim();
						}
						scheduleFlush();
					} else if (evt.type === "done") {
						setResult({
							text: evt.text,
							transcript: evt.text,
							language: evt.language,
							duration_seconds: evt.duration_seconds ?? undefined,
							segments: evt.segments,
						});
						toast.success("Transcription complete");
					} else if (evt.type === "error") {
						throw new Error(evt.message);
					}
				}
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Transcription failed");
		} finally {
			setIsLoading(false);
		}
	};

	const handleTranscribe = async () => {
		if (!file) return;
		await transcribeBlob(file, file.name);
	};

	// Record-then-upload: capture the whole clip in the browser, then on
	// stop, send it as a single file to the same /voice_transcribe/stream
	// endpoint that file uploads use. Simpler than a chunked WebSocket
	// pipeline and gives Azure a complete clip for diarization.
	const startRecording = async () => {
		if (!navigator.mediaDevices?.getUserMedia) {
			toast.error(
				"Your browser does not support microphone access. Please use a modern browser."
			);
			return;
		}

		// Clear the stale banner before the request — getUserMedia will
		// reinstate it via the catch block if access is still denied.
		setMicPermissionDenied(false);

		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
			});

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

			recordedChunksRef.current = [];
			recordedMimeTypeRef.current = mimeType;

			const mediaRecorder = new MediaRecorder(stream, { mimeType });
			mediaRecorderRef.current = mediaRecorder;

			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					recordedChunksRef.current.push(event.data);
				}
			};

			mediaRecorder.onstop = async () => {
				stream.getTracks().forEach((t) => {
					t.stop();
				});
				const chunks = recordedChunksRef.current;
				recordedChunksRef.current = [];
				if (chunks.length === 0) {
					toast.error("No audio captured");
					return;
				}
				const mt = recordedMimeTypeRef.current || mimeType;
				const blob = new Blob(chunks, { type: mt });
				const ext = mt.includes("ogg")
					? "ogg"
					: mt.includes("mp4")
						? "m4a"
						: "webm";
				const filename = `recording-${Date.now()}.${ext}`;
				await transcribeBlob(blob, filename);
			};

			// One single chunk per recording — collect everything, send on stop.
			mediaRecorder.start();
			setIsRecording(true);
			setRecordingDuration(0);
			setResult(null);

			timerRef.current = setInterval(() => {
				setRecordingDuration((d) => d + 1);
			}, 1000);
		} catch (err) {
			if (err instanceof DOMException && err.name === "NotAllowedError") {
				let sitePermission: "granted" | "denied" | "prompt" | "unknown" =
					"unknown";
				try {
					const perms = (
						navigator as Navigator & {
							permissions?: {
								query: (d: { name: string }) => Promise<{
									state: "granted" | "denied" | "prompt";
								}>;
							};
						}
					).permissions;
					const status = await perms?.query({ name: "microphone" });
					if (status) sitePermission = status.state;
				} catch {
					/* ignore */
				}
				const description =
					sitePermission === "granted"
						? "Site permission is allowed — the block is at the OS or audio-stack level. Allow microphone access for your browser in your system settings, then try again."
						: "Allow microphone access for this site in your browser, then try again.";
				toast.error("Microphone access denied", {
					description,
					duration: 10000,
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
			// onstop handler will gather chunks, build a Blob, and upload.
			mediaRecorderRef.current.stop();
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
					via Azure GPT-4o transcribe + diarize. Upload an audio file or record
					from microphone. Supports Vietnamese & English.
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
								<div className="text-xs rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700/50 px-3 py-2 text-amber-900 dark:text-amber-200 space-y-1">
									<p className="font-medium">Microphone access blocked</p>
									<p>
										<strong>1. Site permission:</strong> Click the 🔒 lock icon
										in the address bar → Site settings → Microphone →{" "}
										<strong>Allow</strong>. Then hit <em>Try again</em> below.
									</p>
									<p>
										<strong>2. OS / audio stack:</strong> If the site is already
										allowed, your OS or audio stack is blocking the browser.
										Open your system's microphone settings and grant access to
										your browser, then make sure your input device is unmuted.
									</p>
									<p>
										<strong>Incognito / private windows:</strong> permissions
										are scoped to the incognito session — even if you allowed
										the mic in a regular window, you must allow it again here.
									</p>
									<div className="flex items-center gap-2 pt-1">
										<Button
											type="button"
											variant="outline"
											size="sm"
											className="h-7 text-xs"
											onClick={startRecording}
										>
											Try again
										</Button>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="h-7 text-xs"
											onClick={() => setMicPermissionDenied(false)}
										>
											Dismiss
										</Button>
									</div>
									<p className="text-muted-foreground pt-1">
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
												Records the full clip, then transcribes when you stop.
											</p>
										</>
									)}
								</div>
							</div>

							{/* While the upload is in flight after recording, the
							     standard isLoading button copy + segment stream on the
							     right pane provides the feedback. No live-transcript
							     side panel anymore. */}
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
										{showSegments && (
											<div className="max-h-96 overflow-y-auto space-y-1 pr-2">
												{result.segments.map((seg, i) => (
													<div
														key={`${seg.start}-${i}`}
														className="flex gap-3 text-xs p-2 rounded border"
													>
														<span className="text-muted-foreground font-mono shrink-0">
															{seg.start.toFixed(1)}s{" – "}
															{seg.end.toFixed(1)}s
														</span>
														{seg.speaker && (
															<span className="text-muted-foreground font-mono shrink-0">
																[{seg.speaker}]
															</span>
														)}
														<span>{seg.text}</span>
													</div>
												))}
											</div>
										)}
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
