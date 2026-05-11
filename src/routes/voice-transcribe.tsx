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
import { API_ROUTES } from "@/config/api-routes";
import DashboardLayout from "@/layouts/dashboard-layout";

type Mode = "dictation" | "live";
type ConnState = "idle" | "connecting" | "connected" | "closed" | "error";

interface CaptionLine {
	id: string;
	text: string;
	at: number;
}

const VoiceTranscribePage = () => {
	const [mode, setMode] = useState<Mode>("dictation");

	// Dictation state.
	const [isRecording, setIsRecording] = useState(false);
	const [isTranscribing, setIsTranscribing] = useState(false);
	const [dictationText, setDictationText] = useState("");
	const [dictationDuration, setDictationDuration] = useState<number | null>(
		null
	);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const recordedChunksRef = useRef<Blob[]>([]);
	const dictationStreamRef = useRef<MediaStream | null>(null);
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
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			dictationStreamRef.current = stream;
			recordedChunksRef.current = [];
			// Prefer webm/opus where available (Chrome/Edge); Safari may need mp4/aac.
			let mimeType = "";
			for (const t of ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"]) {
				if (
					typeof MediaRecorder !== "undefined" &&
					MediaRecorder.isTypeSupported(t)
				) {
					mimeType = t;
					break;
				}
			}
			const rec = mimeType
				? new MediaRecorder(stream, { mimeType })
				: new MediaRecorder(stream);
			rec.ondataavailable = (e) => {
				if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
			};
			rec.start();
			mediaRecorderRef.current = rec;
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
	// the /transcribe endpoint and stash the result. Filename is only used by
	// the server for content-type sniffing and error messages.
	const sendForTranscription = useCallback(
		async (blob: Blob | File, filename: string) => {
			if (blob.size === 0) {
				toast.error("Empty audio");
				return;
			}
			setIsTranscribing(true);
			setDictationText("");
			setDictationDuration(null);
			try {
				const fd = new FormData();
				fd.append("file", blob, filename);
				const resp = await fetch(API_ROUTES.SERVICES.VOICE_TRANSCRIBE_UPLOAD, {
					method: "POST",
					body: fd,
				});
				if (!resp.ok) {
					const txt = await resp.text();
					toast.error(`Transcribe failed: ${resp.status} ${txt.slice(0, 200)}`);
					return;
				}
				const j = (await resp.json()) as {
					success: boolean;
					text: string;
					duration_seconds: number;
				};
				setDictationText(j.text || "");
				setDictationDuration(j.duration_seconds);
			} catch (err) {
				toast.error(`Transcribe error: ${String(err)}`);
			} finally {
				setIsTranscribing(false);
			}
		},
		[]
	);

	const stopDictation = useCallback(async () => {
		const rec = mediaRecorderRef.current;
		if (!rec) return;
		setIsRecording(false);
		await new Promise<void>((resolve) => {
			rec.onstop = () => resolve();
			rec.stop();
		});
		dictationStreamRef.current?.getTracks().forEach((t) => {
			t.stop();
		});
		dictationStreamRef.current = null;
		mediaRecorderRef.current = null;

		const blob = new Blob(recordedChunksRef.current, {
			type: rec.mimeType || "audio/webm",
		});
		const filename = blob.type.includes("mp4")
			? "dictation.m4a"
			: "dictation.webm";
		await sendForTranscription(blob, filename);
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

	useEffect(() => {
		return () => {
			try {
				wsRef.current?.close();
			} catch {}
			wsRef.current = null;
			teardownLive();
			mediaRecorderRef.current?.stop?.();
			dictationStreamRef.current?.getTracks().forEach((t) => {
				t.stop();
			});
		};
	}, [teardownLive]);

	// Switching mode silences any active capture/recording from the other mode.
	const switchMode = useCallback(
		(next: Mode) => {
			if (next === mode) return;
			if (mode === "dictation" && isRecording) {
				mediaRecorderRef.current?.stop?.();
				dictationStreamRef.current?.getTracks().forEach((t) => {
					t.stop();
				});
				setIsRecording(false);
			}
			if (mode === "live") {
				disconnectLive();
			}
			setMode(next);
		},
		[mode, isRecording, disconnectLive]
	);

	return (
		<DashboardLayout>
			<div className="flex flex-col h-[calc(100vh-3.5rem)]">
				<DemoPageDescription>
					Speech-to-text only — offline Vietnamese Zipformer ASR, no LLM, no
					agent. Choose <strong>Dictation</strong> to record a clip and get the
					full transcript, or <strong>Live captions</strong> to stream PCM
					frames and see captions appear utterance by utterance.
				</DemoPageDescription>

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
							{isTranscribing && (
								<span className="text-[12px] text-muted-foreground">
									Transcribing…
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
							<div className="rounded-lg border bg-card px-4 py-3 min-h-[120px]">
								<div className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground mb-2">
									Transcript
									{dictationDuration !== null && (
										<span className="ml-2 normal-case font-normal text-[11px]">
											· {dictationDuration.toFixed(2)}s audio
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
