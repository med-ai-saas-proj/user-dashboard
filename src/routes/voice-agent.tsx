// Voice Agent page — bidirectional voice conversation client.
//
// Speaks the conv_agent WebSocket protocol from
// /home/minh/Desktop/api-hub-deployment/voice-agent/conv_agent/web/app.py:
//
//   client → server:
//     binary frames: int16 little-endian mono @ 16 kHz PCM (any size; we send 30 ms frames)
//     text frames:   {type: "stop"|"clear_memory"|"barge_in"}
//
//   server → client:
//     text frames:   {type, ...} where type ∈ {ready, final_transcript,
//                    assistant_token, assistant_sentence, barge_in, turn_end, error}
//     binary frames: 4-byte BE header length || JSON header || float32 LE PCM mono
//                    where header = {type:"audio_chunk", seq:int, sample_rate:24000}

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { DemoEmptyState, DemoPageDescription } from "@/components/demo";
import { Button } from "@/components/shadcn/button";
import { ViewCodeDialog } from "@/components/view-code-dialog";
import { API_ROUTES } from "@/config/api-routes";
import { useServiceApiKeyStore } from "@/features/api-keys/store/service-api-key.store";
import { usePiperTts } from "@/features/voice-agent/use-piper-tts";
import DashboardLayout from "@/layouts/dashboard-layout";

interface AgentTurn {
	id: string;
	user: string;
	assistant: string;
	at: number;
}

type ConnState = "idle" | "connecting" | "connected" | "closed" | "error";

// "server"  → play audio_chunk binary frames from VieNeu (high quality, slower)
// "browser" → speak each assistant_sentence via Web SpeechSynthesis (snappy,
//             quality depends on the OS's Vietnamese voice)
// "piper"   → in-browser Piper VITS model (vi_VN-vais1000-medium) via
//             onnxruntime-web; ~63 MB one-time download, ~1-3s/sentence on
//             WebGPU, higher quality than Web SpeechSynthesis
// "off"     → text-only
type TtsMode = "server" | "browser" | "piper" | "off";

