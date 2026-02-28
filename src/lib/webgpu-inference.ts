/**
 * WebGPU inference service using Transformers.js
 *
 * Runs vision-language models directly in the browser via WebGPU.
 * See: https://huggingface.co/docs/transformers.js/en/guides/webgpu
 */

type WebGPUStatus = "idle" | "loading" | "ready" | "error" | "unsupported";

interface WebGPUState {
	status: WebGPUStatus;
	model: string | null;
	error: string | null;
	progress: number;
}

let _state: WebGPUState = {
	status: "idle",
	model: null,
	error: null,
	progress: 0,
};

let _pipeline: unknown = null;
const _listeners = new Set<(state: WebGPUState) => void>();

function notify() {
	for (const cb of _listeners) cb({ ..._state });
}

export function subscribeWebGPU(cb: (state: WebGPUState) => void) {
	_listeners.add(cb);
	cb({ ..._state });
	return () => _listeners.delete(cb);
}

export function getWebGPUState(): WebGPUState {
	return { ..._state };
}

export function isWebGPUSupported(): boolean {
	return "gpu" in navigator;
}

export async function loadWebGPUModel(
	modelId = "onnx-community/Qwen2.5-VL-3B-Instruct",
	task = "image-text-to-text"
): Promise<boolean> {
	if (!isWebGPUSupported()) {
		_state = {
			status: "unsupported",
			model: null,
			error: "WebGPU is not supported in this browser",
			progress: 0,
		};
		notify();
		return false;
	}

	if (_state.status === "loading") return false;

	_state = { status: "loading", model: modelId, error: null, progress: 0 };
	notify();

	try {
		const { pipeline } = await import("@huggingface/transformers");

		_pipeline = await pipeline(task, modelId, {
			device: "webgpu",
			progress_callback: (p: { progress?: number }) => {
				if (p.progress != null) {
					_state.progress = p.progress;
					notify();
				}
			},
		});

		_state = { status: "ready", model: modelId, error: null, progress: 100 };
		notify();
		return true;
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		_state = { status: "error", model: modelId, error: msg, progress: 0 };
		notify();
		return false;
	}
}

export async function generateText(
	prompt: string,
	options: { max_new_tokens?: number; temperature?: number } = {}
): Promise<string> {
	if (!_pipeline)
		throw new Error("Model not loaded. Call loadWebGPUModel() first.");

	const pipe = _pipeline as (
		input: string,
		opts?: Record<string, unknown>
	) => Promise<{ generated_text: string }[]>;
	const result = await pipe(prompt, {
		max_new_tokens: options.max_new_tokens ?? 512,
		temperature: options.temperature ?? 0.7,
	});

	if (Array.isArray(result) && result.length > 0) {
		return result[0].generated_text ?? "";
	}
	return String(result);
}

export function unloadModel() {
	_pipeline = null;
	_state = { status: "idle", model: null, error: null, progress: 0 };
	notify();
}
