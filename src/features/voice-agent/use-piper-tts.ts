// Vietnamese in-browser TTS via Piper, running in onnxruntime-web.
//
// The first call downloads the voice model (~63 MB for vi_VN-vais1000-medium)
// into the browser's Origin Private File System (OPFS); subsequent calls are
// instant. Inference uses WebGPU when available, falling back to WASM.
//
// The library is lazy-imported so the dashboard's initial bundle stays small —
// piper-tts-web ships ~3 MB of WASM/JS that only matter for users who pick
// this TTS mode.

import { useCallback, useEffect, useRef, useState } from "react";

const VOICE_ID = "vi_VN-vais1000-medium";

type PiperLib = typeof import("@mintplex-labs/piper-tts-web");

interface DownloadProgress {
	url: string;
	loaded: number;
	total: number;
}

export type PiperState =
	| { phase: "idle" }
	| { phase: "loading-lib" }
	| { phase: "downloading"; pct: number }
	| { phase: "ready" }
	| { phase: "speaking" }
	| { phase: "error"; message: string }
	| { phase: "unsupported"; message: string };

interface UsePiperTts {
	state: PiperState;
	prepare: () => Promise<void>;
	speak: (text: string) => Promise<void>;
	cancel: () => void;
}

function isSupported(): boolean {
	if (typeof window === "undefined") return false;
	// OPFS is required to cache the model. Safari < 17 and older Firefox lack it.
	const hasOPFS =
		typeof navigator !== "undefined" &&
		typeof navigator.storage?.getDirectory === "function";
	// WebAssembly is required for ort wasm backend. WebGPU is preferred but not
	// strictly required — onnxruntime-web falls back to wasm/cpu.
	const hasWasm = typeof WebAssembly !== "undefined";
	return hasOPFS && hasWasm;
}

export function usePiperTts(): UsePiperTts {
	const [state, setState] = useState<PiperState>({ phase: "idle" });
	const libRef = useRef<PiperLib | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	// Serialize speak() calls so sentences don't overlap.
	const queueRef = useRef<Promise<void>>(Promise.resolve());
	const cancelledRef = useRef<boolean>(false);

	useEffect(() => {
		if (!isSupported()) {
			setState({
				phase: "unsupported",
				message:
					"This browser doesn't support in-browser TTS (needs OPFS + WebAssembly). Try Chrome/Edge 121+ or Firefox 127+.",
			});
		}
	}, []);

	const ensureLib = useCallback(async (): Promise<PiperLib> => {
		if (libRef.current) return libRef.current;
		setState({ phase: "loading-lib" });
		const mod = await import("@mintplex-labs/piper-tts-web");
		libRef.current = mod;
		return mod;
	}, []);

	const prepare = useCallback(async () => {
		if (state.phase === "unsupported") return;
		try {
			const tts = await ensureLib();
			const already = await tts.stored();
			if (already.includes(VOICE_ID)) {
				setState({ phase: "ready" });
				return;
			}
			setState({ phase: "downloading", pct: 0 });
			await tts.download(VOICE_ID, (p: DownloadProgress) => {
				const pct = p.total > 0 ? Math.round((p.loaded * 100) / p.total) : 0;
				setState({ phase: "downloading", pct });
			});
			setState({ phase: "ready" });
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			setState({ phase: "error", message });
		}
	}, [ensureLib, state.phase]);

	const cancel = useCallback(() => {
		cancelledRef.current = true;
		const a = audioRef.current;
		if (a) {
			try {
				a.pause();
				a.currentTime = 0;
			} catch {}
			if (a.src) {
				try {
					URL.revokeObjectURL(a.src);
				} catch {}
				a.src = "";
			}
		}
	}, []);

	const speak = useCallback(
		async (text: string) => {
			const trimmed = text.trim();
			if (!trimmed) return;
			if (state.phase === "unsupported") return;
			cancelledRef.current = false;
			// Chain onto the existing queue so consecutive sentences play in order.
			const next = queueRef.current.then(async () => {
				if (cancelledRef.current) return;
				try {
					const tts = await ensureLib();
					// Make sure the voice is on disk; tts.predict downloads on demand
					// otherwise, but we want the progress UI on first selection.
					const already = await tts.stored();
					if (!already.includes(VOICE_ID)) {
						setState({ phase: "downloading", pct: 0 });
						await tts.download(VOICE_ID, (p: DownloadProgress) => {
							const pct =
								p.total > 0 ? Math.round((p.loaded * 100) / p.total) : 0;
							setState({ phase: "downloading", pct });
						});
					}
					setState({ phase: "speaking" });
					const wav = await tts.predict({ text: trimmed, voiceId: VOICE_ID });
					if (cancelledRef.current) return;
					const url = URL.createObjectURL(wav);
					const audio = new Audio();
					audioRef.current = audio;
					audio.src = url;
					await new Promise<void>((resolve) => {
						audio.onended = () => {
							URL.revokeObjectURL(url);
							resolve();
						};
						audio.onerror = () => {
							URL.revokeObjectURL(url);
							resolve();
						};
						audio.play().catch(() => {
							URL.revokeObjectURL(url);
							resolve();
						});
					});
					setState({ phase: "ready" });
				} catch (err) {
					const message = err instanceof Error ? err.message : String(err);
					setState({ phase: "error", message });
				}
			});
			queueRef.current = next.catch(() => undefined);
			return next;
		},
		[ensureLib, state.phase]
	);

	return { state, prepare, speak, cancel };
}
