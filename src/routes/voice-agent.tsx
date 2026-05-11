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
import { API_ROUTES } from "@/config/api-routes";
import DashboardLayout from "@/layouts/dashboard-layout";

interface AgentTurn {
	id: string;
	user: string;
	assistant: string;
	at: number;
}

type ConnState = "idle" | "connecting" | "connected" | "closed" | "error";

// "server"  → play audio_chunk binary frames from VieNeu (high quality, slower)
// "browser" → speak each assistant_sentence via Web SpeechSynthesis (snappy)
// "off"     → text-only
type TtsMode = "server" | "browser" | "off";

const VoiceAgentPage = () => {
	const [connState, setConnState] = useState<ConnState>("idle");
	const [isMicOn, setIsMicOn] = useState(false);
	const [interimUser, setInterimUser] = useState<string>("");
	const [interimAssistant, setInterimAssistant] = useState<string>("");
	const [turns, setTurns] = useState<AgentTurn[]>([]);
	const [ttsMode, setTtsMode] = useState<TtsMode>("server");

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
	const ttsModeRef = useRef<TtsMode>("server");

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
			if (ttsMode !== "server") return;
			let ctx = playbackCtxRef.current;
			if (!ctx || ctx.state === "closed") {
				ctx = new AudioContext({ sampleRate });
				playbackCtxRef.current = ctx;
				playbackTimeRef.current = ctx.currentTime;
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
		[ttsMode]
	);

	const handleBinaryFrame = useCallback(
		(data: ArrayBuffer) => {
			const view = new DataView(data);
			const headerLen = view.getUint32(0, false);
			const headerBytes = new Uint8Array(data, 4, headerLen);
			const header = JSON.parse(new TextDecoder().decode(headerBytes));
			if (header.type === "audio_chunk") {
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
					// arrives. Server-TTS path ignores this and waits for
					// audio_chunk binary frames instead.
					if (ttsModeRef.current === "browser") {
						speakBrowserTts(String(evt.text ?? ""));
					}
					break;
				}
				case "barge_in":
					log("barge-in");
					cancelBrowserTts();
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
		const userId = (() => {
			try {
				return localStorage.getItem("auth.userId") || "demo-user";
			} catch {
				return "demo-user";
			}
		})();
		const url = `${API_ROUTES.SERVICES.VOICE_AGENT_WS}?user_id=${encodeURIComponent(userId)}`;
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
	}, [handleBinaryFrame, handleTextEvent, log]);

	const disconnect = useCallback(() => {
		try {
			wsRef.current?.send(JSON.stringify({ type: "stop" }));
		} catch {}
		wsRef.current?.close();
		wsRef.current = null;
		teardown();
	}, [teardown]);

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
	}, [cancelBrowserTts]);

	useEffect(() => {
		ttsModeRef.current = ttsMode;
		// Switching mode mid-session: silence any in-flight speech so we
		// don't have browser TTS speaking after the user moves to server TTS
		// (or vice versa).
		cancelBrowserTts();
	}, [ttsMode, cancelBrowserTts]);

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
				<DemoPageDescription>
					Bidirectional Vietnamese voice agent — Zipformer ASR (offline), Azure
					OpenAI LLM (streaming), optional VieNeu TTS. Click{" "}
					<strong>Connect</strong>, then <strong>Start mic</strong> and speak.
					The agent responds with streaming text and (when TTS is on)
					synthesized audio.
				</DemoPageDescription>

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
									checked={ttsMode === "server"}
									onChange={() => setTtsMode("server")}
								/>
								Server (VieNeu)
							</label>
							<label className="flex items-center gap-1">
								<input
									type="radio"
									name="tts-mode"
									checked={ttsMode === "browser"}
									onChange={() => setTtsMode("browser")}
								/>
								Browser
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
