// Voice Transcribe page — speech-to-text only.
//
// Two sub-modes:
//   - Dictation:    record → stop → upload to POST /transcribe → see full text
//   - Live captions: stream PCM frames over WS /ws/transcribe and append each
//                    detected utterance as a new caption line
//
// Both reuse the same offline Vietnamese Zipformer ASR that powers Voice Agent,
// but neither talks to the LLM. Output is pure transcript text.

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { DemoEmptyState, DemoPageDescription } from "@/components/demo";
import { Button } from "@/components/shadcn/button";
import { ViewCodeDialog } from "@/components/view-code-dialog";
import { API_ROUTES } from "@/config/api-routes";
import DashboardLayout from "@/layouts/dashboard-layout";

type Mode = "dictation" | "live";
type ConnState = "idle" | "connecting" | "connected" | "closed" | "error";
// Engine choice for the dictation upload. v1 = raw Zipformer (fast, ALL CAPS,
// no punctuation). v2 = full industrial pipeline (denoise + Azure
// gpt-4o-transcribe with Zipformer fallback + LLM post-edit) — slower but
// cleaner output with diarization and per-turn segmentation.
type Engine = "v1" | "v2";

interface CaptionLine {
	id: string;
	text: string;
	at: number;
}

interface V2Turn {
	speaker: string;
	start: number;
	end: number;
	raw: string;
	text: string;
	edited: boolean;
	engine: string;
	confidence: number | null;
}

interface V2Meta {
	duration_s: number;
	language: string;
	denoised: boolean;
	diarizer: string;
	asr_engines_used: string[];
	post_edit_applied: boolean;
	hotwords_count: number;
	elapsed_s: number;
}

