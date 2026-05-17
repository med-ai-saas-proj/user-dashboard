/**
 * Centralized API endpoint definitions
 * This file contains all API routes used throughout the application
 */
const API_VERSION = "v1";
if (!import.meta.env.VITE_BASE_API_URL) {
	throw new Error("VITE_BASE_API_URL is not defined in environment variables");
}
export let BASE_API_URL = import.meta.env.VITE_BASE_API_URL;
if (!BASE_API_URL.endsWith("/")) {
	BASE_API_URL += "/";
}
export const API_ROUTES = {
	AUTH: {
		SIGN_IN: new URL(`${API_VERSION}/auth/login`, BASE_API_URL).toString(),
		SIGN_OUT: new URL(`${API_VERSION}/auth/logout`, BASE_API_URL).toString(),
		REGISTER: new URL(`${API_VERSION}/auth/register`, BASE_API_URL).toString(),
		REFRESH_TOKEN: new URL(
			`${API_VERSION}/auth/refresh`,
			BASE_API_URL
		).toString(),
	},
	MANAGEMENT: {
		API_KEYS: new URL(
			`management/api/${API_VERSION}/api-keys`,
			BASE_API_URL
		).toString(),
		DOCS_OPENAPI: new URL(`service/docs/openapi.json`, BASE_API_URL).toString(),
	},
	SERVICES: {
		EHR_SUMMARIZE: new URL(
			`service/api/${API_VERSION}/ehr_summarize`,
			BASE_API_URL
		).toString(),
		OPHTH_SUMMARIZE: new URL(
			`service/api/${API_VERSION}/ophth_summarize`,
			BASE_API_URL
		).toString(),
		RX_ADVISOR: new URL(
			`service/api/${API_VERSION}/rx_advisor`,
			BASE_API_URL
		).toString(),
		AI_SEARCH: new URL(
			`service/api/${API_VERSION}/ai_search`,
			BASE_API_URL
		).toString(),
		CHAT: new URL(`service/api/${API_VERSION}/chat`, BASE_API_URL).toString(),
		EHR_CONVERTER_CONVERT: new URL(
			`service/api/${API_VERSION}/ehr_converter/convert`,
			BASE_API_URL
		).toString(),
		EHR_CONVERTER_REVERSE: new URL(
			`service/api/${API_VERSION}/ehr_converter/convert/fhir-to-hl7v2`,
			BASE_API_URL
		).toString(),
		FHIR_CONVERTER_BHYT_TO_FHIR: new URL(
			`service/api/${API_VERSION}/fhir-converter/convert/bhyt-to-fhir`,
			BASE_API_URL
		).toString(),
		FHIR_CONVERTER_EMRBYT_TO_FHIR: new URL(
			`service/api/${API_VERSION}/fhir-converter/convert/emrbyt-to-fhir`,
			BASE_API_URL
		).toString(),
		EHR_CONVERTER_VALIDATE: new URL(
			`service/api/${API_VERSION}/ehr_converter/validate`,
			BASE_API_URL
		).toString(),
		EHR_CONVERTER_DOCUMENT: new URL(
			`service/api/${API_VERSION}/ehr_converter/convert/document`,
			BASE_API_URL
		).toString(),
		EHR_CONVERTER_BATCH: new URL(
			`service/api/${API_VERSION}/ehr_converter/convert/batch`,
			BASE_API_URL
		).toString(),
		EHR_CONVERTER_HEALTH: new URL(
			`service/api/${API_VERSION}/ehr_converter/health`,
			BASE_API_URL
		).toString(),
		KNOWLEDGE_BASE: new URL(
			`service/api/${API_VERSION}/knowledge_base`,
			BASE_API_URL
		).toString(),
		BHXH_VALIDATE: new URL(
			`service/api/${API_VERSION}/bhxh_validator/validate`,
			BASE_API_URL
		).toString(),
		BHXH_VALIDATE_BUNDLE: new URL(
			`service/api/${API_VERSION}/bhxh_validator/validate_bundle`,
			BASE_API_URL
		).toString(),
		// Voice Agent — bidirectional WebSocket. Lives on a sibling FastAPI
		// service at /backend/voice-agent/, not under /service/api/v1/.
		VOICE_AGENT_WS: new URL(
			`voice-agent/ws/agent`,
			BASE_API_URL.replace("https://", "wss://").replace("http://", "ws://")
		).toString(),
		VOICE_AGENT_HEALTH: new URL(`voice-agent/healthz`, BASE_API_URL).toString(),
		// Voice Transcribe (STT-only). Two endpoints share the voice-agent service:
		//   POST /transcribe    — dictation: upload a WAV, get text back
		//   WS   /ws/transcribe — live captions: stream PCM frames
		VOICE_TRANSCRIBE_UPLOAD: new URL(
			`voice-agent/transcribe`,
			BASE_API_URL
		).toString(),
		// /transcribe/v2 — opt-in industrial pipeline (ffmpeg loudnorm +
		// DeepFilterNet denoise + diarization + ASR cascade + LLM post-edit +
		// hallucination guard). Same /backend/voice-agent service.
		VOICE_TRANSCRIBE_UPLOAD_V2: new URL(
			`voice-agent/transcribe/v2`,
			BASE_API_URL
		).toString(),
		VOICE_TRANSCRIBE_WS: new URL(
			`voice-agent/ws/transcribe`,
			BASE_API_URL.replace("https://", "wss://").replace("http://", "ws://")
		).toString(),
		MEDICAL_IMAGE: new URL(
			`service/api/${API_VERSION}/medical_image/describe`,
			BASE_API_URL
		).toString(),
		HEALTH_SCORE: new URL(
			`service/api/${API_VERSION}/health_score/evaluate`,
			BASE_API_URL
		).toString(),
		DATA_MASKING_MASK: new URL(
			`service/api/${API_VERSION}/data_masking/mask`,
			BASE_API_URL
		).toString(),
		DATA_MASKING_QUERY: new URL(
			`service/api/${API_VERSION}/data_masking/query`,
			BASE_API_URL
		).toString(),
		DATA_MASKING_FACILITY_REGISTER: new URL(
			`service/api/${API_VERSION}/data_masking/facility/register`,
			BASE_API_URL
		).toString(),
		DATA_MASKING_FACILITY_SEARCH: new URL(
			`service/api/${API_VERSION}/data_masking/facility/search`,
			BASE_API_URL
		).toString(),
		PATIENT_HISTORY_CREATE: new URL(
			`service/api/${API_VERSION}/patient`,
			BASE_API_URL
		).toString(),
		PATIENT_WEARABLE_INGEST: new URL(
			`service/api/${API_VERSION}/patient`,
			BASE_API_URL
		).toString(),
		PUBLIC_HEALTH_STATS: new URL(
			`service/api/${API_VERSION}/public_health/statistics`,
			BASE_API_URL
		).toString(),
		SYMPTOM_CHECKER: new URL(
			`service/api/${API_VERSION}/symptom_checker/check`,
			BASE_API_URL
		).toString(),
		CLINIC_SEARCH: new URL(
			`service/api/${API_VERSION}/clinic_search/search`,
			BASE_API_URL
		).toString(),
		CLINIC_SEARCH_RECOMMEND: new URL(
			`service/api/${API_VERSION}/clinic_search/recommend`,
			BASE_API_URL
		).toString(),
		DIGITAL_TWIN: new URL(
			`service/api/${API_VERSION}/digital_twin`,
			BASE_API_URL
		).toString(),
		FEDERATED_PROJECTS: new URL(
			`service/api/${API_VERSION}/federated/projects`,
			BASE_API_URL
		).toString(),
		A2UI_GENERATE: new URL(
			`service/api/${API_VERSION}/a2ui/generate`,
			BASE_API_URL
		).toString(),
		GENE_DECODER_DECODE: new URL(
			`service/api/${API_VERSION}/gene_decoder/decode`,
			BASE_API_URL
		).toString(),
		GENE_DECODER_ANALYZE: new URL(
			`service/api/${API_VERSION}/gene_decoder/analyze`,
			BASE_API_URL
		).toString(),
		CROSS_SEARCH_SEARCH: new URL(
			`service/api/${API_VERSION}/cross_search/search`,
			BASE_API_URL
		).toString(),
		CROSS_SEARCH_PULL: new URL(
			`service/api/${API_VERSION}/cross_search/pull`,
			BASE_API_URL
		).toString(),
		CROSS_SEARCH_PULL_CONVERT: new URL(
			`service/api/${API_VERSION}/cross_search/pull_and_convert`,
			BASE_API_URL
		).toString(),
		CROSS_SEARCH_NETWORK_STATS: new URL(
			`service/api/${API_VERSION}/cross_search/network_stats`,
			BASE_API_URL
		).toString(),
		PLAYGROUND_SEED: new URL(
			`service/api/${API_VERSION}/playground/seed`,
			BASE_API_URL
		).toString(),
		PLAYGROUND_STATUS: new URL(
			`service/api/${API_VERSION}/playground/status`,
			BASE_API_URL
		).toString(),
		BLOOD_PANEL_ANALYZE: new URL(
			`service/api/${API_VERSION}/blood_panel/analyze`,
			BASE_API_URL
		).toString(),
		EHR_OVERVIEW: new URL(
			`service/api/${API_VERSION}/ehr_overview`,
			BASE_API_URL
		).toString(),
		EHR_OVERVIEW_NARRATIVE: new URL(
			`service/api/${API_VERSION}/ehr_overview`,
			BASE_API_URL
		).toString(),
	},
} as const;

export type ApiRoute = typeof API_ROUTES;

export const buildUrl = (
	endpoint: string,
	params?: Record<string, string | number | boolean>
): string => {
	const url = new URL(endpoint);
	if (params) {
		Object.entries(params).forEach(([key, value]) => {
			url.searchParams.append(key, String(value));
		});
	}
	return url.toString();
};

/**
 * Check if a URL is a service endpoint that requires an API key
 */
export const isServiceEndpoint = (url?: string): boolean => {
	if (!url) return false;

	const serviceEndpoints = Object.values(API_ROUTES.SERVICES);
	return serviceEndpoints.some((endpoint) => url.includes(endpoint));
};