const VoiceAgentPage = () => {
	const apiKey = useServiceApiKeyStore((s) => s.selectedApiKey);
	const [connState, setConnState] = useState<ConnState>("idle");
	const [isMicOn, setIsMicOn] = useState(false);
	const [interimUser, setInterimUser] = useState<string>("");
	const [interimAssistant, setInterimAssistant] = useState<string>("");
	const [turns, setTurns] = useState<AgentTurn[]>([]);
	// Default to Browser TTS: server-side VieNeu on CPU is 6-18s per
	// sentence which feels broken in conversation. Users can opt into
	// the higher-quality Server (VieNeu) mode when they want to compare.
	const [ttsMode, setTtsMode] = useState<TtsMode>("browser");
	// True between the LLM reply finishing and the last audio_chunk
	// arriving when server TTS is selected. Used to show a status hint
	// and guard against the user clicking Disconnect mid-synthesis.
	const [serverAudioPending, setServerAudioPending] = useState(false);

	const wsRef = useRef<WebSocket | null>(null);
	const audioCtxRef = useRef<AudioContext | null>(null);
	const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
	const workletNodeRef = useRef<AudioWorkletNode | null>(null);
	const micStreamRef = useRef<MediaStream | null>(null);
	const playbackCtxRef = useRef<AudioContext | null>(null);
	const playbackTimeRef = useRef<number>(0);
	const turnIdRef = useRef<string>("");
	// Mirror interim state in refs so the WS message handler — which is
	// bound once at connect time — always reads the latest values instead
	// of a stale closure. Without this, a `turn_end` arriving immediately
	// after the first `final_transcript`/`assistant_token` would commit
	// empty strings to `turns`, producing phantom "(no transcript)" rows.
	const interimUserRef = useRef<string>("");
	const interimAssistantRef = useRef<string>("");
	// Same reason for ttsMode — handlers bound at connect time would
	// otherwise see a stale value if the user toggles the radio mid-session.
	const ttsModeRef = useRef<TtsMode>("browser");

	// In-browser Piper TTS (vi_VN-vais1000-medium). Lazy-loaded so the
	// ~3 MB of WASM/JS only ships when this option is selected.
	const piperTts = usePiperTts();
	// Stash a stable ref so the WS handler bound at connect time doesn't go
	// stale across re-renders (same pattern as ttsModeRef above).
	const piperSpeakRef = useRef(piperTts.speak);
	const piperCancelRef = useRef(piperTts.cancel);
	useEffect(() => {
		piperSpeakRef.current = piperTts.speak;
		piperCancelRef.current = piperTts.cancel;
	}, [piperTts.speak, piperTts.cancel]);
	// Track how many audio_chunk frames are still expected. Incremented
	// whenever a turn ends in server mode (we don't know the count a priori,
	// so we just clear it when no chunks have arrived for ~5s — see effect).
	const lastServerChunkAtRef = useRef<number>(0);

	const log = useCallback((msg: string) => {
		console.log("[voice-agent]", msg);
	}, []);

	const teardown = useCallback(() => {
		try {
			workletNodeRef.current?.disconnect();
		} catch {}
		try {
			sourceNodeRef.current?.disconnect();
		} catch {}
		micStreamRef.current?.getTracks().forEach((t) => {
			t.stop();
		});
		workletNodeRef.current = null;
		sourceNodeRef.current = null;
		micStreamRef.current = null;
		if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
			audioCtxRef.current.close().catch(() => {});
		}
		audioCtxRef.current = null;
		setIsMicOn(false);
	}, []);

	// Speak Vietnamese text via the browser's built-in SpeechSynthesis.
	// Only fires when ttsMode === "browser". We pick the first vi-* voice
	// available; if none is installed, browsers usually fall back to a
	// default voice that still vocalizes the Latin characters acceptably.
	const speakBrowserTts = useCallback((text: string) => {
		if (typeof window === "undefined" || !window.speechSynthesis) return;
		const trimmed = text.trim();
		if (!trimmed) return;
		const u = new SpeechSynthesisUtterance(trimmed);
		u.lang = "vi-VN";
		const voices = window.speechSynthesis.getVoices();
		const viVoice = voices.find((v) => v.lang.toLowerCase().startsWith("vi"));
		if (viVoice) u.voice = viVoice;
		window.speechSynthesis.speak(u);
	}, []);

	const cancelBrowserTts = useCallback(() => {
		if (typeof window === "undefined" || !window.speechSynthesis) return;
		window.speechSynthesis.cancel();
	}, []);

	const playAudioChunk = useCallback(
		(pcmFloat32: Float32Array, sampleRate: number) => {
			// Read the latest mode from the ref so a TTS mode change after
			// the WS connected is honored without forcing a reconnect (the
			// onmessage handler is bound once at connect time, so the
			// captured ttsMode useState here would otherwise be stale).
			if (ttsModeRef.current !== "server") return;
			let ctx = playbackCtxRef.current;
			if (!ctx || ctx.state === "closed") {
				ctx = new AudioContext({ sampleRate });
				playbackCtxRef.current = ctx;
				playbackTimeRef.current = ctx.currentTime;
			}
			// Chrome / Safari autoplay policy: an AudioContext created without
			// a recent user gesture starts in `suspended`. We try to nudge it
			// awake; if the page hasn't seen a gesture in 5s the resume() call
			// will reject silently, which is the correct fail-mode.
			if (ctx.state === "suspended") {
				ctx.resume().catch(() => {});
			}
			const buf = ctx.createBuffer(1, pcmFloat32.length, sampleRate);
			// `copyToChannel` expects a Float32Array<ArrayBuffer> specifically;
			// the view we get from the WS frame is typed as ArrayBufferLike
			// (could be SharedArrayBuffer in theory). A fresh copy normalizes
			// the type and decouples our buffer from the WS receive buffer.
			buf.copyToChannel(new Float32Array(pcmFloat32), 0);
			const src = ctx.createBufferSource();
			src.buffer = buf;
			src.connect(ctx.destination);
			const now = ctx.currentTime;
			const start = Math.max(now, playbackTimeRef.current);
			src.start(start);
			playbackTimeRef.current = start + buf.duration;
		},
		[]
	);

	const handleBinaryFrame = useCallback(
		(data: ArrayBuffer) => {
			const view = new DataView(data);
			const headerLen = view.getUint32(0, false);
			const headerBytes = new Uint8Array(data, 4, headerLen);
			const header = JSON.parse(new TextDecoder().decode(headerBytes));
			if (header.type === "audio_chunk") {
				lastServerChunkAtRef.current = Date.now();
				const pcmStart = 4 + headerLen;
				const pcm = new Float32Array(data, pcmStart);
				playAudioChunk(pcm, header.sample_rate ?? 24000);
			}
		},
		[playAudioChunk]
	);

	const handleTextEvent = useCallback(
		(evt: { type: string; [k: string]: unknown }) => {
			switch (evt.type) {
				case "ready":
					log(`ready: user_id=${String(evt.user_id ?? "")}`);
					break;
				case "final_transcript": {
					const text = String(evt.text ?? "");
					interimUserRef.current = text;
					interimAssistantRef.current = "";
					setInterimUser(text);
					turnIdRef.current = `t-${Date.now()}`;
					setInterimAssistant("");
					break;
				}
				case "assistant_token": {
					const tok = String(evt.text ?? "");
					interimAssistantRef.current += tok;
					setInterimAssistant((prev) => prev + tok);
					break;
				}
				case "assistant_sentence": {
					// Browser-TTS path: speak each completed sentence as it
					// arrives. Piper-TTS path: same, but runs the VITS model in
					// the browser (higher quality, ~1-3s latency). Server-TTS
					// path ignores this and waits for audio_chunk binary frames
					// instead.
					const sentence = String(evt.text ?? "");
					if (ttsModeRef.current === "browser") {
						speakBrowserTts(sentence);
					} else if (ttsModeRef.current === "piper") {
						void piperSpeakRef.current(sentence);
					}
					break;
				}
				case "barge_in":
					log("barge-in");
					cancelBrowserTts();
					piperCancelRef.current();
					break;
				case "turn_end": {
					const userText = interimUserRef.current;
					const assistantText = interimAssistantRef.current;
					// Suppress phantom turns: the server emits `turn_end` only
					// inside the LLM worker, but an empty ASR result followed by
					// a cancelled LLM stream can still produce a turn_end with
					// neither user nor assistant content. Skip those — they
					// would otherwise render as "(no transcript)/(no response)".
					if (userText || assistantText) {
						const id = turnIdRef.current || `t-${Date.now()}`;
						setTurns((prev) => [
							...prev,
							{
								id,
								user: userText,
								assistant: assistantText,
								at: Date.now(),
							},
						]);
						// Server-side TTS keeps streaming audio_chunk frames for
						// many seconds after turn_end. Mark a pending state so
						// the UI can show a "synthesizing audio…" hint and warn
						// before tearing the WS down.
						if (
							ttsModeRef.current === "server" &&
							assistantText.trim().length > 0
						) {
							lastServerChunkAtRef.current = Date.now();
							setServerAudioPending(true);
						}
					}
					interimUserRef.current = "";
					interimAssistantRef.current = "";
					setInterimUser("");
					setInterimAssistant("");
					turnIdRef.current = "";
					break;
				}
				case "error":
					toast.error(String(evt.message ?? "agent error"));
					log(`error: ${JSON.stringify(evt)}`);
					break;
				default:
					log(`unknown event: ${evt.type}`);
			}
		},
		[log, speakBrowserTts, cancelBrowserTts]
	);

	const connect = useCallback(async () => {
		if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;
		setConnState("connecting");
		// Pre-create the playback AudioContext under the user-gesture context
		// so Chrome/Safari don't park it in `suspended`. The TTS sample rate
		// is 24 kHz; if the device prefers a different rate the context will
		// resample on the fly.
		if (!playbackCtxRef.current || playbackCtxRef.current.state === "closed") {
			try {
				const ctx = new AudioContext({ sampleRate: 24000 });
				playbackCtxRef.current = ctx;
				playbackTimeRef.current = ctx.currentTime;
				if (ctx.state === "suspended") {
					ctx.resume().catch(() => {});
				}
			} catch (e) {
				log(`playback ctx init failed: ${String(e)}`);
			}
		}
		const userId = (() => {
			try {
				return localStorage.getItem("auth.userId") || "demo-user";
			} catch {
				return "demo-user";
			}
		})();
		const baseUrl = `${API_ROUTES.SERVICES.VOICE_AGENT_WS}?user_id=${encodeURIComponent(userId)}`;
		const url = apiKey
			? `${baseUrl}&api_key=${encodeURIComponent(apiKey)}`
			: baseUrl;
		const ws = new WebSocket(url);
		ws.binaryType = "arraybuffer";
		wsRef.current = ws;

		ws.onopen = () => {
			setConnState("connected");
			toast.success("Voice agent connected");
		};
		ws.onmessage = (e) => {
			if (typeof e.data === "string") {
				try {
					handleTextEvent(JSON.parse(e.data));
				} catch (err) {
					log(`bad json: ${String(err)}`);
				}
			} else if (e.data instanceof ArrayBuffer) {
				handleBinaryFrame(e.data);
			}
		};
		ws.onerror = () => {
			setConnState("error");
		};
		ws.onclose = () => {
			setConnState("closed");
		};
	}, [handleBinaryFrame, handleTextEvent, log, apiKey]);

	const disconnect = useCallback(() => {
		// Server VieNeu can still be streaming audio_chunk frames for many
		// seconds after the LLM reply finished. Warn before tearing the WS
		// down so the user doesn't accidentally cut off their own audio.
		if (serverAudioPending) {
			const ok = window.confirm(
				"Server (VieNeu) audio is still streaming. Disconnect now will cut off the rest of the spoken reply. Continue?"
			);
			if (!ok) return;
		}
		setServerAudioPending(false);
		try {
			wsRef.current?.send(JSON.stringify({ type: "stop" }));
		} catch {}
		wsRef.current?.close();
		wsRef.current = null;
		teardown();
	}, [teardown, serverAudioPending]);

	const startMic = useCallback(async () => {
		if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
			toast.error("Connect first");
			return;
		}
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: true,
					noiseSuppression: true,
					autoGainControl: true,
					channelCount: 1,
				},
			});
			micStreamRef.current = stream;
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
				if (ws && ws.readyState === WebSocket.OPEN) {
					ws.send(e.data);
				}
			};
			source.connect(node);
			setIsMicOn(true);
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			toast.error(`Mic error: ${msg}`);
		}
	}, []);

	const stopMic = useCallback(() => {
		teardown();
	}, [teardown]);

	const clearMemory = useCallback(() => {
		try {
			wsRef.current?.send(JSON.stringify({ type: "clear_memory" }));
			setTurns([]);
			interimUserRef.current = "";
			interimAssistantRef.current = "";
			setInterimUser("");
			setInterimAssistant("");
			toast.success("Memory cleared");
		} catch {
			toast.error("Not connected");
		}
	}, []);

	const bargeIn = useCallback(() => {
		try {
			wsRef.current?.send(JSON.stringify({ type: "barge_in" }));
		} catch {}
		cancelBrowserTts();
		piperCancelRef.current();
	}, [cancelBrowserTts]);

	useEffect(() => {
		ttsModeRef.current = ttsMode;
		// Switching mode mid-session: silence any in-flight speech so we
		// don't have browser TTS speaking after the user moves to server TTS
		// (or vice versa).
		cancelBrowserTts();
		piperCancelRef.current();
		if (ttsMode !== "server") setServerAudioPending(false);
	}, [ttsMode, cancelBrowserTts]);

	// Clear the "server audio pending" hint after ~5s of audio_chunk silence.
	// The server doesn't tell us how many chunks are coming, so we just watch
	// for the gap.
	useEffect(() => {
		if (!serverAudioPending) return;
		const id = window.setInterval(() => {
			if (Date.now() - lastServerChunkAtRef.current > 5000) {
				setServerAudioPending(false);
			}
		}, 500);
		return () => window.clearInterval(id);
	}, [serverAudioPending]);

	useEffect(() => {
		return () => {
			try {
				wsRef.current?.close();
			} catch {}
			wsRef.current = null;
			teardown();
			playbackCtxRef.current?.close().catch(() => {});
			playbackCtxRef.current = null;
		};
	}, [teardown]);

	const stateColor: Record<ConnState, string> = {
		idle: "bg-muted text-muted-foreground",
		connecting:
			"bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
		connected:
			"bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
		closed: "bg-muted text-muted-foreground",
		error: "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200",
	};

	return (
		<DashboardLayout pageTitle="Voice Agent">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				<div className="flex items-start justify-between gap-4 px-4 pt-2">
					<DemoPageDescription>
						Bidirectional Vietnamese voice agent — Zipformer ASR (offline),
						Azure OpenAI LLM (streaming), optional VieNeu TTS. Click{" "}
						<strong>Connect</strong>, then <strong>Start mic</strong> and speak.
						Pick <strong>Browser</strong> TTS for instant low-quality playback,
						or <strong>Server (VieNeu)</strong> for higher quality (note: ~5-15s
						per sentence on CPU — keep the tab open while it synthesizes).
					</DemoPageDescription>
					<ViewCodeDialog
						endpoint={API_ROUTES.SERVICES.VOICE_AGENT_WS}
						method="WS"
						description="Bidirectional voice agent over a single WebSocket. Open the socket with ?user_id=<id>&api_key=<key>, then send binary frames (16 kHz int16 mono PCM) as the user speaks. Receive JSON events: partial/final transcript, LLM-streamed assistant text, and (optionally) audio frames if server-side TTS is enabled. Browsers can't set custom WS headers, so pass the key as the api_key query param."
					/>
				</div>

				<div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30 flex-wrap gap-2">
					<div className="flex items-center gap-2">
						<span
							className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded ${stateColor[connState]}`}
						>
							{connState}
						</span>
						{isMicOn && (
							<span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200 animate-pulse">
								● mic on
							</span>
						)}
					</div>
					<div className="flex items-center gap-1.5 flex-wrap">
						{connState !== "connected" ? (
							<Button size="sm" className="h-8 text-xs" onClick={connect}>
								Connect
							</Button>
						) : (
							<Button
								size="sm"
								variant="outline"
								className="h-8 text-xs"
								onClick={disconnect}
							>
								Disconnect
							</Button>
						)}
						{connState === "connected" && !isMicOn && (
							<Button size="sm" className="h-8 text-xs" onClick={startMic}>
								Start mic
							</Button>
						)}
						{isMicOn && (
							<Button
								size="sm"
								variant="outline"
								className="h-8 text-xs"
								onClick={stopMic}
							>
								Stop mic
							</Button>
						)}
						{connState === "connected" && (
							<>
								<Button
									size="sm"
									variant="ghost"
									className="h-8 text-xs"
									onClick={bargeIn}
								>
									Barge-in
								</Button>
								<Button
									size="sm"
									variant="ghost"
									className="h-8 text-xs"
									onClick={clearMemory}
								>
									Clear memory
								</Button>
							</>
						)}
						<div className="flex items-center gap-2 text-[11px] text-muted-foreground ml-2">
							<span className="font-medium text-foreground">TTS:</span>
							<label className="flex items-center gap-1">
								<input
									type="radio"
									name="tts-mode"
									checked={ttsMode === "browser"}
									onChange={() => setTtsMode("browser")}
								/>
								Browser (instant)
							</label>
							<label
								className="flex items-center gap-1"
								title="Higher quality but 6-18s per sentence on CPU; not real-time"
							>
								<input
									type="radio"
									name="tts-mode"
									checked={ttsMode === "server"}
									onChange={() => setTtsMode("server")}
								/>
								Server (VieNeu, slow)
							</label>
							<label
								className={`flex items-center gap-1 ${
									piperTts.state.phase === "unsupported"
										? "opacity-50 cursor-not-allowed"
										: ""
								}`}
								title={
									piperTts.state.phase === "unsupported"
										? piperTts.state.message
										: "In-browser Vietnamese TTS via Piper (~63 MB one-time download, ~1-3s/sentence on WebGPU)"
								}
							>
								<input
									type="radio"
									name="tts-mode"
									checked={ttsMode === "piper"}
									disabled={piperTts.state.phase === "unsupported"}
									onChange={() => {
										setTtsMode("piper");
										void piperTts.prepare();
									}}
								/>
								In-browser (Piper)
							</label>
							<label className="flex items-center gap-1">
								<input
									type="radio"
									name="tts-mode"
									checked={ttsMode === "off"}
									onChange={() => setTtsMode("off")}
								/>
								Off
							</label>
							{piperTts.state.phase === "downloading" && (
								<span className="ml-2 inline-flex items-center gap-1 text-sky-700 dark:text-sky-300">
									Downloading Piper voice… {piperTts.state.pct}%
								</span>
							)}
							{piperTts.state.phase === "speaking" && ttsMode === "piper" && (
								<span className="ml-2 inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
									<span className="relative flex h-2 w-2">
										<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
										<span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
									</span>
									Speaking…
								</span>
							)}
							{piperTts.state.phase === "error" && (
								<span className="ml-2 inline-flex items-center gap-1 text-rose-700 dark:text-rose-300">
									Piper error: {piperTts.state.message}
								</span>
							)}
							{serverAudioPending && (
								<span className="ml-2 inline-flex items-center gap-1 text-amber-700 dark:text-amber-300">
									<span className="relative flex h-2 w-2">
										<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
										<span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
									</span>
									Synthesizing audio…
								</span>
							)}
						</div>
					</div>
				</div>

				<div className="flex-1 overflow-auto p-4 space-y-4">
					{turns.length === 0 && !interimUser && !interimAssistant ? (
						<DemoEmptyState
							description={
								<>
									Click <strong>Connect</strong> then <strong>Start mic</strong>{" "}
									and speak. Vietnamese only — the LLM is configured for
									Vietnamese clinical conversation.
								</>
							}
							hint="ASR: offline Zipformer · LLM: Azure OpenAI gpt-5-mini · TTS: VieNeu (when enabled)"
						/>
					) : (
						<>
							{turns.map((t) => (
								<TurnCard key={t.id} turn={t} />
							))}
							{(interimUser || interimAssistant) && (
								<InterimCard user={interimUser} assistant={interimAssistant} />
							)}
						</>
					)}
				</div>
			</div>
		</DashboardLayout>
	);
};

const TurnCard = ({ turn }: { turn: AgentTurn }) => (
	<div className="space-y-2">
		<div className="rounded-lg border bg-card px-3 py-2">
			<div className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground mb-1">
				You
			</div>
			<div className="text-[13px]">{turn.user || "(no transcript)"}</div>
		</div>
		<div className="rounded-lg border bg-primary/5 px-3 py-2">
			<div className="text-[10px] uppercase font-semibold tracking-wider text-primary mb-1">
				Assistant
			</div>
			<div className="text-[13px] whitespace-pre-wrap">
				{turn.assistant || "(no response)"}
			</div>
		</div>
	</div>
);

const InterimCard = ({
	user,
	assistant,
}: {
	user: string;
	assistant: string;
}) => (
	<div className="space-y-2">
		{user && (
			<div className="rounded-lg border-2 border-dashed border-amber-300/60 bg-amber-50/40 dark:bg-amber-950/10 px-3 py-2">
				<div className="text-[10px] uppercase font-semibold tracking-wider text-amber-700 dark:text-amber-300 mb-1">
					You (transcribing)
				</div>
				<div className="text-[13px]">{user}</div>
			</div>
		)}
		{assistant && (
			<div className="rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 px-3 py-2">
				<div className="text-[10px] uppercase font-semibold tracking-wider text-primary mb-1">
					Assistant (streaming)
				</div>
				<div className="text-[13px] whitespace-pre-wrap">{assistant}</div>
			</div>
		)}
	</div>
);

export default VoiceAgentPage;