const VoiceTranscribePage = () => {
	const [mode, setMode] = useState<Mode>("dictation");

	// Dictation state.
	const [isRecording, setIsRecording] = useState(false);
	const [isTranscribing, setIsTranscribing] = useState(false);
	// uploadPct is a real percentage during the upload phase (XHR `progress`
	// event), then null once the bytes are in flight and we're waiting on the
	// server. The progress bar switches to an indeterminate state at that
	// point — server-side ASR has no incremental progress events today.
	const [uploadPct, setUploadPct] = useState<number | null>(null);
	const [transcribeElapsed, setTranscribeElapsed] = useState(0);
	const [dictationText, setDictationText] = useState("");
	const [dictationDuration, setDictationDuration] = useState<number | null>(
		null
	);
	// A/B engine state. Defaults to v2 — v1 stays available for speed.
	const [engine, setEngine] = useState<Engine>("v2");
	const [v2Turns, setV2Turns] = useState<V2Turn[] | null>(null);
	const [v2Meta, setV2Meta] = useState<V2Meta | null>(null);
	// Dictation no longer uses MediaRecorder — that path produces webm/opus,
	// which ships broken cluster indices on some browsers and forces the
	// server to ffmpeg-decode every upload. Instead, we capture raw PCM
	// directly via AudioContext + the existing /worklets/pcm-worklet.js
	// (already used by live captions), collect the 16-kHz int16 frames
	// in memory, and wrap them as a 16-bit mono WAV at stop time.
	const dictationCtxRef = useRef<AudioContext | null>(null);
	const dictationSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
	const dictationWorkletRef = useRef<AudioWorkletNode | null>(null);
	const dictationStreamRef = useRef<MediaStream | null>(null);
	const dictationFramesRef = useRef<Int16Array[]>([]);
	const recordStartRef = useRef<number>(0);
	const [recordElapsed, setRecordElapsed] = useState(0);

	// Live captions state.
	const [connState, setConnState] = useState<ConnState>("idle");
	const [isLiveMicOn, setIsLiveMicOn] = useState(false);
	const [captions, setCaptions] = useState<CaptionLine[]>([]);
	const wsRef = useRef<WebSocket | null>(null);
	const audioCtxRef = useRef<AudioContext | null>(null);
	const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
	const workletNodeRef = useRef<AudioWorkletNode | null>(null);
	const liveStreamRef = useRef<MediaStream | null>(null);

	// ---------------- Dictation mode ----------------

	const startDictation = useCallback(async () => {
		try {
			// We leave Chrome's voice-tuning chain ON for dictation: echo
			// cancellation and noise suppression dramatically improve gpt-4o-
			// transcribe accuracy on real-world phone audio, and they don't
			// hurt Zipformer at conversational volume. Auto-gain stays on too
			// — quiet clinical recordings were the #1 cause of the empty/
			// English-hallucinated transcripts we saw earlier.
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: true,
					noiseSuppression: true,
					autoGainControl: true,
				},
			});
			dictationStreamRef.current = stream;
			dictationFramesRef.current = [];

			const ctx = new AudioContext();
			dictationCtxRef.current = ctx;
			await ctx.audioWorklet.addModule("/worklets/pcm-worklet.js");
			const source = ctx.createMediaStreamSource(stream);
			dictationSourceRef.current = source;
			const node = new AudioWorkletNode(ctx, "pcm-worklet", {
				processorOptions: { targetRate: 16000 },
			});
			dictationWorkletRef.current = node;
			// The worklet posts an ArrayBuffer of int16 PCM every 30 ms.
			// Copy into a fresh Int16Array so the underlying ArrayBuffer can
			// be reused by the worklet (we receive a transferred reference).
			node.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
				dictationFramesRef.current.push(new Int16Array(e.data));
			};
			source.connect(node);

			recordStartRef.current = Date.now();
			setRecordElapsed(0);
			setIsRecording(true);
			setDictationText("");
			setDictationDuration(null);
		} catch (err) {
			toast.error(`Microphone error: ${String(err)}`);
		}
	}, []);

	// Upload a Blob (from a live recording) or a File (from a file picker) to
	// the /transcribe endpoint and stash the result. We use XHR instead of
	// fetch because fetch has no upload-progress event — the user needs a real
	// percentage for large audio files. After upload completes the server
	// runs ASR on the audio, reported as an indeterminate "Transcribing…"
	// state. Engine selection (`v1` = fast Zipformer, `v2` = industrial
	// pipeline) chooses the target endpoint + form fields.
	const sendForTranscription = useCallback(
		(blob: Blob | File, filename: string) =>
			new Promise<void>((resolve) => {
				if (blob.size === 0) {
					toast.error("Empty audio");
					resolve();
					return;
				}
				setIsTranscribing(true);
				setUploadPct(0);
				setTranscribeElapsed(0);
				setDictationText("");
				setDictationDuration(null);
				setV2Turns(null);
				setV2Meta(null);

				const isV2 = engine === "v2";
				const url = isV2
					? API_ROUTES.SERVICES.VOICE_TRANSCRIBE_UPLOAD_V2
					: API_ROUTES.SERVICES.VOICE_TRANSCRIBE_UPLOAD;

				const fd = new FormData();
				fd.append("file", blob, filename);
				if (isV2) {
					// Reasonable defaults: Azure diarization on by default since the
					// dashboard usually receives multi-speaker consult recordings;
					// post-edit + denoise on. A future PR can expose these.
					fd.append("diarize", "azure");
					fd.append("denoise", "true");
					fd.append("post_edit", "true");
					fd.append(
						"hotwords",
						"đục thủy tinh thể,phẫu thuật phaco,IOL Master,thị lực,viễn thị,lão thị,tăng huyết áp"
					);
				}

				const xhr = new XMLHttpRequest();
				xhr.open("POST", url, true);
				xhr.responseType = "text";

				xhr.upload.onprogress = (e) => {
					if (e.lengthComputable) {
						setUploadPct(Math.min(99, Math.round((e.loaded / e.total) * 100)));
					}
				};
				xhr.upload.onload = () => {
					// Bytes are in flight — flip to indeterminate.
					setUploadPct(null);
				};
				xhr.onerror = () => {
					toast.error("Transcribe error: network failure");
					setIsTranscribing(false);
					setUploadPct(null);
					resolve();
				};
				xhr.onabort = () => {
					setIsTranscribing(false);
					setUploadPct(null);
					resolve();
				};
				xhr.onload = () => {
					setUploadPct(null);
					if (xhr.status < 200 || xhr.status >= 300) {
						toast.error(
							`Transcribe failed: ${xhr.status} ${(xhr.responseText || "").slice(0, 200)}`
						);
						setIsTranscribing(false);
						resolve();
						return;
					}
					try {
						const j = JSON.parse(xhr.responseText) as
							| {
									success: boolean;
									text: string;
									duration_seconds: number;
							  }
							| {
									success: boolean;
									text: string;
									turns: V2Turn[];
									meta: V2Meta;
							  };
						setDictationText(j.text || "");
						if ("meta" in j && j.meta) {
							setV2Meta(j.meta);
							setV2Turns(j.turns ?? []);
							setDictationDuration(j.meta.duration_s);
						} else if ("duration_seconds" in j) {
							setDictationDuration(j.duration_seconds);
						}
					} catch (err) {
						toast.error(`Transcribe error: ${String(err)}`);
					} finally {
						setIsTranscribing(false);
						resolve();
					}
				};
				xhr.send(fd);
			}),
		[engine]
	);

	const stopDictation = useCallback(async () => {
		setIsRecording(false);

		// Tear down the audio graph FIRST so no more frames arrive while we
		// concatenate. We deliberately don't await ctx.close() — it's slow
		// and we don't need it to finish before building the WAV.
		try {
			dictationWorkletRef.current?.disconnect();
		} catch {}
		try {
			dictationSourceRef.current?.disconnect();
		} catch {}
		dictationStreamRef.current?.getTracks().forEach((t) => {
			t.stop();
		});
		const ctxToClose = dictationCtxRef.current;
		dictationWorkletRef.current = null;
		dictationSourceRef.current = null;
		dictationStreamRef.current = null;
		dictationCtxRef.current = null;
		if (ctxToClose && ctxToClose.state !== "closed") {
			ctxToClose.close().catch(() => {});
		}

		// Build a 16 kHz mono 16-bit PCM WAV from the collected frames.
		const frames = dictationFramesRef.current;
		dictationFramesRef.current = [];
		const totalSamples = frames.reduce((n, f) => n + f.length, 0);
		if (totalSamples === 0) {
			toast.error("No audio captured — check the microphone permission.");
			return;
		}
		const bytesPerSample = 2;
		const dataBytes = totalSamples * bytesPerSample;
		const wav = new ArrayBuffer(44 + dataBytes);
		const dv = new DataView(wav);
		// RIFF header
		const writeString = (offset: number, s: string) => {
			for (let i = 0; i < s.length; i++)
				dv.setUint8(offset + i, s.charCodeAt(i));
		};
		writeString(0, "RIFF");
		dv.setUint32(4, 36 + dataBytes, true);
		writeString(8, "WAVE");
		writeString(12, "fmt ");
		dv.setUint32(16, 16, true); // PCM chunk size
		dv.setUint16(20, 1, true); // PCM
		dv.setUint16(22, 1, true); // mono
		dv.setUint32(24, 16000, true); // sample rate
		dv.setUint32(28, 16000 * bytesPerSample, true); // byte rate
		dv.setUint16(32, bytesPerSample, true); // block align
		dv.setUint16(34, 16, true); // bits per sample
		writeString(36, "data");
		dv.setUint32(40, dataBytes, true);
		// Copy frame data.
		let offset = 44;
		for (const frame of frames) {
			const view = new Int16Array(wav, offset, frame.length);
			view.set(frame);
			offset += frame.length * bytesPerSample;
		}
		const blob = new Blob([wav], { type: "audio/wav" });
		await sendForTranscription(blob, "dictation.wav");
	}, [sendForTranscription]);

	const handleFileUpload = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			// Allow re-selecting the same file on a subsequent click.
			e.target.value = "";
			if (!file) return;
			await sendForTranscription(file, file.name);
		},
		[sendForTranscription]
	);

	// Update the elapsed-time counter while recording.
	useEffect(() => {
		if (!isRecording) return;
		const id = window.setInterval(() => {
			setRecordElapsed((Date.now() - recordStartRef.current) / 1000);
		}, 200);
		return () => window.clearInterval(id);
	}, [isRecording]);

	// While the upload+ASR round-trip is in flight, tick an elapsed counter so
	// the user can see something is happening during the indeterminate phase.
	useEffect(() => {
		if (!isTranscribing) return;
		const start = Date.now();
		setTranscribeElapsed(0);
		const id = window.setInterval(() => {
			setTranscribeElapsed((Date.now() - start) / 1000);
		}, 200);
		return () => window.clearInterval(id);
	}, [isTranscribing]);

	const copyDictation = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(dictationText);
			toast.success("Copied to clipboard");
		} catch {
			toast.error("Clipboard not available");
		}
	}, [dictationText]);

	// ---------------- Live captions mode ----------------

	const teardownLive = useCallback(() => {
		try {
			workletNodeRef.current?.disconnect();
		} catch {}
		try {
			sourceNodeRef.current?.disconnect();
		} catch {}
		liveStreamRef.current?.getTracks().forEach((t) => {
			t.stop();
		});
		workletNodeRef.current = null;
		sourceNodeRef.current = null;
		liveStreamRef.current = null;
		if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
			audioCtxRef.current.close().catch(() => {});
		}
		audioCtxRef.current = null;
		setIsLiveMicOn(false);
	}, []);

	const connectLive = useCallback(async () => {
		if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;
		setConnState("connecting");
		const ws = new WebSocket(API_ROUTES.SERVICES.VOICE_TRANSCRIBE_WS);
		ws.binaryType = "arraybuffer";
		wsRef.current = ws;
		ws.onopen = () => {
			setConnState("connected");
			toast.success("Transcribe stream connected");
		};
		ws.onmessage = (e) => {
			if (typeof e.data !== "string") return;
			try {
				const evt = JSON.parse(e.data) as { type: string; text?: string };
				if (evt.type === "final_transcript" && evt.text) {
					const text = evt.text;
					setCaptions((prev) => [
						...prev,
						{ id: `c-${Date.now()}-${prev.length}`, text, at: Date.now() },
					]);
				}
			} catch {}
		};
		ws.onerror = () => setConnState("error");
		ws.onclose = () => setConnState("closed");
	}, []);

	const disconnectLive = useCallback(() => {
		try {
			wsRef.current?.send(JSON.stringify({ type: "stop" }));
		} catch {}
		wsRef.current?.close();
		wsRef.current = null;
		teardownLive();
		setConnState("idle");
	}, [teardownLive]);

	const startLiveMic = useCallback(async () => {
		if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
			toast.error("Not connected");
			return;
		}
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			liveStreamRef.current = stream;
			const ctx = new AudioContext();
			audioCtxRef.current = ctx;
			await ctx.audioWorklet.addModule("/worklets/pcm-worklet.js");
			const source = ctx.createMediaStreamSource(stream);
			sourceNodeRef.current = source;
			const node = new AudioWorkletNode(ctx, "pcm-worklet", {
				processorOptions: { targetRate: 16000 },
			});
			workletNodeRef.current = node;
			node.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
				const ws = wsRef.current;
				if (ws && ws.readyState === WebSocket.OPEN) ws.send(e.data);
			};
			source.connect(node);
			setIsLiveMicOn(true);
		} catch (err) {
			toast.error(`Microphone error: ${String(err)}`);
		}
	}, []);

	const stopLiveMic = useCallback(() => {
		teardownLive();
	}, [teardownLive]);

	const clearCaptions = useCallback(() => setCaptions([]), []);

	// Tear down both modes' audio resources on unmount. We don't await the
	// AudioContext close because component teardown runs synchronously.
	const teardownDictation = useCallback(() => {
		try {
			dictationWorkletRef.current?.disconnect();
		} catch {}
		try {
			dictationSourceRef.current?.disconnect();
		} catch {}
		dictationStreamRef.current?.getTracks().forEach((t) => {
			t.stop();
		});
		if (dictationCtxRef.current && dictationCtxRef.current.state !== "closed") {
			dictationCtxRef.current.close().catch(() => {});
		}
		dictationWorkletRef.current = null;
		dictationSourceRef.current = null;
		dictationStreamRef.current = null;
		dictationCtxRef.current = null;
	}, []);

	useEffect(() => {
		return () => {
			try {
				wsRef.current?.close();
			} catch {}
			wsRef.current = null;
			teardownLive();
			teardownDictation();
		};
	}, [teardownLive, teardownDictation]);

	// Switching mode silences any active capture/recording from the other mode.
	const switchMode = useCallback(
		(next: Mode) => {
			if (next === mode) return;
			if (mode === "dictation" && isRecording) {
				teardownDictation();
				setIsRecording(false);
			}
			if (mode === "live") {
				disconnectLive();
			}
			setMode(next);
		},
		[mode, isRecording, disconnectLive, teardownDictation]
	);

	return (
		<DashboardLayout>
			<div className="flex flex-col h-[calc(100vh-3.5rem)]">
				<div className="flex items-start justify-between gap-4 px-4 pt-2">
					<DemoPageDescription>
						Speech-to-text only — offline Vietnamese Zipformer ASR, no LLM, no
						agent. Choose <strong>Dictation</strong> to record a clip and get
						the full transcript, or <strong>Live captions</strong> to stream PCM
						frames and see captions appear utterance by utterance.
					</DemoPageDescription>
					<ViewCodeDialog
						endpoint={API_ROUTES.SERVICES.VOICE_TRANSCRIBE_UPLOAD}
						method="POST"
						contentType="multipart/form-data"
						description="Dictation — upload an audio file (WAV, MP3, M4A, MP4, WebM, etc.), get the full Vietnamese transcript back. For live captions, open a WebSocket to /ws/transcribe and stream 16 kHz int16 mono PCM frames."
					/>
				</div>

				<div className="px-4 pb-2 flex items-center gap-3 border-b">
					<span className="text-xs font-medium text-muted-foreground">
						Mode:
					</span>
					<label className="flex items-center gap-1 text-[12px]">
						<input
							type="radio"
							name="transcribe-mode"
							checked={mode === "dictation"}
							onChange={() => switchMode("dictation")}
						/>
						Dictation (record then transcribe)
					</label>
					<label className="flex items-center gap-1 text-[12px]">
						<input
							type="radio"
							name="transcribe-mode"
							checked={mode === "live"}
							onChange={() => switchMode("live")}
						/>
						Live captions (streaming)
					</label>
				</div>

				{mode === "dictation" ? (
					<div className="flex-1 overflow-auto p-4 space-y-3">
						<div className="flex items-center gap-2">
							{!isRecording ? (
								<Button
									size="sm"
									className="h-8 text-xs"
									onClick={startDictation}
									disabled={isTranscribing}
								>
									Start recording
								</Button>
							) : (
								<Button
									size="sm"
									variant="destructive"
									className="h-8 text-xs"
									onClick={stopDictation}
								>
									Stop & transcribe
								</Button>
							)}
							{!isRecording && (
								<>
									<span className="text-[11px] text-muted-foreground">or</span>
									<label className="inline-flex">
										<input
											type="file"
											accept="audio/*,video/webm,video/mp4"
											className="hidden"
											onChange={handleFileUpload}
											disabled={isTranscribing}
										/>
										<span
											className={`inline-flex items-center h-8 px-3 text-xs rounded-md border bg-background hover:bg-accent transition-colors ${
												isTranscribing
													? "opacity-50 cursor-not-allowed"
													: "cursor-pointer"
											}`}
										>
											Upload audio file
										</span>
									</label>
								</>
							)}
							{isRecording && (
								<span className="text-[12px] text-amber-700 dark:text-amber-300">
									• Recording {recordElapsed.toFixed(1)}s
								</span>
							)}
							{dictationText && (
								<Button
									size="sm"
									variant="ghost"
									className="h-8 text-xs ml-auto"
									onClick={copyDictation}
								>
									Copy
								</Button>
							)}
						</div>

						{/* Engine A/B selector. v1 is the legacy Zipformer-only path
						    (fast, ALL CAPS, no punctuation). v2 is the industrial
						    pipeline (denoise + diarize + cascade + LLM post-edit) —
						    slower but produces a punctuated, per-speaker transcript. */}
						<div className="flex items-center gap-2 flex-wrap">
							<span className="text-[11px] font-medium text-muted-foreground">
								Engine:
							</span>
							<div
								className="inline-flex rounded-md border bg-background p-0.5"
								role="radiogroup"
								aria-label="Transcription engine"
							>
								{(["v1", "v2"] as const).map((opt) => {
									const checked = engine === opt;
									const disabled = isTranscribing || isRecording;
									const label = opt === "v1" ? "v1 · fast" : "v2 · clean";
									return (
										<label
											key={opt}
											className={`h-7 px-3 text-[11px] rounded transition-colors inline-flex items-center select-none ${
												checked
													? "bg-primary text-primary-foreground"
													: "text-muted-foreground hover:text-foreground"
											} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
										>
											<input
												type="radio"
												name="engine"
												value={opt}
												checked={checked}
												onChange={() => setEngine(opt)}
												disabled={disabled}
												className="sr-only"
											/>
											{label}
										</label>
									);
								})}
							</div>
							<span className="text-[11px] text-muted-foreground">
								{engine === "v1"
									? "Raw Zipformer — fastest, ALL CAPS, no punctuation."
									: "Denoise + diarize + LLM cleanup — slower, punctuated, per-speaker."}
							</span>
						</div>

						{isTranscribing && (
							<div className="rounded-md border bg-card px-3 py-2">
								<div className="flex items-center justify-between mb-1">
									<span className="text-[11px] font-medium text-muted-foreground">
										{uploadPct !== null
											? `Uploading… ${uploadPct}%`
											: "Transcribing on server…"}
									</span>
									<span className="text-[11px] text-muted-foreground tabular-nums">
										{transcribeElapsed.toFixed(1)}s
									</span>
								</div>
								<div className="h-1.5 rounded-full bg-muted overflow-hidden">
									{uploadPct !== null ? (
										<div
											className="h-full bg-primary transition-[width] duration-150"
											style={{ width: `${uploadPct}%` }}
										/>
									) : (
										<div
											className="h-full w-1/3 bg-primary/70"
											style={{
												animation: "indeterminate 1.6s linear infinite",
											}}
										/>
									)}
								</div>
							</div>
						)}

						{!isRecording && !isTranscribing && !dictationText ? (
							<DemoEmptyState
								description={
									<>
										Click <strong>Start recording</strong>, speak in Vietnamese,
										then <strong>Stop & transcribe</strong> — or{" "}
										<strong>Upload audio file</strong> (WAV, MP3, M4A, WebM,
										OGG) to transcribe an existing recording. The full
										transcript will appear below.
									</>
								}
								hint="Best for short notes, dictation, or single-take recordings."
							/>
						) : (
							<>
								<div className="rounded-lg border bg-card px-4 py-3 min-h-[120px]">
									<div className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground mb-2 flex items-center gap-2 flex-wrap">
										<span>Transcript</span>
										{dictationDuration !== null && (
											<span className="normal-case font-normal text-[11px]">
												· {dictationDuration.toFixed(2)}s audio
											</span>
										)}
										{v2Meta && (
											<span className="normal-case font-normal text-[11px] text-muted-foreground">
												· {v2Meta.elapsed_s.toFixed(1)}s pipeline ·{" "}
												{v2Meta.denoised ? "denoised" : "no-denoise"} · diarize=
												{v2Meta.diarizer} · ASR=
												{v2Meta.asr_engines_used.join("+") || "—"} · post-edit=
												{v2Meta.post_edit_applied ? "on" : "off"}
											</span>
										)}
									</div>
									<div className="text-[14px] whitespace-pre-wrap">
										{dictationText || (
											<span className="text-muted-foreground italic">
												(no transcript yet)
											</span>
										)}
									</div>
								</div>

								{v2Turns && v2Turns.length > 1 && (
									<div className="rounded-lg border bg-card px-4 py-3">
										<div className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground mb-2">
											Per-speaker turns ({v2Turns.length})
										</div>
										<div className="space-y-2">
											{v2Turns.map((t, i) => (
												<div
													key={`turn-${i}-${t.start}`}
													className="border-l-2 pl-3 py-1 text-[13px]"
													style={{
														borderColor:
															t.speaker === "S0"
																? "var(--primary)"
																: t.speaker === "S1"
																	? "#f59e0b"
																	: "var(--muted-foreground)",
													}}
												>
													<div className="flex items-center gap-2 text-[10px] text-muted-foreground tabular-nums">
														<span className="font-mono font-semibold">
															{t.speaker}
														</span>
														<span>
															{t.start.toFixed(1)}–{t.end.toFixed(1)}s
														</span>
														<span>· engine: {t.engine}</span>
														{t.edited ? (
															<span className="text-emerald-600 dark:text-emerald-400">
																· post-edited
															</span>
														) : (
															<span>· raw</span>
														)}
													</div>
													<div className="mt-0.5">{t.text}</div>
												</div>
											))}
										</div>
									</div>
								)}
							</>
						)}
					</div>
				) : (
					<div className="flex-1 overflow-auto p-4 space-y-3">
						<div className="flex items-center gap-2 flex-wrap">
							{connState === "idle" ||
							connState === "closed" ||
							connState === "error" ? (
								<Button size="sm" className="h-8 text-xs" onClick={connectLive}>
									Connect
								</Button>
							) : (
								<Button
									size="sm"
									variant="outline"
									className="h-8 text-xs"
									onClick={disconnectLive}
								>
									Disconnect
								</Button>
							)}
							{connState === "connected" && !isLiveMicOn && (
								<Button
									size="sm"
									className="h-8 text-xs"
									onClick={startLiveMic}
								>
									Start mic
								</Button>
							)}
							{isLiveMicOn && (
								<Button
									size="sm"
									variant="outline"
									className="h-8 text-xs"
									onClick={stopLiveMic}
								>
									Stop mic
								</Button>
							)}
							{captions.length > 0 && (
								<Button
									size="sm"
									variant="ghost"
									className="h-8 text-xs ml-auto"
									onClick={clearCaptions}
								>
									Clear captions
								</Button>
							)}
							<span className="text-[11px] text-muted-foreground">
								status: {connState}
								{isLiveMicOn ? " · mic on" : ""}
							</span>
						</div>

						{captions.length === 0 ? (
							<DemoEmptyState
								description={
									<>
										Click <strong>Connect</strong> then{" "}
										<strong>Start mic</strong> and speak. Each detected
										utterance appears as a new caption line. No LLM is invoked.
									</>
								}
								hint="Good for live captioning of meetings or lectures."
							/>
						) : (
							<div className="space-y-2">
								{captions.map((c) => (
									<div
										key={c.id}
										className="rounded-md border bg-card px-3 py-2 text-[13px]"
									>
										{c.text}
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</div>
		</DashboardLayout>
	);
};

export default VoiceTranscribePage;
